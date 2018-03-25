module.exports = function OnDelegates(Hive){
  let delegates = {};

  delegates.beeSpawn = function(bee){
    Hive.bees[bee.id] = bee;
  };

  delegates.beeRetire = function(bee){
    Hive.bees[bee.id] = null;
    delete Hive.bees[bee.id];
  };

  delegates.taskStart = function(bee, task){
    Hive.tasks[task.id] = {
      task: task,
      bee: bee.id
    };
  };

  delegates.taskComplete = function(bee, task){
    Hive.tasks[task.id] = null;
    delete Hive.tasks[task.id];
  };

  Hive.on("on:beeSpawn", delegates.beeSpawn);
  Hive.on('on:beeRetire', delegates.beeRetire);
  Hive.on('on:taskStart', delegates.taskStart);
  Hive.on('on:taskComplete', delegates.taskComplete);

  return delegates;
};