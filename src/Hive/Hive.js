module.exports = function Hive(){
  // our common tools
  const common = require('../common');
  const uuid = common.uuid;
  const makeEmitter = common.makeEmitter;
  const delegateBinder = common.delegateBinder;
  const makeLogger = common.makeLogger;
  const Table = require('cli-table');

  const debug = require('debug')('hive');
  const path = require('path');
  const io = require('socket.io')(4202);  
  
  let package = require(path.join(__dirname, '..', '..', 'package.json'));
  
  // start by making the module an event emitter
  let hive = makeEmitter({});

  hive.sockets = {};

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

  hive.renderStats = function(stats){
    let fullStats = [];
    let hiveTable = new Table({
      head: ['Hive', 'ID']
    });

    hiveTable.push(['Hive', stats.hive]);
    
    let queenTable = new Table({
      head: ['Queen', 'ID', 'Spawned At', 'STDOUT', 'STDERR']
    });

    queenTable.push([
      stats.queen.debugName,stats.queen.id, stats.queen.spawnAt, stats.queen.stdout, stats.queen.stderr
    ]);

    let beesTable = new Table({
      head: ['ID', 'BEE', 'MIND', 'Spawned At', 'STDOUT', 'STDERR']
    });

    for(let beeID in stats.bees){
      let bee = stats.bees[beeID];
      beesTable.push([bee.id, bee.class, bee.mind, bee.spawnAt, bee.stdout, bee.stderr]);
    }

    let tasksTable = new Table({
      head: ['TASKID', 'NAME', 'RunTime', 'START', 'END']
    });

    for(let taskID in stats.tasks){
      let task = stats.tasks[taskID];
      tasksTable.push([task.id, task.name, task.runTime, task.startTime, task.endTime]);
    }

    fullStats.push(hiveTable.toString());
    fullStats.push(queenTable.toString());
    fullStats.push(beesTable.toString());
    fullStats.push(tasksTable.toString());

    return fullStats.join("\n");
  };

  hive.gc = function(){
    debug("we are exiting so do some garbage collection...");
    for (let beeID in hive.bees){
      let bee = hive.bees[beeID];
      bee.gc();
    }
    for (let taskID in hive.tasks){
      let taskInfo = hive.tasks[taskID];
      taskInfo.task.gc();
    }
    hive.queen.gc();
    process.exit(2);
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
      //startDrones: ['writeEverySecond']
    };
    hive.queen = require('../Queen')(hive, options);
    hive.cli = require('./Cli')(hive);
    setTimeout(function(){
      hive.queen.spawnChild('drone', 'autocommit');
    }, 2000);
   
    //console.log(hive.meta.stdout);
    process.on('SIGINT', hive.gc);
    return hive;
  };

  return init();
};