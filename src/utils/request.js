import axios from 'axios'
import util from '@/utils/util'
import store from '@/store/index'
import { Message, MessageBox } from 'element-ui'

// 创建一个错误
function errorCreate(msg) {
  const err = new Error(msg)
  errorLog(err)
}

// 记录和显示错误
function errorLog(err) {
  // 显示提示
  Message({
    message: err.message,
    type: 'error',
    duration: 5 * 1000
  })

  // 添加到日志
  store.dispatch('istrong/log/push', {
    type: 'error',
    info: '数据请求异常',
    message: err.message
  })
    .then(() => {
    })

  // 打印到控制台
  if (process.env.NODE_ENV === 'development') {
    util.log.danger('>>>>>> Error >>>>>>')
    console.log(err)
  }
}

// 创建一个axios实例
const service = axios.create({
  // api的base_url
  baseURL: process.env.VUE_APP_BASE_API,
  // request timeout
  timeout: 30000,
  // 使用简单请求,复杂请求(多一次OPTIONS请求)可用 application/json
  headers: { 'Content-Type': 'text/plain; charset=utf-8' }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    setDefaultParams(config)
    return config
  }, err => {
    errorLog(err)
    return Promise.resolve(err)
  }
)

// 响应拦截器
service.interceptors.response.use(response => {
  const result = response.data

  if (result.State === '200' || response.config.responseType === 'blob') {
    return result.Data
  } else {
    result.State === '401' ? reAuthorize() : errorCreate(result.Msg)
    return Promise.reject(result.Msg ? result.Msg : '未知错误')
  }
}, error => {
  if (error.response) {
    error.message = error.response.data.message
    if (error.response.State === 401) {
      reAuthorize()
    }
  }

  errorLog(error)
  return Promise.reject(error.response ? error.response.data : error)
}
)

// 重新授权确认
function reAuthorize() {
  MessageBox.confirm('您的授权已过期或在其他地方登录，是否重新登录？', '授权过期', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      util.cookies.remove('token')
      util.cookies.remove('uuid')
      location.reload()
    })
    .catch(() => {
    })
}

// 防止接口缓存问题
function buildTimeStapURL(url) {
  const timestamp = new Date().getTime()
  return url + (url.indexOf('?') > 0 ? '&timestamp=' : '?t=') + timestamp
}

// 添加默认参数及签名
function setDefaultParams(config) {
  config.url = buildTimeStapURL(config.url)
  const token = util.cookies.get('token')
  if (!token || token === 'undefined') {
    return
  }

  config.headers.Authorization = token
}

export default service
