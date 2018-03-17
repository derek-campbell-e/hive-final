module.exports = function CMDWorker(){
  const child_process = require('child_process');
  const stringArgv = require('string-argv');
  let mind = {};
  mind.tasks = ['spawnCmd'];
  mind.isSync = false;
  mind.spawnCmd = function(command, callback){
    let commandArgs = stringArgv(command);
    let spawn = child_process.spawn(commandArgs[0], commandArgs.slice(1));
    let worker = this;
    spawn.stderr.on('data', function(data){
      worker.error(data.toString());
    });
    spawn.stdout.on('data', function(data){
      worker.log(data.toString());
    });
    spawn.on('close', callback);
  };
  return mind;
};