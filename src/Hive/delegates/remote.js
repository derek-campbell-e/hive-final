module.exports = function RemoteDelegates(Hive, Cli){
  const request = require('request');
  const clientio = require('socket.io-client');

  let delegates = {};
  let remoteSocket = null;

  delegates.retrieveTokenFromRemoteHost = function(host, username, password, callback){
    //request.post(host + "/authenticate").form({username: username, password: password})
    request.post({
      url : host + "/authenticate",
      form: {username: username, password: password}
    }, function(error, response, body){
      let json = JSON.parse(body) || {};
      callback(json.token || false);
    });
  };
  
  // this callback is not for vorpals use
  delegates.connectToHost = function(args, username, password, callback){
    delegates.retrieveTokenFromRemoteHost(args.host, username, password, function(token){
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
      remoteSocket.once('error', function(error){
        delegates.removeRemoteSocket();
        callback(null);
      });
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
      remoteSocket.on("error", function(){
        callback("an error occured during process");
      })
      return;
    } else {
      callback("not connected to a hive instance");
    }
  };

  return delegates;
};