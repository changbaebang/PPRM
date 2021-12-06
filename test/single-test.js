// from https://github.com/then/promise/blob/master/test/resolver-tests.js
const assert = require('better-assert');
const Promise = require('../index.js');


let _it = it;
describe('single-tests', function () {
  it('type of Promise.all', function () {
    assert(typeof Promise.all === 'function');
  });
  it('demo - 1', function(done) {
    const promise1 = Promise.resolve(3);
    const promise2 = 42;
    Promise.all([promise1, promise2]).then((values) => {
      // expected output: Array [3, 42]
      const expected = [3, 42];
      assert(values.length === expected.length);
      assert(values.every((val, index) => val === expected[index]));
      done();
    });
  });
  it('demo - 2', function(done) {
    const promise1 = Promise.reject(3);
    const promise2 = 42;
    Promise.all([promise1, promise2]).then((values) => {
      done(new Error("not called"));
    }, (message) => {
      assert(message === 3);
      done()
    });
  });
  it('demo - 3', function(done) {
    const promise1 = Promise.resolve(3);
    const promise2 = 42;
    const promise3 = new Promise((resolve, reject) => {
      setTimeout(resolve, 100, 'foo');
    });
    Promise.all([promise1, promise2, promise3]).then((values) => {
      // expected output: Array [3, 42, "foo"]
      const expected = [3, 42, "foo"];
      assert(values.length === expected.length);
      assert(values.every((val, index) => val === expected[index]));
      done();
    });
  });

});