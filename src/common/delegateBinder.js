// binds delegate methods to emitter events
module.exports = function DelegateBinder(Module){
  for(let delegateSub in Module.delegates){
    for(let delegateEvent in Module.delegates[delegateSub]){
      let eventName = delegateSub + ":" + delegateEvent;
      let callback = Module.delegates[delegateSub][delegateEvent];
      Module.on(eventName, callback);
    }
  }
};