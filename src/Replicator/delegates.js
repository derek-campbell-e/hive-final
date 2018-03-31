module.exports = function ReplicatorDelegates(Replicator){
  let delegates = {};

  delegates.retrieveTokenFromRemoteHost = function(host, username, password, callback){
    request.post({
      url : host + "/authenticate",
      form: {username: username, password: password}
    }, function(error, response, body){
      let json = JSON.parse(body) || {};
      callback(json.token || false);
    });
  };

  delegates.onConnectionFailed = function(args, callback, extra){
    let message = "Count not connect to hive: "+ args.host;
    Replicator.log(message);
    return callback(message);
  };

  delegates.onConnectionSuccess = function(args, callback){
    let cli = this;
    cli.log("successfully connected!");
    Replicator.notifyHiveOfTransaction(args, callback);
  };

  return delegates;
};