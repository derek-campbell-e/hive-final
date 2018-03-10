module.exports = function FileWriterWorker(){
  const fs = require('fs');
  
  let mind = {};
  mind.isSync = false;
  mind.tasks = ['checkReadWrite', 'checkData', 'writeFile'];
  
  mind.checkReadWrite = function(filename, data, callback){
    this.log("checkReadWrite...");
    setTimeout(callback, 2000);
  };
  
  mind.checkData = function(filename, data, callback){
    //throw new Error("HAHAH");
    this.error("UH OH");
    setTimeout(callback, 1000);
  };

  mind.writeFile = function(filename, data, callback){
    //console.log("RUNNING 3");
    this.log("good to go! WRITE IT...");
    setTimeout(callback, 3000);
  };

  return mind;
};