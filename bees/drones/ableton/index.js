module.exports = function AbletonDrone(){
  const midi = require('midi');
  let mind = {};
  mind.hz = 1000;
  //mind.maxThreads = 1;

  mind.port = new midi.output();
  mind.port.openVirtualPort('drone:ableton');

  mind.task = function(callback){
    mind.port.sendMessage([144, 64, 100]);
    callback("WOOHOO");
  };

  return mind;
};