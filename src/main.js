import Vue from 'vue'
import App from './App.vue'
import VModal from 'vue-js-modal'
import BootstrapVue from 'bootstrap-vue'
import Autocomplete from '@trevoreyre/autocomplete-vue'
import '@trevoreyre/autocomplete-vue/dist/style.css'
import firebase from 'firebase'

import {firebaseConfig} from './firebaseconfig'
import 'bootstrap/dist/css/bootstrap.css'

import 'bootstrap-vue/dist/bootstrap-vue.css'
//vuex
import {store} from "./store/store";

Vue.use(Autocomplete);
Vue.use(VModal);
Vue.use(BootstrapVue);

Vue.config.productionTip = false;

new Vue({
    created() {
        firebase.initializeApp(firebaseConfig)
    },
    store,
    render: h => h(App),
}).$mount('#app');