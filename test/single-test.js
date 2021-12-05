// from https://github.com/then/promise/blob/master/test/resolver-tests.js
const assert = require('better-assert');
const Promise = require('../index.js');


let _it = it;
describe('single-tests', function () {
  it('Chaining - 1', function(done) {
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
  // it('Chaining', function(done) {
  //   Promise.resolve('foo')
  //     // 1. Receive "foo", concatenate "bar" to it, and resolve that to the next then
  //     .then(function(string) {
  //       console.log(`Receive "foo" : ${string}`);
  //       return new Promise(function(resolve, reject) {
  //         setTimeout(function() {
  //           string += 'bar';
  //           console.log(`concatenate "bar" : ${string}`);
  //           resolve(string);
  //         }, 1);
  //       });
  //     })
  //     // 2. receive "foobar", register a callback function to work on that string
  //     // and print it to the console, but not before returning the unworked on
  //     // string to the next then
  //     .then(function(string) {
  //       console.log(`receive "foobar" "bar" : ${string}`);
  //       setTimeout(function() {
  //         string += 'baz';
  //         console.log(`register a callback : ${string}`);
  //         console.log(string); // foobarbaz
  //       }, 1)
  //       return string;
  //     })
  //     // 3. print helpful messages about how the code in this section will be run
  //     // before the string is actually processed by the mocked asynchronous code in the
  //     // previous then block.
  //     .then(function(string) {
  //       console.log(`print helpful messages : ${string}`);
  //       console.log("Last Then:  oops... didn't bother to instantiate and return " +
  //                   "a promise in the prior then so the sequence may be a bit " +
  //                   "surprising");

  //       // Note that `string` will not have the 'baz' bit of it at this point. This
  //       // is because we mocked that to happen asynchronously with a setTimeout function
  //       console.log(string); // foobar
  //     });

  //   // logs, in order:
  //   // Last Then: oops... didn't bother to instantiate and return a promise in the prior then so the sequence may be a bit surprising
  //   // foobar
  //   // foobarbaz
  // });  
});