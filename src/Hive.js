module.exports = function Hive(){
  const uuid = require('./common/uuid');
  const makeEmitter = require('./common/makeEmitter');
  const delegateBinder = require('./common/delegateBinder');
  const debug = require('debug')('hive');
  const path = require('path');
  let package = require(path.join(__dirname, '..', 'package.json'));

  // start by making the module an event emitter
  let hive = makeEmitter({});

  // our cli object
  // might make this private??
  hive.cli = null;

  // our meta object for data
  hive.meta = {};
  hive.meta.id = uuid();
  hive.meta.version = package.version;

  // our object for bee awareness
  hive.bees = {};

  // a special place for our queen
  hive.queen = null;

  // our object for tasks
  hive.tasks = {};

  // our delegates
  hive.delegates = {};

  //
  hive.delegates.on = {};
  hive.delegates.on.beeSpawn = function(bee){
    hive.bees[bee.meta.id] = bee;
  };

  hive.delegates.on.beeRetire = function(bee){
    hive.bees[bee.meta.id] = null;
    delete hive.bees[bee.meta.id];
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

  // for our cli
  hive.startDrones = function(args, callback){
    if(args.options.all){
      args.drones = '*';
    }
    hive.queen.startDrones(args.drones);
    callback();
  };

  hive.showLogs = function(args, callback){
    let output = "LOGS:\n";
    for(let beeID in hive.bees){
      let bee = hive.bees[beeID];
      output += beeID+"\t"+bee.meta.class+":\t"+bee.meta.mind+"\n";
      output += "\t\t"+bee.meta.stdout.replace(/\n/g, "\n\t\t");
      output += "\n";
    }
    callback(output);
  };

  hive.showErrors = function(args, callback){
    let output = "Errors:\n";
    for(let beeID in hive.bees){
      let bee = hive.bees[beeID];
      output += beeID+"\t"+bee.meta.class+":\t"+bee.meta.mind+"\n";
      output += "\t\t"+bee.meta.stderr.replace(/\n/g, "\n\t\t");
      output += "\n";
    }
    callback(output);
  };

  let init = function(){
    debug("initializing the hive...");
    delegateBinder(hive);
    let options = {
      startAllDrones: false,
      startDrones: ['writeEverySecond']
    };
    hive.queen = require('./Queen')(hive, options);
    hive.cli = require('./Cli')(hive);
    return hive;
  };

  return init();
};