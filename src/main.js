import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import Vuex from 'vuex'
import {store} from './store'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.config.productionTip = false;
Vue.use(VueAxios, axios);
Vue.use(Vuex);
Vue.use(BootstrapVue);

new Vue({
  store,
  render: h => h(App),
}).$mount('#app');
