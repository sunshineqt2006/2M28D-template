import request from '@/utils/request'
import util from '@/utils/util'

/**
 * 账号登录，并且获取授权码
 * @param {String} username
 * @param {String} password
 * @returns
 */
export function loginAdminUser(params) {
  const data = { ...params }
  data.password = util.md5(data.password)
  return request({
    url: '/Authorize/SignIn',
    method: 'post',
    data
  })
}

export function getAdminsInfo() {
  return request({
    url: '/Authorize/Profiles',
    method: 'post'
  })
}

/**
 * 获取验证码
 */
export function getCode() {
  return request({
    url: '/Authorize/ValidateCode',
    method: 'post'
  })
}
