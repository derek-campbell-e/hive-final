module.exports = function CliDelegates(Hive){
  let delegates = {};

  delegates.showStats = function(args, callback){
    let stats = Hive.getStats(args);
    let table = Hive.renderStats(stats);
    callback(table, stats);
  };

  delegates.startDrones = function(args, callback){
    if(args.options.all){
      args.drones = '*';
    }
    Hive.log("starting drones...", args);
    Hive.emit('startDrones', args.drones, callback);
  };

  delegates.loadDrones = function(args, callback){
    if(args.options.all){
      args.drones = '*';
    }
    Hive.emit('loadDrones', args.drones, callback);
  };

  delegates.listDrones = function(args, callback){
    Hive.log("listing drones...");
    Hive.queen.listDrones(function(minds){
      callback(Hive.queen.render('list-drones', {minds: minds}), minds);
    });
  };

  delegates.runBee = function(args, callback){
    Hive.queen.runBee(args, callback);
  };

  delegates.retireBees = function(args, callback){
    //callback(Hive.queen.retireChildrenFromCLI(args.bees));
    Hive.emit('retireBees', args.bees, callback);
  };

  delegates.ps = function(args, callback){
    Hive.meta.ps(args, callback);
  };

  delegates.replicate = function(args, callback){
    Hive.log("begin replication...");
    let replicator = require('../../Replicator')(Hive);
    replicator.replicateToHive.call(this, args, callback);
  };

  delegates.remote = function(args, callback){
    let message = "attempting to remote into: " + args.host;
    Hive.log(message);
    this.log(message);
    Hive.emit('remote', args, callback);
  };

  delegates.remote = function(args, callback){
    Hive.runDelegate('socket', 'connectToHost', args, callback);
  };

  delegates.remoteEntry = function(command, callback){
    Hive.runDelegate('remote', 'remoteAction', command, callback);
  };

  return delegates;
};