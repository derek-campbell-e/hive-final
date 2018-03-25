module.exports = function Remote(Hive, Cli){
  let remote = {};

  remote.establishRemoteConnection = function(args, callback){
   
    Cli
      .mode('hive-remote')
      .delimiter('remote:'+args.host)
      .action(function(command, callback){
        this.log(command);
        callback();
      });
      
    Cli.exec('hive-remote', function(){
      callback("OKAY");
    });
  };

  let bind = function(){
    Hive.on('remote', remote.establishRemoteConnection);
  };

  let init = function(){
    bind();
    return remote;
  };

  return init();
};