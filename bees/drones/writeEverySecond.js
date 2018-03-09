module.exports = function WriteEverySecond(){
  let mind = {};

  mind.maxThreads = 2;
  
  mind.hz = 1000;
  mind.task = function(callback){
    let fileWriterWorker = this.spawnWorker('fileWriter');
    this.log("hello\nniceday")
    fileWriterWorker("drone-test.txt", "HEYLLOO", callback);
  };

  return mind;
};