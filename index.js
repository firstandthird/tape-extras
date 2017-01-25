const async = require('async');

module.exports = (tape, events) => {
  let beforeCalled = false;
  let beforeResult = undefined;
  const callTest = (testDescription, testMethod) => {
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
        tape.onFinish(() => {
          if (events.after) {
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
        if (events.afterEach) {
          const args = [];
          if (events.before) {
            args.push(before);
          }
          if (events.beforeEach) {
            args.push(beforeEach);
          }
          const originalEnd = t.end;
          args.push(originalEnd);
          t.end = (err) => {
            if (err) {
              return originalEnd(err);
            }
            events.afterEach.apply(this, args);
          };
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
