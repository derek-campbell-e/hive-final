module.exports = function CLI(Hive){
  const vorpal = require('vorpal')();

  let delegateAction = function(delegateFunction, args, callback){
    let delegateKey = 'cli';
    if(Hive.isValidDelegate(delegateKey, delegateFunction)){
      return Hive.runDelegate(delegateKey, delegateFunction, args, callback);
    }
    Hive.log("unrecognized delegate funcation attempted", delegateKey, delegateFunction);
    callback('an error occured processing your request');
  };

  vorpal.delimiter('hive:'+Hive.meta.version+"$").show();

  vorpal.command('stdout [bees...]').action(delegateAction.bind(Hive, 'showLogs'));

  vorpal.command('stderr [bees...]').action(delegateAction.bind(Hive, 'showErrors'));

  vorpal.command("load drones [drones...]").option('-a, --all', 'load all the drones').action(delegateAction.bind(Hive, 'loadDrones'));

  vorpal.command("start drones [drones...]").option('-a, --all', 'start all the drones').action(delegateAction.bind(Hive, 'startDrones'));

  vorpal.command("logs [bees...]").action(delegateAction.bind(Hive, 'logs'));
  
  vorpal.command("errors [bees...]").action(delegateAction.bind(Hive, 'errors'));

  vorpal.command("stats [bees...]").action(delegateAction.bind(Hive, 'showStats'));

  vorpal.command("retire <bees...>").action(delegateAction.bind(Hive, 'retireBees'));

  vorpal.command("fire <drones...>").action(delegateAction.bind(Hive, 'fireDrones'));

  vorpal.command("create <bees...>").action(delegateAction.bind(Hive, 'createBee'));

  vorpal.command("ls drones").action(delegateAction.bind(Hive, 'listDrones'));

  vorpal.command("run <bee>").option("-o, --once", 'run once and retire the bee')
  .action(delegateAction.bind(Hive, 'runBee'));

  vorpal.command("repl <host>").action(delegateAction.bind(Hive, 'replicate'));

  vorpal.command("ps [bee]").action(delegateAction.bind(Hive, 'ps'));

  return vorpal;

};