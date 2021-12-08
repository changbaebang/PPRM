# PPRM
promise study

# How to use
* make the js file for browser : `npm run build-for-browser-js` -> `promise-for-browser-out.js`
* test : `npm run test`
* Set How many time delay on package.json - promise > interval as ms
* Set Debug mode on package.json - debus as boolean

# Purpose
* How to run async. - with timer??

## What is Promise
Promise support async jobs.
for example, there are t1, t2, t3.
t3 can run after t2 is done.
t2 can run after t1 is done.
we can run t1, t2, t3 on same call stack.
But somtimes we can need async job - none blocked and serialized
- with ajax jobs and so on.

## How to work?
Simply code with promise first.
After it is done, the code from then would run.

These are condition for running code from then.
* add codes with then
* code from promise(promise's excutor) determine resolve or reject

But promise from then call.
These are condition for runing code from other thens.
* add codes with then - other thens.
* code from prevous then determine end

# Supported Specs
* new Promise(executor)
* Promise.all(iterable) (supposed that iterable is the type of Array<Promise>)
* Promise.resolve(reason)
* Promise.reject(value)
* Promise.prototype.then(func)
* Promise.prototype.catch(func)
* Promise.prototype.finally(func)

# Module
## for running?
I write it with vallia JS.

## for testing
* mocha
  * TC from documents' samples

# ETC
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
* https://caniuse.com/?search=es6
* https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Functions/Arrow_functions