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

  let locator = require('./locator')(queen, options);

  queen.drones = {};
  queen.workers = {};

  queen.meta.class = 'queen';

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
      return;
    }

    if(!ref.hasOwnProperty(mind)){
      debug('no mind for that beeClass found...', beeClass, mind, ref);
      return;
    }

    if(ref[mind].meta.isRunning && max > 0){
      debug("dont need to run it again, unless we're doing a single fire...");
      return;
    }

    ref[mind].meta.isRunning = true;
    
  };

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
      return;
    }

    if(!ref.hasOwnProperty(mind)){
      debug('no mind for that beeClass found...', beeClass, mind, ref);
      return;
    }

    if(ref[mind].meta.isLoaded && max > 0){
      debug(beeClass, mind, "has already been loaded...");
      return;
    }

    if(!ref[mind].meta.isLoaded || max < 0){
      let bee = require(requirePath)(Hive, queen, ref[mind].meta.path, options);
      ref[mind].meta.isLoaded = true;
      ref[mind].instances[bee.meta.id] = bee;
      return;
    }

    debug("bee has not been loaded for some reason...");
  };

  let init = function(){
    queen.spawn();
    queen.locateDrones();
    queen.locateWorkers();
    return queen;
  };

  return init();
};