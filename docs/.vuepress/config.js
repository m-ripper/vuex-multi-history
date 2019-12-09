const apiSideBar = require('./api-sidebar.json');

const correctApiSideBar = apiSideBar.map((entry) => {
  if (!entry.children) {
    return entry;
  }
  const correctedChildren = entry.children.map((child) => {
    return `/api/${child}`;
  });
  return { ...entry, children: correctedChildren };
});

const usedSidebar = process.env.NODE_ENV === 'production' ? apiSideBar : correctApiSideBar;
const base = process.env.NODE_ENV === 'production' ? '/vuex-multi-history/' : '/';

module.exports = {
  title: 'vuex-multi-history',
  description: 'A Vuex-plugin to allow undo, redo, etc for multiple histories',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'Example', link: 'https://veake.github.io/vuex-multi-history/example' },
      { text: 'Github', link: 'https://github.com/veake/vuex-multi-history' },
    ],
    sidebar: [
      '/',
      '/guide/',
      {
        title: 'API',
        children: ['/api/', ...usedSidebar],
        sidebarDepth: 1,
      },
    ],
    sidebarDepth: 2,
  },
};
