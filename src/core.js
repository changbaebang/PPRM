// Promise core
import { isFunction } from './util.js'
import { shouldBeRundWithFunction } from './error.js';

// privates
/**
 * Promise is in one of these states
 * @readonly
 * @enum {number}
 */
const STATUS = Object.freeze({
  /** pending: initial state, neither fulfilled nor rejected. */
  PENDING: 0,
  /** fulfilled: meaning that the operation was completed successfully. */
  FULFILLED: 1,
  /** rejected: meaning that the operation failed. */
  REJECTED: 2
});


// Promise core
const Promise = class {
  /**
   * @param {function} excutor - A function to be executed by the constructor, during the process of constructing the new Promise object. The executor is custom code that ties an outcome to a promise. You, the programmer, write the executor.
   */
  constructor(excutor) {
    if(isFunction(excutor) === false) {
      shouldBeRundWithFunction();
    }
    this.status = STATUS.PENDING;
    this.value = null;
    this.resolutionFunc = null; // call on resolved
    this.rejectionFunc = null; // call on rejected
    try {
      excutor(this._resolve.bind(this), this._reject.bind(this));
    } catch (e) {
      //console.log(`excutor have exception ${e.toString()}`);
      //console.log(`Promise ${this._toString()}`);
      if(this.status !== STATUS.FULFILLED) {
        this._reject(e);
      }
    }
  }

  
  /**
   * The Promise.resolve() method returns a Promise object that is resolved with a given value.
   * @param {any} value - Argument to be resolved by this Promise. Can also be a Promise or a thenable to resolve.
   * @return {Promise} A Promise that is resolved with the given value, or the promise passed as value, if the value was a promise object.
   */
  static resolve = (value) => {
    //console.log(`resolve : ${value}`);
    if(Promise._isPromiseObject(value) === true) {
      //console.log('cast object ' + value._toString());
      return value;
    }
    if(Promise._isThenable(value) === true) {
      //console.log(`thenable : ${typeof value['then']} ${value['then']} `);
      return new Promise(value['then']);
    }
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
    //console.log(`reject : ${reason}`);
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
    console.log(`then : ${onFulfilled} / ${onRejected}`);
    this.resolutionFunc = onFulfilled;
    this.rejectionFunc = onRejected;

    if(this.status === STATUS.PENDING) {
      console.log('PENDING with then');
      return this;
    }
    else if(this.status === STATUS.FULFILLED) {
      console.log(`then FULFILLED with then ${this.value}`);
      this._requestCallback();
      return this;
    } else { // STATUS.REJECTED
      //console.log(`then REJECTED with then ${this.value}`);
      this._requestCallback();
      return this;
    }
  }

  // privates
  static _defaultExcutor = () => {};
  static _asyncInterval = 1000;
  static _isPromiseObject = (obj) => obj instanceof Promise
  static _isThenable = (obj) => {
    return typeof obj === 'object' && obj['then'] && typeof obj['then'] === `function`;
  }

  _toString() {
    return '[Promise] status : ' + this.status + ' value : ' + this.value;
  }
  /**
   * The resove method for excuter of Constructor
   * @param {any} value - Argument to be resolved by this Promise. Can also be a Promise or a thenable to resolve.
   */
  _resolve(value) {
    //console.log(`_resolve : ${value}`);
    this.status = STATUS.FULFILLED;
    this.value = value;
    this._requestCallback();
  }

  /**
   * The reject method for excuter of Constructor
   * @param {any} reason - Reason why this Promise rejected.
   */
  _reject(reason) {
    //console.log(`_reject : ${reason}`);
    this.status = STATUS.REJECTED;
    this.value = reason;
    this._requestCallback();
  }
  /**
   * The trigger for call on resolved or call on rejected
   */
  _requestCallback() {
    //console.log(`_requestCallback is called`);
    setTimeout(function() {
      this._excuteCallBack();
    }.bind(this), Promise._asyncInterval);
  }

  /**
   * call on resolved or call on rejected
   */
  _excuteCallBack() {
    //console.log(`_excuteCallBack is called ${this.status}`);
    if(this.status === STATUS.PENDING) {
      //console.log(`_excuteCallBack call is not validate : ${this.status}`);
    } else if(this.status === STATUS.FULFILLED) {
      if(this.resolutionFunc === null) {
        //console.log(`_excuteCallBack call is not validate : ${this.status}`);
      } else {
        this.resolutionFunc(this.value);
        this.resolutionFunc = null;
        this.rejectionFunc = null;
      }
    } else {  // STATUS.REJECTED
      if(this.rejectionFunc === null) {
        //console.log(`_excuteCallBack call is not validate : ${this.status}`);
      } else {
        this.rejectionFunc(this.value);
        this.resolutionFunc = null;
        this.rejectionFunc = null;
      }
    }
  }
}

export default Promise;