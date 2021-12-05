// const
const PROMISE_SHOULD_BE_USE_WITH_NEW = 'Promises must be constructed via new';
const PROMISE_SHOULD_BE_WORKING_WITH_FUNCTION = 'Promise constructor\'s argument is not a function';
const OBJECT_IS_NOT_PROMISE = "Promise should be passed for this function";

// abstraction
const raiseException = (errorType) => (errorMessage) => {
    throw new errorType(errorMessage);
};
const rasieTypeError = (message) => raiseException(TypeError);


// implemetations
const shouldBeUseWithNew = rasieTypeError(PROMISE_SHOULD_BE_USE_WITH_NEW);
const shouldBeRundWithFunction = rasieTypeError(PROMISE_SHOULD_BE_WORKING_WITH_FUNCTION);
const shouldBePromiseForArgument = rasieTypeError(OBJECT_IS_NOT_PROMISE);

module.exports = {
  shouldBeUseWithNew,
  shouldBeRundWithFunction,
  shouldBePromiseForArgument
};