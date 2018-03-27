module.exports = function Hive(options){
  const path = require('path');
  // our common tools
  const defaultOptions = {};
  defaultOptions.port = process.env.PORT || 4202;
  defaultOptions.loadAllDrones = true; // load all the drones from the bees/drones folder
  defaultOptions.beeFolder = path.join(__dirname, '..', '..', 'bees');
  defaultOptions.startDronesOnLoad = true;
  defaultOptions.loadDrones = []; // drones to load by default
  defaultOptions.startDrones = []; // drones to start by default
  defaultOptions.maxTaskRuntime = 60 * 1000; // max runtime for tasks in ms, default is 1 minute

  options = require('extend')(true, {}, defaultOptions, options);

  const common = require('../common');
  const delegateBinder = common.delegateBinder;
  const Table = require('cli-table');

  const debug = require('debug')('hive');
  const io = require('socket.io')(options.port);  
  
  let package = require(path.join(__dirname, '..', '..', 'package.json'));
  
  // start by making the module an event emitter
  let hive = new common.commonObject();

  hive.options = options;

  // our private socket variable
  let sockets = {};

  // our remote handler
  let remote = null;

  // our cli object
  // might make this private??
  hive.cli = null;

  

  // our meta object for data
  hive.meta.version = package.version;
  hive.meta.class = 'hive';
  hive.meta.mind = 'default';

  let cli = {};
  cli = require('./_Cli')(hive);

  // our object for bee awareness
  hive.bees = {};

  let queen = null;

  // our object for tasks
  hive.tasks = {};

  // our private delegates
  let delegates = {};
  delegates.socket = require('./delegates/socket')(hive, io, sockets, cli);
  delegates.cli = require('./delegates/cli')(hive, cli);
  delegates.on = require('./delegates/on')(hive);
  remote = require('./Remote')(hive, cli);
  delegates.remote = require('./delegates/remote')(hive, cli);
  

  hive.isValidDelegate = function(delegateKey, delegateFunction){
    if(delegates.hasOwnProperty(delegateKey) && delegates[delegateKey].hasOwnProperty(delegateFunction)){
      return delegates[delegateKey][delegateFunction];
    }
    return false;
  };

  hive.runDelegate = function(delegateKey, delegateFunctionKey, ...delegateArguments){
    let cli = this;
    let delegateFunction = hive.isValidDelegate(delegateKey, delegateFunctionKey);
    if(delegateFunction){
      return delegateFunction.apply(cli, delegateArguments);
    }
    hive.log("attempting to run non-existent delegate function", delegateKey, delegateFunctionKey);
    return false;
  };

  hive.getStats = function(args){
    let hiveExport = {};
    hiveExport.hive = {id: hive.meta.id, port: options.port};
    hiveExport.bees = {};
    //hiveExport.queen = hive.queen.refresh();
    hiveExport.tasks = {};
    for(let beeID in hive.bees){
      hiveExport.bees[beeID] = hive.bees[beeID].refresh();
    }
    for(let taskID in hive.tasks){
      let taskInfo = hive.tasks[taskID];
      hiveExport.tasks[taskID] = taskInfo.task.refresh();
    }
    return hiveExport;
  };

  hive.renderStats = function(stats){
    let fullStats = [];
    let hiveTable = new Table({
      head: ['Hive', 'ID', 'PORT']
    });

    hiveTable.push(['Hive', stats.hive.id, stats.hive.port]);
    
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
    queen.gc();
    process.exit(2);
  };

  hive.reload = function(){
    queen.reloadBees();
  };
  
  let init = function(){
    debug("initializing the hive...");
    let options = {
      startAllDrones: false,
    };
    queen = require('../Queen')(hive, options);
    
    cli.local.show();
    
    process.on('SIGINT', hive.gc);
    return hive;
  };

  return init();
};