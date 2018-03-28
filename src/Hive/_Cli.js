module.exports = function CLI(Hive){
  const vorpal = require('vorpal');
  const local = vorpal();
  const remote = vorpal();

  let delegateAction = function(delegateFunction, args, callback){
    let self = this;
    let delegateKey = 'cli';
    if(Hive.isValidDelegate(delegateKey, delegateFunction)){
      return Hive.runDelegate.call(self, delegateKey, delegateFunction, args, callback);
    }
    Hive.log("unrecognized delegate funcation attempted", delegateKey, delegateFunction);
    callback('an error occured processing your request');
  };

  let remoteDelegateAction = function(delegateFunction, args, callback){
    let delegateKey = 'cli';
    let internalDelegateFunction = 'remoteCommandEntry'
    if(Hive.isValidDelegate(delegateKey, internalDelegateFunction)){
      return Hive.runDelegate.call(vorpal, delegateKey, internalDelegateFunction, delegateFunction, args, callback);
    }
    Hive.log("unrecognized delegate funcation attempted", delegateKey, delegateFunction);
    callback('an error occured processing your request');
  };

  // set up our local cli 
  local.delimiter('hive:'+Hive.meta.version+"$");
  local._originaldelimiter = 'hive:'+Hive.meta.version+"$";

  // our commands that will be for both local and remote clis
  let commands = {};

  // to load the drones
  commands.loadDrones = {};
  commands.loadDrones.command = "load drones [drones...]";
  commands.loadDrones.description = "Load up the drones by their mind name. (spawned)";
  commands.loadDrones.option = ['-a, --all', 'load all the drones'];
  commands.loadDrones.action = {
    local: delegateAction.bind(local, 'loadDrones'),
    remote: remoteDelegateAction.bind(remote, 'loadDrones')
  };


  // to start the drones
  commands.startDrones = {};
  commands.startDrones.command = "start drones [drones...]";
  commands.startDrones.description = "Start the drones on their own task schedule";
  commands.startDrones.option = ['-a, --all', 'start all the drones'];
  commands.startDrones.action = {
    local: delegateAction.bind(local, 'startDrones'),
    remote: remoteDelegateAction.bind(remote, 'startDrones')
  };

  // get the hive stats or stats for a certain bee
  commands.stats = {};
  commands.stats.command = "stats [bees...]";
  commands.stats.description = "Show the stats for the hive or certain bees";
  commands.stats.action = {
    local: delegateAction.bind(local, 'showStats'),
    remote: remoteDelegateAction.bind(remote, 'showStats')
  };

  // command to retire bee or bees
  commands.retireBees = {};
  commands.retireBees.command = "retire <bees...>";
  commands.retireBees.description = "retire the specified bees";
  commands.retireBees.action = {
    local: delegateAction.bind(local, 'retireBees'),
    remote: remoteDelegateAction.bind(remote, 'retireBees')
  };

  // tell our drones to run now and return the output
  commands.fireDrones = {};
  commands.fireDrones.command = "fire <drones...>";
  commands.fireDrones.description = "Tell a drone to run now, and output its result";
  commands.fireDrones.action = {
    local: delegateAction.bind(local, 'fireDrones'),
    remote: remoteDelegateAction.bind(remote, 'fireDrones')
  };

  // create a drone or worker to make your own
  commands.createBees = {};
  commands.createBees.command = "create <bee>";
  commands.createBees.description = "create a drone/worker to make your own";
  commands.createBees.action = {
    local: delegateAction.bind(local, 'createBee'),
    remote: remoteDelegateAction.bind(remote, 'createBee')
  };
  
  // replicate our hive to another host
  commands.replicate = {};
  commands.replicate.command = "repl <host>";
  commands.replicate.description = "Replicate current hive structure to another host";
  commands.replicate.action = {
    local: delegateAction.bind(local, 'replicate'),
    remote: remoteDelegateAction.bind(remote, 'replicate')
  };

  // show basic process stuffs
  commands.ps = {};
  commands.ps.command = "ps [bee]";
  commands.ps.description = "Show process meta";
  commands.ps.action = {
    local: delegateAction.bind(local, 'ps'),
    remote: remoteDelegateAction.bind(remote, 'ps')
  };
  

  // connect to remote hive instance
  commands.remote = {};
  commands.remote.command = "remote <host>";
  commands.remote.description = "connect to remote hive";
  commands.remote.action = {
    local: delegateAction.bind(local, 'connectToRemote'),
    remote: remoteDelegateAction.bind(remote, 'connectToRemote')
  };

  // disconnect from remote hive
  commands.disconnectRemote = {};
  commands.disconnectRemote.command = "xrem";
  commands.disconnectRemote.description = "disconnect from remote hive";
  commands.disconnectRemote.action = {
    local: delegateAction.bind(local, 'disconnectRemote'),
    remote: delegateAction.bind(remote, 'disconnectRemote')
  };

  commands.nothing = {};
  commands.nothing.command = "nothing";
  commands.nothing.description = "does nothing";
  commands.nothing.action = {
    local: function(args, callback){
      callback();
    },
    remote: function(args, callback){
      callback();
    }
  };

  let bindCLI = function(cliObject, commandDict, isRemote){
    isRemote = isRemote || false;
    let cliSession = cliObject.command(commandDict.command);
    cliSession.description(commandDict.description);
    if(isRemote){
      cliSession.action(commandDict.action.remote);
    } else {
      cliSession.action(commandDict.action.local);
    }
    
    if(typeof commandDict.option !== "undefined"){
      cliSession.option.apply(cliSession, commandDict.option);
    }
  };

  let bind = function(){
    for(let commandKey in commands){
      let commandDict = commands[commandKey];
      bindCLI(local, commandDict, false);
      bindCLI(remote, commandDict, true);
    }
  };

  let init = function(){
    bind();
    return {local: local, remote: remote};
  };

  return init();
  //return {local: local, remote: remote};
};