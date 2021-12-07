// from https://github.com/then/promise/blob/master/test/resolver-tests.js
const assert = require('better-assert');
const Promise = require('../index.js');

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
      it('demo - 4', function(done) {
        const promise1 = Promise.resolve(3);
        const promise2 = 42;
        const promise3 = new Promise((resolve, reject) => {
          setTimeout(reject, 100, 'foo');
        });
        Promise.all([promise1, promise2, promise3]).then((values) => {
          done(new Error("not called"));
        }, (message) => {
          assert(message === 'foo');
          done();
        });
      });
      it('demo - 5', function(done) {
        const promise1 = Promise.resolve(3);
        const promise2 = 42;
        const promise3 = new Promise((resolve, reject) => {
          setTimeout(reject, 100, 'foo');
        });
        Promise.all([promise1, promise3, promise2]).then((values) => {
          done(new Error("not called"));
        }, (message) => {
          assert(message === 'foo');
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
        let p = Promise.resolve([1,2,3]);
        p.then(function(v) {
          assert(v.length === resolves.length);
          assert(v.every((val, index) => val === resolves[index]));
          done();
        });
      });
      it('Resolving another Promise', function(done) {
        let original = Promise.resolve(33);
        let cast = Promise.resolve(original);
        let checkOrder = 0;
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
        let p1 = Promise.resolve({
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
        let thenable = { then: function(resolve) {
          throw new TypeError('Throwing');
          resolve('Resolving');
        }};

        let p2 = Promise.resolve(thenable);
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
        let thenable = { then: function(resolve) {
          resolve('Resolving');
          throw new TypeError('Throwing');
        }};

        let p3 = Promise.resolve(thenable);
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
          assert(value === 'Success!');
          done();
        });
      });
      it('Using the then method - 1', function(done) {
        let p1 = new Promise((resolve, reject) => {
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
        let p1 = new Promise((resolve, reject) => {
          reject(new Error("Error!"));
        });
        p1.then(value => {
          done(new Error("not called"));
        }, reason => {
          assert(reason.toString() === 'Error: Error!');
          done();
        });
      });
      it('Then cast', function(done) {
        let checkSequence = 0;
        const p1 = new Promise((resolve, reject) => {resolve()});
        const p2 = p1.then(value => {
          assert(checkSequence !== 0);
          done();
        }, reason => {
          done(new Error("not called"));
        });
        checkSequence++;
        assert(p1 !== p2)
        //false
        //resolve
      });
      it('small chain - 1', function(done) {
        let checkSequence = 0;
        const p1 = new Promise((resolve, reject) => {resolve()});
        const p2 = p1.then(value => {
          assert(checkSequence !== 0);
          checkSequence++;
        }, reason => {
          done(new Error("not called"));
        });
        const p3 = p2.then(value => {
          assert(checkSequence !== 1);
          done();
        }, reason => {
          done(new Error("not called"));
        });
        checkSequence++;
      });
      it('small chain - 2', function(done) {
        let checkSequence = 0;
        const p1 = new Promise((resolve, reject) => {resolve(1)});
        const p2 = p1.then(value => {
          assert(checkSequence !== 0);
          assert(value === 1);
          checkSequence++;
          return 2;
        }, reason => {
          done(new Error("not called"));
        });
        const p3 = p2.then(value => {
          assert(checkSequence !== 1);
          assert(value === 2);
          done();
        }, reason => {
          done(new Error("not called"));
        });
        checkSequence++;
      });
      it('small chain - 3', function(done) {
        let checkSequence = 0;
        const p1 = new Promise((resolve, reject) => {
          resolve(1);
        });
        const p2 = p1.then(value => {
          assert(checkSequence !== 0);
          assert(value === 1);
          checkSequence++;
        }, reason => {
          done(new Error("not called"));
        });
        const p3 = p2.then(value => {
          assert(checkSequence !== 1);
          assert(value === undefined);
        }, reason => {
          done(new Error("not called"));
        });
        p3.then(value => {
          assert(checkSequence !== 1);
          assert(value === undefined);
          done();
        }, reason => {
          done(new Error("not called"));
        });
        checkSequence++;
      });
      it('small chain - 4', function(done) {
        let checkSequence = 0;
        const p1 = new Promise((resolve, reject) => {
          resolve(1);
        });
        const p2 = p1.then(value => {
          assert(checkSequence !== 0);
          assert(value === 1);
          checkSequence++;
        }, reason => {
          done(new Error("not called"));
        });
        const p3 = p2.then(value => {
          assert(checkSequence !== 1);
          assert(value === undefined);
          checkSequence++;
          return new Error('Test');
        }, reason => {
          done(new Error("not called"));
        });
        const p4 = p3.then(value => {
          assert(checkSequence !== 2);
          assert(value.toString() === 'Error: Test');
          checkSequence++;
          throw new Error('Test');
          return 2;
        }, reason => {
          done(new Error("not called"));
        });
        p4.then(value => {
          done(new Error("not called"));
        }, reason => {
          assert(checkSequence !== 3);
          assert(reason.toString() === 'Error: Test');
          done();
        });
        checkSequence++;
      });
      it('Async - 1', function(done) {
        let checkSequence = 0;
        const p1 = new Promise((resolve, reject) => {
          setTimeout(resolve, 100);
        });
        const p2 = p1.then(value => {
          assert(checkSequence !== 0);
          done();
        }, reason => {
          done(new Error("not called"));
        });
        checkSequence++;
        assert(p1 !== p2)
        //false
        //resolve
      });
      it('Async - 2', function(done) {
        const p1 = new Promise((resolve, reject) => {
          setTimeout(reject, 100);
          setTimeout(resolve, 1000);
        });
        const p2 = p1.then(value => {
          console.log('good')
          done(new Error("not called"));
        }, reason => {
          done();      
        });
        assert(p1 !== p2)
        //false
        //resolve
      });
      it('Chaining - 1', function(done) {
        Promise.resolve('foo')
          .then(function(string) {
            assert(string === 'foo');
            return new Promise(function(resolve, reject) {
                string += 'bar';
                resolve(string);
            });
          })
          .then(function(string) {
            assert(string === 'foobar');
            string += 'baz';
            return string;
          })
          .then(function(string) {
            assert(string === 'foobarbaz');
            done();
          });
      });
      it('Chaining - 2', function(done) {
        Promise.resolve('foo')
          .then(function(string) {
            assert(string === 'foo');
            return new Promise(function(resolve, reject) {
                string += 'bar';
                reject(string);
            });
          })
          .then(function(string) {
            done(new Error("not called"));
            string += 'baz';
            return string;
          }, function(reason) {
            assert(reason === 'foobar');
            return reason + 'baz';
          })
          .then(function(string) {
            assert(string === 'foobarbaz');
            done();
          });
      });
      it('Chaining - 3', function(done) {
        Promise.resolve('foo')
          .then(function(string) {
            assert(string === 'foo');
            return new Promise(function(resolve, reject) {
                string += 'bar';
                reject(string);
            });
          })
          .then(function(string) {
            done(new Error("not called"));
            string += 'baz';
            return string;
          }, function(message) {
            assert(message === 'foobar');
            throw new Error('Test');
            return message + 'baz';
          })
          .then(function(string) {
            done(new Error("not called"));
          }, function(reason) {
            assert(reason.toString() === 'Error: Test');
            done();
          });
      });
      it('Chaining - 4', function(done) {
        let step = 0;
        Promise.resolve('foo')
        .then(function(string) {
          assert(string === 'foo');
          assert(step === 1);
          step++;
          return new Promise(function(resolve, reject) {
            setTimeout(function() {
              string += 'bar';
              assert(step === 2)
              step++;
              resolve(string);
            }, 1);
          });
        })
        .then(function(string) {
          assert(string === 'foobar');
          assert(step === 3);
          step++;
          setTimeout(function() {
            string += 'baz';
            assert(string === 'foobarbaz');
            assert(step === 5);
            done()
            step++;
          }, 10)
          return string;
        })
        .then(function(string) {
          assert(string === 'foobar');
          assert(step === 4);
          step++;
        });
        step++;
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
      it('Using and chaining the catch method', function(done) {
        let p1 = new Promise(function(resolve, reject) {
          resolve('Success');
        });
        p1.then(function(value) {
          // "Success!"
          assert(value == 'Success');
          throw new Error('oh, no!');
        }).catch(function(e) {
           // "oh, no!"
          assert(e.message === 'oh, no!');
        }).then(function(result){
          assert(result === undefined);
        }, function () {
          done(new Error("not called"));
        });
        // The following behaves the same as above
        p1.then(function(value) {
          //"Success!"
          assert(value == 'Success');
          return Promise.reject('oh, no!');
        }).catch(function(e) {
          // "oh, no!"
          assert(e === 'oh, no!');
        }).then(function(){
          done();
        }, function () {
          done(new Error("not called"));
        });
      });
      it('Gotchas when throwing errors', function (done) {
        // Throwing an error will call the catch method most of the time
        let p1 = new Promise(function(resolve, reject) {
          throw new Error('Uh-oh!');
        });
    
        p1.catch(function(e) {
          // "Uh-oh!"
          assert(e.message === 'Uh-oh!');
        });
    
        // // Errors thrown inside asynchronous functions will act like uncaught errors
        // let p2 = new Promise(function(resolve, reject) {
        //   setTimeout(function() {
        //     throw new Error('Uncaught Exception!');
        //   }, 1000);
        // });
    
        // p2.catch(function(e) {
        //   // This is never called
        //   done(new Error("not called"));
        // });
       
        // Errors thrown after resolve is called will be silenced
        let p3 = new Promise(function(resolve, reject) {
          resolve();
          throw new Error('Silenced Exception!');
        });
    
        let p4 = p3.catch(function(e) {
          // This is never called
          done(new Error("not called"));
        });

        p4.then(() => {
          done();
        });
      });
      it('If it is resolved - 1', function (done) {
        //Create a promise which would not call onReject
        let p1 = Promise.resolve("calling next");
    
        let p2 = p1.catch(function (reason) {
            //This is never called
            done(new Error("not called"));
        });
    
        p2.then(function (value) {
            /* calling next */
            assert(value === 'calling next');
            done();
        }, function (reason) {
            done(new Error("not called"));
        });
      });
      it('If it is resolved - 2', function (done) {
        //Create a promise which would not call onReject
        let p11 = new Promise(function(resolve, reject) {
          setTimeout(function() {
            resolve("calling next");
          }, 1000);
        });
    
        let p2 = p11.catch(function (reason) {
            //This is never called
            done(new Error("not called"));
        });
    
        p2.then(function (value) {
            /* calling next */
            assert(value === 'calling next');
            done();
        }, function (reason) {
            done(new Error("not called"));
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