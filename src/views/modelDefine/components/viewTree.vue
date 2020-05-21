<template>
  <div class="view-tree">
    <div style="overflow:auto;position:relative;height: 100%;font-size:12px;">
        <el-tree
          :data="treeData"
          empty-text=""
          default-expand-all
          @node-click="clickHandle"
          :expand-on-click-node="false">
          <div slot-scope="{ node,data }">
            <template v-if="data.nodeType === '2'">查询 </template>
            <template v-else-if="data.nodeType === '3'">追加 </template>
            <template v-else-if="data.nodeType === '4'">结果 </template>
            <template > {{ data.title }}</template>
          </div>
        </el-tree>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      treeData: []
    }
  },
  props: {
    shareObject: Object
  },
  mounted() {
  },
  methods: {
    clickHandle(data, node) {
      this.$emit('centeNode', data)
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
.view-tree{
  height: 100%;
  .el-tree {
    position: absolute;
    width: 100%;
  }
}
</style>