module.exports = function LogFormatter(bee, logString){
  const moment = require('moment');
  const util = require('util');
  const dateString = moment().format('DD/MMM/YYYY:HH:mm:ss ZZ');
  const metaString = bee.meta.id + " " + bee.meta.class + ":" + bee.meta.mind;
  logString = logString.replace(/\n/g, " ");
  return util.format('%s [%s] - %s \n', metaString, dateString, logString);
};