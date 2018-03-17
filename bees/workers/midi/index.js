module.exports = function MidiWorker(){
  const midi = require('midi');

  let mind = {};
  mind.isSync = false;
  mind.tasks = ['connectToMidi', 'sendMidiMessage', 'closeMidiPort'];

  mind.port = null;
  
  mind.connectToMidi = function(virtualMidiPort, midiMessage, callback){
    console.log("connectiong");
    mind.port = new midi.output();
    mind.port.openVirtualPort(virtualMidiPort);
    callback();
  };

  mind.sendMidiMessage = function(virtualMidiPort, midiMessage, callback){
    console.log("sending");
    mind.port.sendMidiMessage(midiMessage);
  };

  mind.closeMidiPort = function(virtualMidiPort, midiMessage, callback){
    console.log("closing");
    setTimeout(function(){
      mind.port.closePort();
      callback();
    },0);
  };

  return mind;
};