module.exports = function CreateLovingMessageMind(){
  const sentencer = require('sentencer');

  let randomNumber = function(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  let generateGreeting = function(){
    let greetings = ['Goooood morning!', 'Rise and shine!!!!', 'Look who just got up!', 'STOP SLEEPIN\' THE WORLD MISSES YA!'];
    return greetings[randomNumber(0, greetings.length - 1)];
  };

  let mind = {};
  
  mind.tasks = ['configure', 'create'];

  mind.configure = function(name, verb, also, callback){
    sentencer.configure({
      adjectiveList: ["adaptable",
      "adventurous",
      "affectionate",
      "ambitious",
      "amiable",
      "compassionate",
      "considerate",
      "courageous",
      "courteous",
      "diligent",
      "empathetic",
      "exuberant",
      "frank",
      "generous",
      "gregarious",
      "impartial",
      "intuitive",
      "inventive",
      "passionate",
      "persistent",
      "philosophical",
      "practical",
      "rational",
      "reliable",
      "resourceful",
      "sensible",
      "sincere",
      "sympathetic",
      "unassuming",
      "witty",
      "adaptable",
      "adventurous",
      "affable",
      "affectionate",
      "agreeable",
      "ambitious",
      "amiable",
      "amicable",
      "amusing",
      "brave",
      "bright",
      "broad-minded",
      "calm",
      "careful",
      "charming",
      "communicative",
      "compassionate",
      "conscientious",
      "considerate",
      "convivial",
      "courageous",
      "courteous",
      "creative",
      "decisive",
      "determined",
      "diligent",
      "diplomatic",
      "discreet",
      "dynamic",
      "easygoing",
      "emotional",
      "energetic",
      "enthusiastic",
      "exuberant",
      "fair-minded",
      "faithful",
      "fearless",
      "forceful",
      "frank",
      "friendly",
      "funny",
      "generous",
      "gentle",
      "good",
      "gregarious",
      "hard-working",
      "helpful",
      "honest",
      "humorous",
      "imaginative",
      "impartial",
      "independent",
      "intellectual",
      "intelligent",
      "intuitive",
      "inventive",
      "kind",
      "loving",
      "lovely",
      "modest",
      "neat",
      "nice",
      "optimistic",
      "passionate",
      "patient",
      "persistent",
      "pioneering",
      "philosophical",
      "placid",
      "plucky",
      "polite",
      "powerful",
      "practical",
      "pro-active",
      "quick-witted",
      "quiet",
      "rational",
      "reliable",
      "reserved",
      "resourceful",
      "romantic",
      "self-confident",
      "self-disciplined",
      "sensible",
      "sensitive",
      "shy",
      "sincere",
      "sociable",
      "straightforward",
      "sympathetic",
      "thoughtful",
      "tidy",
      "tough",
      "unassuming",
      "understanding",
      "versatile",
      "warmhearted",
      "willing"
      ]
    });
    callback();
  };

  mind.create = function(name, verb, also, callback){
    let fullSentencer = [generateGreeting(), "It's time to", verb, name + ".", "But also, I wish that you", also];
    let outputSentence = sentencer.make(fullSentencer.join(" "));
    callback(outputSentence);
  };

  return mind;
};