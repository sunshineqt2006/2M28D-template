<template>
  <el-form
    class="login-form"
    status-icon
    :rules="loginRules"
    ref="loginForm"
    :model="loginForm"
    label-width="0"
    size="default"
  >
    <el-form-item prop="userName">
      <el-input
        size="small"
        @keyup.enter.native="handleLogin()"
        v-model="loginForm.userName"
        auto-complete="off"
        placeholder="请输入账号"
      >
        <i slot="prefix" class="el-icon-user" />
      </el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input
        size="small"
        @keyup.enter.native="handleLogin()"
        :type="passwordType"
        v-model="loginForm.password"
        auto-complete="off"
        placeholder="请输入密码"
      >
        <i class="el-icon-view el-input__icon" slot="suffix" @click="showPassword" />
        <i slot="prefix" class="el-icon-key" />
      </el-input>
    </el-form-item>
    <el-form-item prop="code">
      <el-row :span="34">
        <el-col :span="14">
          <el-input
            ref="code"
            size="small"
            @keyup.enter.native="handleLogin()"
            :maxlength="code.len"
            v-model="loginForm.code"
            auto-complete="off"
            placeholder="请输入验证码"
          >
            <i slot="prefix" class="el-icon-mobile" />
          </el-input>
        </el-col>
        <el-col :span="10">
          <div class="login-code">
            <img :src="code" class="login-code-img" @click="refreshCode" alt />
          </div>
        </el-col>
      </el-row>
    </el-form-item>
    <el-checkbox v-model="checked">记住账号</el-checkbox>
    <el-form-item>
      <el-button
        type="primary"
        size="small"
        :loading="loading"
        @click.native.prevent="handleLogin"
        class="login-submit"
      >登 录</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapActions } from 'vuex'
import { getCode } from '@/api/user/admin'

export default {
  name: 'loginbox',
  data() {
    return {
      loginForm: {
        userName: 'xieli',
        password: '123456',
        code: ''
      },
      checked: false,
      code: '',
      loginRules: {
        userName: [
          { required: true, message: '请输入账号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度最少为6位', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 4, max: 4, message: '验证码长度为4位', trigger: 'blur' }
        ]
      },
      passwordType: 'password',
      loading: false
    }
  },
  created() {
    this.refreshCode()
  },
  methods: {
    ...mapActions('istrong/account', [
      'login'
    ]),
    /**
     * @description 创建随机验证码
     */
    refreshCode() {
      getCode().then(({ ImgUrl }) => {
        this.code = `${this.$baseApiUrl}${ImgUrl}`
        this.loginForm.code = ''
        this.$refs.code.focus()
      })
    },
    /**
     * @description 是否显示实际密码
     */
    showPassword() {
      this.passwordType === '' ? (this.passwordType = 'password') : (this.passwordType = '')
    },
    /**
     * @description 正式登录
     */
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          // 登录,暂时没有对验证码进行处理
          this.loading = true
          this.login(this.loginForm).then(() => {
            this.$store.dispatch('istrong/account/load')
            this.$router.replace(this.$route.query.redirect || '/')
          }).catch(() => {
            this.refreshCode()
            this.loading = false
          })
        }
      })
    }
  }
}
</script>
