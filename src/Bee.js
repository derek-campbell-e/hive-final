module.exports = function Bee(Hive){
  // our common tools
  const common = require('./common');
  const uuid = common.uuid;
  const makeEmitter = common.makeEmitter;
  const delegateBinder = common.delegateBinder;
  const makeLogger = common.makeLogger;
  const render = common.renderer;

  const moment = require('moment');
 
  let debug = require('debug')('bee');

  // start by making the module an event emitter
  let bee = common.commonObject();
  bee.meta.hasStarted = false;
  bee.meta.class = 'base';
  bee.meta.mind = 'default';
  bee.meta.spawnAt = -1;
  bee.meta.stdout = "";
  bee.meta.stderr = "";
  bee.meta.maxLog = 10; //only want last 50 lines of logs and errors
  bee.meta.threads = function(){
    return Object.keys(bee.tasks).length;
  };

  bee.meta.debugName = function(){
    return bee.meta.class + ":" + bee.meta.mind;
  };

  // make our bee a logger
  makeLogger(bee);
  
  // holds the tasks object for the bee;
  // we may end out having more than one task based on timeouts and delays and such
  bee.tasks = {};

  // hold an object for our timers,
  // or setIntervals, setTimeouts
  // close out these timers on gc
  bee.timers = {};
  bee.timers.taskComplete = null;

  bee.on('logline', function(line){
    Hive.emit("logline", line);
  });

  bee.on('errorline', function(line){
    Hive.emit("errorline", line);
  });

  // our delegate methods
  bee.delegates = {};
  bee.delegates.on = {};

  bee.delegates.on.spawn = function(){
    debug = require('debug')(bee.meta.debugName());
    bee.meta.spawnAt = moment().format('x');
    debug("i am being spawned... better let the hive know");
    Hive.emit("on:beeSpawn", this);
  };

  bee.delegates.on.retire = function(){
    bee.retireSpawn();
    bee.gc();
    debug("i am being retired... the hive should know about my two-weeks");
    Hive.emit("on:beeRetire", this);
    bee.gc();
  };

  bee.delegates.on.taskStart = function(task){
    Hive.emit('on:taskStart', bee, task);
  };

  bee.delegates.on.taskComplete = function(task){
    bee.retireSpawn();
    Hive.emit('on:taskComplete', bee, task);
    bee.tasks[task.meta.id] = null;
    delete bee.tasks[task.meta.id];
  };

  bee.spawn = function(){
    bee.emit("on:spawn", bee);
  };

  bee.retire = function(){
    bee.emit("on:retire", bee);
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
    let task = require('./Task')(bee, taskName);
    bee.tasks[task.meta.id] = task;
    bee.emit.apply(bee, ['on:taskStart', bee.tasks[task.meta.id]]);
    task.run();
    return task.meta.id;
  };

  bee.completionCallback = function(){};

  // called when task is complete
  // this -> refers to taskID that has been completed
  bee.taskComplete = function(){
    let taskID = this;
    let task = bee.tasks[taskID];
    task.stop();
    bee.timers.taskComplete = setTimeout(function(){
      bee.emit.apply(bee, ["on:taskComplete", task]);
    }, 5000);
    bee.completionCallback.apply(bee, arguments);
    bee.completionCallback = function(){};
  };

  // garbage collection, remove timers, etc
  // each bee should impliment its own gc
  bee.gc = function(){
    for (let timerKey in bee.timers){
      let timer = bee.timers[timerKey];
      //if(typeof )
    }
  };

  bee.stopTimer = function(timer){
    switch(typeof timer){
      //case ''
    }
  };

  bee.render = render;

  bee.export = function(){
    let exports = {};
    for(let key in bee.meta){
      let exportData = bee.meta[key];
      if(typeof exportData === 'function'){
        exports[key] = exportData();
      } else {
        exports[key] = exportData;
      }
      exports[key].__proto__ = bee.meta[key].__proto__;
    }
    return exports;
  };

  bee.exportForMind = function(){
    let exports = {};
    exports.meta = bee.export();
    exports.log = bee.log;
    exports.error = bee.error;
    return exports;
  };

  // our private initializer
  let init = function(){
    debug("initializing a new bee...");
    delegateBinder(bee);
    return bee;
  };

  return init();
};