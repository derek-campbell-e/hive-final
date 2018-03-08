module.exports = function Task(taskName){
  const uuid = require('./common/uuid');
  const timestamp = require('./common/timestamp');
  
  let task = {};
  
  task.meta = {};

  task.meta.id = uuid();
  task.meta.name = taskName;
  task.meta.runTime = 0;
  task.meta.startTime = -1;
  task.meta.endTime = -1;

  task.updateRuntimeTimer = null;

  task.stop = function(){
    task.meta.endTime = timestamp();
    task.updateRuntimeTimer = clearInterval(task.updateRuntimeTimer);
  };

  task.run = function(){
    task.meta.startTime = -1;
    task.meta.endTime = -1;
    task.updateRuntimeTimer = setInterval(task.calculateRuntime, 0);
    task.meta.startTime = timestamp();
  };

  task.calculateRuntime = function(){
    let endTime = task.meta.endTime;
    if(endTime < 0){
      endTime = timestamp();
    }
    task.meta.runTime = endTime - task.meta.startTime;
  };

  return task;
};