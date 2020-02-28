import store from '@/store'

export default {
  install(Vue, options) {
    Vue.prototype.$permission = (path) => {
      const auth = store.state.istrong.menu.sourceData
      if (!path || !Array.isArray(auth)) {
        return false
      }

      const index = auth.findIndex(item => item.url === path)
      return index !== -1
    }
  }
}
