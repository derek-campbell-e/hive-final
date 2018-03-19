module.exports = function CLI(Hive){
  const vorpal = require('vorpal')();

  vorpal.delimiter('hive:'+Hive.meta.version+"$").show();

  vorpal.command('stdout [bees...]').action(Hive.showLogs);

  vorpal.command('stderr [bees...]').action(Hive.showErrors);

  vorpal.command("load drones [drones...]").option('-a, --all', 'load all the drones').action(Hive.delegates.cli.loadDrones);

  vorpal.command("start drones [drones...]").option('-a, --all', 'start all the drones').action(Hive.delegates.cli.startDrones);

  vorpal.command("logs [bees...]").action(Hive.tailLogs);
  
  vorpal.command("errors [bees...]").action(Hive.tailErrors);

  vorpal.command("stats [bees...]").action(Hive.delegates.cli.showStats);

  vorpal.command("retire <bees...>").action(Hive.delegates.cli.retireBees);

  vorpal.command("fire <drones...>").action(Hive.delegates.cli.fireDrones);

  vorpal.command("create <bees...>").action(Hive.delegates.cli.createBee);

  vorpal.command("ls drones").action(Hive.delegates.cli.listDrones);

  vorpal.command("run <bee>").option("-o, --once", 'run once and retire the bee')
  .action(Hive.delegates.cli.runBee);

  return vorpal;

};