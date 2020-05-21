<template>
  <div>
      <basic-table v-show="tableToggle" ref="basicTable" :height="shareObject.containHeight" sortable=true :tableOption="configData" :pagenation="true" :rowNum="true" :rowCheck='false'>
      </basic-table>
  </div>
</template>
<script>
// var url = '/modelDefine/resultsOfImplementation'
// import { baseRequest } from '@/api/base'
import BasicTable from 'basic-table-ry'
export default {
  name: 'modelDefineComponentsTableList',
  directives: { },
  components: {
    BasicTable
  },
  data() {
    return {
      configData: {},
      tableToggle: true
    }
  },
  props: {
    shareObject: Object
  },
  mounted() {
    // baseRequest(url).then(response => {
    //   const result = response.data
    //   result.tableConfig = JSON.parse(result.tableConfig)
    //   this.configData = result
    //   this.$refs.basicTable.getData(url, {})
    // })
  },
  computed: { // 计算属性
  },
  methods: {
  },
  watch: {
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
</style>