const fs = require("fs-extra");
const generateHTMLs = require("./utils/generateHTMLs.js");
const config = require("./config.js");
const pluginsData = require("./data/plugins.js");

function clearBuildPath(buildPath){
  try {
    fs.rmSync(buildPath, { recursive: true });
  } catch (err) {
    console.log(err);
  }
}

function copyStaticFiles(buildPath){
  try {
    fs.copySync("./assets", buildPath);
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

(async function() {
  clearBuildPath(config.distDir);
  copyStaticFiles(config.distDir);
  // Copy plugins data to build path
  copyData(config.distDir, await pluginsData());
  generateHTMLs();
})();