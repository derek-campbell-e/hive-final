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
    Cli.remote.delimiter(remoteDelimiter).show();
    Cli.remote.exec("nothing");
    callback("connected to host!");
  };

  delegates.switchToLocal = function(args, callback){
    callback = callback || function(){};
    Hive.runDelegate('remote', 'disconnectFromRemote');
    Cli.remote.hide();
    Cli.local.show();
    callback("returned to local");
    /*
    Cli.local.exec("nothing", function(){
      //Cli.local.log("Returned to local hive");
    });
    */
  };

  delegates.connectToRemote = function(args, callback){
    let isConnectedCallback = function(socket){
      socket.on('disconnect', disconnectedCallback);
      delegates.switchToRemote(args, callback);
    };

    let failedConnectionCallback = function(){
      callback("An error occured when trying to connect to remote host");
    };

    let disconnectedCallback = function(callback){
      Cli.local.log("recieved a disconnect event...");
      //delegates.switchToLocal(callback);
    }.bind(delegates, callback);

    Hive.runDelegate('remote', 'connectToHost', args, isConnectedCallback, failedConnectionCallback, disconnectedCallback);
  };

  delegates.disconnectRemote = function(args, callback){
    delegates.switchToLocal(args, function(){
      callback();
    });
  };

  delegates.remoteCommandEntry = function(delegateFunction, args, callback){
    Hive.runDelegate('remote', 'commandToRemoteHost', delegateFunction, args, callback);
  };

  delegates.remoteEntry = function(command, callback){
    Hive.runDelegate('socket', 'remoteAction', command, callback);
  };

  return delegates;
};