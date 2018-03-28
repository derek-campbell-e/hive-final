module.exports = function DestersDrone(){
  let mind = {};
  mind.later = "at 6:15 am on Monday,Tuesday,Wednesday and Thursday";

  mind.task = function(callback){
    let lovingMessage = this.worker('createLovingMessage');
    let textMessage = this.worker('textMessage');
    lovingMessage("Dester", "wake up", "have {{ an_adjective }} and {{ an_adjective }} day!", function(message){
      textMessage("+19092638502", message, callback);
    });
  };
  return mind;
};