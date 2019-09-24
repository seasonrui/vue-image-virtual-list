import Vue from 'vue'
import Index from './index.vue'

Vue.config.productionTip = false;
import imageVirtualList from '../../src/index';

Vue.use(imageVirtualList);

new Vue({
  render: h => h(Index),
}).$mount('#app');
