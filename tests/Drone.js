const assert = require('assert');
const Drone = require('../src/Drone');
const testHive = new (require('events').EventEmitter); // We need a test emitter to act as our hive...
const drone = Drone(testHive, null, ''); // no need for a queen to do tests...yet, and we will do a manual loading of our drone mind
let testMind = function(){
  let mind = {};
  mind.hz = 1000;
  mind.task = function(callback){
    callback("RUNNING");
  };
  return mind;
};

drone.mind = testMind();
drone.meta.mind = 'testMind';

describe("Drone", function(){
  it("should be a logger", function(){
    assert(drone.log);
    assert(drone.error);
  });

  it("should run a task every second (using hz/ms)", function(done){
    var hasCompleted = false;
    drone.start(function(result){
      hasCompleted = true;
    });
    setTimeout(function(){
      if(hasCompleted){
        return done();
      } else {
        return done(new Error("did not complete in a second"));
      }
    }, 1000);
  });

  it("should run a task every 5 seconds (using later text)", function(done){
    this.timeout(6000);
    var hasCompleted = false;
    delete drone.mind.hz;
    drone.mind.later = 'every 5 sec';
    drone.start(function(result){
      hasCompleted = true;
    });
    setTimeout(function(){
      if(hasCompleted){
        return done();
      } else {
        return done(new Error("did not complete in a second"));
      }
    }, 5000);
  });

});

