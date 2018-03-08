module.exports = function Bee(Hive){
  const uuid = require('./common/uuid');
  const makeEmitter = require('./common/makeEmitter');
  const delegateBinder = require('./common/delegateBinder');
  let debug = require('debug')('bee');

  // start by making the module an event emitter
  let bee = makeEmitter({});

  // our meta object for data
  bee.meta = {};

  bee.meta.id = uuid();
  bee.meta.class = 'base';
  bee.meta.mind = 'default';

  bee.meta.debugName = function(){
    return bee.meta.class + ":" + bee.meta.mind;
  };

  // our delegate methods
  bee.delegates = {};
  bee.delegates.on = {};
  
  bee.delegates.on.spawn = function(){
    debug = require('debug')(bee.meta.debugName());
    debug("i am being spawned... better let the hive know");
    Hive.emit("on:beeSpawn", this);
  };

  bee.delegates.on.retire = function(){
    debug("i am being retired... the hive should know about my two-weeks");
    Hive.emit("on:beeRetire", this);
  };

  bee.spawn = function(){
    bee.emit("on:spawn", bee);
  };

  bee.retire = function(){
    bee.emit("on:retire", bee);
  };

  // our private initializer
  let init = function(){
    debug("initializing a new bee...");
    delegateBinder(bee);
    return bee;
  };

  return init();
};