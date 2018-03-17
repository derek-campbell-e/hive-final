module.exports = function CMDWorker(){
  const child_process = require('child_process');
  const stringArgv = require('string-argv');
  let mind = {};
  mind.tasks = ['spawnCmd'];
  mind.isSync = false;
  mind.spawnCmd = function(command, callback){
    let commandArgs = stringArgv(command);
    let spawn = child_process.spawn(commandArgs[0], commandArgs.slice(1), {stdio: 'inherit'});
    spawn.on('close', callback);
  };
  return mind;
};