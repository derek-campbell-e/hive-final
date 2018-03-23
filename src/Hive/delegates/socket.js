module.exports = function SocketDelegates(Hive, io, sockets){
  let delegates = {};
  let newSocketDelegates = {};
  
  delegates.bindNewSocket = function(socket){
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
  

  delegates.onConnection = function(socket){
    Hive.log("new socket: ", socket.id);
    sockets[socket.id] = socket;
    delegates.bindNewSocket(socket);
  };

  delegates.onDisconnect = function(reason, socket){
    Hive.log("socket", socket.id, "has disconnected", "reason:", reason);
    sockets[socket.id] = null;
    delete sockets[socket.id];
  };

  newSocketDelegates['stats'] = delegates.showStats;
  newSocketDelegates['disconnect'] = delegates.onDisconnect;
  newSocketDelegates['begin:replication'] = delegates.prepareForReplication;
  newSocketDelegates['replication'] = delegates.replication;

  // our initializer for our socket delegates
  let init = function(){
    io.on('connection', delegates.onConnection);
    return delegates;
  };

  return init();
};