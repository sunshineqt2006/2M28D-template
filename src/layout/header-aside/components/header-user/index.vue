<template>
  <el-dropdown class="cs-mr" :show-timeout="50">
    <span class="btn-text">
      <el-badge
        :hidden="!unreadMessage"
        :value="unreadMessage"
        :max="99"
      >{{info.name ? `您好 ${info.name}` : '未登录'}}</el-badge>
    </span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item @click.native="$open('/')" icon="el-icon-link">打开前台</el-dropdown-item>
      <el-dropdown-item v-if="auth.cache" @click.native="clearCache" icon="el-icon-delete">清空缓存</el-dropdown-item>
      <el-dropdown-item
        v-if="auth.optimize"
        @click.native="systemOptimize"
        icon="el-icon-finished"
      >优化缓存</el-dropdown-item>
      <el-dropdown-item divided @click.native="handleCreate" icon="el-icon-key">修改密码</el-dropdown-item>
      <el-dropdown-item v-if="auth.unread" @click.native="handleMessage" icon="el-icon-bell">
        <span>未读消息</span>
        <el-badge :hidden="!unreadMessage" :value="unreadMessage" :max="99" />
      </el-dropdown-item>
      <el-dropdown-item divided @click.native="logOff" icon="el-icon-switch-button">退出账号</el-dropdown-item>
    </el-dropdown-menu>

    <el-dialog
      title="修改密码"
      width="600px"
      :visible.sync="dialogVisible"
      :append-to-body="true"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="dataForm" label-width="80px">
        <el-form-item label="原始密码" prop="passwordOld">
          <el-input
            v-model="form.passwordOld"
            @keyup.enter.native="setPassword()"
            type="password"
            placeholder="原始密码"
            :clearable="true"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input
            v-model="form.password"
            @keyup.enter.native="setPassword()"
            type="password"
            placeholder="新密码"
            :clearable="true"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="passwordConfirm">
          <el-input
            v-model="form.passwordConfirm"
            @keyup.enter.native="setPassword()"
            type="password"
            placeholder="确认密码"
            :clearable="true"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="dialogVisible = false" size="small">取消</el-button>

        <el-button
          type="primary"
          :loading="dialogLoading"
          @click.native="setPassword"
          size="small"
        >确定</el-button>
      </div>
    </el-dialog>
  </el-dropdown>
</template>

<script>
import semver from 'semver'
import { mapState, mapActions } from 'vuex'
import { setAdminPassword } from '@/api/user/admin'

export default {
  data() {
    return {
      timer: null,
      dialogVisible: false,
      dialogLoading: false,
      form: {
        password: '',
        passwordConfirm: '',
        passwordOld: ''
      },
      auth: {
        cache: false,
        optimize: false,
        unread: false
      },
      rules: {
        password: [
          {
            required: true,
            message: '新密码不能为空',
            trigger: 'blur'
          },
          {
            min: 6,
            message: '长度不能少于 6 个字符',
            trigger: 'blur'
          }
        ],
        passwordConfirm: [
          {
            required: true,
            message: '确认密码不能为空',
            trigger: 'blur'
          },
          {
            min: 6,
            message: '长度不能少于 6 个字符',
            trigger: 'blur'
          }
        ],
        passwordOld: [
          {
            required: true,
            message: '原始密码不能为空',
            trigger: 'blur'
          },
          {
            min: 6,
            message: '长度不能少于 6 个字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {
    ...mapState('istrong/user', [
      'info',
      'unreadMessage'
    ])
  },
  mounted() {
    this._validationAuth()
    this.checkUpdate()
    // this.getMessageUnread()
    // this.timer = setInterval(this.getMessageUnread, 1000 * 60 * 5)
  },
  methods: {
    ...mapActions('istrong/account', [
      'logout'
    ]),
    /**
     * 权限检测
     */
    _validationAuth() {
      this.auth.cache = this.$permission('/index/help/cache')
      this.auth.optimize = this.$permission('/index/help/optimize')
      this.auth.unread = this.$permission('/system/message/unread')
    },
    /**
     * 检测版本更新
     */
    checkUpdate() {
      let host = process.env.VUE_APP_BASE_API
      if (process.env.NODE_ENV !== 'development') {
        host = 'https://api.istrong.cn/api'
      }

      this.$axios({
        /**
         * 版本更新检查使用远程官方接口,便于版本号统一
         * 如二次开发有所需求,可修改 host 参数
         */
        url: host + '/v1/app_install',
        method: 'post',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        params: {
          method: 'query.app.install.updated'
        },
        data: {
          user_agent: 'vue',
          ver: process.env.VUE_APP_VERSION
        }
      })
        .then(res => {
          const data = res.data || {}
          if (!data.is_updated) {
            return
          }

          if (semver.lt(process.env.VUE_APP_VERSION, data.ver)) {
            const h = this.$createElement
            this.$notify.info({
              title: '版本更新',
              message: h('p', { 'class': 'cs-cp' }, `发现最新版本号： ${data.ver}，点击查看。`),
              position: 'bottom-right',
              duration: 0,
              onClick: () => { this.$open(data.url) }
            })

            this.$log.capsule('istrong Admin', `New version ${data.ver}`)
            console.log(`版本号: ${data.ver} | 详情 ${data.url}`)
          }
        })
        .catch(err => {
          console.log('checkUpdate error', err)
        })
    },
    /**
     * @description 登出
     */
    logOff() {
      this.logout({
        vm: this,
        confirm: true
      })
    },
    /**
     * 最优设置
     */
    systemOptimize() {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
        .then(() => {
          this.$message.success('已调至最优状态')
        })
        .finally(() => {
          loading.close()
        })
    },
    /**
     * 初始化成员变量
     */
    resetTemp() {
      this.dialogLoading = false
      this.form = { password: '', passwordConfirm: '', passwordOld: '' }
    },
    /**
     * 创建修改密码对话框
     */
    handleCreate() {
      this.resetTemp()
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },
    /**
     * 修改密码
     */
    setPassword() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          this.dialogLoading = true
          const request = {
            client_id: this.info.admin.admin_id,
            password_old: this.form.passwordOld,
            password: this.form.password,
            password_confirm: this.form.passwordConfirm
          }

          setAdminPassword({ ...request })
            .then(() => {
              this.dialogVisible = false
              this.$message.success('密码修改成功')
            })
            .catch(() => {
              this.dialogLoading = false
            })
        }
      })
    },
    /**
     * 打开未读消息
     */
    handleMessage() {
      this.$router.push({ name: 'system-message-user' })
        .catch(() => {
        })
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>
