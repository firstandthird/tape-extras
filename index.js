'use strict';
const async = require('async');

module.exports = (tape, events) => {
  let beforeCalled = false;
  let beforeResult = undefined;
  let outstandingTestCounter = 0;
  const callTest = (testDescription, testMethod) => {
    outstandingTestCounter++;
    async.autoInject({
      before: done => {
        if (events.before) {
          // if before hasn't been called before:
          if (!beforeCalled) {
            return events.before((err, result) => {
              if (err) {
                return done(err);
              }
              beforeCalled = true;
              beforeResult = result;
              done(null, beforeResult);
            });
          }
          return done(null, beforeResult);
        }
        return done();
      },
      beforeEach: (before, done) => {
        if (events.beforeEach) {
          if (events.before) {
            return events.beforeEach(before, done);
          }
          return events.beforeEach(done);
        }
        return done();
      },
      // wrap the test to handle afterEach:
      wrapper: (before, beforeEach, done) => {
        const t = tape(testDescription);
        if (events.after) {
          tape.onFinish(() => {
            outstandingTestCounter--;
            if (outstandingTestCounter === 0) {
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
      mainTest: (wrapper, before, beforeEach, done) => {
        const args = [wrapper];
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
