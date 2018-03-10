module.exports = function SocketDelegates(Hive, io){
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
  

  delegates.onConnection = function(socket){
    Hive.log("new socket: ", socket.id);
    Hive.sockets[socket.id] = socket;
    delegates.bindNewSocket(socket);
  };

  delegates.onDisconnect = function(reason, socket){
    Hive.log("socket", socket.id, "has disconnected", "reason:", reason);
    Hive.sockets[socket.id] = null;
    delete Hive.sockets[socket.id];
  };

  newSocketDelegates['stats'] = delegates.showStats;
  newSocketDelegates['disconnect'] = delegates.onDisconnect;

  // our initializer for our socket delegates
  let init = function(){
    io.on('connection', delegates.onConnection);
    return delegates;
  };

  return init();
};