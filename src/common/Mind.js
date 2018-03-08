module.exports = function Mind(Mindfile){
  const path = require('path');
  
  let mind = {};

  mind.module = {};
  mind.name = path.basename(Mindfile, '.js');
  mind.error = null;

  try {
    mind.module = require(Mindfile);
  } catch (e){
    mind.module = {};
    mind.error = e;
  }

  return mind;
};