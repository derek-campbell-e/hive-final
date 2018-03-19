const assert = require('assert');
const Hive = require('../src/Hive')();

describe("Hive", function(){

  it("should spawn with a queen bee", function(){
    assert(Hive.queen);
  });

  it("should spawn with a CLI", function(){
    assert(Hive.cli);
  });

  it("should be a logger", function(){
    assert(Hive.log);
    assert(Hive.error);
  });

});