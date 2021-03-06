module.exports = function Worker(Hive, Queen, MindFile){
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
        worker.taskComplete.apply(currentTaskID, arguments);
      }

      if(typeof taskName === 'undefined'){
        // WORKER IS DONE
        workerCompleteCallback.apply(worker, arguments); // callback with arguments passed from the last worker task
        return;
      }
      
      currentTaskID = worker.taskStart(worker.meta.taskName(taskName));
      let task = worker.mind[taskName];
      let taskTickArguments = [...argsMinusCallback, ...arguments, loop];
      try {
        task.apply(worker, taskTickArguments); // feed in arguments from caller, take out final callback, add our nextTick callback
      } catch (error){
        error.name = taskName;
        worker.error(error);
        loop.apply(loop, taskTickArguments);
      }
      
    };

    loop.apply(worker, []); // start running the async loop
  };

  worker.start = function(){
    if(worker.mind.isSync){
      return worker.runSync.apply(worker, arguments);
    }
    return worker.runAsync.apply(worker, arguments);
  };

  //overrite Bee.taskComplete
  worker.taskComplete = function(){
    let taskID = this;
    let task = worker.tasks[taskID];
    task.stop.apply(task, arguments);
    setTimeout(worker.delegates.onTaskComplete.bind(worker, task), 5000);
  };

  let init = function(){
    worker.spawn();
    worker.start.__proto__ = worker;
    return worker.start;
  };

  return init();
};