module.exports = function QueenBeeLocator(Queen, options){
  const path = require('path');
  const glob = require('multi-glob').glob;

  Queen.saveBeeMeta = function(beeClass, file){
    let baseName = path.basename(file, '.js');
    let beeObject = {};
    beeObject.instances = {};
    beeObject.instance = null;
    beeObject.meta = {};
    beeObject.meta.mind = baseName;
    beeObject.meta.path = file;
    beeObject.meta.isLoaded = false;
    beeObject.meta.isRunning = false;
    beeObject.meta.belongingTo = {};
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

  Queen.returnChildByID = function(id){
    let bee = null;
    
    for(let droneMind in Queen.drones){
      let singleInstance = Queen.drones[droneMind].instance;
      
      if(singleInstance && singleInstance.meta.id === id) {
        return singleInstance;
      }

      for(let droneInstanceID in Queen.drones[droneMind].instances){
        if (droneInstanceID === id){
          return Queen.drones[droneMind].instances[droneInstanceID];
        }
      }
    }

    for(let workerMind in Queen.workers){
      for(let workerInstanceID in Queen.workers[workerMind].instances){
        if (workerInstanceID === id){
          return  Queen.workers[workerMind].instances[workerInstanceID];
        }
      }
    }

    return bee;
  };

  Queen.returnChild = function(withBeeClass, withBeeMind, orByID){
    if(typeof orByID !== 'undefined'){
      return Queen.returnChildByID(orByID);
    }

    let bee = null;
    let ref = null;
    let singleInstance = false;

    switch(withBeeClass){
      case 'drone':
      case 'drones':
        ref = Queen.drones;
        singleInstance = true;
        break;
      case 'worker':
      case 'workers':
        ref = Queen.workers;
        break;
    }

    for(let beeMind in ref){
      let lowerCaseBeeMind = beeMind.toLowerCase();
      if(lowerCaseBeeMind === withBeeMind.toLowerCase()){
        if(singleInstance){
          bee = ref[beeMind].instance;
        } else {
          bee = [...Object.values(ref[beeMind].instances)];
        }
      }
    }

    return bee;
  };

};