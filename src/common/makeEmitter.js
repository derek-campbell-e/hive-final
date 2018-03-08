// extends a module to make it an event emitter
module.exports = function MakeEmitter(Module){
  const EventEmitter = require('events').EventEmitter;
  const extend = require('extend');
  return extend(true, Module, new EventEmitter());
};