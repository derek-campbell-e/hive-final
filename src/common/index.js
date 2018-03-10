module.exports = {
  // required by our bees/hive for events and delegate events
  delegateBinder: require('./delegateBinder'),
  makeEmitter: require('./makeEmitter'),
  
  // required by our bees to make em smart
  Mind: require('./Mind'),
  mindLoader: require('./mindLoader'),

  // required for logging, making timestamps etc
  makeLogger: require('./makeLogger'),
  logFormatter: require('./logFormatter'),
  stdFormatter: require('./stdFormatter'),
  timestamp: require('./timestamp'),

  // make a universally unique identifier
  uuid: require('./uuid')
};