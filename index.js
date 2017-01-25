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
      before: done => {
        if (events.before) {
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
        }
        return done();
      },
      // handle beforeEach:
      beforeEach: (before, done) => {
        if (events.beforeEach) {
          if (events.before) {
            return events.beforeEach(before, done);
          }
          return events.beforeEach(done);
        }
        return done();
      },
      // set up event listeners to handle after and afterEach:
      registerEndings: (before, beforeEach, done) => {
        const t = tape(testDescription);
        // set up 'after' event:
        if (events.after) {
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
        }
        // set up 'afterEach' event:
        if (events.afterEach) {
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
        }
        done(null, t);
      },
      // perform the actual test:
      mainTest: (registerEndings, before, beforeEach, done) => {
        const args = [registerEndings];
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
