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

  queen.loadDrones = function(){
    let hasDronesToLoad = options.loadDrones.length > 0;
    let startAllLoadedDrones = options.startDrones.length > 0;
    let dronesToLoad = [];
    if(hasDronesToLoad || !options.loadAllDrones){
      debug('we have specific drones to load...');
      queen.droneFinder(options.loadDrones, function(returnedDrones){
        dronesToLoad = [...dronesToLoad, ...returnedDrones];
      });
    } else {
      queen.droneFinder([], function(returnedDrones){
        dronesToLoad = [...dronesToLoad, ...returnedDrones];
      });
    }
    
  };

  let init = function(){
    queen.loadDrones();
    queen.spawn();
    return queen;
  };

  return init();
};