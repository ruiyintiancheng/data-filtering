/*
 * @Author: lk 
 * @Date: 2018-08-11 11:43:38
 * @Last Modified by: wk
 * @Last Modified time: 2020-05-21 10:30:11
 * @Description:  登录页面
 */
<template>
  <div class="login-container">
    <el-form class="login-form"
             autoComplete="on"
             :model="loginForm"
             :rules="loginRules"
             ref="loginForm"
             label-position="left">
      <div class="title-container clearfix">
        <span class="logo"
              href="javascript:;"
              :style="{backgroundImage:'url('+logo+')'}"></span>
        <h3 class="title">锐银天成EAST系统</h3>
        <!-- <lang-select class="set-language"></lang-select> -->
      </div>
      <el-form-item prop="username">
        <span class="svg-container svg-container_login">
          <svg-icon icon-class="user" />
        </span>
        <el-input name="username"
                  type="text"
                  v-model="loginForm.username"
                  placeholder="请输入用户名"
                  clearable />
      </el-form-item>

      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input name="password"
                  :type="passwordType"
                  @keyup.enter.native="handleLogin"
                  v-model="loginForm.password"
                  autoComplete="on"
                  placeholder="请输入密码"
                  clearable />
        <span class="show-pwd"
              @click="showPwd">
          <svg-icon icon-class="eye" />
        </span>
      </el-form-item>
      <el-form-item prop="captcha"
                    class="captcha"
                    v-if="verifyCode">
        <span class="svg-container">
          <svg-icon icon-class="captcha" />
        </span>
        <el-input name="captcha"
                  placeholder="请输入验证码"
                  clearable
                  v-model="loginForm.captcha"
                  @keyup.enter.native="handleLogin" />
        <a><img height="50"
               width="100"
               :src="verifyCode"
               @click="handleCaptcha" /></a>
      </el-form-item>
      <el-checkbox v-model="loginForm.freeLogin"
                   style="margin-bottom:20px;">记住我</el-checkbox>

      <el-button type="primary"
                 style="width:100%;margin-bottom:30px;"
                 :loading="loading"
                 @click.native.prevent="handleLogin">登录</el-button>

      <!-- <div class="tips">
        <span>{{$t('login.username')}} : admin</span>
        <span>{{$t('login.password')}} : {{$t('login.any')}}</span>
      </div>
      <div class="tips">
        <span style="margin-right:18px;">{{$t('login.username')}} : editor</span>
        <span>{{$t('login.password')}} : {{$t('login.any')}}</span>
      </div>

      <el-button class="thirdparty-button" type="primary" @click="showDialog=true">{{$t('login.thirdparty')}}</el-button> -->
    </el-form>

    <!-- <el-dialog :title="$t('login.thirdparty')" :visible.sync="showDialog" append-to-body>
      {{$t('login.thirdpartyTips')}}
      <br/>
      <br/>
      <br/>
      <social-sign />
    </el-dialog> -->

  </div>
</template>

<script>
// import { isvalidUsername } from '@/utils/validate'
import { baseRequest } from '@/api/base'
import SocialSign from './socialsignin'
import logo from '@/assets/logo/logo4.png'
import { encrypt } from '@/utils/encryption'
import { getToken } from '@/utils/auth'
const errorMsg = {
  password: '',
  captcha: ''
}
export default {
  components: { SocialSign },
  name: 'login',
  created() {
    if (getToken()) {
      this.$router.push('/')
    }
  },
  data() {
    return {
      logo,
      verifyCode: '',
      verifyRandom: '',
      loginForm: {
        username: '',
        password: '',
        captcha: '',
        freeLogin: true
      },
      loginRules:
      { username: [{ required: true, message: '用户名不能为空' }],
        password: [{ required: true, message: '密码不能为空' },
          {
            validator: (rule, value, callback) => {
              if (errorMsg.password) {
                callback(new Error(errorMsg.password))
              } else {
                callback()
              }
            }
          }],
        captcha: [{ required: true, message: '验证码不能为空' },
          {
            validator: (rule, value, callback) => {
              if (errorMsg.captcha) {
                callback(new Error(errorMsg.captcha))
              } else {
                callback()
              }
            }
          }]
      },
      passwordType: 'password',
      loading: false,
      showDialog: false
    }
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
    },
    // 点击切换验证码
    handleCaptcha() {
      baseRequest('/basic/login/getVerifyCode', { date: new Date().getTime() }).then((response) => {
        this.verifyCode = 'data:image/png;base64,' + response.data.item.verifyCode
        this.verifyRandom = response.data.item.verifyRandom
      })
    },
    // 点击登录
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          // 加密：要测试的明文数据
          encrypt(this.loginForm.password).then(password => {
            const username = this.loginForm.username.trim()
            baseRequest('/basic/login/login', { loginName: username, loginPasswd: password, captcha: this.loginForm.captcha, verifyRandom: this.verifyRandom, freeLogin: this.loginForm.freeLogin ? '1' : '0' }).then(response => {
              if (response.code === 2) {
                const validateMsg = response.data.validateMsg
                if (validateMsg.hasOwnProperty('loginPasswd')) {
                  errorMsg.password = validateMsg.loginPasswd
                  this.$refs.loginForm.validateField('password')
                  errorMsg['password'] = ''
                  console.log('密码错误')
                }
                if (validateMsg.hasOwnProperty('verifyCode')) {
                  this.verifyCode = 'data:image/png;base64,' + validateMsg.verifyCode
                  this.verifyRandom = validateMsg.verifyRandom
                  console.log('验证码错误')
                  this.$nextTick(function() {
                    errorMsg.captcha = validateMsg.captcha
                    this.$refs.loginForm.validateField('captcha')
                    errorMsg['captcha'] = ''
                  })
                }
                this.loading = false
                return
              }
              this.$store.dispatch('LoginByUsername', response.data.item.token).then(() => {
                // this.loading = false
                this.$router.push({ path: '/' })
              }).catch(() => {
                this.loading = false
              })
            }).catch(_ => {
              this.loading = false
            })
          })
        } else {
          // alert('error submit!!')
          return false
        }
      })
    },
    afterQRScan() {
      // const hash = window.location.hash.slice(1)
      // const hashObj = getQueryObject(hash)
      // const originUrl = window.location.origin
      // history.replaceState({}, '', originUrl)
      // const codeMap = {
      //   wechat: 'code',
      //   tencent: 'code'
      // }
      // const codeName = hashObj[codeMap[this.auth_type]]
      // if (!codeName) {
      //   alert('第三方登录失败')
      // } else {
      //   this.$store.dispatch('LoginByThirdparty', codeName).then(() => {
      //     this.$router.push({ path: '/' })
      //   })
      // }
    }
  },
  destroyed() {
    // window.removeEventListener('hashchange', this.afterQRScan)
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
$bg: #2d3a4b;
$inputBg: #283443;
$light_gray: #eee;

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      &:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px $inputBg inset !important;
        box-shadow: 0 0 0px 1000px $inputBg inset !important;
        -webkit-text-fill-color: #fff !important;
      }
    }
  }
  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: $inputBg;
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style rel="stylesheet/scss" lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;
.login-container {
  position: fixed;
  height: 100%;
  width: 100%;
  background-color: $bg;
  .login-form {
    position: absolute;
    left: 0;
    right: 0;
    width: 520px;
    padding: 35px 35px 15px 35px;
    margin: 120px auto;
    .captcha {
      .el-input {
        width: 69%;
      }
      a {
        display: block;
        float: right;
        img {
          display: block;
        }
      }
    }
  }
  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }
  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
    &_login {
      font-size: 20px;
    }
  }
  .title-container {
    position: relative;
    .logo {
      float: left;
      width: 45.2px;
      height: 45.2px;
      background-repeat: no-repeat;
      background-position: -125px 0;
      background-size: 180.4px 45.2px;
      font-size: 0;
      margin-left: 80px;
      margin-bottom: 40px;
    }
    .title {
      font-size: 26px;
      font-weight: 400;
      color: $light_gray;
      margin: 0;
      text-align: center;
      font-weight: bold;
      line-height: 49.2px;
      float: left;
      margin-left: 5px;
    }
    .set-language {
      color: #fff;
      position: absolute;
      top: 5px;
      right: 0px;
    }
  }
  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
  .thirdparty-button {
    position: absolute;
    right: 35px;
    bottom: 28px;
  }
}
</style>
