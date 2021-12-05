// const
const PROMISE_SHOULD_BE_USE_WITH_NEW = 'Promises must be constructed via new';
const PROMISE_SHOULD_BE_WORKING_WITH_FUNCTION = 'Promise constructor\'s argument is not a function';

// abstraction
const raiseException = (errorType) => (errorMessage) => {
    throw new errorType(errorMessage);
};
const rasieTypeError = (message) => raiseException(TypeError);


// implemetations
const shouldBeUseWithNew = rasieTypeError(PROMISE_SHOULD_BE_USE_WITH_NEW);
const shouldBeRundWithFunction = raiseException(PROMISE_SHOULD_BE_WORKING_WITH_FUNCTION);

module.exports = {
  shouldBeUseWithNew,
  shouldBeRundWithFunction,
};