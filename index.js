'use strict';
const async = require('async');
const debounce = require('lodash.debounce');

module.exports = (tape, events) => {
  const testCases = [];
  let lastBeforeEachResult;
  // executes a single call to 'test':
  const runOneTest = (before, testDescription, testMethod, testDone) => {
    async.autoInject({
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
      test(done) {
        return done(null, tape(testDescription));
      },
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
      tests(before, done) {
        async.eachSeries(testCases, (testCase, testDone) => {
          runOneTest(before, testCase.testDescription, testCase.testMethod, testDone);
        }, done);
      },
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
    });
  };
  // this will only trigger once 500 ms after new tests stop coming in:
  runAllTests = debounce(runAllTests, 500, { leading: false, trailing: true } );

  return (testDescription, testMethod) => {
    // add the test to the queue:
    testCases.push({ testDescription, testMethod });
    // 500 ms after the last test is added, this should begin processing them in series:
    runAllTests();
  };
};
