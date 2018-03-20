module.exports = function FileWriterWorker(){
  const fs = require('fs');
  
  let mind = {};
  mind.isSync = false;
  mind.tasks = ['checkReadWrite', 'checkData', 'writeFile'];
  
  mind.checkReadWrite = function(filename, data, callback){
    setTimeout(callback, 2000);
  };
  
  mind.checkData = function(filename, data, callback){
    setTimeout(callback, 1000);
  };

  mind.writeFile = function(filename, data, callback){
    setTimeout(callback, 3000);
  };

  return mind;
};