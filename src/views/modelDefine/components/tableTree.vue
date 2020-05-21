<template>
  <div id="tableCanvas" class="modal-define-dataSourcetree" style="height: 100%;">
    <div :style="dragNodeStyle" ref="dragNode">
    </div>
    <div style="height: 100%;">
      <div style="overflow:auto;position:relative;height: 100%;font-size:12px;">
        <el-input placeholder="筛选" v-model="filterText" style="padding:5px 10px;"></el-input>
        <el-tree
          ref="dataSourceTree"
          :data="treeData"
          :filter-node-method="filterNode"
          node-key="id"
          empty-text=""
          default-expand-all
          :props="defaultProps"
          :expand-on-click-node="false">
          <div class="tree-text" @mousedown="mousedown($event,data,node)" slot-scope="{ node,data }">
            <template v-if="data.type==='table'">
              {{ data.tableName + (data.name?'('+data.name+')':'') }}
            </template>
            <template v-else >{{ node.label }}</template>
          </div>
        </el-tree>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  currentFun: '',
  directives: { },
  name: 'modelDefineComponentsTableTree',
  data() {
    return {
      // addDataJudge: false, // 是否添加数据
      // type: '', // 有值为编辑状态
      // 筛选文字
      filterText: '',
      canvasHeight: 0,
      canvasWidth: 0,
      dragNodeStyle: {
        width: '64px',
        height: '64px',
        position: 'fixed',
        border: '1px solid rgb(203, 191, 191)',
        display: 'none',
        backgroundColor: '#e1651d',
        opacity: 0.3,
        zIndex: 1000
      },
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      currentTreeNode: null,
      drag: false
    }
  },
  watch: {
    filterText(val) {
      this.$refs.dataSourceTree.filter(val)
    }
  },
  props: {
    shareObject: Object,
    treeData: Array
  },
  computed: { // 计算属性
  },
  methods: {
    // 过滤节点
    filterNode(value, data) { // 树的查询
      if (!value) return true
      let name = ''
      if (data.type === 'table') {
        name = data.tableName + (data.name ? '(' + data.name + ')' : '')
      } else {
        name = data.name
      }
      const nameUp = name.toUpperCase()
      const nameLo = name.toLowerCase()
      return nameUp.indexOf(value) !== -1 || nameLo.indexOf(value) !== -1
    },
    mousedown(event, data, node) {
      if (data.type !== 'table') return
      // const reduce = this.$parent.$parent.$parent.fullScreen ? 32 : 242
      const reduce = 32
      this.currentTreeNode = data
      var e = event || window.event
      var x = e.clientX
      var y = e.clientY
      var style = this.$refs.dragNode.style
      style.backgroundColor = '#e1651d'
      style.display = 'block'
      // const model = document.querySelector('.model-option')
      style.left = x - reduce + 'px'
      style.top = y - reduce + 'px'
      document.querySelector('body').addEventListener('mouseup', this.dragMouseup)
      document.querySelector('body').addEventListener('mousemove', this.dragMousemove)
    },
    dragMousemove(event) {
      // 2.计算坐标
      const e = event || window.event
      // const model = document.querySelector('.model-option')
      const x = e.clientX
      const y = e.clientY
      var style = this.$refs.dragNode.style
      // const reduce = this.$parent.$parent.$parent.fullScreen ? 32 : 242
      const reduce = 32
      style.left = x - reduce + 'px'
      style.top = y - reduce + 'px'
      const rect = document.querySelector('#flowChart' + this.shareObject.currentTab).getBoundingClientRect()
      if (e.clientX > rect.left && e.clientX < rect.left + rect.width && e.clientY > rect.top && e.clientY < rect.top + rect.height) {
        style.backgroundColor = 'green'
      } else {
        style.backgroundColor = '#e1651d'
      }
    },
    dragMouseup(event) {
      const rect = document.querySelector('#flowChart' + this.shareObject.currentTab).getBoundingClientRect()
      document.querySelector('body').removeEventListener('mouseup', this.dragMouseup)
      document.querySelector('body').removeEventListener('mousemove', this.dragMousemove)
      var style = this.$refs.dragNode.style
      style.display = 'none'
      var e = event || window.event
      if (e.clientX > rect.left && e.clientX < rect.left + rect.width && e.clientY > rect.top && e.clientY < rect.top + rect.height) {
        this.$set(this.shareObject, 'event', e)
        this.$set(this.shareObject, 'currentTreeNode', this.currentTreeNode)
        this.$set(this.shareObject, 'dragTime', new Date().getTime())
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
</style>
<style lang="scss">
.modal-define-dataSourcetree .el-tree{
  position: absolute;
  -webkit-user-select:none;

   -moz-user-select:none;

   -ms-user-select:none;

   user-select:none;
   .el-tree-node__content {
     cursor: initial;
   }
   .tree-text{
     cursor: pointer;
   }
}
</style>
