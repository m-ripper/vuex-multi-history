module.exports = {
  publicPath: '/vuex-multi-history/example/',
  chainWebpack: (config) => {
    config.resolve.symlinks(false);
  },
};
