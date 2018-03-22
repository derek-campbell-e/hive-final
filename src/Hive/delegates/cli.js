module.exports = function CliDelegates(Hive){
  let delegates = {};

  delegates.showStats = function(args, callback){
    let stats = Hive.getStats(args);
    let table = Hive.renderStats(stats);
    callback(table, stats);
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
    Hive.log("starting drones...", args);
    callback(Hive.queen.startDrones(args.drones));
  };

  delegates.loadDrones = function(args, callback){
    if(args.options.all){
      args.drones = '*';
    }
    callback(Hive.queen.loadDrones(args.drones));
  };

  delegates.listDrones = function(args, callback){
    Hive.log("listing drones...");
    Hive.queen.listDrones(function(minds){
      callback(Hive.queen.render('list-drones', {minds: minds}), minds);
    });
    //callback();
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

  delegates.runBee = function(args, callback){
    Hive.queen.runBee(args, callback);
  };

  delegates.retireBees = function(args, callback){
    callback(Hive.queen.retireChildrenFromCLI(args.bees));
  };

  delegates.ps = function(args, callback){
    callback(Hive.getStats());
  };

  delegates.replicate = function(args, callback){
    Hive.log("begin replication...");
    let replicator = require('../../Replicator')(Hive);
    replicator.replicateToHive(args, callback);
  };

  return delegates;
};