module.exports = function Hive(){
  const uuid = require('./common/uuid');
  const makeEmitter = require('./common/makeEmitter');
  const delegateBinder = require('./common/delegateBinder');
  const debug = require('debug')('hive');

  // start by making the module an event emitter
  let hive = makeEmitter({});

  // our meta object for data
  hive.meta = {};
  hive.meta.id = uuid();

  // our object for bee awareness
  hive.bees = {};

  // our object for tasks
  hive.tasks = {};

  // our delegates
  hive.delegates = {};

  //
  hive.delegates.on = {};
  hive.delegates.on.beeSpawn = function(bee){
    hive.bees[bee.id] = bee;
  };

  hive.delegates.on.beeRetire = function(bee){
    hive.bees[bee.id] = null;
    delete hive.bees[bee.id];
  };

  hive.delegates.on.taskStart = function(bee, task){
    hive.tasks[task.meta.id] = {
      task: task,
      bee: bee.meta.id
    };
  };

  hive.delegates.on.taskComplete = function(bee, task){
    hive.tasks[task.meta.id] = null;
    delete hive.tasks[task.meta.id];
  };

  let init = function(){
    debug("initializing the hive...");
    delegateBinder(hive);
    let options = {
      loadAllDrones: false,
      loadDrones: ['writeEverySecond']
    };
    let Queen = require('./Queen')(hive, options);
    //let worker = Queen.loadWorker('fileWriter');
    setInterval(function(){
      process.stdout.write('\033c');
      for(let taskID in hive.tasks){
        debug(hive.tasks[taskID].task.meta);
      }
    }, 100);
    return hive;
  };

  return init();
};