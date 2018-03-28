module.exports = function AutoCommitDrone(){
  let mind = {};
  mind.later = 'at 10:24 pm on Tuesday';
  mind.task = function(callback){
    let textWorker = this.worker('textMessage');
    this.log("RUNNING");
    textWorker("+19512315340", "CLEAN YOUR ROOM", callback);
  };
  return mind;
};