// const
const { isFunction, log, getRandName, isDebug } = require('./util');
const { shouldBeRundWithFunction, shouldBePromiseForArgument } = require('./error');
const INTERVAL = require('../package.json').promise.interval;

// privates


// Promise core
const Promise = class {
  /**
   * @param {function} excutor - A function to be executed by the constructor, during the process of constructing the new Promise object. The executor is custom code that ties an outcome to a promise. You, the programmer, write the executor.
   */
  constructor(excutor) {
    if(isFunction(excutor) === false) {
      shouldBeRundWithFunction();
    }
    this.status = Promise.STATUS.PENDING; // status of promise pending - fullfiled - rejected
    this.value = null;  // value of excutor - this value would be update when _resolve or _reject is called.
    this.resolutionFunc = null;   // call on resolved from then
    this.rejectionFunc = null;    // call on rejected from then
    this.excutor = excutor;

    if(isDebug === true) {  // when debug mode, we can make name for promises
      this._name = 'PROMISE-' + getRandName();  // please do not use _name beyond _toString()
    }

    log(`Crate Promise(${this._toString()})`);
    if(excutor === Promise._defaultExcutor) {
      log(`Promise(${this._toString()}) has default excutor`);
      return; // prevent run defaultExcutor
    }

    // excute code immediately and bind _resove and _reejct function to excutor
    try {
      excutor(this._resolve.bind(this), this._reject.bind(this));
    } catch (e) {
      // if any exception call reject
      // but the resolve is already called, do not call reject.
      if(this.status === Promise.STATUS.FULFILLED) {
        return;
      }
      log(`Promise ${this._toString()} excutor have exception ${e.toString()}`);
      this._reject(e);
    }
  }

  
  /**
   * The Promise.resolve() method returns a Promise object that is resolved with a given value.
   * @param {any} value - Argument to be resolved by this Promise. Can also be a Promise or a thenable to resolve.
   * @return {Promise} A Promise that is resolved with the given value, or the promise passed as value, if the value was a promise object.
   */
  static resolve = (value) => {
    // resolve with Promise - cast
    if(Promise._isPromiseObject(value) === true) {
      log('resolve with casting ' + value._toString());
      return value;
    }
    // resolve with thenable - object must have 'then' property and the value should be function.
    if(Promise._isThenable(value) === true) {
      log(`resolve with thenable : ${typeof value['then']} ${value['then']} `);
      return new Promise(value['then']);
    }
    log(`resolve with ${value}`);
    let promise = new Promise(Promise._defaultExcutor);
    promise._resolve(value);
    return promise;
  }

  /**
   * The Promise.reject() method returns a Promise object that is rejected with a given reason.
   * @param {any} reason - Reason why this Promise rejected.
   * @return {Promise} A Promise that is rejected with the given reason.
   */
  static reject = (reason) => {
    log(`reject with ${reason}`);
    let _promise = new Promise(Promise._defaultExcutor);
    _promise._reject(reason);
    return _promise;
  }

  /**
   * The then() method returns a Promise. It takes up to two arguments: callback functions for the success and failure cases of the Promise.
   * @param {function} onFulfilled - (Optional) A Function called if the Promise is fulfilled.
   * @param {function} onRejected - (Optional) A Function called if the Promise is rejected. 
   * @return {any} Once a Promise is fulfilled or rejected, the respective handler function (onFulfilled or onRejected) will be called asynchronously (scheduled in the current thread loop)
   */
  then(onFulfilled, onRejected) {
    // this.resolutionFunc = onFulfilled;
    // this.rejectionFunc = onRejected;
    // return new Promise((resolve, reject) =>{
    //   if(this.status === Promise.STATUS.PENDING) {
    //     log('PENDING with then');
    //   } else if(this.status === Promise.STATUS.FULFILLED) {
    //     log(`then FULFILLED with then ${this.value}`);
    //     this._requestCallback();
    //   } else { // Promise.STATUS.REJECTED
    //     log(`then REJECTED with then ${this.value}`);
    //     this._requestCallback();
    //   }
    // });
    log(`then(${this._toString()}) : ${onFulfilled} / ${onRejected}`);
    this.resolutionFunc = onFulfilled;
    this.rejectionFunc = onRejected;
    const next = Promise._create();
    this.nextPromise = next;
    log(`then(${this._toString()}) : current : ${this._toString()} nextPromise : ${this.nextPromise._toString()}`);

    if(this.status === Promise.STATUS.PENDING) {
      log(`then(${this._toString()}) : PENDING`);
    }
    else if(this.status === Promise.STATUS.FULFILLED) {
      log(`then(${this._toString()}) : FULFILLED with ${this.value}`);
      this._requestCallback();
    } else { // Promise.STATUS.REJECTED
      log(`then(${this._toString()}) : REJECTED ${this.value}`);
      this._requestCallback();
    }
    return next;
  }

  // privates
  /**
   * Promise is in one of these states
   * @readonly
   * @enum {number}
   */
  static STATUS = Object.freeze({
    /** pending: initial state, neither fulfilled nor rejected. */
    PENDING: 0,
    /** fulfilled: meaning that the operation was completed successfully. */
    FULFILLED: 1,
    /** rejected: meaning that the operation failed. */
    REJECTED: 2
  });

  /**
   * Null excutoer for Promise
   * @readonly
   */
  static _defaultExcutor = () => {};
  /**
   * Async job interval
   * this value from package.json - promise/interval
   * @readonly
   */
  static _asyncInterval = INTERVAL;
  /**
   * Check the object is promise or not
   * @param {any} obj - object to check
   * @return {boolean} if promise ture, if not false
   */
  static _isPromiseObject = (obj) => obj instanceof Promise
  /**
   * Check the object is thenable or not
   * @param {any} obj - object to check
   * @return {boolean} if thenable ture, if not false
   */
  static _isThenable = (obj) => {
    return typeof obj === 'object' && obj['then'] && typeof obj['then'] === `function`;
  }
  /**
   * create promise object
   * @return {Promise} duplication of obj
   */
  static _create = () => {
    return new Promise(Promise._defaultExcutor);
  }

  /**
   * function for debug
   * please use with only log
   * @return {String} Information about this(Promise)
   */
  _toString() {
    const name = isDebug === true ? '(' + this._name + ')' : '';
    return '[Promise' + name + '] status : ' + this.status + ' value : ' + this.value;
  }
  /**
   * The resove method for excuter of Constructor
   * @param {any} value - Argument to be resolved by this Promise. Can also be a Promise or a thenable to resolve.
   */
  _resolve(value) {
    if(this.status !== Promise.STATUS.PENDING)
      return;

    log(`_resolve : ${value}`);
    this.status = Promise.STATUS.FULFILLED;
    this.value = value;
    this._requestCallback();
  }

  /**
   * The reject method for excuter of Constructor
   * @param {any} reason - Reason why this Promise rejected.
   */
  _reject(reason) {
    if(this.status !== Promise.STATUS.PENDING)
      return;

    log(`_reject : ${reason}`);
    this.status = Promise.STATUS.REJECTED;
    this.value = reason;
    this._requestCallback();
  }
  /**
   * The trigger for call on resolved or call on rejected
   * only _resolve & _reject & then call call this function
   * just use timer for assyn job
   */
  _requestCallback() {
    if(this._requested === true)
      return;
    
    this._requested = true;
    log(`_requestCallback(${this._toString()}) is called`);
    setTimeout(function() {
      this._excuteCallBack();
    }.bind(this), Promise._asyncInterval);
  }
  /**
   * call on resolved or call on rejected
   */
  _excuteCallBack() {
    log(`_excuteCallBack(${this._toString()}) is called ${this.status}`);
    if(this.status === Promise.STATUS.PENDING) {
      log(`_excuteCallBack call is not validate : ${this.status}`);
    } else if(this.status === Promise.STATUS.FULFILLED) {
      if(this.resolutionFunc === null) {
        log(`_excuteCallBack call is not validate : ${this.status}`);
      } else {
        let result = undefined;
        try {
          result = this.resolutionFunc(this.value);
          if(this.nextPromise) {
            log(`_excuteCallBack - current : ${this._toString()} nextPromise : ${this.nextPromise._toString()}`);
            if(Promise._isPromiseObject(result) === true) {
              if(result.status === Promise.STATUS.PENDING) {
                // re-link result and nextPromise
                result.resolutionFunc = this.nextPromise.resolutionFunc;
                result.rejectionFunc = this.nextPromise.rejectionFunc;
                result.nextPromise = this.nextPromise.nextPromise;
              } else if(result.status === Promise.STATUS.FULFILLED) {
                this.nextPromise._resolve(result.value)
              } else { // Promise.STATUS.REJECTED
                this.nextPromise._reject(result.value);
              }
            } else {
              this.nextPromise._resolve(result);
            }
          }
        } catch (e) {
          if(this.nextPromise) {
            result = e;
            this.nextPromise._reject(e);
          }
        }
        log(`previoud : ${this.value} current : ${result}`);
        this.resolutionFunc = null;
        this.rejectionFunc = null;
      }
    } else {  // Promise.STATUS.REJECTED
      if(this.rejectionFunc === null) {
        log(`_excuteCallBack call is not validate : ${this.status}`);
      } else {
        let result = undefined;
        try {
          result = this.rejectionFunc(this.value);
          if(this.nextPromise) {
            this.nextPromise._resolve(result);
          }
        } catch (e) {
          try{
            this.nextPromise._reject(e);
          } catch (err) {
            throw e;
          }
        }
        this.resolutionFunc = null;
        this.rejectionFunc = null;
      }
    }
    this._requested = false;
  }
}

module.exports =  Promise;