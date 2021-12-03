// Promise core
import { isFunction } from './util.js'
import { shouldBeRundWithFunction } from './error.js';

// Promise core
const Promise = class {
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
   * @param {function} excutor - A function to be executed by the constructor, during the process of constructing the new Promise object. The executor is custom code that ties an outcome to a promise. You, the programmer, write the executor.
   */
  constructor(excutor) {
    if(isFunction(excutor) === false) {
      shouldBeRundWithFunction();
    }

    this.status = Promise.STATUS.PENDING;
    this.value = null;
    // resolutionFunc(value) // call on resolved
    // rejectionFunc(reason) // call on rejected
    excutor(Promise.resolve.bind(this), Promise.reject.bind(this));
  }

  /**
   * for resolve & reject
   * @param {any} self - context when resolve or reject is called.
   * @return {Promise} if static call new Promise instance / if not context
   */
  static getPromise(self) {
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
   * The Promise.resolve() method returns a Promise object that is resolved with a given value.
   * @param {any} value - Argument to be resolved by this Promise. Can also be a Promise or a thenable to resolve.
   * @return {Promise} A Promise that is resolved with the given value, or the promise passed as value, if the value was a promise object.
   */
  static resolve(value) {
    //console.log(`resolve : ${value}`);
    let self = Promise.getPromise(this);
    self.status = Promise.STATUS.FULFILLED;
    self.value = value;
    return self;
  }

  /**
   * The Promise.reject() method returns a Promise object that is rejected with a given reason.
   * @param {any} reason - Reason why this Promise rejected.
   * @return {Promise} A Promise that is rejected with the given reason.
   */
  static reject(reason) {
    let self = Promise.getPromise(this);
    self.status = Promise.STATUS.REJECTED;
    self.value = reason;
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

    if(this.status === Promise.STATUS.PENDING) {
      return new Promise(onFulfilled, onRejected);
    }
    else if(this.status === Promise.STATUS.FULFILLED) {
      onFulfilled(this.value);
      return this;
    } else { // Promise.STATUS.REJECTED
      onRejected(this.value);
      return this;
    }
  }
}

export default Promise;