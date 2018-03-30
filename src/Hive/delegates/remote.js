module.exports = function RemoteDelegates(Hive, Cli){
  let clientio = require('socket.io-client');

  let delegates = {};
  let remoteSocket = null;
  
  // this callback is not for vorpals use
  delegates.connectToHost = function(args, callback){
    let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJuYW1lIjoidWdlbnUiLCJwYXNzd29yZCI6Ijh0YT1SYW1hIn0sImlhdCI6MTUyMjM5MTUzNiwiZXhwIjoxNTIyMzk1MTM2fQ.Q3RDJiFoaOEcD4I8G9m3_eYSZIK-hfUJ_qXlSGnbmjs";
    delegates.removeRemoteSocket();
    remoteSocket = clientio(args.host + "?token=" + token);
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
      remoteSocket.emit("remote:message", command, args, callback);
      return;
    } else {
      callback("not connected to a hive instance");
    }
  };

  return delegates;
};