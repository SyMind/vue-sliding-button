import Vue from 'vue'
import App from './App.vue'
import BetterSlider from '../../src/index.js'

Vue.config.productionTip = false

Vue.use(BetterSlider)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
