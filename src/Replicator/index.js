module.exports = function Replicator(Hive){
  const debug = require('debug')('replicate');
  const glob = require('multi-glob').glob;
  const path = require('path');
  const fs = require('fs');
  const io = require('socket.io-client');

  const common = require('../common');

  let repl = common.commonObject();
  repl.meta.class = 'replicator';
  repl.meta.mind = 'default';

  let replicateSocket = null;

  let assets = {};
  assets.dirs = [];
  assets.files = {};

  let resetAssets = function(){
    assets = {};
    assets.dirs = [];
    assets.files = {};
  };

  let delegates = require('./delegates')(repl);

  repl.replicateToHive = function(args, callback){
    let cli = this;
    let message = "starting to replicate to hive: " + args.host;
    this.log(message);
    repl.log(message);
    resetAssets();
    repl.connectToHive.call(cli, args, callback);
  };

  repl.connectToHive = function(args, callback){
    let cli = this;
    replicateSocket = io(args.host, {forceNew: true});
    replicateSocket.once('connect', delegates.onConnectionSuccess.bind(cli, args, callback));
    replicateSocket.once('connect_error', delegates.onConnectionFailed.bind(cli, args, callback));
  };

  repl.notifyHiveOfTransaction = function(args, callback){
    replicateSocket.on("ready:replication", repl.startReplication);
    replicateSocket.on("complete:replication", repl.completeReplication.bind(repl, args, callback));
    replicateSocket.emit("begin:replication");
  };

  repl.startReplication = function(){
    debug("STARTING TO REPLICATE");
    repl.log("building assets...");
    repl.buildAssets(function(){
      replicateSocket.compress().emit("replication", assets);
    });
  };

  repl.completeReplication = function(args, callback){
    debug("we are done replicating so close the socket!");
    replicateSocket.close();
    Hive.reload();
    callback("REPLICATION COMPLETED");
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
      let relativePath = path.relative(Hive.options.beeFolder, file);

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
    globOptions.cwd = Hive.options.beeFolder;
    globOptions.absolute = true;
    globOptions.realpath = true;
    glob(['**/*'], globOptions, function(error, files){
      if(!error){
        repl.compileIntoAssets(files, callback);
      }
    });
  };

  repl.replicateInto = function(assets, callback){
    let folders = assets.dirs;
    repl.createFolders(folders, function(){
      repl.createFiles(assets.files, callback);
    });
  };

  repl.createFiles = function(files, callback){
    let basePath = Hive.options.beeFolder;
    let fileKeys = Object.keys(files);
    let loop = function(){
      let filename = fileKeys.shift();
      if(typeof filename === 'undefined'){
        callback();
        return;
      }
      let fullFilePath = path.join(basePath, filename);
      let fileData = files[filename];
      fs.writeFile(fullFilePath, fileData, {flag: 'w+'}, function(error){
        loop();
      });
    };
    loop();
  };

  repl.createFolders = function(folders, callback){
    let basePath = Hive.options.beeFolder;
    let foldersCopy = [...folders];
    let loop = function(){
      let folder = foldersCopy.shift();
      if(typeof folder === "undefined"){
        debug("folders are done, lets write the data");
        callback();
        return;
      }
      let fullFolderPath = path.join(basePath, folder);
      fs.mkdir(fullFolderPath, function(error){
        loop();
      });
    }
    loop();
  };

  return repl;
};