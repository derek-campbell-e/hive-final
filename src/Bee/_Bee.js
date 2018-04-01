module.exports = function Bee(Hive){
  // common tools
  const common = require('../common');
  let debug = require('debug')('bee');

  // our main module
  let bee = new common.commonObject();

  // set our important meta
  bee.meta.hasStarted = false;
  bee.meta.class = 'bee';
  bee.meta.mind = 'default';
  bee.meta.maxLog = 10; // number of lines to keep for our logging/errors
  bee.meta.threads = function(){
    return Object.keys(bee.tasks).length;
  };

  // holds the task objects that the bee is currently working on
  let tasks = {};
  bee.tasks = tasks;

  // hold the objet for our timers
  let timers = {};

  // our delegate methods
  let delegates = require('./delegates')(bee, Hive);

  bee.delegates = {};
  bee.delegates.onTaskComplete = delegates.onTaskComplete;

  bee.isValidDelegate = function(delegateKey, delegateFunction){
    if(delegates.hasOwnProperty(delegateKey) && delegates[delegateKey].hasOwnProperty(delegateFunction)){
      return delegates[delegateKey][delegateFunction];
    }
    return false;
  };

  bee.runDelegate = function(delegateKey, delegateFunction, ...delegateArguments){
    let validDelegate = bee.isValidDelegate(delegateKey, delegateFunction);
    if(validDelegate){
      return validDelegate.apply(bee, delegateArguments);
    }
    bee.log("attempting to run non-existent delegate function", delegateKey, delegateFunction);
    return 
  };

  bee.completionCallback = function(){};
  
  bee.spawn = function(){
    delegates.onSpawn();
  };

  bee.retire = function(){
    delegates.onRetire();
  };

  bee.retireSpawn = function(){
    let hasWorkers = bee.hasOwnProperty('workers') && Object.keys(bee.workers).length > 0;
    if (hasWorkers) {
      for (let workerID in bee.workers){
        let workerObject = bee.workers[workerID];
        let worker = workerObject.worker;
        worker.retire();
        bee.workers[workerID] = null;
        delete bee.workers[workerID];
      }
    }
  };

  bee.taskStart = function(taskName){
    let task = require('../Task')(bee, taskName);
    bee.tasks[task.meta.id] = task;
    //bee.emit.apply(bee, ['on:taskStart', bee.tasks[task.meta.id]]);
    delegates.on.taskStart(bee.tasks[task.meta.id]);
    task.run();
    return task.meta.id;
  };

  bee.taskComplete = function(){
    let taskID = this;
    let task = bee.tasks[taskID];
    task.completeTask.apply(task, arguments);
    timers.taskComplete = setTimeout(function(){
      delegates.onTaskComplete(task);
    }, 5000);
    bee.completionCallback.apply(bee, arguments);
    bee.completionCallback = function(){};
  };

  bee.export = function(){
    let exports = {};
    for(let key in bee.meta){
      let exportData = bee.meta[key];
      if(typeof exportData === 'function'){
        exports[key] = exportData;
      } else {
        exports[key] = exportData;
      }
      exports[key].__proto__ = bee.meta[key].__proto__;
    }
    exports.ps = bee.meta.ps;
    exports.gc = bee.gc;
    exports.refresh = bee.export;
    return exports;
  };

  bee.exportForMind = function(){
    let exports = {};
    exports.meta = bee.export();
    exports.log = bee.log;
    exports.error = bee.error;
    return exports;
  };

  // garbage collection
  bee.gc = function(){
    //bee.retireSpawn();
  };

  // our private initializer
  let init = function(){
    debug('initializing a new bee...');
    return bee;
  };

  return init();
};