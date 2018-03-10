module.exports = function CliDelegates(Hive){
  let delegates = {};

  delegates.showStats = function(args, callback){
    callback(Hive.getStats(args));
  };

  delegates.tailErrors = function(args, callback){
    Hive.on('errorline', function(line){
      Hive.blast('errorline', line);
      console.error(line);
    });
    callback();
  };

  delegates.startDrones = function(args, callback){
    if(args.options.all){
      args.drones = '*';
    }
    hive.queen.startDrones(args.drones);
    callback();
  };

  delegates.showLogs = function(args, callback){
    let output = "LOGS:\n";
    for(let beeID in hive.bees){
      let bee = hive.bees[beeID];
      output += beeID+"\t"+bee.meta.class+":\t"+bee.meta.mind+"\n";
      output += "\t\t"+bee.meta.stdout.replace(/\n/g, "\n\t\t");
      output += "\n";
    }
    callback(output);
  };

  delegates.showErrors = function(args, callback){
    let output = "Errors:\n";
    for(let beeID in hive.bees){
      let bee = hive.bees[beeID];
      output += beeID+"\t"+bee.meta.class+":\t"+bee.meta.mind+"\n";
      output += "\t\t"+bee.meta.stderr.replace(/\n/g, "\n\t\t");
      output += "\n";
    }
    callback(output);
  };

  delegates.tailLogs = function(args, callback){
    hive.on('logline', function(line){
      hive.blast('logline', line);
      console.log(line);
    });
    callback();
  };

  delegates.stopTailLogs = function(args, callback){
    hive.off('logline');
    callback();
  };


  delegates.stopTailErrors = function(args, callback){
    hive.off('errorline');
    callback();
  };

  return delegates;
};