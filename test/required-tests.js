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
          }, 1);
        });
        promise1.then((value) => {
          // expected output: "foo"
          assert(value === 'foo');
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
          done();
        }, function(value) {
          // not called
          done(new Error("not called"));
        });
      });
      it('Resolving an array', function(done) {
        const resolves = [1,2,3];
        var p = Promise.resolve([1,2,3]);
        p.then(function(v) {
          assert(v.length === resolves.length);
          assert(v.every((val, index) => val === resolves[index]));
          done();
        });
      });
      it('Resolving another Promise', function(done) {
        var original = Promise.resolve(33);
        var cast = Promise.resolve(original);
        var checkOrder = 0;
        cast.then(function(value) {
          assert(value === 33);
          assert(checkOrder === 1);
          done();
        });
        checkOrder++;
        assert(original === cast);
        // logs, in order:
        // original === cast ? true
        // value: 33
      });
      it('Resolving thenables and throwing Errors - 1', function(done) {
        // Resolving a thenable object
        var p1 = Promise.resolve({
          then: function(onFulfill, onReject) {
            onFulfill('fulfilled!');
          }
        });
        assert(p1 instanceof Promise === true);
        p1.then(function(v) {
            // "fulfilled!"
            assert(v === 'fulfilled!');
            done();
          }, function(e) {
            // not called
            done(new Error("not called"));
        });
      });
      it('Resolving thenables and throwing Errors - 2', function(done) {
        // Thenable throws before callback
        // Promise rejects
        var thenable = { then: function(resolve) {
          throw new TypeError('Throwing');
          resolve('Resolving');
        }};

        var p2 = Promise.resolve(thenable);
        p2.then(function(v) {
          // not called
          done(new Error("not called"));
        }, function(e) {
          assert(e.toString() === 'TypeError: Throwing');
          done();
        });
      });
      it('Resolving thenables and throwing Errors - 3', function(done) {
        // Thenable throws after callback
        // Promise resolves
        var thenable = { then: function(resolve) {
          resolve('Resolving');
          throw new TypeError('Throwing');
        }};

        var p3 = Promise.resolve(thenable);
        p3.then(function(v) {
          // "Resolving"
          assert(v === 'Resolving');
          done();
        }, function(e) {
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
        Promise.reject(new Error('fail')).then(resolved, rejected);
      });
      it('Using the static Promise.reject() method', function(done) {
        Promise.reject(new Error('fail')).then(function() {
          // not called
        }, function(error) {
          assert(error.toString() === 'Error: fail');
          done();
        });
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
          //console.log(`passing value : ${value}`);
          assert(value === 'Success!');
          done();
        });
      });
      it('Using the then method - 1', function(done) {
        var p1 = new Promise((resolve, reject) => {
          resolve('Success!');
        });
        p1.then(value => {
          assert(value === 'Success!');
          done();
        }, reason => {
          done(new Error("not called"));
        });
      });
      it('Using the then method - 2', function(done) {
        var p1 = new Promise((resolve, reject) => {
          reject(new Error("Error!"));
        });
        p1.then(value => {
          done(new Error("not called"));
        }, reason => {
          assert(reason.toString() === 'Error: Error!');
          done();
        });
      });
      it('Chaining', function(done) {
        Promise.resolve('foo')
          // 1. Receive "foo", concatenate "bar" to it, and resolve that to the next then
          .then(function(string) {
            console.log(`Receive "foo" : ${string}`);
            return new Promise(function(resolve, reject) {
              setTimeout(function() {
                string += 'bar';
                console.log(`concatenate "bar" : ${string}`);
                resolve(string);
              }, 1);
            });
          })
          // 2. receive "foobar", register a callback function to work on that string
          // and print it to the console, but not before returning the unworked on
          // string to the next then
          .then(function(string) {
            console.log(`receive "foobar" "bar" : ${string}`);
            setTimeout(function() {
              string += 'baz';
              console.log(`register a callback : ${string}`);
              console.log(string); // foobarbaz
            }, 1)
            return string;
          })
          // 3. print helpful messages about how the code in this section will be run
          // before the string is actually processed by the mocked asynchronous code in the
          // previous then block.
          .then(function(string) {
            console.log(`print helpful messages : ${string}`);
            console.log("Last Then:  oops... didn't bother to instantiate and return " +
                        "a promise in the prior then so the sequence may be a bit " +
                        "surprising");

            // Note that `string` will not have the 'baz' bit of it at this point. This
            // is because we mocked that to happen asynchronously with a setTimeout function
            console.log(string); // foobar
          });

        // logs, in order:
        // Last Then: oops... didn't bother to instantiate and return a promise in the prior then so the sequence may be a bit surprising
        // foobar
        // foobarbaz
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