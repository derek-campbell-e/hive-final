// the queen is the task manager for the hive
// she knows what's going on but also loads the drones, can load more drones, etc.
module.exports = function Queen(Hive, options){
  const path = require('path');
  const glob = require('glob');
  const debug = require('debug')('base:queen');
  const defaultOptions = {};
  
  defaultOptions.loadAllDrones = true; // load all the drones from the bees/drones folder
  defaultOptions.beeFolder = path.join(__dirname, '..', '..', 'bees');
  defaultOptions.startDronesOnLoad = true;
  defaultOptions.loadDrones = []; // drones to load by default
  defaultOptions.startDrones = []; // drones to start by default
  defaultOptions.maxTaskRuntime = 60 * 1000; // max runtime for tasks in ms, default is 1 minute

  options = require('extend')(true, {}, defaultOptions, options);

  let mindFormatter = function(mindFile){
    let exports = {};
    exports.mind = path.basename(mindFile, '.js');
    exports.meta = {};
    exports.path = mindFile;
    exports.loaded = false;
    exports.running = false;
    exports.id = "";
    return exports;
  };

  let queen = require('../Bee')(Hive);

  // object for holding our drones
  queen.drones = {};

  // object for holding drone minds
  queen.droneMinds = {};

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
    queen.log("trying to load the drones", dronesToLoad);
    let dronesToLoadArray = [];
    
    if(Array.isArray(dronesToLoad)){
      dronesToLoadArray = [...dronesToLoad];
    } else {
      dronesToLoadArray.push(dronesToLoad);
    }

    for(let droneMindKey in queen.droneMinds){
      if(dronesToLoadArray.indexOf(droneMindKey) === -1 && dronesToLoad !== '*') {
        continue;
      }
      let droneMind = queen.droneMinds[droneMindKey];
      let drone = require('../Drone')(Hive, queen, droneMind.path);
      queen.drones[drone.meta.id] = drone;
      queen.droneMinds[droneMindKey].loaded = true;
      queen.droneMinds[droneMindKey].id = drone.meta.id;
      queen.log("loaded drone:", drone.meta.mind);
    }
  };


  queen.startDrones = function(startDrones){
    startDrones = startDrones || [];
    let startDronesArray = [];
    
    if(Array.isArray(startDrones)){
      startDronesArray = [...startDrones];
    } else {
      startDronesArray.push(startDrones);
    }

    for(let droneID in queen.drones){
      let drone = queen.drones[droneID];
      if(startDrones === "*" || startDronesArray.indexOf(drone.meta.mind) !== -1){
        if(!drone.meta.hasStarted){
          drone.start();
        }
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


  queen.listDrones = function(callback){
    callback = callback || function(){};
    
    queen.droneFinder([], function(droneMinds){
      let minds = [];
      for(let droneMindIndex in droneMinds){
        minds.push(mindFormatter(droneMinds[droneMindIndex]));
      }
      callback(minds);
    });
  };

  queen.loadDroneMinds = function(){
    queen.droneFinder([], function(droneMinds){
      droneMinds.forEach(function(droneMind){
        let formattedMind = mindFormatter(droneMind);
        queen.droneMinds[formattedMind.mind] = formattedMind;
      });
    });
  };

  queen.spawnWorker = function(drone, workerMind, absolutePath){
    let workerPath = path.join(options.beeFolder, 'workers');
    let workerMindFile = path.join(workerPath, workerMind);
    if(absolutePath) {
      workerMindFile = workerMind;
    }
    let worker = require('../Worker')(Hive, workerMindFile);
    queen.workers[worker.meta.id] = {
      drone: drone.meta.id,
    };
    queen.listenToWorker(worker);
    return worker;
  };

  queen.runBee = function(args, callback){
    let beeParts = args.bee.split(":");
    let beeClass = beeParts[0];
    let beeMind = beeParts[1] || "default";
    queen.log(args);
    let droneMindRef = null;
    for(let droneMind in queen.droneMinds){
      if(droneMind.toLowerCase() === beeMind.toLowerCase()){
        droneMindRef = droneMind;
      }
    }
    if(!droneMindRef){
      return;
    }
    let mindMeta = queen.droneMinds[droneMindRef];
    if(!mindMeta.loaded){
      queen.loadDrones(mindMeta.mind);
    }
    let drone = queen.drones[mindMeta.id];
    drone.now(function(){
      callback.apply(this, arguments);
      if(args.options.once){
        drone.retire();
      }
    });
  };

  queen.retireBee = function(bee){
    let beeParts = bee.split(":");
    let beeClass = beeParts[0];
    let beeMind = beeParts[1] || "default";
    let droneMindRef = null;
    for(let droneMind in queen.droneMinds){
      if(droneMind.toLowerCase() === beeMind.toLowerCase()){
        droneMindRef = droneMind;
      }
    }
    if(!droneMindRef){
      return;
    }
    let mindMeta = queen.droneMinds[droneMindRef];
    queen.drones[mindMeta.id].retire();
    return mindMeta.mind;
  };

  let init = function(){
    //queen.gatherDrones();
    queen.log("IM HEREEE");
    queen.loadDroneMinds();
    queen.spawn();
    return queen;
  };

  return init();
};