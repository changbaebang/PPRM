// const
const { isFunction, log, getRandName, isDebug } = require('./util');
const { shouldBeRundWithFunction, shouldBeUseWithArray } = require('./error');
const INTERVAL = require('../package.json').promise.interval;

// privates


// Promise core
const Promise = class {
  // public
  /**
   * @param {function} excutor - A function to be executed by the constructor, during the process of constructing the new Promise object. The executor is custom code that ties an outcome to a promise. You, the programmer, write the executor.
   */
  constructor(excutor) {
    if(isFunction(excutor) === false) {
      shouldBeRundWithFunction();
    }
    //this.#excutor = excutor;

    if(isDebug === true) {  // when debug mode, we can make name for promises
      this.#name = 'PROMISE-' + getRandName();  
    }

    log(`Crate Promise(${this.#toString()})`);
    if(excutor === Promise.#nullFunction) {
      log(`Promise(${this.#toString()}) has default excutor`);
      return; // prevent run defaultExcutor
    }

    // excute code immediately and bind _resove and _reejct function to excutor
    try {
      excutor(this.#resolve.bind(this), this.#reject.bind(this));
    } catch (e) {
      // if any exception call reject
      // but the resolve is already called, do not call reject.
      if(this.#status === Promise.#STATUS.FULFILLED || this.#doNotRaiseErrorForExcutore === true) {
        return;
      }
      log(`Promise ${this.#toString()} excutor have exception ${e.toString()}`);
      this.#reject(e);
    }
  }
  /**
   * The Promise.all() method takes an iterable of promises as an input, and returns a single Promise that resolves to an array of the results of the input promises. 
   * @param {array} iterable - An iterable object such as an Array.
   * @return {Promise} A Promise that is resolved with the given value, or the promise passed as value, if the value was a promise object.
   */
  static all = (iterable) => {
    if(Array.isArray(iterable) === false) {
      log(`all required array)`);
      shouldBeUseWithArray();
      return;
    }

    const rejected = iterable.find((iter, index) => {
      return Promise.#isPromiseObject(iter) === true &&
      iter.#status === Promise.#STATUS.REJECTED;
    });
    if(rejected !== undefined) {
      log(`all is rejected : ${rejected}`);
      return rejected;
    }

    let promise = Promise.resolve();
    let results = [];
    for(let i in iterable) {
      const iter = iterable[i];
      log(`loop ${i} => ${iter}`);
      if(Promise.#isPromiseObject(iter) === false) {
        promise = promise.then(() => {
          results.push(iter);
          log(`all result : ${iter}`);
          return results;
        }, (message) => {
          log(`all reject : ${message}`);
          throw message;
        });
      } else { 
        promise = promise.then(() => {
          return iter;
        }).then((result) => {
          results.push(result);
          log(`all result : ${result}`);
          return results;
        }, (message) => {
          log(`all reject : ${message}`);
          throw message;
        });
      }
    }
    return promise;
  }
  /**
   * The Promise.resolve() method returns a Promise object that is resolved with a given value.
   * @param {any} value - Argument to be resolved by this Promise. Can also be a Promise or a thenable to resolve.
   * @return {Promise} A Promise that is resolved with the given value, or the promise passed as value, if the value was a promise object.
   */
  static resolve = (value) => {
    // resolve with Promise - cast
    if(Promise.#isPromiseObject(value) === true) {
      log('resolve with casting ' + value.#toString());
      return value;
    }
    // resolve with thenable - object must have 'then' property and the value should be function.
    if(Promise.#isThenable(value) === true) {
      log(`resolve with thenable : ${typeof value['then']} ${value['then']} `);
      return new Promise(value['then']);
    }
    log(`resolve with ${value}`);
    let promise = new Promise(Promise.#nullFunction);
    promise.#resolveRequest(value);
    return promise;
  }

  /**
   * The Promise.reject() method returns a Promise object that is rejected with a given reason.
   * @param {any} reason - Reason why this Promise rejected.
   * @return {Promise} A Promise that is rejected with the given reason.
   */
  static reject = (reason) => {
    log(`reject with ${reason}`);
    let _promise = new Promise(Promise.#nullFunction);
    _promise.#reject(reason);
    return _promise;
  }

  /**
   * The then() method returns a Promise. It takes up to two arguments: callback functions for the success and failure cases of the Promise.
   * @param {function} onFulfilled - (Optional) A Function called if the Promise is fulfilled.
   * @param {function} onRejected - (Optional) A Function called if the Promise is rejected. 
   * @return {promise} Once a Promise is fulfilled or rejected, the respective handler function (onFulfilled or onRejected) will be called asynchronously (scheduled in the current thread loop)
   */
  then(onFulfilled, onRejected) {
    log(`then(${this.#toString()}) : ${onFulfilled} / ${onRejected}`);
    const next = new Promise(Promise.#nullFunction);
    let chain = {
      resolutionFunc: onFulfilled,
      rejectionFunc: onRejected,
      nextPromise: next
    }
    this.#chains.push(chain);
    log(`then(${this.#toString()}) : current : ${this.#toString()} nextPromise : ${chain.nextPromise.#toString()}`);

    if(this.#status === Promise.#STATUS.PENDING) {
      log(`then(${this.#toString()}) : PENDING`);
    }
    else if(this.#status === Promise.#STATUS.FULFILLED) {
      log(`then(${this.#toString()}) : FULFILLED with ${this.#value}`);
      this.#requestCallback();
    } else { // Promise.#STATUS.REJECTED
      log(`then(${this.#toString()}) : REJECTED ${this.#value}`);
      this.#requestCallback();
    }
    return next;
  }
  /**
   * The catch() method returns a Promise and deals with rejected cases only
   * @param {function} onRejected - A Function called when the Promise is rejected
   * @return {promise} 
   */
  catch(onRejected) {
    log(`catch(${this.#toString()}) : ${onRejected}`);
    return this.then((value) => value, onRejected);
  }

  /**
   * The finally() method returns a Promise. 
   * @param {function} onFinally - A Function called when the Promise is settled
   * @return {promise} 
   */
  finally(onFinally) {
    log(`finally(${this.#toString()}) : ${onFinally}`);
    return this.then(onFinally, onFinally);
  }
  
  // privates 
  static #STATUS = Object.freeze({      // Promise is in one of these states
    PENDING:    0,                      //// pending: initial state, neither fulfilled nor rejected.
    FULFILLED:  1,                      //// fulfilled: meaning that the operation was completed successfully.
    REJECTED:   2                       //// rejected: meaning that the operation failed.
  });
  static #asyncInterval = INTERVAL;     // Async job interval
                                        // from package.json - promise/interval

  #status = Promise.#STATUS.PENDING;    // status of promise pending - fullfiled - rejected
  #doNotRaiseErrorForExcutore = false;  // value for rais error on excutor
  #value = undefined;                   // value of excutor - this value would be update when _resolve or _reject is called.
  #chains = [];                         // for promise chain
                                        // chain = { resolutionFunc: onFulfilled function,
                                        //           rejectionFunc: onRejected function,
                                        //           nextPromise: next promise }
  
  #name = null;                         // promise instance name for debug
                                        // please do not use _name beyond _toString()
  
  
  static #nullFunction = () => {};                            // Null function for Promise
  static #isPromiseObject = (obj) => obj instanceof Promise   // Check the object is promise or not
  static #isThenable = (obj) => {                             // Check the object is thenable or not
    return obj !== null && typeof obj === 'object' && obj['then'] && typeof obj['then'] === `function`;
  }

  
  /**
   * The resove method for excuter of Constructor
   * @param {any} value - Argument to be resolved by this Promise. Can also be a Promise or a thenable to resolve.
   */
  #resolve(value) {
    if(this.#status !== Promise.#STATUS.PENDING)
      return;
    
    log(`#resolve${this.#toString()} : ${value}`);
    // resolve with Promise - cast
    let _value = value;
    if(Promise.#isPromiseObject(_value) === true) {
      log('resolve with casting ' + _value.#toString());
      log(`this.#chains : ${this.#chains.length}`);
      if(this.#chains.length) {
        // this -> value -> chains
        _value.#chains = this.#chains.map(chain => chain);
        this.#chains = [{
          resolutionFunc: Promise.#nullFunction,
          rejectionFunc: Promise.#nullFunction,
          nextPromise: _value
        }];
        this.#status = Promise.#STATUS.FULFILLED;
        return;
      } else {
        _value.#chains = [{
          resolutionFunc: (result) => result,
          rejectionFunc: null,
          nextPromise: this
        }];
        this.#doNotRaiseErrorForExcutore = true;
        return;
      }
    }
    // resolve with thenable - object must have 'then' property and the value should be function.
    if(Promise.#isThenable(_value) === true) {
      log(`resolve with thenable : ${typeof value['then']} ${value['then']} `);
      let _thenable = new Promise(_value['then']);
      log(`this.#chains : ${this.#chains.length}`);
      if(this.#chains.length) {
        _thenable.#chains = this.#chains.map(chain => chain);
        this.#chains = [{
          resolutionFunc: Promise.#nullFunction,
          rejectionFunc: null,
          nextPromise: _thenable
        }];
        this.#status = Promise.#STATUS.FULFILLED;
        return;
      } else {
        _thenable.#chains = [{
          resolutionFunc: (result) => result,
          rejectionFunc: null,
          nextPromise: this
        }];
        this.#doNotRaiseErrorForExcutore = true;
        return;
      }
    }
    this.#resolveRequest(_value);
  }

  /**
   * The common resove method
   * @param {any} value - Argument to be resolved by this Promise. Can also be a Promise or a thenable to resolve.
   */
   #resolveRequest(value) {    
    log(`#resolveRequest : ${value}`);
    this.#status = Promise.#STATUS.FULFILLED;
    this.#value = value;
    this.#requestCallback();
  }

  /**
   * The reject method for excuter of Constructor
   * @param {any} reason - Reason why this Promise rejected.
   */
  #reject(reason) {
    if(this.#status !== Promise.#STATUS.PENDING)
      return;

    log(`#reject : ${reason}`);
    this.#rejectRequest(reason);
  }

  /**
   * The common reject method
   * @param {any} reason - Reason why this Promise rejected.
   */
  #rejectRequest(reason) {  
      log(`#rejectRequest : ${reason}`);
      this.#status = Promise.#STATUS.REJECTED;
      this.#value = reason;
      this.#requestCallback();
    }

  /**
   * The trigger for call on resolved or call on rejected
   * only _resolve & _reject & then call call this function
   * just use timer for assyn job
   */
  #requestCallback() {
    log(`#requestCallback(${this.#toString()}) is called`);
    setTimeout(function() {
      this.#excuteCallBack();
    }.bind(this), Promise.#asyncInterval);
  }
  /**
   * call on resolved or call on rejected
   * only requestCallback would be call asynchronously
   */
  #excuteCallBack() {
    log(`#excuteCallBack(${this.#toString()}) is called ${this.#status}`);
    if(this.#status === Promise.#STATUS.PENDING) {
      log(`#excuteCallBack call is not validate : ${this.#status}`);
    } else if(this.#status === Promise.#STATUS.FULFILLED) {
      const _self = this;
      log(`chains\' length: ${this.#chains.length}`);
      this.#chains.forEach(chain => {
        if(chain.resolutionFunc === null) {
          log(`#excuteCallBack call is not validate : ${_self.#status}`);
        } else {
          let result = undefined;
          try {
            result = chain.resolutionFunc(_self.#value);
            log(`#excuteCallBack : ${result}`);
            if(chain.nextPromise) {
              log(`#excuteCallBack - current : ${_self.#toString()} nextPromise : ${chain.nextPromise.#toString()}`);
              if(Promise.#isPromiseObject(result) === true) {
                if(result.#status === Promise.#STATUS.PENDING) {
                  // re-link result and nextPromise
                  result.#chains = chain.nextPromise.#chains;
                } else if(result.#status === Promise.#STATUS.FULFILLED) {
                  chain.nextPromise.#resolve(result.#value)
                } else { // Promise.#STATUS.REJECTED
                  chain.nextPromise.#reject(result.#value);
                }
              } else {
                chain.nextPromise.#resolve(result);
              }
            }
          } catch (e) {
            if(chain.nextPromise) {
              result = e;
              chain.nextPromise.#reject(result);
            }
          }
          log(`previoud : ${_self.#value} current : ${result}`);
          chain.resolutionFunc = null;
          chain.rejectionFunc = null;
        }
      });
    } else {  // Promise.#STATUS.REJECTED
      const _self = this;
      this.#chains.forEach(chain => {
        if(chain.rejectionFunc === null) {
          log(`#excuteCallBack call is not validate : ${this.#status}`);
        } else {
          let result = undefined;
          try {
            result = chain.rejectionFunc(_self.#value);
            if(chain.nextPromise) {
              chain.nextPromise.#resolve(result);
            }
          } catch (e) {
            try{
              chain.nextPromise.#reject(e);
            } catch (err) {
              throw e;
            }
          }
          chain.resolutionFunc = null;
          chain.rejectionFunc = null;
        }
      });
    }
  }

  /**
   * function for debug
   * please use with only log
   * @return {String} Information about this(Promise)
   */
   #toString() {
    const name = isDebug === true ? '(' + this.#name + ')' : '';
    return '[Promise' + name + '] status : ' + this.#status + ' value : ' + this.#value;
  }
}

module.exports =  Promise;