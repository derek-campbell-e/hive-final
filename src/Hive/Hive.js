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
  let hive = makeEmitter({});

  hive.sockets = {};

  let io = require('socket.io')(4202);
  io.on('connection', function(socket){
    debug("WE HAVE A NEW SOCKET CONNECTION YALL");
    console.log("NEW SOCKET", socket.id);
    hive.sockets[socket.id] = socket;
  });
  
  // start by making the module an event emitter
  

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

  hive.tailLogs = function(args, callback){
    hive.on('logline', function(line){
      hive.blast('logline', line);
      console.log(line);
    });
    callback();
  };

  hive.stopTailLogs = function(args, callback){
    hive.off('logline');
    callback();
  };

  hive.tailErrors = function(args, callback){
    hive.on('errorline', function(line){
      hive.blast('errorline', line);
      console.error(line);
    });

    callback();
  };

  hive.stopTailErrors = function(args, callback){
    hive.off('errorline');
    callback();
  };

  hive.blast = function(eventName,...args){
    for(let socketID in hive.sockets){
      let socket = hive.sockets[socketID];
      socket.emit.apply(socket, [eventName, ...args]);
    }
  };

  let init = function(){
    debug("initializing the hive...");
    hive.log("well well well");
    delegateBinder(hive);
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