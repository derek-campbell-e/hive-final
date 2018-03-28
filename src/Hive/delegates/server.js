module.exports = function(app){
  let delegates = {};

  delegates.get = {};
  delegates.get["/"] = function(req, res){
    res.send("AYOO");
  };

  delegates.get["/hive"] = function(req, res){
    res.send("I see you want to go to the hive...");
  };

  let bind = function(){
    for(let methodKey in delegates){
      for(let route in delegates[methodKey]){
        let handler = delegates[methodKey][route];
        try {
          app[methodKey](route, handler);
        } catch (e) {

        }
      }
    }
  };

  bind();

  return delegates;
};