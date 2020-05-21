<template>
  <section class="app-main">
    <transition name="fade"
                mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view></router-view>
      </keep-alive>
    </transition>
    <el-dialog title="受限权限"
               v-el-drag-dialog
               append-to-body
               :close-on-click-modal="false"
               :visible.sync="dialogVisible"
               width="70%"
               custom-class="dialog-default">
      <div class="dialog-contant-default permission-notification-dialog"
           v-if="dialogVisible">
        <el-table stripe
                  border
                  :data="permissionItem.data"
                  :height="tableHeight">
          <el-table-column align="center"
                           prop="permissionvalue"
                           label="权限值"></el-table-column>
          <el-table-column align="center"
                           prop="dsname"
                           label="数据源"></el-table-column>
          <el-table-column align="center"
                           prop="schemaname"
                           label="用户"></el-table-column>
          <el-table-column align="center"
                           prop="tablename"
                           label="表名"></el-table-column>
          <el-table-column align="center"
                           prop="columnname"
                           label="字段名"></el-table-column>
          <el-table-column align="center"
                           label="申请状态">
            <template slot-scope="scope">
              {{ scope.row.status | permissionStatus }}
            </template>
          </el-table-column>
        </el-table>
        <div class="permission-textarea">
          <el-input type="textarea"
                    :rows="3"
                    placeholder="请输入申请信息"
                    v-model="permissionItem.submitMsg">
          </el-input>
        </div>
      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="dialogVisible=false">关 闭</el-button>
        <el-button @click="commitPermission"
                   :disabled="permissionItem.data.every(item => item.status !== '0')"
                   type="primary">权限申请</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import { baseRequest } from '@/api/base'
export default {
  name: 'AppMain',
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    errorList() {
      return this.$store.state.tagsView.errorListStr
    },
    tableHeight() {
      return this.$store.state.app.dialogHeight - 220
    }
  },
  filters: {
    permissionStatus(key) {
      let result = ''
      switch (key) {
        case '0':
          result = '未申请'
          break
        case '1':
          result = '未审核'
          break
        case '2':
          result = '审核通过'
          break
        case '3':
          result = '审核未通过'
          break
      }
      return result
    }
  },
  data() {
    return {
      dialogVisible: false,
      // 是否是路由切换导致的提示关闭
      isRouter: false,
      // 当前申请权限弹框
      permissionItem: {
        path: '',
        data: [],
        submitMsg: ''
      }
    }
  },
  created() {
    this.$i18n.locale = this.$store.state.app.language
    this.showSideBar(this.$route.path)
  },
  watch: {
    '$route'(to, from) {
      this.showSideBar(to.path)
      this.recoverNotification(to, from)
    },
    errorList(value) {
      this.addNotification(value)
    }
  },
  methods: {
    // 提交申请
    commitPermission() {
      const pathes = this.permissionItem.path.split('/')
      const actionId = pathes[pathes.length - 1]
      const submitMsg = this.permissionItem.submitMsg
      const t00PermissionAuditValues = []
      for (const iterator of this.permissionItem.data) {
        if (iterator.status === '0') {
          const tempObj = {}
          tempObj.permissionId = iterator.permissionid
          tempObj.permissionValue = iterator.permissionvalue
          t00PermissionAuditValues.push(tempObj)
        }
      }
      const params = {
        actionId,
        submitMsg,
        t00PermissionAuditValues
      }
      baseRequest('/basic/t00PermissionAudit/applyAuthority', params).then(response => {
        this.$message.success('提交成功')
        this.dialogVisible = false
      })
    },
    // 是否屏蔽申请
    isDisabled() {
      return
    },
    // 关闭以及恢复提示
    recoverNotification(to, from) {
      this.isRouter = true
      const allNotification = this.$store.state.tagsView.errorNotifitionList
      // 关闭所有
      for (const it of allNotification) {
        if (it.notify) {
          it.notify.close()
        }
      }
      const h = this.$createElement
      for (const it of allNotification) {
        if (it.path === this.$route.path) {
          window.setTimeout(function() {
            const notify = this.openNotification(h, {
              path: it.path,
              value: it.value })
            const params = {
              path: it.path,
              value: it.value,
              notify: notify
            }
            this.$store.dispatch('updateErrorNotifition', params)
          }.bind(this), 500)
        }
      }
      this.isRouter = false
    },
    // 打开提示
    openNotification(h, value) {
      const notify = this.$notify({
        title: '提示',
        dangerouslyUseHTMLString: true,
        message: h('a', {// 内容 可点击弹框
          on: {
            click: _ => {
              this.openErrorList(value)
            }
          }
        }, '表或字段的访问权限受限，请向管理员申请权限'),
        onClose: _ => {
          if (!this.isRouter) {
            const params = {
              path: value.path,
              value: value.value
            }
            this.$store.dispatch('deleteErrorNotifition', params)
          }
        },
        offset: 250, // 位置
        duration: 0, // 显示时间, 毫秒。设为 0 则不会自动关闭
        showClose: true, // 是否展示可关闭按钮
        customClass: 'permission-notification',
        iconClass: 'el-icon-bell' // 自定义图标的类名，会覆盖 type
      })
      return notify
    },
    // 新增提示
    addNotification(tempStr) {
      const value = tempStr.split('$')[0]
      const currentPath = localStorage.getItem('requestFromPath')
      const h = this.$createElement
      const allNotification = this.$store.state.tagsView.errorNotifitionList
      if (allNotification.some(item => item.path === currentPath && item.value === value)) {
        return
      }
      window.setTimeout(_ => {
        const notify = this.openNotification(h, { path: currentPath,
          value: value })
        const params = {
          path: currentPath,
          value: value,
          notify: notify
        }
        this.$store.dispatch('addErrorNotifition', params)
      }, 500)
    },
    openErrorList(value) {
      baseRequest('/basic/t00PermissionAuditValue/selectAuditStatus', { 'permissionData': JSON.parse(value.value) }).then(response => {
        this.permissionItem.path = value.path
        this.permissionItem.data = response.data.item
        this.permissionItem.submitMsg = ''
        this.dialogVisible = true
      })
    },
    showSideBar(path) {
      const leftMap = this.$store.state.permission.leftMap // 左侧map选项
      const topRouters = this.$store.state.permission.topRouters // 顶部菜单
      const current = path.split('/')[path.split('/').length - 1]
      let boo = false
      for (const key in leftMap) {
        this.topItem = false
        this.findChildrenName(current, leftMap[key])
        if (this.topItem) {
          this.baseTopPath = ''
          this.findTopPath(key, topRouters)
          const parmObj = {
            leftRoutes: leftMap[key],
            path: this.baseTopPath
          }
          this.$store.dispatch('GenerateLeftRoutes', parmObj).then(() => {
            const style2 = {
              dispalySideBar: 'block',
              marginNavBar: '210px'
            }
            this.$store.dispatch('setPageStyle', style2).then(() => {
            }).catch(() => {
              alert('error submit!!')
            })
          }).catch(() => {
            alert('error submit!!')
          })
          boo = true
          break
        }
      }
      if (!boo) {
        const style = {
          dispalySideBar: 'none',
          marginNavBar: '0px'
        }
        this.$store.dispatch('setPageStyle', style).then(() => {
        }).catch(() => {
          alert('error submit!!')
        })
      }
    },
    findChildrenName(current, list) {
      for (const iterator of list) {
        if (iterator.path.split('/')[iterator.path.split('/').length - 1] === current) {
          this.topItem = true
          break
        }
        if (iterator.children && iterator.children.length > 0) {
          this.findChildrenName(current, iterator.children)
        }
      }
    },
    findTopPath(key, topRouters, str) {
      if (!str) {
        str = ''
      }
      for (const iterator of topRouters) {
        if (iterator.name === key) {
          str += '/' + iterator.name
          this.baseTopPath = str
          this.$store.dispatch('setSideTitle', iterator.meta.title).then(() => {
          }).catch(() => {
            alert('error submit!!')
          })
          break
        }
        if (iterator.children && iterator.children.length > 0) {
          str += '/' + iterator.name
          this.findTopPath(key, iterator.children, str)
          str = ''
        }
      }
    }
  }
}
</script>


<style lang="scss">
.permission-notification {
  .el-notification__content {
    a {
      text-decoration: underline;
    }
  }
}
.permission-notification-dialog {
  position: relative;
  .permission-textarea {
    position: absolute;
    bottom: 5px;
    width: calc(100% - 20px);
  }
}
</style>
