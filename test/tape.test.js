const originalTape = require('tape');
const tapeExtras = require('../');

class Server {
  constructor() {
    this.name = 'server';
    this.count = 0;
  }
  stop(done) {
    this.count++;
    done();
  }
}

class Db {
  constructor(server) {
    this.name = 'db';
    this.server = server;
    this.count = 0;
  }
  drop(done) {
    this.count++;
    done();
  }
}
/*
originalTape('wrapper for tape passes the tape assertion callback', (realT) => {
  const test = tapeExtras(require('tape'), {
    before(done) {
      const server = new Server();
      done(null, server);
    }
  });
  test('calling test', (testT) => {
    realT.equal(typeof testT.equal, 'function');
    testT.equal(true, true);
    realT.end();
  });
});

originalTape('wrapper for tape supports "before"', (realT) => {
  const test = tapeExtras(require('tape'), {
    before(done) {
      const server = new Server();
      done(null, server);
    }
  });
  test('calling test', (testT, server) => {
    realT.equal(server.name, 'server');
    realT.equal(server.count, 0, 'before should have been called and made a new server');
    server.stop(testT.end);
  });
  test('calling test again', (testT, server) => {
    realT.equal(server.name, 'server');
    realT.equal(server.count, 1, 'before should have only beeen called before the first test');
    testT.end();
    realT.end();
  });
});

originalTape('wrapper for tape supports "beforeEach"', (realT) => {
  const test = tapeExtras(require('tape'), {
    before(done) {
      const server = new Server();
      done(null, server);
    },
    beforeEach(server, done) {
      done(null, new Db(server));
    }
  });
  test('calling test', (testT, server, db) => {
    realT.equal(server.name, 'server');
    realT.equal(db.name, 'db');
    realT.equal(db.server, server);
    server.stop(() => {
      db.drop(testT.end);
    });
  });
  test('calling test again', (testT, server, db) => {
    realT.equal(server.name, 'server');
    realT.equal(db.name, 'db');
    realT.equal(server.count, 1, 'before should have only beeen called before the first test');
    realT.equal(db.count, 0, 'beforeEach will be called every time');
    realT.end();
  });
});

originalTape('wrapper for tape supports "afterEach"', (realT) => {
  const test = tapeExtras(require('tape'), {
    before(done) {
      const server = new Server();
      done(null, server);
    },
    afterEach(server, done) {
      server.stop(done);
    }
  });
  test('calling test', (testT, server) => {
    realT.equal(server.name, 'server');
    realT.equal(server.count, 0, 'before should have been called and made a new server');
    testT.end();
  });
  test('calling test again', (testT, server) => {
    realT.equal(server.name, 'server');
    realT.equal(server.count, 1, 'afterEach should have stopped the server');
    testT.end();
  });
  test('calling test a third time', (testT, server) => {
    realT.equal(server.name, 'server');
    realT.equal(server.count, 2, 'afterEach should have stopped the server, again');
    testT.end();
  });

  // check to make sure it also works with beforeEach:
  const test2 = tapeExtras(require('tape'), {
    beforeEach(done) {
      const server = new Server();
      done(null, server);
    },
    afterEach(server, done) {
      server.stop(done);
    }
  });
  test2('calling test', (testT, server) => {
    realT.equal(server.name, 'server');
    realT.equal(server.count, 0, 'before should have been called and made a new server');
    testT.end();
  });
  test2('calling test again', (testT, server) => {
    realT.equal(server.name, 'server');
    realT.equal(server.count, 0, 'afterEach should have stopped the server');
    testT.end();
  });
  test2('calling test a third time', (testT, server) => {
    realT.equal(server.name, 'server');
    realT.equal(server.count, 0, 'afterEach should have stopped the server, again');
    testT.end();
  });

  // check to make sure it also works with both before and beforeEach:
  const test3 = tapeExtras(require('tape'), {
    before(done) {
      const server = new Server();
      done(null, server);
    },
    beforeEach(server, done) {
      done(null, new Db(server));
    },
    afterEach(server, db, done) {
      server.stop(() => {
        db.drop(done);
      });
    }
  });
  test3('calling test', (testT, server, db) => {
    realT.equal(server.name, 'server');
    realT.equal(server.count, 0, 'before should have been called and made a new server');
    realT.equal(db.name, 'db');
    realT.equal(db.count, 0, 'beforeEach resets the db each time');
    testT.end();
  });
  test3('calling test again', (testT, server, db) => {
    realT.equal(server.count, 1, 'the server does not get reset each time');
    realT.equal(db.count, 0, 'beforeEach resets the db each time');
    testT.end();
  });
  test3('calling test a third time', (testT, server, db) => {
    realT.equal(server.count, 2, 'the server does not get reset each time');
    realT.equal(db.count, 0, 'beforeEach resets the db each time');
    testT.end();
    realT.end();
  });
});
*/
originalTape('wrapper for tape supports "after"', (realT) => {
  const test = tapeExtras(require('tape'), {
    before(done) {
      const server = new Server();
      done(null, server);
    },
    after(server, done) {
      console.log('after!!!')
      console.log(server)
      realT.equal(server.count, 0);
      server.stop(done);
    }
  });
  test('calling test', (testT, server) => {
    realT.equal(server.name, 'server');
    realT.equal(server.count, 0, 'before should have been called and made a new server');
    testT.end();
  });
  test('calling test again', (testT, server) => {
    realT.equal(server.name, 'server');
    realT.equal(server.count, 1, 'afterEach should have stopped the server');
    testT.end();
  });
  test('calling test a third time', (testT, server) => {
    realT.equal(server.name, 'server');
    realT.equal(server.count, 2, 'afterEach should have stopped the server, again');
    testT.end();
    realT.end();
  });
});
  // check to make sure it also works with beforeEach:
//   const test2 = tapeExtras(require('tape'), {
//     beforeEach(done) {
//       const server = new Server();
//       done(null, server);
//     },
//     afterEach(server, done) {
//       server.stop(done);
//     }
//   });
//   test2('calling test', (testT, server) => {
//     realT.equal(server.name, 'server');
//     realT.equal(server.count, 0, 'before should have been called and made a new server');
//     testT.end();
//   });
//   test2('calling test again', (testT, server) => {
//     realT.equal(server.name, 'server');
//     realT.equal(server.count, 0, 'afterEach should have stopped the server');
//     testT.end();
//   });
//   test2('calling test a third time', (testT, server) => {
//     realT.equal(server.name, 'server');
//     realT.equal(server.count, 0, 'afterEach should have stopped the server, again');
//     testT.end();
//   });
//
//   // check to make sure it also works with both before and beforeEach:
//   const test3 = tapeExtras(require('tape'), {
//     before(done) {
//       const server = new Server();
//       done(null, server);
//     },
//     beforeEach(server, done) {
//       done(null, new Db(server));
//     },
//     afterEach(server, db, done) {
//       server.stop(() => {
//         db.drop(done);
//       });
//     }
//   });
//   test3('calling test', (testT, server, db) => {
//     realT.equal(server.name, 'server');
//     realT.equal(server.count, 0, 'before should have been called and made a new server');
//     realT.equal(db.name, 'db');
//     realT.equal(db.count, 0, 'beforeEach resets the db each time');
//     testT.end();
//   });
//   test3('calling test again', (testT, server, db) => {
//     realT.equal(server.count, 1, 'the server does not get reset each time');
//     realT.equal(db.count, 0, 'beforeEach resets the db each time');
//     testT.end();
//   });
//   test3('calling test a third time', (testT, server, db) => {
//     realT.equal(server.count, 2, 'the server does not get reset each time');
//     realT.equal(db.count, 0, 'beforeEach resets the db each time');
//     testT.end();
//     realT.end();
//   });
// });


//     after(server, db, done) {
//       server.stop(done);
//     },

// test2('calls before and passes result to test methods', (t, server, db) => {
//   t.equal(t instanceof Server, true, 'before was run');
//   t.equal(t instanceof Db, true, 'beforeEach was run');
//   t.end();
// });

// test('this is some test 2', (t, server, db) => {
//   t.equal(false, false, 'false is false');
//   t.end();
// });
