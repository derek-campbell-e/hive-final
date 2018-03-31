module.exports = function(Hive, app, tokenDelegate){
  let delegates = {};
  let processArgs = require('vorpal')().parse(process.argv, {use: 'minimist'});

  delegates.get = {};
  delegates.post = {};

  delegates.get["/"] = function(req, res){
    res.send("AYOO");
  };

  delegates.get["/hive"] = function(req, res){
    res.send("I see you want to go to the hive...");
  };

  delegates.post["/authenticate"] = function(req, res){
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    Hive.log("Authentication request from: ", ip);
    let loginInformation = {username: processArgs.u, password: processArgs.p};
    let postedLogin = {username: req.body.username, password: req.body.password};
    let sameUsername = postedLogin.username === loginInformation.username;
    let samePassword = postedLogin.password === loginInformation.password;
    if(sameUsername && samePassword){
      tokenDelegate.createToken(postedLogin, function(token){
        res.send({status: "OK", token: token});
      });
    } else {
      res.send({status: "FAILED", error: "AUTHENTICATION"});
    }
  };

  delegates.post["/verify"] = function(req, res){
    let token = req.body.token;
    tokenDelegate.verifyToken(token, function(error, data){
      if(error){
        return res.send({status: "FAILED", error: "INVALID OR EXPIRED TOKEN"});
      }
      return res.send({status: "OK"});
    });
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