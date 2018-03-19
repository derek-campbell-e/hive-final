const assert = require('assert');
const Bee = require('../src/Bee');
const testHive = new (require('events').EventEmitter);
const bee = Bee(testHive); // We need a test emitter to act as our hive...
let taskID = null;

describe("Bee", function(){
  it("should be a logger", function(){
    assert(bee.log);
    assert(bee.error);
  });

  it("should have a unique id", function(){
    assert(bee.meta.id);
  });

  it("should emit a spawn event when being spawned (different than being initialized)", function(done){
    testHive.on("on:beeSpawn", function(){
      done();
    });
    bee.spawn();
  });

  it("should emit a task start event when starting a task", function(done){
    testHive.on("on:taskStart", function(){
      done();
    });
    taskID = bee.taskStart.call(bee, "testing");
  });

  it("should emit a task completion event when completing a task", function(done){
    this.timeout(6000); // we emit the task complete notification after a 5 second delay, this might change
    testHive.on("on:taskComplete", function(){
      done();
    });
    bee.taskComplete.call(taskID);
  });

  it("should emit a retire event when being retired", function(done){
    testHive.on("on:beeRetire", function(){
      done();
    });
    bee.retire();
  });

});