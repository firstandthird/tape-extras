'use strict';
// const originalTape = require('tape');
const tapeExtras = require('../');
const chai = require('chai');
const freshy = require('freshy');
freshy.unload('tape');

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

it('wrapper for tape supports "afterEach" when .end not explicitly called', (mochaDone) => {
  const test = tapeExtras(require('tape'), {
    before(done) {
      const server = new Server();
      done(null, server);
    },
    afterEach(server, done) {
      server.stop(done);
      mochaDone();
    }
  });
  test('calling test', (testT, server) => {
    testT.plan(1);
    testT.equal(server.name, 'server');
  });
});

it('wrapper for tape supports "afterEach"', (mochaDone) => {
  freshy.unload('tape');
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
    chai.expect(server.name).to.equal('server');
    chai.expect(server.count).to.equal(0);
    testT.end();
  });
  test('calling test again', (testT, server) => {
    chai.expect(server.name).to.equal('server');
    chai.expect(server.count).to.equal(1);
    testT.end();
  });
  test('calling test a third time', (testT, server) => {
    chai.expect(server.name).to.equal('server');
    chai.expect(server.count).to.equal(2);
    testT.end();
    mochaDone();
  });
});

it('wrapper for tape supports "afterEach" with "beforeEach"', (mochaDone) => {
  // check to make sure it also works with beforeEach:
  freshy.unload('tape');
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
    chai.expect(server.name).to.equal('server');
    chai.expect(server.count).to.equal(0);
    testT.end();
  });
  test2('calling test again', (testT, server) => {
    chai.expect(server.name).to.equal('server');
    chai.expect(server.count).to.equal(0);
    testT.end();
  });
  test2('calling test a third time', (testT, server) => {
    chai.expect(server.name).to.equal('server');
    chai.expect(server.count).to.equal(0);
    testT.end();
    mochaDone();
  });
});

it('wrapper for tape supports "afterEach" with "beforeEach"', (mochaDone) => {
  // check to make sure it also works with both before and beforeEach:
  freshy.unload('tape');
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
    chai.expect(server.name).to.equal('server');
    chai.expect(server.count).to.equal(0);
    chai.expect(db.name).to.equal('db');
    chai.expect(db.count).to.equal(0);
    testT.end();
  });
  test3('calling test again', (testT, server, db) => {
    chai.expect(server.count).to.equal(1);
    chai.expect(db.count).to.equal(0);
    testT.end();
  });
  test3('calling test a third time', (testT, server, db) => {
    chai.expect(server.count).to.equal(2);
    chai.expect(db.count).to.equal(0);
    testT.end();
    mochaDone();
  });
});
