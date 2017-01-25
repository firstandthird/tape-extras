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

it('wrapper for tape supports "beforeEach"', (mochaDone) => {
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
    chai.expect(server.name).to.equal('server');
    chai.expect(db.name).to.equal('db');
    chai.expect(db.server).to.equal(server);
    server.stop(() => {
      db.drop(testT.end);
    });
  });
  test('calling test again', (testT, server, db) => {
    chai.expect(server.name).to.equal('server');
    chai.expect(db.name).to.equal('db');
    chai.expect(server.count).to.equal(1);
    chai.expect(db.count).to.equal(0);
    testT.end();
    mochaDone();
  });
});
