const klawSync = require('klaw-sync')
const Mustache = require('mustache');
const fs = require("fs-extra");
const path = require('node:path');
const config = require('../config.js');


function loadData(){
  const dataFiles = klawSync('./data', {nodir: true});
  const data = {};
  dataFiles.forEach(file => {
    let dataItem = require(file.path);
    data[path.basename(file.path, '.js')] = dataItem();
  })
  return data;
}

function loadTemplate(){
  const templateFiles = klawSync('./pages', {nodir: true});
  return templateFiles.map(file => {
    return {
      name: path.basename(file.path, '.mustache'),
      path: path.parse(file.path).dir,
      content: fs.readFileSync(file.path, 'utf8')
    }
  });
}

function loadTemplatePartials(){
  const partialFiles = klawSync('./components', {nodir: true});
  const partialData = {};
  partialFiles.forEach(file => {
    partialData[path.basename(file.path, '.mustache')] = fs.readFileSync(file.path, 'utf8');
  })
  return partialData;
}

function renderTemplates(templates, data, partials){
  templates.forEach(template => {
    const distPath = path.join(path.resolve(config.distDir), path.relative(config.rootDir, template.path).replace('pages', ''), template.name + '.html');
    console.log(`Rendering ${distPath}`);
    const output = Mustache.render(template.content, data, partials);
    fs.mkdirsSync(path.dirname(distPath));
    fs.writeFileSync(distPath, output, 'utf8');
  });
}

module.exports = function() {
  const template = loadTemplate();
  const data = loadData();
  const partials = loadTemplatePartials();
  renderTemplates(template, data, partials);
}