// the queen is the task manager for the hive
// she knows what's going on but also loads the drones, can load more drones, etc.
module.exports = function Queen(Hive, options){
  const path = require('path');
  const glob = require('glob');
  const debug = require('debug')('base:queen');
  const defaultOptions = {};
  
  defaultOptions.loadAllDrones = true; // load all the drones from the bees/drones folder
  defaultOptions.beeFolder = path.join(__dirname, '..', 'bees');
  defaultOptions.startDronesOnLoad = true;
  defaultOptions.loadDrones = []; // drones to load by default
  defaultOptions.startDrones = []; // drones to start by default
  defaultOptions.maxTaskRuntime = 60 * 1000; // max runtime for tasks in ms, default is 1 minute

  options = require('extend')(true, {}, defaultOptions, options);
  let queen = require('./Bee')(Hive);

  // object for holding our drones
  queen.drones = {};

  // object for holding our workers
  queen.workers = {};

  //overwrite some defaults
  queen.meta.class = 'queen';

  // our object for holding the current tasks
  queen.tasks = {};

  queen.droneFinder = function(specificDrones, callback){
    let dronePath = path.join(options.beeFolder, 'drones');
    let globOptions = {};
    globOptions.cwd = dronePath;
    globOptions.absolute = true;
    let returnedDrones = [];
    
    let fileTest = function(error, files){
      if(specificDrones.length === 0) {
        returnedDrones = [...returnedDrones, ...files];
        return;
      }
      for(let fileIndex in files){
        let file = files[fileIndex];
        let fileBase = path.basename(file, '.js');
        if(specificDrones.indexOf(fileBase) !== -1){
          returnedDrones.push(file);
        }
      };
    };

    //check individual files in drone directory
    glob('*.js', globOptions, function(error, files){
      fileTest(error, files);
      // check folders
      glob('*/', globOptions, function(error, files){
        fileTest(error, files);
        callback(returnedDrones);
      });
    });
  };
  
  queen.gatherDrones = function(){
    let hasDronesToLoad = options.loadDrones.length > 0;
    let dronesToLoad = [];

    if(hasDronesToLoad || !options.loadAllDrones){
      debug('we have specific drones to load...');
      queen.droneFinder(options.loadDrones, function(returnedDrones){
        dronesToLoad = [...dronesToLoad, ...returnedDrones];
        queen.loadDrones(dronesToLoad);
      });
    } else {
      queen.droneFinder([], function(returnedDrones){
        dronesToLoad = [...dronesToLoad, ...returnedDrones];
        queen.loadDrones(dronesToLoad);
      });
    }
  };

  queen.loadDrones = function(dronesToLoad){
    let droneMinds = [...dronesToLoad];
    for(let droneMindIndex in droneMinds){
      let droneMind = droneMinds[droneMindIndex];
      let drone = require('./Drone')(Hive, queen, droneMind);
      queen.drones[drone.meta.id] = drone;
    }
    queen.startDrones();
  };

  queen.startDrones = function(startDrones){
    startDrones = startDrones || [];
    for(let droneID in queen.drones){
      let drone = queen.drones[droneID];
      let isInStartDrones = options.startDrones.indexOf(drone.meta.mind) !== -1;
      let ifShouldStartDronesOnLoad = options.startDronesOnLoad && options.startDrones.length === 0;
      if(ifShouldStartDronesOnLoad || isInStartDrones){
        if(!drone.meta.hasStarted){
          drone.start();
        }
        continue;
      }
      let isInStartDroneArguments = startDrones.indexOf(drone.meta.mind) !== -1 || startDrones === '*';
      if(isInStartDroneArguments){
        drone.start();
      }
    }
  };

  queen.listenToWorker = function(worker){
    worker.once('on:retire', function(bee){
      debug("the queen knows about your two weeks..");
      queen.workers[bee.meta.id] = null;
      delete queen.workers[bee.meta.id];
    });
  };

  queen.spawnWorker = function(drone, workerMind, absolutePath){
    let workerPath = path.join(options.beeFolder, 'workers');
    let workerMindFile = path.join(workerPath, workerMind);
    if(absolutePath) {
      workerMindFile = workerMind;
    }
    let worker = require('./Worker')(Hive, workerMindFile);
    queen.workers[worker.meta.id] = {
      drone: drone.meta.id,
    };
    queen.listenToWorker(worker);
    return worker;
  };

  let init = function(){
    queen.gatherDrones();
    queen.spawn();
    return queen;
  };

  return init();
};