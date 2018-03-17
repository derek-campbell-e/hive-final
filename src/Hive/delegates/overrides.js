module.export = function OverrideDelegates(Hive){
  var uuid = require('../../common/uuid');
  var delegates = {};
  
  delegates.ovveride.setInterval = function(fn){
    let caller = this;
    var internalID = uuid();
    hive.timers[internalID] = {
      type: 'setInterval',
      fn: fn.bind(this)
    };
    return window.set
  };

  return delegates;
};