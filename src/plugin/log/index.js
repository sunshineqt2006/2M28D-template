import store from '@/store'
import util from '@/utils/util'

export default {
  install(Vue, options) {
    // 快速打印 log
    Vue.prototype.$log = {
      ...util.log,
      push(data) {
        if (typeof data === 'string') {
          // 如果传递来的数据是字符串
          // 赋值给 message 字段
          // 为了方便使用
          // eg: this.$log.push('foo text')
          store.dispatch('istrong/log/push', {
            message: data
          })
        } else if (typeof data === 'object') {
          // 如果传递来的数据是对象
          store.dispatch('istrong/log/push', data)
        }
      }
    }
  }
}
