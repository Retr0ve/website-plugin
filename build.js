const fs = require("fs-extra");
const path = require("path");
const config = require("./config.js");
const pluginsData = require("./data/plugins.js");
const Mustache = require('mustache');
const klawSync = require('klaw-sync')


function clearBuildPath(buildPath){
  try {
    fs.rmSync(buildPath, { recursive: true });
  } catch (err) {
    console.log(err);
  }
}

function copyStaticFiles(buildPath){
  try {
    const files = klawSync('./assets', {nodir: true});
    for (let index = 0; index < files.length; index++) {
      console.log(files[index].path);
      if (files[index].path.split('.').pop() === 'mustache') {
        const output = Mustache.render(fs.readFileSync(files[index].path, 'utf8'), config)
        fs.writeFileSync(path.join(buildPath, path.basename(files[index].path, '.mustache')), output, 'utf8');
      } else {
        fs.copySync(files[index].path, path.join(buildPath, path.basename(files[index].path)));
      }
    }
  } catch (err) {
    console.log(err);
  }
}

// Data are used for search feature
function copyData(buildPath, data){
  try {
    fs.writeJsonSync('./site/plugins.json', data);
  } catch (err) {
    console.log(err);
  }
}

async function loadData(){
  const dataFiles = klawSync('./data', {nodir: true});
  const data = {};
  for (let index = 0; index < dataFiles.length; index++) {
    let getData = require(dataFiles[index].path);
    data[path.basename(dataFiles[index].path, '.js')] = await getData();
  }
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

function renderTemplates(templates, globalData, partials, routes){
  templates.forEach(template => {
    if (template.name.search(/\[*\]/g) !== -1) {
      const pathToken = template.name.slice(1, parseInt(template.name.search(/\[*\]/g)));
      console.log(`Rendering dynamic route ${pathToken}`);
      routes[pathToken].forEach(key => {
        const distPath = path.join(path.resolve(config.distDir), path.relative(config.rootDir, template.path).replace('pages', ''), key, 'index.html');
        console.log(`- Rendering ${distPath}`);
        const data = {
          ...globalData,
          path: key,
          plugin: {
            ...globalData.plugins.raw.plugins[key],
            ...globalData.plugins.raw.stats[key][globalData.plugins.raw.plugins[key].version]
          }
        }
        const output = Mustache.render(template.content, data, partials);
        fs.mkdirsSync(path.dirname(distPath));
        fs.writeFileSync(distPath, output, 'utf8');
      });

    } else {
      const distPath = path.join(path.resolve(config.distDir), path.relative(config.rootDir, template.path).replace('pages', ''), template.name + '.html');
      console.log(`Rendering ${distPath}`);
      const output = Mustache.render(template.content, globalData, partials);
      fs.mkdirsSync(path.dirname(distPath));
      fs.writeFileSync(distPath, output, 'utf8');
    }
  });
}

(async function() {
  const buildPath = path.resolve(config.distDir);
  fs.ensureDirSync(buildPath);
  clearBuildPath(buildPath);
  copyStaticFiles(buildPath);
  // Copy plugins data to build path
  copyData(buildPath, await pluginsData());
  const template = loadTemplate();
  const globalData = await loadData();
  const partials = loadTemplatePartials();
  const routes = {
    'pluginName': globalData.plugins.all.map(plugin => plugin.id),
  };
  renderTemplates(template, globalData, partials, routes);
})();