module.exports = function Renderer(template, data){
  const ejs = require('ejs');
  const path = require('path');
  const fs = require('fs');
  let templatePath = path.join(__dirname, '..', 'templates', template + ".ejs");
  let templateString = "";
  try {
    templateString = fs.readFileSync(templatePath, 'utf-8');
  } catch (error){
    templateString = "";
  }
  return ejs.render(templateString, data);
};