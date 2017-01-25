'use strict';
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

it('wrapper for tape supports "after" with "before"', (mochaDone) => {
  const test = tapeExtras(require('tape'), {
    before(done) {
      done(null, new Server());
    },
    after(server, done) {
      chai.expect(server.count).to.equal(0);
      mochaDone();
    }
  });
  test('calling test', (testT, server) => {
    chai.expect(server.count).to.equal(0);
    testT.end();
  });
  test('calling test again', (testT, server) => {
    chai.expect(server.count).to.equal(0);
    testT.end();
  });
  test('calling test a third time', (testT, server) => {
    chai.expect(server.count).to.equal(0);
    testT.end();
  });
});

it('wrapper for tape supports "after" with "beforeEach"', (mochaDone) => {
  const originalServer = new Server();
  freshy.unload('tape');
  const test = tapeExtras(require('tape'), {
    beforeEach(done) {
      originalServer.stop(() => {
        done(null, originalServer);
      });
    },
    after(server, done) {
      chai.expect(server.count).to.equal(3);
      server.stop(mochaDone);
    }
  });
  test('calling test', (testT, server) => {
    chai.expect(server.count).to.equal(1);
    testT.end();
  });
  test('calling test again', (testT, server) => {
    chai.expect(server.count).to.equal(2);
    testT.end();
  });
  test('calling test a third time', (testT, server) => {
    chai.expect(server.count).to.equal(3);
    testT.end();
  });
});

it('wrapper for tape supports "after" with "beforeEach" and "before"', (mochaDone) => {
  freshy.unload('tape');
  const test = tapeExtras(require('tape'), {
    before(done) {
      done(null, new Server());
    },
    beforeEach(server, done) {
      server.stop(() => {
        done(null, new Db(server));
      });
    },
    after(server, db, done) {
      chai.expect(server.count).to.equal(3);
      chai.expect(db.count).to.equal(0);
      server.stop(mochaDone);
    }
  });
  test('calling test', (testT, server, db) => {
    chai.expect(server.count).to.equal(1);
    testT.end();
  });
  test('calling test again', (testT, server, db) => {
    chai.expect(server.count).to.equal(2);
    chai.expect(db.count).to.equal(0);
    testT.end();
  });
  test('calling test a third time', (testT, server, db) => {
    chai.expect(server.count).to.equal(3);
    chai.expect(db.count).to.equal(0);
    testT.end();
  });
});
