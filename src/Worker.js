module.exports = function Worker(Hive, MindFile){
  const debug = require('debug')('worker');
  let worker = require('./Bee')(Hive);

  let mind = require('./common/Mind')(MindFile);

  // seeing how we can wrap a drone mind in a function
  if(typeof mind.module === 'function'){
    mind.module = mind.module();
  }

  worker.mind = mind.module;
  worker.mind.isSync = worker.mind.isSync || false;

  worker.meta.class = 'worker';
  worker.meta.mind = mind.name;
  worker.meta.taskName = function(taskName){
    return worker.meta.class + ":" + taskName;
  };

  worker.runSync = function(){

  };
  
  worker.runAsync = function(){
    let args = [...arguments];
    let workerCompleteCallback = args[args.length - 1];
    let argsMinusCallback = [...args];
    argsMinusCallback.splice(argsMinusCallback.length -1, 1);

    if(typeof workerCompleteCallback !== 'function') {
      debug("NO CALLBACK");
      return;
    }

    let tasks = [...worker.mind.tasks];
    
    let currentTaskID = null;

    let loop = function(){
      let taskName = tasks.shift();

      if(currentTaskID) {
        worker.taskComplete.call(currentTaskID);
      }

      if(typeof taskName === 'undefined'){
        // WORKER IS DONE
        workerCompleteCallback.apply(worker, arguments); // callback with arguments passed from the last worker task
        return;
      }
      
      currentTaskID = worker.taskStart(worker.meta.taskName(taskName));
      let task = worker.mind[taskName];
      let taskTickArguments = [...argsMinusCallback, ...arguments, loop];
      task.apply(worker, taskTickArguments); // feed in arguments from caller, take out final callback, add our nextTick callback
    };

    loop.apply(worker, []); // start running the async loop
  };

  worker.start = function(){
    if(worker.mind.isSync){
      return worker.runSync.apply(worker, arguments);
    }
    return worker.runAsync.apply(worker, arguments);
  };

  let init = function(){
    worker.spawn();
    worker.start.__proto__ = worker;
    return worker.start;
  };

  return init();
};