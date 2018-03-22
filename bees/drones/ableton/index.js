module.exports = function AbletonDrone(){
  let mind = {};
  mind.hz = 1000;
  //mind.maxThreads = 1;

  mind.task = function(callback){
    //mind.port.sendMessage([144, 64, 100]);
    callback("WOOHOO");
  };

  return mind;
};