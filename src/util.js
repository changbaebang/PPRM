// const
const DEBUG = require('../package.json').debug || false;
const OBJECT_TYPE_NAME = 'object';
const FUNCTION_TYPE_NAME = 'function';
const TYPE_ERROR_PROTOTYPE_NAME = 'TypeError';

// abstraction
const validatorBuilder = (validator) => {
  return (something) => validator(something);
}

const validatorBuilderWithTypeofName = (type) => {
  const typeVaildator = (something) => typeof something === type;
  return validatorBuilder(typeVaildator);
};
const validatorBuilderWithTypeofNameAndPrototypeName = (type, name) => {
  const typeAndProtoTypeNameValidator = (something) => typeof something === type && something.prototype.name === name;
  return validatorBuilder(typeAndProtoTypeNameValidator);
};

const isSomething = (vaildator) => {
  return (something) => {
    return vaildator(something);
  }
};

// implementation
const objectVaildator = validatorBuilderWithTypeofName(OBJECT_TYPE_NAME);
const functionValidator = validatorBuilderWithTypeofName(FUNCTION_TYPE_NAME);
const typeErrorValidator = validatorBuilderWithTypeofNameAndPrototypeName(FUNCTION_TYPE_NAME, TYPE_ERROR_PROTOTYPE_NAME)

const isObject = isSomething(objectVaildator);
const isFunction = isSomething(functionValidator);
const isTypeError = isSomething(typeErrorValidator);
const isDebug = DEBUG;
const log = DEBUG == true ? console.log : () => {};
const getRandName = DEBUG == true ? () => Math.random().toString(36).substr(2,11) : () => {}; // for debug

module.exports = {
  isObject,
  isFunction,
  isTypeError,
  isDebug,
  log,
  getRandName,
};