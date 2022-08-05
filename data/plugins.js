async function fetchPluginData() {
  let plugins = [];
  const mirrors = [
    'https://raw.githubusercontent.com/joplin/plugins/master/manifests.json',
    'https://raw.staticdn.net/joplin/plugins/master/manifests.json',
    'https://raw.fastgit.org/joplin/plugins/master/manifests.json'
  ]
  for (let index = 0; index < mirrors.length; index++) {
    try {
      plugins =  await fetch(mirrors[index]).then(res => res.json());
    } catch (error) {
      continue;
    }
  }
  return plugins;
}

async function fetchStatsData(){
  let stats;
  const mirrors = [
    'https://raw.githubusercontent.com/joplin/plugins/master/stats.json',
    'https://raw.staticdn.net/joplin/plugins/master/stats.json',
    'https://raw.fastgit.org/joplin/plugins/master/stats.json'
  ]
  for (let index = 0; index < mirrors.length; index++) {
    try {
      stats =  await fetch(mirrors[index]).then(res => res.json());
    } catch (error) {
      continue;
    }
  }
  return stats;
}

async function getTrendingPlugins(plugins, topn){
  const period = 'last-week';

  let result = [];
  for (const pluginId in plugins) {
    const package = plugins[pluginId]._npm_package_name;
    const downloadStat = await fetch(`https://api.npmjs.org/downloads/point/${period}/${package}`).then(res => res.json());
    console.log(package, downloadStat.downloads);
    result.push({
      id: pluginId,
      downloadCount: downloadStat.downloads
    });
  }

  return result.sort((a, b) => b.downloadCount - a.downloadCount).slice(0, topn).map((item) => {
    return {
      id: item.id,
      downloadCount: item.downloadCount,
      ...plugins[item.id],
    }
  });
}

module.exports = async function() {
  const rawPluginsData = await fetchPluginData();
  const rawStats = await fetchStatsData();
  const allPlugins = Object.values(rawPluginsData);
  const plugins = {
    raw: {
      plugins: rawPluginsData,
      stats: rawStats
    },
    all: allPlugins,
    recommended: allPlugins.filter(plugin => plugin._recommended),
    trending: await getTrendingPlugins(rawPluginsData, 3),
  };
  return plugins;
};