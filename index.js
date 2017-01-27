'use strict';
const async = require('async');
const debounce = require('lodash.debounce');

module.exports = (tape, events) => {
  const testCases = [];
  let lastBeforeEachResult;
  // executes a single call to 'test':
  const runOneTest = (before, testDescription, testMethod, testDone) => {
    async.autoInject({
      // run before each:
      beforeEach: (done) => {
        if (!events.beforeEach) {
          return done();
        }
        const args = [];
        if (before) {
          args.push(before);
        }
        args.push(done);
        events.beforeEach.apply(this, args);
      },
      // get the tape test instance:
      test(done) {
        return done(null, tape(testDescription));
      },
      // register the afterEach event:
      afterEach(beforeEach, test, done) {
        lastBeforeEachResult = beforeEach;
        if (!events.afterEach) {
          return done();
        }
        test.on('end', () => {
          const args = [];
          if (before) {
            args.push(before);
          }
          if (events.beforeEach) {
            args.push(beforeEach);
          }
          args.push((err) => {
            if (err) {
              throw err;
            }
          });
          events.afterEach.apply(this, args);
        });
        done();
      },
      // run the actual test:
      runTest: (beforeEach, test, afterEach, done) => {
        const args = [test];
        if (before) {
          args.push(before);
        }
        if (events.beforeEach) {
          args.push(beforeEach);
        }
        return done(null, testMethod.apply(this, args));
      }
    }, (err, result) => {
      return testDone(err, { beforeEach: result.beforeEach, test: result.test });
    });
  };

  // executes all tests in series:
  let runAllTests = () => {
    async.autoInject({
      // run the 'before' event handler:
      before(done) {
        if (!events.before) {
          return done();
        }
        return events.before((err, result) => {
          if (err) {
            return done(err);
          }
          done(null, result);
        });
      },
      // run all the tests in order:
      tests(before, done) {
        async.eachSeries(testCases, (testCase, testDone) => {
          runOneTest(before, testCase.testDescription, testCase.testMethod, testDone);
        }, done);
      },
      // run the 'after' event handler:
      after(before, tests, done) {
        if (!events.after) {
          return done();
        }
        const args = [];
        if (events.before) {
          args.push(before);
        }
        if (events.beforeEach) {
          args.push(lastBeforeEachResult);
        }
        args.push(done);
        events.after.apply(this, args);
      }
    }, (err, result) => {
      if (err) {
        throw err;
      }
      // add tests to harness:
      const harness = tape.getHarness();
      harness._tests.forEach((testItem) => {
        harness._results.push(testItem);
      });
      // over-ride test results to print the results
      harness._results.close = function () {
        const self = this;
        if (self.closed) {
           self._stream.emit('error', new Error('ALREADY CLOSED'));
        }
        self.closed = true;
        const write = function (s) {
          console.log(s);
          self._stream.queue(s);
        };
        write('\n1..' + self.count + '\n');
        write('# tests ' + self.count + '\n');
        write('# pass  ' + self.pass + '\n');
        if (self.fail) {
          write('# fail  ' + self.fail + '\n');
        }
        else {
          write('\n# ok\n');
        }
        self._stream.queue(null);
      }.bind(harness._results);
    });
  };
  // this will only trigger once 500 ms after new tests stop coming in:
  runAllTests = debounce(runAllTests, 500, { leading: false, trailing: true });

  return (testDescription, testMethod) => {
    // add the test to the queue:
    testCases.push({ testDescription, testMethod });
    // 500 ms after the last test is added, this should begin processing them in series:
    runAllTests();
  };
};
