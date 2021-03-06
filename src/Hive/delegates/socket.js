module.exports = function SocketDelegates(Hive, io, sockets, Cli){
  let delegates = {};
  let newSocketDelegates = {};
  let clientio = require('socket.io-client');
  
  let remoteSockets = {};

  let socketAuthentication = function(socket, next){
    let token = socket.handshake.query.token;
    Hive.runDelegate('tokens', 'verifyToken', token, function(error, data){
      if(!error){
        socket.token = token;
        return next();
      }
      return next(new Error("Not authenticated..."));
    });
  };

  let socketVerifyTokenStillWorks = function(packet, next){
    let socket = this;
    Hive.runDelegate('tokens', 'verifyToken', this.token, function(error, data){
      if(!error){
        return next();
      }
      return next(new Error("Not authenticated..."));
    });
  };
  
  delegates.bindNewSocket = function(socket){
    socket.use(socketVerifyTokenStillWorks.bind(socket));
    for(let eventName in newSocketDelegates){
      let delegateMethod = newSocketDelegates[eventName];
      socket.on(eventName, function(){
        Hive.log("received socket event:", eventName, "from:", socket.id);
        delegateMethod.apply(delegateMethod, [...arguments, socket]);
      });
    }
  };

  delegates.showStats = function(args, callback, socket){
    callback(Hive.getStats(args));
  };

  delegates.prepareForReplication = function(socket){
    Hive.log("received replication request");
    socket.emit('ready:replication');
  };

  delegates.replication = function(replicationData, socket){
    let replication = require('../../Replicator')(Hive);
    replication.replicateInto(replicationData, function(){
      socket.emit("complete:replication");
    });
  };

  delegates.completeReplication = function(){
    console.log("WE ARE COMPLETE");
    Hive.log("completed replication....");
  };

  delegates.performActionFromRemote = function(command, callback){
    Hive.log("performing a command from a remote host...");
    callback("GOTCHA");
  };
  

  delegates.onConnection = function(socket){
    Hive.log("new socket: ", socket.id, socket.handshake.address, socket.handshake.headers["x-real-ip"]);
    sockets[socket.id] = socket;
    delegates.bindNewSocket(socket);
  };

  delegates.onDisconnect = function(reason, socket){
    Hive.log("socket", socket.id, "has disconnected", "reason:", reason);
    sockets[socket.id] = null;
    delete sockets[socket.id];
  };

  delegates.connectToHost = function(args, callback){
    let socket = clientio(args.host);
    socket.on('connect', function(){
      callback("CONNECTED TO HOST");
      remoteSockets[socket.id] = socket;
      Hive.runDelegate('remote', 'connectedToRemote', socket);
    });
    socket.on('disconnect', function(){
      delete remoteSockets[socket.id];
    });
  };

  delegates.remoteAction = function(args, callback){
    Hive.runDelegate('remote', 'sendToRemote', args, callback);
  };
  

  delegates.receiveRemoteAction = function(delegateFunction, args, callback, socket){
    Hive.runDelegate('cli', delegateFunction, args, callback);
  };
 
  newSocketDelegates['stats'] = delegates.showStats;
  newSocketDelegates['disconnect'] = delegates.onDisconnect;
  newSocketDelegates['begin:replication'] = delegates.prepareForReplication;
  newSocketDelegates['complete:replication'] = delegates.completeReplication;
  newSocketDelegates['replication'] = delegates.replication;
  newSocketDelegates['remoteMessageIn'] = delegates.performActionFromRemote;
  newSocketDelegates['remote:message'] = delegates.receiveRemoteAction;

  // our initializer for our socket delegates
  let init = function(){
    io.on('connection', delegates.onConnection);
    io.use(socketAuthentication);
    return delegates;
  };

  return init();
};