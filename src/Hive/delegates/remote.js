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
  
  // this callback is not for vorpals use
  delegates.connectToHost_ = function(args, callback){
    delegates.removeRemoteSocket();
    remoteSocket = clientio(args.host);
    remoteSocket.once('connect', function(){
      callback(remoteSocket);
    });
    //remoteSocket.once('disconnect', delegates.removeRemoteSocket);
    remoteSocket.once('connect_error', function(){
      delegates.removeRemoteSocket();
      callback(null);
    });
  };

  delegates.removeRemoteSocket = function(){
    if(remoteSocket){
      remoteSocket.close();
      remoteSocket = null;
    }
  };

  delegates.connectedToRemote = function(socket){
    remoteSocket = socket;
  };

  delegates.disconnectFromRemote = function(){
    if(remoteSocket){
      remoteSocket.close();
      remoteSocket = null;
    }
  };

  delegates.sendToRemote = function(command, callback){
    if(remoteSocket){
      console.log("SEND THAT FUCKER");
      return remoteSocket.emit("remote:message", command, callback);
    }
    callback("An error occured, remote socket not connected...");
  };

  delegates.commandToRemoteHost = function(command, args, callback){
    //console.log(remoteSocket, command);
    if(remoteSocket){
      console.log("SEND THAT FUCKER");
      remoteSocket.emit("remote:message", command, args, callback);
      return;
    } else {
      callback("not connected to a hive instance");
    }
  };

  return delegates;
};