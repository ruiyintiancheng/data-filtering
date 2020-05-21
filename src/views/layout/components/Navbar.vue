/*
 * @Author: lk 
 * @Date: 2018-09-21 14:54:24 
 * @Last Modified by: wk
 * @Last Modified time: 2020-05-21 10:29:23
 * @Description:  
 */
<template>
  <div class="navbar no-text-select"
       :style="{ backgroundColor: bgColor}">
    <div class="logo">
      <h1><a href="javascript:;"
           :style="{backgroundImage:'url('+logo+')'}">锐银天成EAST系统</a></h1>
    </div>
    <h1 class="name">锐银天成EAST系统</h1>
    <div class="right-menu">
      <el-menu class="top-menu"
               mode="horizontal"
               :show-timeout="200"
               :default-active="$route.path"
               :background-color="bgColor"
               text-color="#bfcbd9"
               active-text-color="#409EFF">

        <template v-for="item in permission_top_routers">

          <el-menu-item class="top-title"
                        v-if="!item.children || item.children.length === 0"
                        style="float:left;"
                        :index="'/'+item.name"
                        :key="item.name"
                        @click="linkTo('',item.path,item.name,item.meta.title)">
            <svg-icon v-if="item.meta&&item.meta.icon"
                      :icon-class="item.meta.icon"></svg-icon>
            <span v-if="item.meta&&item.meta.title">{{item.meta.title}}</span>
          </el-menu-item>

          <el-submenu class="top-title"
                      style="float:left;"
                      v-else
                      :index="item.name||item.path"
                      :key="item.name">
            <template slot="title">
              <svg-icon v-if="item.meta&&item.meta.icon"
                        :icon-class="item.meta.icon"></svg-icon>
              <span v-if="item.meta&&item.meta.title"
                    slot="title">{{item.meta.title}}</span>
            </template>
            <template v-for="child in item.children">
              <template v-if="!child.hidden">
                <el-submenu v-if="child.children&&child.children.length>0"
                            :index="child.name||child.path"
                            :key="child.name">
                  <template slot="title">
                    <svg-icon v-if="child.meta&&child.meta.icon"
                              :icon-class="child.meta.icon"></svg-icon>
                    <span v-if="child.meta&&child.meta.title"
                          slot="title">{{child.meta.title}}</span>
                  </template>
                  <template v-for="child3 in child.children">
                    <el-menu-item v-if="!child3.children||child3.children.length<=0"
                                  :index="'/'+item.name+'/'+child.name+'/'+child3.name"
                                  @click="linkTo(item.path+'/'+child.path,child3.path,child3.name,child3.meta.title)"
                                  :key="child3.name">
                      <svg-icon v-if="child3.meta&&child3.meta.icon"
                                :icon-class="child3.meta.icon"></svg-icon>
                      <span v-if="child3.meta&&child3.meta.title">{{child3.meta.title}}</span>
                    </el-menu-item>
                  </template>
                </el-submenu>
                <el-menu-item v-else
                              :index="'/'+item.name+'/'+child.name"
                              @click="linkTo(item.path,child.path,child.name,child.meta.title)"
                              :key="child.name">
                  <svg-icon v-if="child.meta&&child.meta.icon"
                            :icon-class="child.meta.icon"></svg-icon>
                  <span v-if="child.meta&&child.meta.title">{{child.meta.title}}</span>
                </el-menu-item>
              </template>
            </template>
          </el-submenu>
        </template>
      </el-menu>
      <div class="right-setting">
        <ul class="clearfix">
          <li>
            <div class="user">
              <svg-icon icon-class="head" />
              <span class="user-name">{{name}}</span>
            </div>
          </li>
          <li>
            <el-tooltip effect="dark"
                        content="注销登录 "
                        placement="bottom">
              <a class="right-menu-item"
                 @click="logout">
                <svg-icon icon-class="out" /></a>
            </el-tooltip>
          </li>
        </ul>
        <div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Hamburger from '@/components/Hamburger'
import { baseRequest } from '@/api/base'
import logo from '@/assets/logo/logo4.png'
// import { openWebSocket } from '@/utils/websocket'
export default {
  data() {
    return {
      logo,
      setting: false,
      activeName: '1',
      settingNews: false,
      notifyList: [], // 右侧notify列表
      newsCount: 0 // 新闻数量红色圆点提示
    }
  },
  mounted() {
    // openWebSocket(function(result) {
    //   console.log(result)
    // })
  },
  computed: {
    ...mapGetters([
      'permission_top_routers',
      'permission_left_map',
      'sidebar',
      'avatar',
      'dispalySideBar',
      'name',
      'bgColor'
    ])
  },
  components: {
    Hamburger
  },
  methods: {
    // 打开消息
    openNotify(id) {
      baseRequest('/basic/notices/select', { noticeId: id, urlMode: '2' }).then(response => {
        const row = response.data.item
        if (row) {
          const formData = {
            notice_title: row.noticeTitle,
            summary: row.summary,
            content: row.content,
            notice_id: row.noticeId
          }
          this.$refs.newsDetail.seeView(formData)
        }
      })
    },
    // 获取未读文件数
    getNewsCount() {
      return new Promise((resolve) => {
        baseRequest('/basic/notices/notify').then(response => {
          this.newsCount = response.data.item.news_count
          resolve()
        })
      })
    },
    toggleSideBar() {
      this.$store.dispatch('toggleSideBar')
    },
    logout() {
      this.$confirm('确定注销当前登录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('LogOut').then(() => {
          location.reload()
        })
      })
    },
    hasOneShowingChildren(children) {
      const showingChildren = children.filter(item => {
        return !item.hidden
      })
      if (showingChildren.length === 1) {
        return true
      }
      return false
    },
    linkTo(purl, curl, name, title) {
      if (curl) {
        const style = {
          dispalySideBar: 'none',
          marginNavBar: '0px'
        }
        this.$store.dispatch('setPageStyle', style).then(() => {
          if (purl) {
            this.$router.push({ path: '/' + purl + '/' + curl })
          } else {
            this.$router.push({ path: '/' + curl })
          }
        }).catch(() => {
          alert('error submit!!')
        })
      } else {
        const parmObj = {
          leftRoutes: this.permission_left_map[name],
          path: purl ? '/' + purl + '/' + name : '/' + name
        }
        this.$store.dispatch('GenerateLeftRoutes', parmObj).then(() => {
          const style2 = {
            dispalySideBar: 'block',
            marginNavBar: '210px'
          }
          this.$store.dispatch('setSideTitle', title).then(() => {
          }).catch(() => {
            alert('error submit!!')
          })
          this.$store.dispatch('setPageStyle', style2).then(() => {
          }).catch(() => {
            alert('error submit!!')
          })
        }).catch(() => {
          alert('error submit!!')
        })
      }
    }
  }

}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dialog-contant-default {
  padding-top: 10px;
}
.navbar {
  // position:fixed;
  width: 100%;
  z-index: 2;
  height: 61px;
  min-width: 320px;
  // top:0;
  // padding-left:180px;
  border: 0px !important;
  border-radius: 0px !important;
  .logo {
    float: left;
    margin-top: 7.9px;
    margin-left: 36px;
    h1 {
      margin: 0;
      padding: 0;
      a {
        display: block;
        width: 58.2px;
        height: 58.2px;
        // width: 44.2px;
        // height: 44.2px;
        background-repeat: no-repeat;
        background-position: -166px 0;
        background-size: 238.4px 44.2px;
        font-size: 0;
      }
    }
  }
  .name {
    color: #fff;
    float: left;
    font-weight: 400;
    letter-spacing: 4px;
    height: 100%;
    margin: 0 0;
    margin-left: 10px;
    line-height: 64px;
    font-size: 25px;
    // background: url(@assets)
  }
  .right-menu {
    float: right;
    height: 100%;
    &:focus {
      outline: none;
    }
    .top-menu {
      float: left;
      .svg-icon {
        margin-right: 7px;
      }
    }
    .right-menu-item {
      display: inline-block;
      margin: 18px 14px 0 5px;
      svg {
        color: #bfcbd9;
        width: 1.5em !important;
        height: 1.5em !important;
      }
    }
    .theme-switch {
      vertical-align: 15px;
    }
    svg-icon {
      width: 2em !important;
      height: 2em !important;
      vertical-align: -0.5em !important;
    }
    .avatar-container {
      height: 50px;
      margin-right: 30px;
      .avatar-wrapper {
        cursor: pointer;
        margin-top: 10px;
        position: relative;
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }
        .hamburger-container {
          float: left;
        }
        .el-icon-caret-bottom {
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
.theme-picker {
  vertical-align: middle;
  vertical-align: 15px;
}
.user-name {
  color: #bfcbd9;
  font-size: 14px;
  float: left;
}
.right-setting {
  float: right;
  ul {
    margin: 0;
    padding: 0;
    li {
      float: left;
      height: 61px;
      list-style: none;
      .user {
        margin: 0 14px 0 5px;
        line-height: 62px;
        svg {
          color: #bfcbd9;
          width: 1.5em !important;
          height: 1.5em !important;
          margin: 18px 5px 0 0;
          float: left;
        }
      }
      .message {
        position: relative;
        span {
          position: absolute;
          display: block;
          top: 0;
          right: 0;
          background-color: #ff5918;
          color: #fff;
          font-size: 12px;
          height: 16px;
          line-height: 16px;
          min-width: 16px;
          text-align: center;
          border-radius: 50%;
        }
      }
    }
    li:hover {
      background: rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
