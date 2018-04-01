module.exports = function(Hive){
  const jwt = require('jsonwebtoken');
  let secret = require('crypto').randomBytes(10).toString('hex');
  
  let delegates = {};

  delegates.createToken = function(data, callback){
    let error = null;
    let token = null;
    try {
      token = jwt.sign({data: data}, secret, {expiresIn: 60 * 60});
    } catch (e){
      error = e;
    }
    delegates.onCreateToken(callback, error, token);
  };

  delegates.onCreateToken = function(callback, error, token){
    if(error){
      return callback(null);
    }
    return callback(token);
  };

  delegates.verifyToken = function(token, callback){
    jwt.verify(token, secret, callback);
  };

  return delegates;
};