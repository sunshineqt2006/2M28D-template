import util from '@/utils/util'

export default {
  namespaced: true,
  mutations: {
    /**
     * @description 显示版本信息
     */
    versionShow() {
      util.log.capsule('istrong Admin', `${process.env.VUE_APP_VERSION}`)
      console.log('Web https://www.istrong.cn/')
      console.log('Doc https://doc.istrong.cn/')
    }
  }
}
