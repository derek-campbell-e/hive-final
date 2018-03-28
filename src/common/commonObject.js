// we use a common structure for most main components, so lets simplify it;
module.exports = function CommonObject(){
  const common = require('../common');
  const renderer = common.renderer;

  let Module = {};
  Module.meta = {};
  Module.meta.id = common.uuid();
  Module.meta.stdout = "";
  Module.meta.stderr = "";
  Module.meta.results = "";
  Module.meta.class = "";

  Module.meta.debugName = function(){
    return Module.meta.class + ":" + Module.meta.mind;
  };

  Module.meta.mind = "default";
  Module.meta.spawnAt = common.timestamp();
  Module.meta.spawnAt.__proto__.refresh = function(){
    Module.meta.spawnAt = common.timestamp();
  };

  Module.meta.timeSince = function(formatString){
    return require('moment')(Module.meta.spawnAt, 'x').subtract(common.timestamp(), 'x').fromNow();
  };

  Module.meta.spawnAt.__proto__.format = function(formatString){
    return require('moment')(Module.meta.spawnAt).format(formatString);
  };

  Module.meta.lastLog = function(logType, withoutMeta){
    withoutMeta = withoutMeta || false;
    let logs = "";
    switch(logType){
      case 'logs':
        logs = Module.meta.stdout;
      break;
      case 'errors':
        logs = Module.meta.stderr;
      break;
    }
    var messages = logs.split(/\n/g);
    var message = messages.slice(messages.length - 1, 1).join(" ");
    return message;
  };

  Module.meta.ps = function(args, callback){
    callback = callback || function(){};
    let message = renderer('ps', {meta: Module.meta});
    callback(message);
    return message;
  };

  common.makeEmitter(Module);
  common.makeLogger(Module);
  return Module;
};