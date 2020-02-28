import util from '@/utils/util'
import { getMenuAuthList } from '@/api/auth/menu'
import { loginAdminUser, getAdminsInfo } from '@/api/user/admin'
import menuJson from '@/menu/menu.json'

export default {
  namespaced: true,
  actions: {
    adminInfo() {
      return getAdminsInfo().then(res => {
        return res
      })
    },
    /**
     * @description 登录
     * @param {Object} payload dispatch
     * @param {Object} payload userName {String} 用户账号
     * @param {Object} payload password {String} 密码
     */
    login({ dispatch }, { userName, password, code }) {
      return new Promise((resolve, reject) => {
        loginAdminUser({ userName, password, code }).then(async ({ Token }) => {
          util.cookies.set('token', Token)
          const userInfo = await dispatch('adminInfo')
          util.cookies.set('uuid', userInfo.UserName)
          dispatch('istrong/user/set', {
            name: userInfo.UserName,
            industry: userInfo.Industry,
            token: Token
          }, { root: true })

          // 请求get.menu.list,并且由下个then处理
          return getMenuAuthList(null)
        }).then(menu => {
          dispatch('istrong/db/set', {
            dbName: 'database',
            path: '$menu.sourceData',
            value: menuJson.data, // menu.data,
            user: true
          }, { root: true })
          resolve()
        }).catch(err => {
          util.cookies.remove('token')
          util.cookies.remove('uuid')
          reject(err)
        })
      })
    },
    /**
     * @description 注销用户并返回登录页面
     * @param {Object} payload dispatch
     * @param {Object} payload vm {Object} vue 实例
     * @param {Object} payload confirm {Boolean} 是否需要确认
     */
    logout({ dispatch, commit }, { vm, confirm = false }) {
      // 实际注销操作
      function logout() {
        // 删除info
        dispatch('istrong/user/set', {}, { root: true })

        // 删除cookie
        util.cookies.remove('token')
        util.cookies.remove('uuid')

        // 跳转路由并重新载入vue
        vm.$router.push({ name: 'index' }).catch(() => { })
        location.reload()
      }

      if (!confirm) {
        logout()
        return
      }

      commit('istrong/gray/set', true, { root: true })
      vm.$confirm('确定要执行注销操作吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      })
        .then(() => {
          commit('istrong/gray/set', false, { root: true })
          vm.$loading({
            lock: true,
            text: 'Loading',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })

          logout()
        })
        .catch(() => {
          commit('istrong/gray/set', false, { root: true })
        })
    },
    /**
     * @description 用户登录后从持久化数据加载一系列的设置
     * @param {Object} context
     */
    load({ dispatch }) {
      return new Promise(async resolve => {
        // DB -> store 加载用户数据
        await dispatch('istrong/user/load', null, { root: true })
        // DB -> store 加载主题
        await dispatch('istrong/theme/load', null, { root: true })
        // DB -> store 加载页面过渡效果设置
        await dispatch('istrong/transition/load', null, { root: true })
        // DB -> store 持久化数据加载上次退出时的多页列表
        await dispatch('istrong/page/openedLoad', null, { root: true })
        // DB -> store 持久化数据加载侧边栏折叠状态
        await dispatch('istrong/menu/asideCollapseLoad', null, { root: true })
        // DB -> store 持久化数据加载全局尺寸
        await dispatch('istrong/size/load', null, { root: true })
        // DB -> store 持久化数据读取菜单源数据
        await dispatch('istrong/menu/sourceDataLoad', null, { root: true })
        // end
        resolve()
      })
    }
  }
}
