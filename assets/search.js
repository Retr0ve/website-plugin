const plugins = await fetch("./plugins.json").then(res => res.json());
// document.getElementById('main').innerHTML = JSON.stringify(plugins);
console.log(plugins);