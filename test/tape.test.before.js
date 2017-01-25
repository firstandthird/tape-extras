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
it('wrapper for tape supports "before"', (mochaDone) => {
  const test = tapeExtras(require('tape'), {
    before(done) {
      const server = new Server();
      done(null, server);
    }
  });
  test('calling test', (testT, server) => {
    chai.expect(server.name).to.equal('server');
    chai.expect(server.count).to.equal(0);
    server.stop(testT.end);
  });
  test('calling test again', (testT, server) => {
    chai.expect(server.name).to.equal('server');
    chai.expect(server.count).to.equal(1);
    testT.end();
    mochaDone();
  });
});
