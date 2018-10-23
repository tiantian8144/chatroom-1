import Vue from 'vue';
import App from './App.vue';
import AlloyFinger from 'alloyfinger';
import AlloyFingerPlugin from 'alloyfinger/vue/alloy_finger.vue.js';

import './assets/global.scss';
import checkIsMobile from './assets/isMobile';

Vue.config.productionTip = false;
Vue.prototype.isMobile = checkIsMobile(navigator.userAgent);
Vue.prototype.isMobile && Vue.use(AlloyFingerPlugin, { AlloyFinger });
Vue.prototype.bus = new Vue();

new Vue({ render: h => h(App) }).$mount('#app');


