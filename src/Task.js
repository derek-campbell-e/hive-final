module.exports = function Task(bee, taskName){
  const uuid = require('./common/uuid');
  const timestamp = require('./common/timestamp');
  const common = require('./common');
  
  let task = common.commonObject();

  task.meta.class = 'task';
  task.meta.mind = taskName;
  task.meta.name = taskName;
  task.meta.runTime = 0;
  task.meta.startTime = -1;
  task.meta.endTime = -1;

  task.updateRuntimeTimer = null;

  task.completeTask = function(){
    task.result.apply(task, arguments);
    task.meta.endTime = timestamp();
    task.updateRuntimeTimer = clearInterval(task.updateRuntimeTimer);
  };

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
  
  task.gc = function(){

  };

  task.export = function(){
    let exports = {};
    for(let key in task.meta){
      let exportData = task.meta[key];
      if(typeof exportData === 'function'){
        exports[key] = exportData();
      } else {
        exports[key] = exportData;
      }
    }
    exports.refresh = task.export;
    exports.bee = bee.meta.id;
    exports.gc = task.gc;
    return exports;
  };

  return task;
};