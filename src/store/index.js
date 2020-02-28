import Vue from 'vue'
import Vuex from 'vuex'

import istrong from './modules/istrong'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    istrong
  }
})
