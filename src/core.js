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

/**
 * Get Context
 * @param {any} self - function context
 * @return {Promise} if function context, new Promise / if not, current context
 */
const getPromise = (self) => {
let promise = null;
  if(self instanceof Promise) { // call from excutor of constructor
    promise = self;
  } else { // call as static function
    const defaultExcutor = (resolve, reject) => {};
    promise = new Promise(defaultExcutor);
  }
  return promise;
}

/**
 * excuteCallBack
 * @param {any} self - primose that excute callback
 */
 excuteCallBack = (self) => {
  if(self instanceof Promise === false) {
    console.log(`excuteCallBack call is not validate : invalid self`);
    return;
  }

  if(self.status === STATUS.PENDING) {
    //console.log(`excuteCallBack call is not validate : ${this.status}`);
  } else if(self.status === STATUS.FULFILLED) {
    if(self.resolutionFunc === null) {
      //console.log(`excuteCallBack call is not validate : ${this.status}`);
    } else {
      self.resolutionFunc(this.value);
      self.resolutionFunc = null;
      self.rejectionFunc = null;
    }
  } else {  // STATUS.REJECTED
    if(self.rejectionFunc === null) {
      //console.log(`excuteCallBack call is not validate : ${this.status}`);
    } else {
      self.rejectionFunc(this.value);
      self.resolutionFunc = null;
      self.rejectionFunc = null;
    }
  }
}


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
    excutor(Promise.resolve.bind(this), Promise.reject.bind(this));
  }

  
  /**
   * The Promise.resolve() method returns a Promise object that is resolved with a given value.
   * @param {any} value - Argument to be resolved by this Promise. Can also be a Promise or a thenable to resolve.
   * @return {Promise} A Promise that is resolved with the given value, or the promise passed as value, if the value was a promise object.
   */
  static resolve(value) {
    //console.log(`resolve : ${value}`);
    let self = getPromise(this);
    self.status = STATUS.FULFILLED;
    self.value = value;
    excuteCallBack(self);
    return self;
  }

  /**
   * The Promise.reject() method returns a Promise object that is rejected with a given reason.
   * @param {any} reason - Reason why this Promise rejected.
   * @return {Promise} A Promise that is rejected with the given reason.
   */
  static reject(reason) {
    //console.log(`reject : ${value}`);
    let self = getPromise(this);
    self.status = STATUS.REJECTED;
    self.value = reason;
    excuteCallBack(self);
    return self;
  }

  /**
   * The then() method returns a Promise. It takes up to two arguments: callback functions for the success and failure cases of the Promise.
   * @param {function} onFulfilled - (Optional) A Function called if the Promise is fulfilled.
   * @param {function} onRejected - (Optional) A Function called if the Promise is rejected. 
   * @return {any} Once a Promise is fulfilled or rejected, the respective handler function (onFulfilled or onRejected) will be called asynchronously (scheduled in the current thread loop)
   */
  then(onFulfilled, onRejected) {
    //console.log(`then : ${onFulfilled} / ${onRejected}`);
    this.resolutionFunc = onFulfilled;
    this.rejectionFunc = onRejected;

    if(this.status === STATUS.PENDING) {
      // console.log('PENDING with then');
      return this;
    }
    else if(this.status === STATUS.FULFILLED) {
      // console.log(`FULFILLED with then ${this.value}`);
      excuteCallBack(this);
      return this;
    } else { // STATUS.REJECTED
      // console.log(`REJECTED with then ${this.value}`);
      excuteCallBack(this);
      return this;
    }
  }
}

export default Promise;