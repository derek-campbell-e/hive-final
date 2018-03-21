// we use a common structure for most main components, so lets simplify it;
module.exports = function CommonObject(){
  const common = require('../common');
  let Module = {};
  Module.meta = {};
  Module.meta.id = common.uuid();
  Module.meta.stdout = "";
  Module.meta.stderr = "";
  Module.meta.class = "";
  Module.meta.mind = "default";
  common.makeEmitter(Module);
  common.makeLogger(Module);
  return Module;
};