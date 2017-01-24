# tape-extras

## Features

* before
* after
* beforeEach
* afterEach
* passing data to the tests from before/beforeEach

## Example

```javascript

const tape = require('tape');
const tapeExtras = require('tape-extras');

const test = tapeExtras(tape, {
  before(done) {
    const server = new Server();
    done(null, server);
  },
  beforeEach(server, done) {
    const db = new Db();
    done(null, db);
  }
  after(server, db, done) {
    server.stop(done);
  },
  afterEach(server, db, done) {
    db.drop(done);
  },
});

test('this is some test', (t, server, db) => {
  t.equal(true, true, 'true is true');
  t.end();
});

test('this is some test 2', (t, server, db) => {
  t.equal(false, false, 'false is false');
  t.end();
});
```
