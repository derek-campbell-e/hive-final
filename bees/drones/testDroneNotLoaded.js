module.exports = function TestDroneNotLoaded(){
  let mind = {};

  mind.maxThreads = 1;
  
  mind.later = 'every 1 sec';
  mind.task = function(callback){
    let fileWriterWorker = this.spawnWorker('fileWriter');
    this.log("hello WE FINALLY STARTED");
    console.log(this);
    fileWriterWorker("drone-test.txt", "HEYLLOO", callback);
  };

  return mind;
};