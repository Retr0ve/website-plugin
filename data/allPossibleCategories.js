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