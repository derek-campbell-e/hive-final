module.exports = function RemoteDelegates(Hive, Cli){
  let clientio = require('socket.io-client');

  let delegates = {};
  let remoteSocket = null;

  delegates.connectToHost = function(args, connectedCallback, failedCallback, disconnectCallback){
    if(remoteSocket) {
      remoteSocket.close();
      remoteSocket = null;
    }
    let socket = clientio(args.host);
    socket.once('connect', function(){
      console.log(socket.id);
      remoteSocket = socket;
      connectedCallback(remoteSocket);
      
    });
    socket.on('disconnect', function(){
      remoteSocket = null;
    });
    socket.on('connect_error', function(){
      remoteSocket = null;
      failedCallback();
    });
    socket.on('connect_timeout', function(){
      remoteSocket = null;
      disconnectCallback();
    });
  };

  delegates.connectedToRemote = function(socket){
    remoteSocket = socket;
  };

  delegates.disconnectFromRemote = function(){
    if(remoteSocket){
      console.log("HAD A REMOTE SOCKET, GOTTA CLOSE IT");
      remoteSocket.close();
      remoteSocket = null;
    }
  };

  delegates.sendToRemote = function(command, callback){
    remoteSocket.emit("remote:message", command, callback);
  };

  delegates.commandToRemoteHost = function(command, args, callback){
    console.log("SENDING REMOTE COMMAND", remoteSocket.id);
    if(remoteSocket){
      console.log("SENDING REMOTE COMMAND", remoteSocket.id);
      remoteSocket.emit("remote:message", command, args, callback);
      return;
    } else {
      callback("not connected to a hive instance");
    }
  };

  return delegates;
};