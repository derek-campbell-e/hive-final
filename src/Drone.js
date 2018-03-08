module.exports = function Drone(Hive, MindFile){
  let drone = require('./Bee')(Hive);

  let mind = require('./common/Mind')(MindFile); 
  
  drone.mind = mind.module;
  
  drone.meta.class = 'drone';
  drone.meta.mind = mind.name;

  drone.start = function(){

  };

  let init = function(){
    drone.spawn();
    return drone;
  };

  return init();
};