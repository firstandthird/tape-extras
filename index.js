'use strict';
const async = require('async');

module.exports = (tape, events) => {
  let beforeCalled = false;
  let previousResult = undefined;
  let outstandingTestCounter = 0;
  const callTest = (testDescription, testMethod) => {
    outstandingTestCounter++;
    async.autoInject({
      // handle before:
      before(done) {
        if (!events.before) {
          return done();
        }
        // if before hasn't been called before:
        if (!beforeCalled) {
          return events.before((err, result) => {
            if (err) {
              return done(err);
            }
            beforeCalled = true;
            previousResult = result;
            done(null, previousResult);
          });
        }
        return done(null, previousResult);
      },
      // handle beforeEach:
      beforeEach(before, done) {
        if (!events.beforeEach) {
          return done();
        }
        const args = [];
        if (events.before) {
          args.push(before);
        }
        args.push(done);
        events.beforeEach.apply(this, args);
      },
      // set up event listeners to handle after and afterEach:
      registerAfter(before, beforeEach, done) {
        if (!events.after) {
          return done();
        }
        // set up 'after' event:
        tape.onFinish(() => {
          // 'after' only fires after the last outstanding test is deducted:
          outstandingTestCounter--;
          if (outstandingTestCounter === 0) {
            // set up args and call it:
            const args = [];
            if (events.before) {
              args.push(before);
            }
            if (events.beforeEach) {
              args.push(beforeEach);
            }
            args.push((err, results) => {
              if (err) {
                throw err;
              }
            });
            events.after.apply(this, args);
          }
        });
        return done();
      },
      registerAfterEach(before, beforeEach, done) {
        const t = tape(testDescription);
        // set up 'afterEach' event:
        if (!events.afterEach) {
          return done(null, t);
        }
        t.on('end', () => {
          const args = [];
          if (events.before) {
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
        done(null, t);
      },
      // perform the actual test:
      mainTest(registerAfter, registerAfterEach, before, beforeEach, done) {
        const args = [registerAfterEach];
        if (events.before) {
          args.push(before);
        }
        if (events.beforeEach) {
          args.push(beforeEach);
        }
        return done(null, testMethod.apply(this, args));
      },
    }, (err) => {
      if (err) {
        throw err;
      }
    });
  };
  return callTest;
};
