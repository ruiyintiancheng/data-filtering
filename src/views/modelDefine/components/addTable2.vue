<template>
  <div>
    <el-dialog title="添加表"
               v-el-drag-dialog
               append-to-body
               :close-on-click-modal="false"
               :visible.sync="dialogAddVisible"
               width="55%"
               custom-class="dialog-default">
      <div class="dialog-contant-default"
           v-if="dialogAddVisible">
        <div class="add-table-inside2">
          <div class="data-resource">
            <el-input v-model.trim="keyword"
                      style="width:255px;"
                      placeholder="关键字"
                      clearable>
            </el-input>
            <el-button type="primary"
                       @click="filterSearch">查询</el-button>
          </div>
          <el-tabs class="table-option"
                   v-model="activeName"
                   type="card">
            <el-tab-pane class="search-panel"
                         label="原始表"
                         name="tableOri">
              <el-table border
                        :data="tableData"
                        :height="tableHeight"
                        style="width: 100%">
                <el-table-column width="55"
                                 label="选择"
                                 align="center">
                  <template slot-scope="scope">
                    <el-radio v-model="tableChoose"
                              :label="scope.row.id">&nbsp;</el-radio>
                  </template>
                </el-table-column>
                <el-table-column align="center"
                                 label="表名称">
                  <template slot-scope="scope">
                    {{scope.row.tableName}}({{scope.row.name}})
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane class="search-panel"
                         label="结果表"
                         name="tableName">
              <el-table border
                        :height="tableHeight"
                        :data="tableData1"
                        style="width: 100%">
                <el-table-column width="55"
                                 label="选择"
                                 align="center">
                  <template slot-scope="scope">
                    <el-radio v-model="tableChoose"
                              :label="scope.row.tableNumber">&nbsp;</el-radio>
                  </template>
                </el-table-column>
                <el-table-column align="center"
                                 label="表名称">
                  <template slot-scope="scope">
                    {{scope.row.tableChnName}}
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane class="search-panel"
                         label="生成表"
                         name="tableCreate">
              <el-table border
                        :height="tableHeight"
                        :data="tableData2"
                        style="width: 100%">
                <el-table-column width="55"
                                 label="选择"
                                 align="center">
                  <template slot-scope="scope">
                    <el-radio v-model="tableChoose"
                              :label="scope.row.id">&nbsp;</el-radio>
                  </template>
                </el-table-column>
                <el-table-column align="center"
                                 label="表名称">
                  <template slot-scope="scope">
                    {{scope.row.tableName}}({{scope.row.name}})
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <div>
          <el-button type="primary"
                     @click="openRelationDialog">确定</el-button>
          <el-button @click="dialogAddVisible=false">关闭</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { deepClone } from '@/utils/index'
import elDragDialog from '@/directive/el-dragDialog'
import { baseRequest } from '@/api/base'
export default {
  directives: { elDragDialog },
  props: {
    dataSourceTree: Array,
    shareObject: Object,
    tableJson: Array,
    // 整体json
    modelJson: Object,
    // 新增节点 来源
    fromTableNumber: Number
  },
  computed: {
    tableHeight() {
      return this.$store.state.app.dialogHeight - 250
    }
  },
  data() {
    return {
      // 筛选关键字
      keyword: '',
      // 传过来的table
      oriTable: {},
      // 选中值
      tableChoose: null,
      // 当前table
      currentTable: {},
      dialogVisible: false,
      dialogAddVisible: false,
      activeName: 'tableOri',
      tableData: [],
      tableData1: [],
      tableData2: [],
      tableDataOri: [],
      tableData1Ori: [],
      tableData2Ori: [],
      chooseTableTab: null
    }
  },
  watch: {
    tableChoose: function(val) {
      this.chooseTableTab = this.activeName
    }
  },
  mounted() {
  },
  methods: {
    // 筛选查询
    filterSearch() {
      this.tableData = this.tableDataOri.filter(item => {
        const name = item.tableName + '(' + item.name + ')'
        const nameUp = name.toUpperCase()
        const nameLo = name.toLowerCase()
        return nameUp.indexOf(this.keyword) !== -1 || nameLo.indexOf(this.keyword) !== -1
      })
      this.tableData1 = this.tableData1Ori.filter(item => {
        const name = item.tableChnName
        const nameUp = name.toUpperCase()
        const nameLo = name.toLowerCase()
        return nameUp.indexOf(this.keyword) !== -1 || nameLo.indexOf(this.keyword) !== -1
      })
      this.tableData2 = this.tableData2Ori.filter(item => {
        const name = item.tableName + '(' + item.name + ')'
        const nameUp = name.toUpperCase()
        const nameLo = name.toLowerCase()
        return nameUp.indexOf(this.keyword) !== -1 || nameLo.indexOf(this.keyword) !== -1
      })
    },
    // 打开添加表
    openDialog(table) {
      this.tableChoose = table ? table.tableId : null
      this.oriTable = table || {}
      this.getTableData().then(_ => {
        if (this.tableChoose || this.tableChoose === 0) {
          if (this.tableData.some(item => item.tableId === this.tableChoose)) {
            this.activeName = 'tableOri'
            this.chooseTableTab = 'tableOri'
          } else if (this.tableData1.some(item => item.tableId === this.tableChoose)) {
            this.activeName = 'tableName'
            this.chooseTableTab = 'tableName'
          } else if (this.tableData2.some(item => item.tableId === this.tableChoose)) {
            this.activeName = 'tableCreate'
            this.chooseTableTab = 'tableCreate'
          }
        }
        this.dialogAddVisible = true
      })
    },
    // 获取原始表 生成表
    getTableData() {
      return new Promise(resolve => {
        // 筛选结果表
        this.tableData1 = this.modelJson.T05ModelTable.filter(item => item.tableType === '2')

        const allLine = this.$parent.$parent.$refs[this.shareObject.currentTab][0].net.getEdges()
        const nodeId = this.$parent.$parent.$refs[this.shareObject.currentTab][0].activation.getModel().id
        this.getBehand(nodeId, allLine)
        console.log(this.dataSourceTree)
        const users = this.dataSourceTree[0].children ? this.dataSourceTree[0].children : []
        this.tableData = []
        if (users.length > 0) {
          for (const user of users) {
            if (user.children && user.children.length > 0) {
              this.tableData = this.tableData.concat(user.children)
            }
          }
        }
        this.tableData2 = []
        if (this.dataSourceTree[1].children) {
          this.tableData2 = this.dataSourceTree[1].children
        }
        this.tableDataOri = this.tableData
        this.tableData1Ori = this.tableData1
        this.tableData2Ori = this.tableData2
        resolve()
      })
    },
    // 筛选结果表
    getBehand(id, lines) {
      for (const iterator of lines) {
        if (iterator._attrs.source._attrs.id === id && iterator._attrs.model.lineType !== '2') {
          this.tableData1 = this.tableData1.filter(item => item.tableNumber !== iterator._attrs.target._attrs.model.tableNumber)
          this.getBehand(iterator._attrs.target._attrs.id, lines)
        }
      }
    },
    openRelationDialog() {
      if (!this.tableChoose) {
        this.$message.warning('请选择表')
        return
      }
      const numberId = this.tableChoose
      if (this.chooseTableTab === 'tableName') {
        this.currentTable = deepClone(this.tableData1.find(item => item.tableNumber === numberId))
        if (this.oriTable.tableNumber === this.currentTable.tableNumber) {
          this.currentTable.joinRelation = this.oriTable.joinRelation
        }
        this.$emit('openRelationDialog', this.currentTable)
        this.dialogAddVisible = false
      } else {
        const exsitTable = this.tableJson.find(item => item.tableId === numberId)
        if (exsitTable) {
          this.currentTable = deepClone(exsitTable)
          if (this.oriTable.tableId === this.currentTable.tableId) {
            this.currentTable.joinRelation = this.oriTable.joinRelation
          }
          this.$emit('openRelationDialog', this.currentTable)
          this.dialogAddVisible = false
        } else {
          baseRequest('/basic/columns/getColumnsByTableId', { tableId: this.tableChoose }).then(response => {
            const colunms = response.data.item
            colunms.map((item, index) => {
              item.columnNumber = index
              item.columnChnName = item.columnchnname || ''
              item.columnId = item.columnid
              item.columnName = item.columnname
              return item
            })
            const tableNumber = new Date().getTime()
            let currentRow = {}
            if (this.chooseTableTab === 'tableOri') {
              currentRow = this.tableData.find(item => item.id === numberId)
            } else {
              currentRow = this.tableData2.find(item => item.id === numberId)
            }
            this.currentTable = {
              'tableNumber': tableNumber,
              'tableType': '1', // '1' 原始表 '2' 结果表
              'tableId': currentRow.id,
              'tableName': currentRow.tableName,
              'tableChnName': currentRow.name || '',
              'schemaName': currentRow.schemaName,
              'T05ModelColumn': colunms
            }
            this.$emit('openRelationDialog', this.currentTable)
            this.dialogAddVisible = false
          })
        }
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
.add-table-inside2 {
  height: 100%;
  .data-resource {
    border: 1px solid #e4e7ed;
    height: 60px;
    line-height: 60px;
    padding-left: 20px;
  }
  .table-option {
    margin-top: 10px;
    height: calc(100% - 70px);
    .el-tabs__header {
      margin: 0px 0 10px;
    }
    .el-tabs__content {
      height: calc(100% - 41px);
      .search-panel {
        height: 100%;
      }
    }
  }
}
</style>
