module.exports = function Timer(options){
  let timer = {};

  timer.fn = "";
  timer.type = "";
  timer.scheduledTimer = null;

  timer.uuid = require('./uuid')();

  timer.setTimeout = function(fn, schedule){
    let caller = this;
    timer.type = 'setTimeout';
    timer.fn = fn.bind(caller);
    timer.scheduledTimer = setTimeout(timer.fn, schedule);
  };

  timer.setInterval = function(){
    let caller = this;
    timer.type = 'setInterval';
    timer.fn = fn.bind(caller);
    timer.scheduledTimer = setInterval(timer.fn, schedule);
  };

  timer.gc = function(){
    switch(timer.type){
      case 'setTimeout':
        timer.scheduledTimer = clearTimeout(timer.scheduledTimer);
      break;
      case 'setInterval':
        timer.scheduledTimer = clearInterval(timer.scheduledTimer);
      break;
    }
    timer.type
  };

  return timer;
};