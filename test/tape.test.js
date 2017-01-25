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

it('wraps the tape assertion callback', (mochaDone) => {
  const test = tapeExtras(require('tape'), {
    before(done) {
      const server = new Server();
      done(null, server);
    }
  });
  test('calling test', (testT) => {
    chai.expect(typeof testT.equal).to.equal('function');
    testT.equal(true, true);
    testT.end();
    mochaDone();
  });
});
