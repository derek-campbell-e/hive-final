module.exports = function Drone(Hive, Queen, MindFile){
  const debug = require('debug')('drone');

  let drone = require('./Bee')(Hive);

  let mind = require('./common/Mind')(MindFile); 
  
  // seeing how we can wrap a drone mind in a function
  if(typeof mind.module === 'function'){
    mind.module = mind.module();
  }
  
  drone.mind = mind.module;

  // keep track of the workers we spawn to do our tasks
  drone.workers = {};
  
  drone.meta.class = 'drone';
  drone.meta.mind = mind.name;
  drone.meta.taskName = function(){
    return drone.meta.class + ":" + drone.meta.mind;
  };

  drone.taskTimer = null;

  let delegates = {};
  delegates.threads = {};

  delegates.threads = {};
  delegates.threads.shouldStartThread = function(){
    if(!drone.mind.maxThreads){
      return true;
    }
    if(drone.mind.maxThreads > Object.keys(drone.tasks).length){
      return true;
    }
    return false;
  };

  drone.bindHz = function(bindedFunction, hz){
    drone.taskTimer = setInterval(bindedFunction, hz);
  };

  drone.bindLater = function(bindedFunction, laterSchedule){
    const later = require('later');
    later.date.localTime();
    let schedule = later.parse.text(laterSchedule);
    drone.taskTimer = later.setInterval(bindedFunction, schedule);
  };

  drone.bindCron = function(bindedFunction, cronSchedule){
    const later = require('later');
    later.date.localTime();
    let schedule = later.parse.cron(cronSchedule);
    drone.taskTimer = later.setInterval(bindedFunction, schedule);
  };

  // will be bound each time for the task that is currently being run
  drone.spawnWorker = function(workerMind, absolutePath, options){
    let taskID = this;
    let worker = Queen.spawnWorker(drone, workerMind, absolutePath);
    drone.workers[worker.meta.id] = {
      task: taskID,
      worker: worker
    };
    return worker;
  };

  // creates a function with a (this) object referring to drone
  // and callback
  drone.createBindedFunction = function(){
    let spawnWorker = function(){
      return this.spawnWorker.apply(this, arguments);
    }.bind(drone);
    let func = function droneTask(callback){
      if(delegates.threads.shouldStartThread()){
        let taskID = drone.taskStart(drone.meta.taskName());
        callback = callback.bind(taskID);
        drone.spawnWorker = drone.spawnWorker.bind(taskID);
        let droneExport = drone.exportForMind();
        droneExport.spawnWorker = spawnWorker;
        droneExport.worker = spawnWorker;

        drone.mind.task.apply(droneExport, [callback]);
      }
    }.bind(drone, drone.taskComplete);
    return func;
  };

  drone.bindTask = function(){
    let isHz = drone.mind.hasOwnProperty('hz');
    let isLater = drone.mind.hasOwnProperty('later');
    let isCron = drone.mind.hasOwnProperty('cron');
    let bindedFunction = drone.createBindedFunction();
  
    if(isHz){
      return drone.bindHz(bindedFunction, drone.mind.hz);
    }

    if(isLater){
      return drone.bindLater(bindedFunction, drone.mind.later);
    }

    if(isCron){
      return drone.bindCron(bindedFunction, drone.mind.cron);
    }

  };

  drone.gc = function(){
    let isHz = drone.mind.hasOwnProperty('hz');
    let isLater = drone.mind.hasOwnProperty('later');
    let isCron = drone.mind.hasOwnProperty('cron');

    if(isHz){
      drone.taskTimer = clearInterval(drone.taskTimer);
    }

    if(isLater || isCron){
      drone.taskTimer = drone.taskTimer.clear();
    }
  };

  drone.start = function(callback){
    callback = callback || function(){};
    debug("starting...");
    drone.meta.hasStarted = true;
    drone.completionCallback = callback;
    drone.bindTask();
  };

  drone.now = function(callback){
    callback = callback || function(){};
    drone.meta.hasStarted = true;
    drone.completionCallback = callback;
    let bindedFunction = drone.createBindedFunction();
    bindedFunction();
  };

  let init = function(){
    drone.spawn();
    return drone;
  };

  return init();
};