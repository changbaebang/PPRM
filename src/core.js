// Promise core
import { isFunction } from './util.js'
import { shouldBeRundWithFunction } from './error.js';

// Promise core
class Promise {
  // STATUS
  // pending: initial state, neither fulfilled nor rejected.
  // fulfilled: meaning that the operation was completed successfully.
  // rejected: meaning that the operation failed.
  static STATUS = Object.freeze({
    PENDING: 0,
    FULFILLED: 1,
    REJECTED: 2
  });

  /**
  * @param {function} excutor - A function to be executed by the constructor, during the process of constructing the new Promise object. The executor is custom code that ties an outcome to a promise. You, the programmer, write the executor.
  */
  constructor(excutor) {
    if(isFunction(excutor) === false) {
      shouldBeRundWithFunction();
    }

    // resolutionFunc(value) // call on resolved
    // rejectionFunc(reason) // call on rejected
    excutor(this.resolve, this.reject);
  }
  resolve() {

  }
  reject() {

  }
}



export default Promise;