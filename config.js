const config = {
  mode: 'dev',
  dev: {
    rootDir: './',
    distDir: './site',
    site: ''
  },
  demo: {
    rootDir: './',
    distDir: './site',
    site: 'website-plugin'
  },
  prod: {
    rootDir: './',
    distDir: './site',
    site: ''
  },
}
module.exports = () => {
  return config[config.mode];
}