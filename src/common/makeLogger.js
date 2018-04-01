module.exports = function MakeLogger(Module){
  const colors = require('colors');
  const fs = require('fs');
  const path = require('path');

  const logFormatter = require('./logFormatter');
  const stdFormatter = require('./stdFormatter');
 
  let logger = {};

  let logpaths = {};
  logpaths.stdout = path.join(HiveOptions.logFolder, 'stdout.txt');
  logpaths.stderr = path.join(HiveOptions.logFolder, 'stderr.txt');
  logpaths.results = path.join(HiveOptions.logFolder, 'results.txt');

  if(typeof Module.emit === "undefined"){ Module.emit = function(){} };

  logger.makeLogLine = function(){
    return logFormatter(Module, stdFormatter.apply(Module, arguments))
  };

  logger.beforeWrite = function(file, callback){
    let dirName = path.dirname(file);
    fs.access(dirName, fs.constants.R_OK | fs.constants.W_OK, function(error){
      if(error){
        return fs.mkdir(dirName, callback);
      }
      callback(null);
    });
  };

  logger.log = function(){
    let line = logger.makeLogLine.apply(logger, arguments);
    Module.meta.stdout += line;
    Module.emit("logline", line.replace(/\n/g, " "));
    if(HiveOptions.verbose){
      console.log(line);
    }
    logger.beforeWrite(logpaths.stdout, function(error){
      if(!error){
        fs.writeFileSync(logpaths.stdout, line, {encoding: 'utf-8', flag: 'a'});
        trim();
        return;
      }
    });
  };

  logger.error = function(){
    let line = logger.makeLogLine.apply(logger, arguments);
    Module.meta.stderr += line;
    Module.emit("errorline", line.replace(/\n/g, " ").red);
    if(HiveOptions.verbose){
      console.error(line);
    }
    logger.beforeWrite(logpaths.stderr, function(error){
      if(!error){
        fs.writeFileSync(logpaths.stderr, line, {encoding: 'utf-8', flag: 'a'});
        trim();
        return;
      }
    });
  };
  
  logger.result = function(){
    let line = logger.makeLogLine.apply(logger, arguments);
    Module.meta.results += line;
    logger.beforeWrite(logpaths.results, function(error){
      if(!error){
        fs.writeFileSync(logpaths.results, line, {encoding: 'utf-8', flag: 'a'});
        trim();
        return;
      }
    });
  };

 let trim = function(){
    let maxLines = Module.meta.maxLog || 50;
    let stdOutLines = Module.meta.stdout.split(/\n/g);
    let stdErrLines = Module.meta.stderr.split(/\n/g);
    let resultsLines = Module.meta.results.split(/\n/g);
    
    let stdOutIndexAndCount = stdOutLines.length - maxLines;
    let stdErrIndexAndCount = stdErrLines.length - maxLines;
    let resultIndexAndCount = resultsLines.length - maxLines;

    let stdOutWrite = stdOutLines.splice(stdOutIndexAndCount, stdOutIndexAndCount);
    let stdErrWrite = stdErrLines.splice(stdErrIndexAndCount, stdErrIndexAndCount);
    let resultsWrite = resultsLines.splice(resultIndexAndCount, resultIndexAndCount);

    Module.meta.stdout = stdOutLines.join("\n");
    Module.meta.stderr = stdErrLines.join("\n");
    Module.meta.results = resultsLines.join("\n");
  };

  Module.log = logger.log;
  Module.error = logger.error;
  Module.result = logger.result;
  
};