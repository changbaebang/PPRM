// build js code for browser.
const Promise = require('./index');
const fs = require('fs');

const INTERVAL = require('./package.json').promise.interval;
const DEBUG = require('./package.json').debug || false;
const dest = 'promise-for-browser-out.js';
const utilJs = 'src/util.js';
const errorJs = 'src/error.js';
const coreJs = 'src/core.js';

const messagePrinter = (message) => console.error(message);
const doubleSpace = '\n\n';

const checkFile = new Promise((resolve, reject) => {
  fs.open(dest, 'wx', (err, fd) => {
    if (err) {
      if (err.code === 'EEXIST') {
        console.error(`${dest} already exists`);
        resolve(true);
        return;
      }
  
      throw err;
    }
    console.error(`${dest} is not exists`);
    resolve(false);
  });
});

const deleteFile = checkFile.then((result) => {
  const exists = result;
  if(exists === false) {
    return true;
  } else {
    return new Promise((resolve, reject) => {
      fs.unlink(dest, (err) => {
        if (err)
          throw err;
        console.log(`successfully deleted ${dest}`);
        resolve(true);
      });
    })
  }
}, messagePrinter);



const writeConsts = deleteFile.then(() => {
  return new Promise((resolve, reject) => {
    // const INTERVAL = require('../package.json').promise.interval;
    // const DEBUG = require('../package.json').debug || false;
    const consts = `//consts\nconst INTERVAL = ${INTERVAL};\nconst DEBUG = ${DEBUG};` + doubleSpace;
    fs.appendFile(dest, consts, (err) => {
      if (err) throw err;
      console.log('write const data');
      resolve();
    });
  });
}, messagePrinter);


const copyUtilJS = writeConsts.then(() => {
  return new Promise((resolve, reject) => {
    // copy src/util.js
    // line 3 to 42
    fs.readFile(utilJs, (err, data) => {
      if (err) throw err;
      console.log(`read ${utilJs}`);
      const toWrite = data.toString().split('\n').slice(2, 38).join('\n');
      resolve(toWrite);
    });
  });
}, messagePrinter).then((data) => {
  fs.appendFile(dest, data + doubleSpace, (err) => {
    if (err) throw err;
    console.log(`write ${utilJs}`);
  });
}, messagePrinter);


const copyErrorJS = copyUtilJS.then(() => {
  return new Promise((resolve, reject) => {
    // copy src/error.js
    // line 0 to 18
    fs.readFile(errorJs, (err, data) => {
      if (err) throw err;
      console.log(`read ${errorJs}`);
      const toWrite = data.toString().split('\n').slice(0, 18).join('\n');
      resolve(toWrite);
    });
  });
}, messagePrinter).then((data) => {
  fs.appendFile(dest, data + doubleSpace, (err) => {
    if (err) throw err;
    console.log(`write ${errorJs}`);
  });
}, messagePrinter);


const copyCoreJS = copyErrorJS.then(() => {
  return new Promise((resolve, reject) => {
    // copy src/core.js
    // line 5 to 413
    fs.readFile(coreJs, (err, data) => {
      if (err) throw err;
      console.log(`read ${coreJs}`);
      const toWrite = data.toString().split('\n').slice(5, 412).join('\n');
      resolve(toWrite);
    });
  });
}, messagePrinter).then((data) => {
  fs.appendFile(dest, data, (err) => {
    if (err) throw err;
    console.log(`write ${coreJs}`);
  });
}, messagePrinter);







