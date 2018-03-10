module.exports = function MakeLogger(Module){
  const colors = require('colors');
  const fs = require('fs');
  const path = require('path');

  const logFormatter = require('./logFormatter');
  const stdFormatter = require('./stdFormatter');
 
  let logger = {};

  let logpaths = {};
  logpaths.stdout = path.join(__dirname, '..', '..', 'logs/stdout.txt');
  logpaths.stderr = path.join(__dirname, '..', '..', 'logs/stderr.txt');

  logger.makeLogLine = function(){
    return logFormatter(Module, stdFormatter.apply(Module, arguments))
  };

  logger.log = function(){
    let line = logger.makeLogLine.apply(logger, arguments);
    Module.meta.stdout += line;
    Module.emit("logline", line.replace(/\n/g, " "));
    fs.writeFileSync(logpaths.stdout, line, {encoding: 'utf-8', flag: 'a'});
    trim();
  };

  logger.error = function(){
    let line = logger.makeLogLine.apply(logger, arguments);
    Module.meta.stderr += line;
    Module.emit("errorline", line.replace(/\n/g, " ").red);
    fs.writeFileSync(logpaths.stderr, line, {encoding: 'utf-8', flag: 'a'});
    trim();
  };

 let trim = function(){
    let maxLines = Module.meta.maxLines || 50;
    let stdOutLines = Module.meta.stdout.split(/\n/g);
    let stdErrLines = Module.meta.stderr.split(/\n/g);
    
    let stdOutIndexAndCount = stdOutLines.length - maxLines;
    let stdErrIndexAndCount = stdErrLines.length - maxLines;

    let stdOutWrite = stdOutLines.splice(stdOutIndexAndCount, stdOutIndexAndCount);
    let stdErrWrite = stdErrLines.splice(stdErrIndexAndCount, stdErrIndexAndCount);

    Module.meta.stdout = stdOutLines.join("\n");
    Module.meta.stderr = stdErrLines.join("\n");
  };

  Module.log = logger.log;
  Module.error = logger.error;
};