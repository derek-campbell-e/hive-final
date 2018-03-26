module.exports = function RemoteDelegates(Hive, Cli){
  let delegates = {};
  let remoteSocket = null;

  delegates.connectedToRemote = function(socket){
    remoteSocket = socket;
  };

  delegates.sendToRemote = function(command, callback){
    remoteSocket.emit("remote:message", command, callback);
  };

  return delegates;
};