module.exports = function Replicate(Hive){
  const debug = require('debug')('replicate');
  const glob = require('multi-glob').glob;
  const path = require('path');
  const fs = require('fs');

  let repl = {};

  let assets = {};
  assets.dirs = [];
  assets.files = {};

  let resetAssets = function(){
    assets = {};
    assets.dirs = [];
    assets.files = {};
  };

  repl.replicateToHive = function(){
    resetAssets();
    repl.buildAssets(repl.connectToHive);
  };

  repl.connectToHive = function(){
    debug("done building assets so lets connect to the hive!");
  };

  repl.compileIntoAssets = function(files, callback){
    let filesCopy = [...files];
    let loop = function(){
      let file = filesCopy.shift();
      if(typeof file === "undefined"){
        debug("finished compiling assets");
        callback();
        return;
      }
      repl.addIntoStructure(file, loop);
    };
    loop();
  };

  repl.addIntoStructure = function(file, callback){
    callback = callback || function(){};
    fs.stat(file, function(error, stats){
      let isDirectory = stats.isDirectory();
      let isFile = stats.isFile();
      let relativePath = path.relative(Hive.queen.options.beeFolder, file);

      if(isDirectory){
        assets.dirs.push(relativePath);
        return callback();
      }

      if(isFile){
        assets.files[relativePath] = null;
        fs.readFile(file, function(error, data){
          if(!error){
            assets.files[relativePath] = data;
            callback();
          }
        });
      }
    });
  };

  repl.buildAssets = function(callback){
    callback = callback || function(){};
    debug("building assets...");
    let globOptions = {};
    globOptions.cwd = Hive.queen.options.beeFolder;
    globOptions.absolute = true;
    globOptions.realpath = true;
    glob(['**/*'], globOptions, function(error, files){
      if(!error){
        repl.compileIntoAssets(files, callback);
      }
    });
  };

  return repl;
};