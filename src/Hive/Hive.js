module.exports = function Hive(){
  // our common tools
  const common = require('../common');
  const uuid = common.uuid;
  const makeEmitter = common.makeEmitter;
  const delegateBinder = common.delegateBinder;
  const makeLogger = common.makeLogger;

  const debug = require('debug')('hive');
  const path = require('path');
  let package = require(path.join(__dirname, '..', '..', 'package.json'));
  
  // start by making the module an event emitter
  let hive = makeEmitter({});

  hive.sockets = {};

  let io = require('socket.io')(4202);  

  // make our hive a logger
  makeLogger(hive);

  // our cli object
  // might make this private??
  hive.cli = null;

  // our meta object for data
  hive.meta = {};
  hive.meta.id = uuid();
  hive.meta.version = package.version;
  hive.meta.class = 'hive';
  hive.meta.mind = 'default';
  hive.meta.stdout = "";
  hive.meta.stderr = "";

  // our object for bee awareness
  hive.bees = {};

  // a special place for our queen
  hive.queen = null;

  // our object for tasks
  hive.tasks = {};

  // our delegates
  hive.delegates = {};
  hive.delegates.socket = require('./delegates/socket')(hive, io);
  hive.delegates.cli = require('./delegates/cli')(hive);
  hive.delegates.on = require('./delegates/on')(hive);

  hive.getStats = function(args){
    let hiveExport = {};
    hiveExport.hive = hive.meta.id;
    hiveExport.bees = {};
    hiveExport.queen = hive.queen.export();
    hiveExport.tasks = {};
    for(let beeID in hive.bees){
      hiveExport.bees[beeID] = hive.bees[beeID].export();
    }
    for(let taskID in hive.tasks){
      let taskInfo = hive.tasks[taskID];
      hiveExport.tasks[taskID] = taskInfo.task.export();
    }
    return hiveExport;
  };
  
  hive.blast = function(eventName,...args){
    for(let socketID in hive.sockets){
      let socket = hive.sockets[socketID];
      socket.emit.apply(socket, [eventName, ...args]);
    }
  };

  let init = function(){
    debug("initializing the hive...");
    let options = {
      startAllDrones: false,
      startDrones: ['writeEverySecond']
    };
    hive.queen = require('../Queen')(hive, options);
    hive.cli = require('./Cli')(hive);
    console.log(hive.meta.stdout);
    return hive;
  };

  return init();
};