module.exports = {
  publicPath: '/example/',
  chainWebpack: (config) => {
    config.resolve.symlinks(false);
  },
};
