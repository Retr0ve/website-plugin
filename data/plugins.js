async function fetchPluginData() {
  // const plugins =  await fetch('https://raw.githubusercontent.com/joplin/plugins/master/manifests.json').then(res => res.json());
  // const plugins =  await fetch('https://raw.staticdn.net/joplin/plugins/master/manifests.json').then(res => res.json());
  const plugins =  await fetch('https://raw.fastgit.org/joplin/plugins/master/manifests.json').then(res => res.json());

  return plugins;
}

async function fetchStatsData(){
  // const stats = await fetch('https://raw.githubusercontent.com/joplin/plugins/master/stats.json').then(res => res.json());
  // const stats = await fetch('https://raw.staticdn.net/joplin/plugins/master/stats.json').then(res => res.json());
  const stats = await fetch('https://raw.fastgit.org/joplin/plugins/master/stats.json').then(res => res.json());

  return stats;
}

async function getTrendingPlugins(plugins, stats, topn){
  let result = [];
  for (const plugin in stats) {
    if (Object.prototype.hasOwnProperty.call(stats, plugin)) {
      const versions = Object.values(stats[plugin]);
      const downloadCount = versions[versions.length - 1].downloadCount;
      const createdAt = new Date(versions[versions.length - 1].createdAt);
      const popularity = downloadCount / (Date.now() - createdAt)
      result.push({
        id: plugin,
        popularity: popularity
      });
    }
  }

  return result.sort((a, b) => b.popularity - a.popularity).slice(0, topn).map((item) => {
    return {
      id: item.id,
      popularity: item.popularity,
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
    trending: await getTrendingPlugins(rawPluginsData, await fetchStatsData(), 3),
  };
  return plugins;
};