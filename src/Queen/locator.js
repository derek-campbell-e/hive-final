module.exports = function QueenBeeLocator(Queen, options){
  const path = require('path');
  const glob = require('multi-glob').glob;

  Queen.saveBeeMeta = function(beeClass, file){
    let baseName = path.basename(file, '.js');
    let beeObject = {};
    beeObject.instances = {};
    beeObject.meta = {};
    beeObject.meta.mind = baseName;
    beeObject.meta.path = file;
    beeObject.meta.isLoaded = false;
    beeObject.meta.isRunning = false;
    Queen[beeClass][baseName] = beeObject;
  };

  Queen.saveDroneMeta = function(drone){
    Queen.saveBeeMeta('drones', drone);
  };

  Queen.saveWorkerMeta = function(worker){
    Queen.saveBeeMeta('workers', worker);
  };

  Queen.locateBees = function(beeClass){
    let beePath = path.join(options.beeFolder, beeClass);
    let globOptions = {};
    globOptions.cwd = beePath;
    globOptions.absolute = true;
    globOptions.realpath = true;
    glob(["*/", '*.js'], globOptions, function(error, files){
      if(error){
        debug("an error occured loading bees...", error);
        return;
      }
      files.forEach(function(file){
        Queen.saveBeeMeta(beeClass, file);
      });
    });
  };

  Queen.locateDrones = function(){
    Queen.locateBees('drones');
  };

  Queen.locateWorkers = function(){
    Queen.locateBees('workers');
  };

};