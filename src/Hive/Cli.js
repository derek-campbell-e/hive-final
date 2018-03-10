module.exports = function CLI(Hive){
  const vorpal = require('vorpal')();
  vorpal.delimiter('hive:'+Hive.meta.version+"$").show();

  vorpal
    .command('stdout [bees...]')
    .action(Hive.showLogs);
  vorpal
    .command('stderr [bees...]')
    .action(Hive.showErrors);

  vorpal
    .command("start drones [drones...]")
    .option('-a, --all', 'start all the drones')
    .action(Hive.startDrones);

  vorpal
    .command("logs")
    .action(Hive.tailLogs);
  
  vorpal
    .command("errors")
    .action(Hive.tailErrors);
};