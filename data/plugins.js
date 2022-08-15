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

async function getData() {
  const rawPluginsData = await fetchPluginData();
  const rawStats = await fetchStatsData();
  const plugins = Object.values(rawPluginsData).map((plugin) => {
    return {
      domId: convertToDomId(plugin.id),
      ...rawStats[plugin.id][plugin.version],
      ...plugin
    }
  });
  return {
    rawPluginsData,
    rawStats,
    plugins
  }
}

function convertToDomId(id) {
  return id.toLowerCase().replace(/[.]/g, '-' )
}

async function getTrendingPlugins(plugins, topn){
  const period = 'last-week';

  let result = [];
  for (const pluginId in plugins) {
    const package = plugins[pluginId]._npm_package_name;
    const downloadStat = await fetch(`https://api.npmjs.org/downloads/point/${period}/${package}`).then(res => res.json());
    console.log(`Fetching ${package} downloads in ${period}: ${downloadStat.downloads}`);
    result.push({
      id: pluginId,
      downloadCount: downloadStat.downloads
    });
  }

  return result.sort((a, b) => b.downloadCount - a.downloadCount).slice(0, topn).map((item) => {
    return {
      domId: convertToDomId(item.id),
      ...plugins[item.id],
    }
  });
}

module.exports = async function() {
  const data = await getData();
  const plugins = {
    raw: {
      plugins: data.rawPluginsData,
      stats: data.rawStats
    },
    all: data.plugins,
    recommended: data.plugins.filter(plugin => plugin._recommended),
    trending: await getTrendingPlugins(data.rawPluginsData, 3),
  };
  return plugins;
};