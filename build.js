// build js code for browser.
const Promise = require('./index');
const fs = require('fs');

const INTERVAL = require('./package.json').promise.interval;
const DEBUG = require('./package.json').debug || false;
const dest = 'promise-for-browser-out.js';
const utilJs = {    
  name: 'src/util.js',
  from: 2,
  to: 38
};
const errorJs = {
  name : 'src/error.js',
  from: 0,
  to: 18
};
const coreJs = {
  name: 'src/core.js',
  from: 5,
  to: 392
};
const jsFiles = [utilJs, errorJs, coreJs];

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
    fs.readFile(utilJs.name, (err, data) => {
      if (err) throw err;
      console.log(`read ${utilJs.name}`);
      const toWrite = data.toString().split('\n').slice(utilJs.from, utilJs.to).join('\n');
      resolve(toWrite);
    });
  });
}, messagePrinter).then((data) => {
  fs.appendFile(dest, data + doubleSpace, (err) => {
    if (err) throw err;
    console.log(`write ${utilJs.name}`);
  });
}, messagePrinter);


const copyErrorJS = copyUtilJS.then(() => {
  return new Promise((resolve, reject) => {
    fs.readFile(errorJs.name, (err, data) => {
      if (err) throw err;
      console.log(`read ${errorJs.name}`);
      const toWrite = data.toString().split('\n').slice(errorJs.from, errorJs.to).join('\n');
      resolve(toWrite);
    });
  });
}, messagePrinter).then((data) => {
  fs.appendFile(dest, data + doubleSpace, (err) => {
    if (err) throw err;
    console.log(`write ${errorJs.name}`);
  });
}, messagePrinter);


const copyCoreJS = copyErrorJS.then(() => {
  return new Promise((resolve, reject) => {
    fs.readFile(coreJs.name, (err, data) => {
      if (err) throw err;
      console.log(`read ${coreJs.name}`);
      const toWrite = data.toString().split('\n').slice(coreJs.from, coreJs.to).join('\n');
      resolve(toWrite);
    });
  });
}, messagePrinter).then((data) => {
  fs.appendFile(dest, data, (err) => {
    if (err) throw err;
    console.log(`write ${coreJs.name}`);
  });
}, messagePrinter);





