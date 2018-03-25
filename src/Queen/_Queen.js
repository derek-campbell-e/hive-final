module.exports = function Queen(Hive, options){
  const debug = require('debug')('base:queen');
  const path = require('path');

  // set up our default options
  const defaultOptions = {};
  defaultOptions.loadAllDrones = true; // load all the drones from the bees/drones folder
  defaultOptions.beeFolder = path.join(__dirname, '..', '..', 'bees');
  defaultOptions.startDronesOnLoad = true;
  defaultOptions.loadDrones = []; // drones to load by default
  defaultOptions.startDrones = []; // drones to start by default
  defaultOptions.maxTaskRuntime = 60 * 1000; // max runtime for tasks in ms, default is 1 minute

  // merge our options with the default override what is passed in through params
  options = require('extend')(true, {}, defaultOptions, options);

  let queen = require('../Bee')(Hive);
  queen.options = options;

  let locator = require('./locator')(queen, options);

  queen.drones = {};
  queen.workers = {};

  queen.meta.class = 'queen';

  queen.retireChildrenFromCLI = function(bees, callback){
    if(Array.isArray(bees)){
      bees.forEach(queen.retireChildFromCLI);
    } else {
      queen.retireChildFromCLI(bees);
    }
    callback("retired: "+ bees.join(" "));
  };

  queen.retireChildFromCLI = function(beeString){
    let beeParts = beeString.split(":");
    let beeClass = beeParts[0];
    let beeMind = beeParts[1];
    let bee = null;
    if(beeParts.length === 1){
      bee = queen.returnChildByID(beeString); // we're going to assume that if there isn't a colon, its by an id
    } else {
      bee = queen.returnChild(beeClass, beeMind);
    }
    if(bee){
      if(Array.isArray(bee)){
        bee.forEach(function(beeInstance){
          beeInstance.retire();
        });
        return;
      }
      bee.retire();
    }
  };

  // retire a bee, usually called from event listener, but we can do the same thing from our cli
  queen.retireChild = function(bee){
    debug(bee.meta.id, bee.meta.class, "has retired...");
    let ref = null;
    switch(bee.meta.class){
      case 'worker':
      case 'workers':
        ref = queen.workers;
        break;
      case 'drone':
      case 'drones':
        ref = queen.drones;
        break;
    }

    if(!ref){
      debug("no reference to delete from...");
      return;
    }

    if(!ref.hasOwnProperty(bee.meta.mind)){
      debug(bee.meta.class, "with mind of", bee.meta.mind, "is not in the queens reference...");
      return;
    }

    for(let instanceID in ref[bee.meta.mind].instances){
      if(instanceID === bee.meta.id){
        delete ref[bee.meta.mind][instanceID];
        debug("deleting instance of", instanceID);
      }
    }

    if(ref[bee.meta.mind].instance){
      ref[bee.meta.mind].instance = null;
    }
  };

  // any events we need to be aware about are here
  queen.listenToChild = function(bee){
    bee.once('on:retire', queen.retireChild);
  };

  // starts the bee with the specified class and specified mind
  // probably only for drones at this moment
  queen.runChild = function(beeClass, mind, options){
    options = options || {};
    let ref = null;
    let max = -1;

    switch(beeClass){
      case 'drone':
      case 'drones':
        ref = queen.drones;
        max = 1;
        break;
      case 'worker':
      case 'workers':
        ref = queen.workers;
        break;
    }

    if(!ref){
      debug("no class of that type...");
      return false;
    }

    if(!ref.hasOwnProperty(mind)){
      debug('no mind for that beeClass found...', beeClass, mind, ref);
      return false;
    }

    if(ref[mind].meta.isRunning && max > 0){
      debug("dont need to run it again, unless we're doing a single fire...");
      return false;
    }

    ref[mind].meta.isRunning = true;
    let drone = ref[mind].instance;
    drone.start();
    return true;
  };

  // loads and spawns the bee with the specified class and specified mind
  // used for both drones and workers, drones will have this method modifed to run inside their own task
  queen.spawnChild = function(beeClass, mind, options){
    options = options || {};
    let ref = null;
    let max = -1;
    let requirePath = '';

    switch(beeClass){
      case 'drone':
      case 'drones':
        ref = queen.drones;
        max = 1;
        requirePath = '../Drone';
        break;
      case 'worker':
      case 'workers':
        ref = queen.workers;
        requirePath = '../Worker'
        break;
    }

    if(!ref){
      debug("no class of that type...");
      return false;
    }

    if(!ref.hasOwnProperty(mind)){
      debug('no mind for that beeClass found...', beeClass, mind, ref);
      return false;
    }

    if(ref[mind].meta.isLoaded && max > 0){
      debug(beeClass, mind, "has already been loaded...");
      return false;
    }

    if(!ref[mind].meta.isLoaded || max < 0){
      let bee = require(requirePath)(Hive, queen, ref[mind].meta.path, options);
      ref[mind].meta.isLoaded = true;
      ref[mind].instances[bee.meta.id] = bee;
      if(beeClass === 'drone' || beeClass === 'drones'){
        ref[mind].instance = bee;
      }
      queen.listenToChild(bee);
      return bee;
    }

    debug("bee has not been loaded for some reason...");
    return false;
  };

  queen.spawnWorker = function(drone, mind, options){
    return queen.spawnChild('worker', mind, options);
  };

  // loads the specified drones or '*' for all
  // optional callback returns the number and which drones were loaded
  // drones should not be loaded more than once, so if they are already loaded, you will have to check???
  queen.loadDrones = function(drones, callback){
    let dronesToLoad = drones || [];
    callback = callback || function(){};
    let loaded = [];

    if(!Array.isArray(drones) && typeof drones !== "undefined"){
      dronesToLoad = [drones];
    }

    dronesToLoad.forEach(function(droneMind, index){
      dronesToLoad[index] = droneMind.toLowerCase();
    });

    for(let droneMind in queen.drones){
      let lowerCaseDrone = droneMind.toLowerCase();
      if(dronesToLoad.indexOf(lowerCaseDrone) === -1 && drones !== '*'){
        continue;
      }
      if(queen.spawnChild('drone', droneMind)) {
        loaded.push(droneMind);
      }
    }
    let message = ["loaded", loaded.length, "drones!", loaded.join(", ")].join(" ");
    debug(message);
    callback(message);
    return message;
  };

  queen.startDrones = function(drones, callback){
    callback = callback || function(){};
    let dronesToStart = drones || [];
    let started = [];
    
    if(!Array.isArray(drones) && typeof drones !== "undefined"){
      dronesToStart = [drones];
    }

    dronesToStart.forEach(function(droneMind, index){
      dronesToStart[index] = droneMind.toLowerCase();
    });

    for(let droneMind in queen.drones){
      let lowerCaseDrone = droneMind.toLowerCase();
      if(dronesToStart.indexOf(lowerCaseDrone) === -1 && drones !== '*'){
        continue;
      }
      if(queen.runChild('drone', droneMind)) {
        started.push(droneMind);
      }
    }

    let message = ["started", started.length, "drones!", started.join(", ")].join(" ");
    debug(message);
    callback(message);
    return message;
  };

  let bind = function(){
    Hive.on('loadDrones', queen.loadDrones);
    Hive.on('retireBees', queen.retireChildrenFromCLI);
    Hive.on('startDrones', queen.startDrones);
  };

  queen.reloadBees = function(){
    queen.locateDrones();
    queen.locateWorkers();
  };

  let init = function(){
    bind();
    queen.spawn();
    queen.locateDrones();
    queen.locateWorkers();
    return queen;
  };

  return init();
};