module.exports = function MakeLogger(Module){
  const colors = require('colors');

  const logFormatter = require('./logFormatter');
  const stdFormatter = require('./stdFormatter');
  let logger = {};

  logger.makeLogLine = function(){
    return logFormatter(Module, stdFormatter.apply(Module, arguments))
  };

  logger.log = function(){
    let line = logger.makeLogLine.apply(logger, arguments);
    Module.meta.stdout += line;
    Module.emit("logline", line.replace(/\n/g, " "));
    trim();
  };

  logger.error = function(){
    let line = logger.makeLogLine.apply(logger, arguments);
    Module.meta.stderr += line;
    Module.emit("errorline", line.replace(/\n/g, " ").red);
    trim();
  };

 let trim = function(){
    let maxLines = Module.meta.maxLines || 50;
    let stdOutLines = Module.meta.stdout.split(/\n/g);
    let stdErrLines = Module.meta.stderr.split(/\n/g);
    
    let stdOutIndexAndCount = stdOutLines.length - maxLines;
    let stdErrIndexAndCount = stdErrLines.length - maxLines;

    stdOutLines.splice(stdOutIndexAndCount, stdOutIndexAndCount);
    stdErrLines.splice(stdErrIndexAndCount, stdErrIndexAndCount);

    Module.meta.stdout = stdOutLines.join("\n");
    Module.meta.stderr = stdErrLines.join("\n");
  };

  Module.log = logger.log;
  Module.error = logger.error;
};