module.exports = function MindLoader(options){
  options = options || {};

  const path = require('path');
  let mind = {};
  let baseFolder = options.base || path.join(__dirname, '..', '..', 'bees');
  let mindFolder = path.join(baseFolder, options.class);
  let mindPath = path.join(mindFolder, options.mind);
  
  try {
    mind = require(mindPath);
  } catch (e){
    mind = {};
  }

  return mind;
};