// from https://github.com/then/promise/blob/master/test/resolver-tests.js
import assert from 'better-assert';
import Promise from '../index.js';

let sentinel = {};
let promise = new Promise(function (resolve) {
  resolve(sentinel);
});

let _it = it;
describe('required-tests', function () {
  describe('spec test', function () {
    describe('new Promise', function () {
      it('new Promise without function', function () {
        try {
          new Promise({});
        } catch (ex) {
          assert(ex instanceof TypeError);
          return;
        }
        throw new Error('Should have thrown a TypeError');
      });
      it('User Promise without new', function() {
        try {
          Promise(() => {});
        } catch (ex) {
          assert(ex instanceof TypeError);
          return;
        }
        throw new Error('Should have thrown a TypeError');
      });
      it('demo', function(done) {
        const promise1 = new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve('foo');
          }, 300);
        });
        promise1.then((value) => {
          //console.log(value);
          assert(value === 'foo');
          // expected output: "foo"
          done();
        });
        // expected output: [object Promise]
        assert(typeof promise1 === 'object')
        assert(promise1 instanceof Promise === true)
      });
    });
    describe('Promise.all', function () {
      it('type of Promise.all', function () {
        assert(typeof Promise.all === 'function');
      });
      it('demo', function(done) {
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
    describe('Promise.resolve', function () {
      it('type of Promise.resolve', function () {
        assert(typeof Promise.resolve === 'function');
      });
      it('Using the static Promise.resolve method', function(done) {
        Promise.resolve('Success').then(function(value) {
          // "Success"
          assert(value === 'Success');
        }, function(value) {
          // not called
          done(new Error("not called"));
        });
      });
    });
    describe('Promise.reject', function () {
      it('type of Promise.reject', function () {
        assert(typeof Promise.reject === 'function');
      });
      it('demo', function(done) {
        function resolved(result) {
          done(new Error("not called"));
        }
        function rejected(result) {
          assert(typeof result === 'object');
          assert(result.toString() === 'Error: fail');
          done();
        };
      });
    });
    describe('Promise.prototype.then', function () {
      it('type of Promise.prototype.then', function () {
        assert(typeof Promise.prototype.then === 'function');
      });
      it('demo', function(done) {
        const promise1 = new Promise((resolve, reject) => {
          resolve('Success!');
        });
        promise1.then((value) => {
          // expected output: "Success!"
          assert(value === 'Success!');
          done();
        });
      });
    });
    describe('Promise.prototype.catch', function () {
      it('type of Promise.prototype.catch', function () {
        assert(typeof Promise.prototype.catch === 'function');
      });
      it('demo', function(done) {
        const promise1 = new Promise((resolve, reject) => {
          throw 'Uh-oh!';
        });
        promise1.catch((error) => {
          // expected output: Uh-oh!
          assert(error === 'Uh-oh!');
          done();
        });
      });
    });
    describe('Promise.prototype.finally', function () {
      it('type of Promise.prototype.finally', function () {
        assert(typeof Promise.prototype.finally === 'function');
      });
      it('demo', function(done) {
        function checkMail() {
          return new Promise((resolve, reject) => {
            if (Math.random() > 0.5) {
              resolve('Mail has arrived');
            } else {
              reject(new Error('Failed to arrive'));
            }
          });
        }
        checkMail()
          .then((mail) => {
            // Mail has arrived
            assert(mail === 'Mail has arrived');
          })
          .catch((err) => {
            // ;Error: Failed to arrive
            assert(err.toString() === 'Error: Failed to arrive')
          })
          .finally(() => {
            done();
          });
      });
    });
  });
});