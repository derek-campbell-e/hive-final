module.exports = function WriteEverySecond(){
  let mind = {};

  mind.maxThreads = 2;
  
  mind.hz = 1;
  mind.task = function(callback){
    let fileWriterWorker = this.spawnWorker('fileWriter');
    console.log(this.meta.threads());
    fileWriterWorker("drone-test.txt", "HEYLLOO", callback);
  };

  return mind;
};