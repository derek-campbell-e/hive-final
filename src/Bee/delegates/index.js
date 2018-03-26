module.exports = function BeeDelegates(Bee, Hive){
  let delegates = {};

  delegates.on = {};
  
  delegates.onSpawn = function(){
    debug = require('debug')(Bee.meta.debugName());
    Bee.meta.spawnAt.refresh();
    debug("i am being spawned... better let the hive know");
    Hive.runDelegate('on', 'beeSpawn', Bee.export());
  };
  
  delegates.onRetire = function(){
    Bee.retireSpawn();
    Bee.gc();
    debug("i am being retired... the hive should know about my two-weeks");
    Hive.runDelegate('on', 'beeRetire', Bee.export());
    Bee.gc();
  };

  delegates.onTaskStart = function(task){
    Hive.runDelegate('on', 'taskStart', Bee.export(), task.export());
  };

  delegates.onTaskComplete = function(task){
    Bee.retireSpawn();
    Hive.runDelegate('on', 'taskComplete', Bee.export(), task.export());
    Bee.tasks[task.meta.id] = null;
    delete Bee.tasks[task.meta.id];
  };

  delegates.on.spawn = delegates.onSpawn;
  delegates.on.retire = delegates.onRetire;
  delegates.on.taskStart = delegates.onTaskStart;
  delegates.on.taskComplete = delegates.onTaskComplete;

  return delegates;
};