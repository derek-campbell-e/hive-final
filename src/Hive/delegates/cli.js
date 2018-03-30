module.exports = function CliDelegates(Hive, Cli){
  const URL = require('url').URL;

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

  delegates.switchToRemote = function(args, callback){
    let url = new URL(args.host);
    let remoteDelimiter = "hive@"+url.host+"$";
    Cli.local.hide();
    callback("connected to host!");
    Cli.remote.delimiter(remoteDelimiter);
    Cli.remote.show();
  };

  delegates.switchToLocal = function(args, callback){
    callback = callback || function(){};
    Hive.runDelegate('remote', 'disconnectFromRemote');
    Cli.remote.hide();
    Cli.local.show();
    callback("Returned to local hive...");
  };

  delegates.switchToLocalFromDisconnect = function(callback){
    Cli.remote.exec("xrem", function(){
      this.log("exited");
    });
  };

  delegates.hasUserNameAndPasswordForRemote = function(args, callback){
    if(args.username){}
    callback();
  };

  delegates.connectToRemote = function(args, callback){
    delegates.hasUserNameAndPasswordForRemote.call(this, args, function(username, password){
      Hive.runDelegate('remote', 'connectToHost', args, function(remoteSocket){
        if(remoteSocket){
          remoteSocket.once('disconnect', delegates.switchToLocalFromDisconnect);
          remoteSocket.once('connect_timeout', delegates.switchToLocalFromDisconnect);
          return delegates.switchToRemote(args, callback);
        }
        return callback("An error occured connecting to remote hive");
      });
    });
  };

  delegates.disconnectRemote = function(args, callback){
    delegates.switchToLocal(args, callback);
  };

  delegates.remoteCommandEntry = function(delegateFunction, args, callback){
    Hive.runDelegate('remote', 'commandToRemoteHost', delegateFunction, args, callback);
  };

  delegates.remoteEntry = function(command, callback){
    Hive.runDelegate('socket', 'remoteAction', command, callback);
  };

  return delegates;
};