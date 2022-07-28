async function fetchPluginData() {
  // const plugins =  await fetch('https://raw.githubusercontent.com/joplin/plugins/master/manifests.json').then(res => res.json());

  // const plugins =  await fetch('https://raw.staticdn.net/joplin/plugins/master/manifests.json').then(res => res.json());
  const plugins =  await fetch('https://raw.fastgit.org/joplin/plugins/master/manifests.json').then(res => res.json());

  
  return plugins;
}

module.exports = async function() {
  const allPossibleCategoriesRaw = ['Appearance', 'Developer Tools', 'Productivity', 'Themes', 'Integrations', 'Viewer', 'Search', 'Tags', 'Editor', 'Files', 'Personal Knowledge Management'];
  const plugins = Object.values(await fetchPluginData());
  const allPossibleCategories = allPossibleCategoriesRaw.map(category => {
    return {
      name: category.toLowerCase().replace(/[ ]/g, '-' ),
      displayName: category,
      plugins: plugins.filter(plugin => plugin.categories && plugin.categories.includes(category.toLowerCase()))
    };
  })
  return allPossibleCategories;
};