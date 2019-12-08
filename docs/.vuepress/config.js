module.exports = {
  title: 'vuex-multi-history',
  description: 'A Vuex-plugin to allow undo, redo, etc for multiple histories',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'Github', link: 'https://github.com/veake/vuex-multi-history' },
    ],
    sidebar: [
      '/',
      '/getting-started/',
      {
        title: 'Guide',
        collapsable: false,
        children: ['/guide/', '/guide/options/', '/guide/usage/'],
        sidebarDepth: 2,
      },
    ],
  },
};
