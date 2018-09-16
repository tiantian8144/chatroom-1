import Vue from 'vue';
import App from './App.vue';

import './assets/global.scss';

Vue.config.productionTip = false;
Vue.prototype.bus = new Vue();

new Vue({
  render: h => h(App)
}).$mount('#app');


