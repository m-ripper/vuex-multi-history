import '@/style/theme.scss';
import ElementUI from 'element-ui';
import locale from 'element-ui/lib/locale/lang/en';
import 'element-ui/lib/theme-chalk/index.css';
import Vue from 'vue';

Vue.use(ElementUI, {
  locale,
  size: 'small',
});
