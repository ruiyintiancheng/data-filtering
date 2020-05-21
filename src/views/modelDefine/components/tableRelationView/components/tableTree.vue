<template>
  <div style="height: 100%;overflow-y: hidden;">
    <div style="border: '1px solid rgb(203, 191, 191)';
                display: 'none';
                backgroundColor: '#e1651d';
                opacity: 0.3;
                zIndex: 1000;
                width: 64px;
                height: 64px;
                position: absolute;" 
          ref="dragNode">
    </div>
      <div class="block" style="-webkit-user-select:none;
                                -moz-user-select:none;
                                -ms-user-select:none;
                                user-select:none;">
        <el-tree
          :data="tables"
          node-key="id"
          default-expand-all
          :expand-on-click-node="false">
          <div style="widht:100%;height:100%" class="custom-tree-node" @mousedown="mousedown" slot-scope="{ node }">
            <span style="widht:100%;height:100%">{{ node.label }}</span>
          </div>
        </el-tree>
      </div>
  </div>
</template>
<script>
export default {
  currentFun: '',
  directives: { },
  name: 'modelDefineComponentsTableRelationViewComponentsTableTree',
  data() {
    return {
      tables: [{
        id: 1,
        label: '原始数据',
        children: [{
          id: 2,
          label: '核心数据',
          children: [{
            id: 3,
            label: '个人活期存款分户账'
          }, {
            id: 4,
            label: '对公定期存款分户账'
          }]
        }, {
          id: 5,
          label: '信贷系统',
          children: [{
            id: 6,
            label: '对公信贷分户账'
          }]
        }, {
          id: 7,
          label: '总账系统'
        }, {
          id: 8,
          label: '客户关系管理系统'
        }]
      }, {
        id: 9,
        label: '主题域',
        children: [{
          id: 12,
          label: '公共信息'
        }, {
          id: 10,
          label: '会计记账信息'
        }, {
          id: 11,
          label: '客户信息'
        }]
      }, {
        id: 13,
        label: '结果集'
      }]
    }
  },
  props: {
    shareObject: Object
  },
  mounted() {
  },
  computed: { // 计算属性
  },
  methods: {
    mousedown(event) {
      var e = event || window.event
      var x = e.x
      var y = e.y
      var style = this.$refs.dragNode.style
      style.backgroundColor = '#e1651d'
      style.display = 'block'
      const model = document.querySelector('#relationTable .el-dialog.dialog-default')
      style.left = x - 32 - model.offsetLeft + 'px'
      style.top = y - 32 - model.offsetTop + 'px'
      document.querySelector('body').addEventListener('mouseup', this.dragMouseup)
      document.querySelector('body').addEventListener('mousemove', this.dragMousemove)
    },
    dragMousemove(event) {
      // 2.计算坐标
      const e = event || window.event
      const model = document.querySelector('#relationTable .el-dialog.dialog-default')
      var x = 0
      var y = 0

      const canvas = document.querySelector('#tableCanvasFlowChart')
      const canvasX = canvas.offsetLeft
      const canvasY = canvas.offsetTop
      const canvasHeight = canvas.clientHeight
      const canvasWidth = canvas.clientWidth
      var style = this.$refs.dragNode.style
      if (e.x < model.offsetLeft || e.y < model.offsetTop || e.y > model.offsetHeight + model.offsetTop || e.x > model.offsetLeft + model.offsetWidth) {
        x = parseInt(style.left) + 32
        y = parseInt(style.top) + 32
      } else {
        x = e.x - model.offsetLeft
        y = e.y - model.offsetTop
      }
      style.left = x - 32 + 'px'
      style.top = y - 32 + 'px'
      if (x > canvasX && x < (canvasX + canvasWidth) && y > canvasY && y < (canvasY + canvasHeight)) {
        style.backgroundColor = 'green'
      } else {
        style.backgroundColor = '#e1651d'
      }
    },
    dragMouseup(event) {
      document.querySelector('body').removeEventListener('mouseup', this.dragMouseup)
      document.querySelector('body').removeEventListener('mousemove', this.dragMousemove)
      const style = this.$refs.dragNode.style
      if (style) {
        style.display = 'none'
      }
      var e = event || window.event
      const model = document.querySelector('#relationTable .el-dialog.dialog-default')
      const x = e.x - model.offsetLeft
      const y = e.y - model.offsetTop
      const canvas = document.querySelector('#tableCanvasFlowChart')
      const canvasX = canvas.offsetLeft
      const canvasY = canvas.offsetTop
      const canvasHeight = canvas.clientHeight
      const canvasWidth = canvas.clientWidth
      if (x > canvasX && x < (canvasX + canvasWidth) && y > canvasY && y < (canvasY + canvasHeight)) {
        this.$set(this.shareObject, 'event', e)
        this.$set(this.shareObject, this.shareObject.currentTab, new Date().getTime())
      }
    }
  },
  watch: {
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
</style>