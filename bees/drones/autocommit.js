module.exports = function AutoCommitDrone(){
  let mind = {};
  mind.hz = 10000;
  mind.task = function(callback){
    let cmdWorker = this.spawnWorker('cmd');
    cmdWorker("git add .", function(){
      cmdWorker("git commit -m \"autocommit\"", function(){
        cmdWorker("git push -u origin master", callback);
      });
    });
    //callback("HO");
  };
  return mind;
};