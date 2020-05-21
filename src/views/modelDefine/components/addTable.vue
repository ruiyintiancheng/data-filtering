<template>
  <div class="addTable">
    <div class="at-node">
      <h4>节点信息</h4>
      <el-form inline
               :model="nameForm">
        <el-form-item prop="addName"
                      label="节点名称:"
                      class="is-required">
          <el-input v-model="nameForm.addName"
                    style="width:255px;"
                    clearable></el-input>
        </el-form-item>
        <el-form-item prop="resultName"
                      label="输出名称:"
                      class="is-required">
          <el-input v-model="nameForm.resultName"
                    style="width:255px;"
                    clearable></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="search-panel clearfix">
      <div class="search-panel-left">
        <div class="data-table">
          <el-table v-if="freshTable"
                    ref="dataTable"
                    row-key="name"
                    :height="tableHeight"
                    highlight-current-row
                    border
                    :data="tableData"
                    :empty-text="headData.length <= 0?'请在右侧选择添加表':'请在右侧选择添加列'"
                    @row-click="getCurrenthRow"
                    style="width: 100%">
            <el-table-column fixed="left"
                             align="center"
                             min-width="200">
              <template slot="header">
                <el-tooltip class="item"
                            effect="dark"
                            :content="fromTable.tableName+'('+fromTable.tableChnName+')'"
                            placement="top">
                  <span style="display:inline-block;">{{(fromTable.tableChnName||item.tableName)+'(原始表)'}}</span>
                </el-tooltip>
              </template>
              <template slot-scope="scope">
                <el-select v-model="scope['row']['original']">
                  <el-option v-for="(option,index) in fromTable.T05ModelColumn"
                             :key="index"
                             :label="option.columnName+'('+option.columnChnName+')'"
                             :value="option.columnNumber"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column v-for="(item,index) in headData"
                             align="center"
                             :key="index"
                             min-width="390"
                             :label="item.tableName">
              <template slot="header">
                <el-tooltip class="item"
                            effect="dark"
                            :content="item.tableName+'('+item.tableChnName+')'"
                            placement="top">
                  <span style="display:inline-block;">{{item.tableChnName || item.tableName}}</span>
                </el-tooltip>
                <el-select v-model="item.unionType"
                           size="mini"
                           style="width:140px;padding:0;"
                           @change="unionTypeChange($event,item)">
                  <el-option label="UNION"
                             value="1"></el-option>
                  <el-option label="UNION ALL"
                             value="2"></el-option>
                </el-select>
              </template>
              <template slot-scope="scope">
                <el-select v-model="scope['row'][item.tableNumber+'']"
                           @change="unionTypeChange($event,item)">
                  <el-option v-for="(option,index) in item.T05ModelColumn"
                             :key="index"
                             :label="option.columnName+'('+option.columnChnName+')'"
                             :value="option.columnNumber"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="列名"
                             fixed="right"
                             align="center">
              <template slot-scope="scope">
                {{scope.row.newName.columnName}}
              </template>
            </el-table-column>
            <el-table-column label="中文名"
                             fixed="right"
                             align="center">
              <template slot-scope="scope">
                {{scope.row.newName.columnChnName}}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="search-panel-right">
        <el-tooltip class="item"
                    effect="dark"
                    content="添加表"
                    placement="right">
          <el-button class="right-button"
                     @click="addTable"
                     icon="el-icon-document-add"
                     size="mini"></el-button>
        </el-tooltip><br>
        <el-tooltip class="item"
                    effect="dark"
                    content="添加列"
                    placement="right">
          <el-button class="right-button"
                     @click="addColumn"
                     icon="el-icon-plus"
                     size="mini"></el-button>
        </el-tooltip><br>
        <el-tooltip class="item"
                    effect="dark"
                    content="修改列"
                    placement="right">
          <el-button class="right-button"
                     @click="updateResultHandle"
                     icon="el-icon-edit-outline"
                     size="mini"></el-button>
        </el-tooltip><br>
        <el-tooltip class="item"
                    effect="dark"
                    content="删除"
                    placement="right">
          <el-button class="right-button"
                     @click="deleteHandle()"
                     icon="el-icon-delete"
                     size="mini"></el-button>
        </el-tooltip><br>
        <el-tooltip class="item"
                    effect="dark"
                    content="向上"
                    placement="right">
          <el-button class="right-button"
                     @click="upHandle()"
                     icon="el-icon-arrow-up"
                     size="mini"></el-button>
        </el-tooltip><br>
        <el-tooltip class="item"
                    effect="dark"
                    content="向下"
                    placement="right">
          <el-button class="right-button"
                     @click="downHandle()"
                     icon="el-icon-arrow-down"
                     size="mini"></el-button>
        </el-tooltip>
      </div>
    </div>
    <el-dialog title="添加表"
               v-el-drag-dialog
               append-to-body
               :close-on-click-modal="false"
               :visible.sync="addHeadVisable"
               width="30%"
               custom-class="dialog-default">
      <div class="dialog-contant-default addtable-dialog">
        <el-input placeholder="筛选"
                  v-model="filterText"
                  style="padding:5px 10px;"></el-input>
        <el-tree ref="dataSourceTree"
                 :filter-node-method="filterNode"
                 :data="tableTree"
                 show-checkbox
                 node-key="id"
                 default-expand-all
                 :props="{
                      children: 'children',
                      label: 'name'
                    }"
                 :expand-on-click-node="false">
          <div slot-scope="{ node,data }">
            <template v-if="data.type==='table'">
              {{ data.tableName + (data.name?'('+data.name+')':'') }}
            </template>
            <template v-else>{{ node.label }}</template>
          </div>
        </el-tree>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button type="primary"
                   @click="addTableCommit">确定</el-button>
        <el-button @click="addHeadVisable=false">关闭</el-button>
      </div>
    </el-dialog>
    <el-dialog title="添加列"
               v-el-drag-dialog
               append-to-body
               :close-on-click-modal="false"
               :visible.sync="addResultVisable"
               width="30%"
               custom-class="dialog-default add-result">
      <div class="dialog-contant-default"
           v-if="addResultVisable">
        <el-form :rules="addResultRules"
                 class="baseUpdate-form"
                 ref="addResultForm"
                 :model="addResultData"
                 label-width="100px">
          <el-form-item label="列名"
                        prop="columnName">
            <el-input :disabled="isUpdateResult"
                      class="form-input"
                      v-model="addResultData.columnName"
                      clearable></el-input>
          </el-form-item>
          <el-form-item label="中文名"
                        prop="columnChnName">
            <el-input class="form-input"
                      v-model="addResultData.columnChnName"
                      clearable></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <div>
          <el-button type="primary"
                     @click="saveAddResult">确定</el-button>
          <el-button @click="addResultVisable=false">取消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { deepClone } from '@/utils/index'
import { baseRequest } from '@/api/base'
export default {
  props: {
    dataSourceTree: Array,
    // 整体json
    modelJson: Object,
    // 新增节点 来源
    fromTableNumber: Number,
    // 添加数据
    addJson: Object,
    shareObject: Object
  },
  computed: {
    tableJson: function() {
      return deepClone(this.modelJson.T05ModelTable)
    },
    tableHeight: function() {
      return this.$store.state.app.dialogHeight - 200
    },
    fromTable: function() {
      let fromTable = {}
      if (this.addJson) {
        const T05UnionTable = this.addJson.T05UnionTable
        const oriTable = T05UnionTable.find(item => item.unionType === '0')
        fromTable = deepClone(this.tableJson.find(item => item.tableNumber === oriTable.tableNumber))
        fromTable.unionType = '0'
      } else {
        fromTable = deepClone(this.tableJson.find(item => item.tableNumber === this.fromTableNumber))
        fromTable.unionType = '0'
      }
      return fromTable
    },
    tableTree: function() {
      this.resultTables = this.modelJson.T05ModelTable.filter(item => item.tableType === '2')
      const allLine = this.$parent.$parent.$refs[this.shareObject.currentTab][0].net.getEdges()
      const nodeId = this.$parent.$parent.$refs[this.shareObject.currentTab][0].activation.getModel().id
      this.getBehand(nodeId, allLine)
      const resultTable = {
        children: [],
        id: -3,
        name: '结果表',
        type: 'dataSource'
      }
      if (this.resultTables.length > 0) {
        for (const iterator of this.resultTables) {
          const table = {
            id: iterator.tableNumber,
            name: iterator.tableChnName,
            schemaName: null,
            tableName: iterator.tableChnName,
            type: 'table',
            resultTable: true
          }
          resultTable.children.push(table)
        }
      }
      return this.dataSourceTree.concat([resultTable])
    }
  },
  data() {
    return {
      resultTables: [],
      headData: [],
      tableData: [],
      // 添加列开关
      addResultVisable: false,
      // 刷新表格
      freshTable: true,
      // 筛选文字
      filterText: '',
      // 输入输出表单
      nameForm: {
        // 追名称
        addName: '',
        // 结果表名称
        resultName: ''
      },
      // 选择表弹框
      addHeadVisable: false,
      currentRow: null,
      // 添加结果数据
      addResultData: {
        columnName: null,
        columnChnName: null
      },
      isUpdateResult: false,
      // 添加结果校验
      addResultRules: {
        columnName: [
          {
            required: true, message: '列名不能为空'
          },
          {
            validator: (rule, value, callback) => {
              if (this.isUpdateResult) {
                callback()
              } else {
                if (this.tableData.some(item => item.newName.columnName === value)) {
                  callback(new Error('该列名已存在'))
                } else {
                  callback()
                }
              }
            }
          }
        ],
        columnChnName: [
          {
            required: true, message: '列中文名名不能为空'
          }
        ]
      }
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tableTree.filter(val)
    }
  },
  mounted() {
    if (this.addJson) {
      const resultTable = this.tableJson.find(item => item.tableNumber === this.addJson.tableNumber)
      this.nameForm.addName = this.addJson.title
      this.nameForm.resultName = resultTable.tableChnName
      for (const iterator of this.addJson.T05UnionTable) {
        const table = this.tableJson.find(item => item.tableNumber === iterator.tableNumber)
        if (iterator.unionType !== '0') {
          this.headData.push({
            'tableNumber': table.tableNumber,
            'tableType': '1', // '1' 原始表 '2' 结果表
            'tableId': table.tableId,
            'tableName': table.tableName,
            'tableChnName': table.tableChnName,
            'schemaName': table.schemaName,
            'T05ModelColumn': table.T05ModelColumn,
            'unionType': iterator.unionType
          })
        }
        const T05UnionColumn = iterator.T05UnionColumn
        for (const [index, it] of T05UnionColumn.entries()) {
          if (this.tableData[index]) {
            if (it.unionType !== '0') {
              this.tableData[index][table.tableNumber + ''] = it.columnNumber
            } else {
              this.tableData[index]['original'] = it.columnNumber
            }
          } else {
            const column = {
              newName: {
                columnChnName: resultTable.T05ModelColumn[index].columnChnName,
                columnName: resultTable.T05ModelColumn[index].columnName
              }
            }
            if (iterator.unionType !== '0') {
              column[table.tableNumber + ''] = it.columnNumber
            } else {
              column['original'] = it.columnNumber
            }
            this.tableData.push(column)
          }
        }
      }
    }
  },
  methods: {
    // 筛选结果表
    getBehand(id, lines) {
      for (const iterator of lines) {
        if (iterator._attrs.source._attrs.id === id && iterator._attrs.model.lineType !== '2') {
          this.resultTables = this.resultTables.filter(item => item.tableNumber !== iterator._attrs.target._attrs.model.tableNumber)
          this.getBehand(iterator._attrs.target._attrs.id, lines)
        }
      }
    },
    // 保存追加
    saveHandle() {
      if (!this.nameForm.addName || !this.nameForm.resultName) {
        this.$message.warning('查询名称和输出名称不能为空')
        return
      }
      if (this.tableData.length <= 0) {
        this.$message.warning('列选项不能为空')
        return
      }
      const status = this.tableData.every(item => {
        let notNull = true
        for (const key in item) {
          if (!item[key] && item[key] !== 0) {
            notNull = false
          }
        }
        return notNull
      })
      if (!status) {
        this.$message.warning('列选项不能为空')
        return
      }
      const currentTime = new Date().getTime()
      // 保存tableJson
      for (const iterator of this.headData) {
        if (this.tableJson.every(item => item.tableId !== iterator.tableId)) {
          this.tableJson.push(iterator)
        }
      }
      const resultTableNumber = this.addJson ? this.addJson.tableNumber : currentTime + 1
      // 保存追加节点
      const addJson = {}
      addJson.id = this.addJson ? this.addJson.id : new Date().getTime()
      addJson.tableNumber = this.addJson ? this.addJson.tableNumber : resultTableNumber
      addJson.x = this.addJson ? this.addJson.x : null
      addJson.y = this.addJson ? this.addJson.y : null
      addJson.shape = '2'
      addJson.nodeType = '3'
      addJson.title = this.nameForm.addName
      addJson.T05UnionTable = this.getT05UnionTable()
      // 保存结果表
      const resultJosn = {}
      resultJosn.tableNumber = resultTableNumber
      resultJosn.tableType = '2'
      resultJosn.tableId = resultTableNumber
      resultJosn.tableName = ''
      resultJosn.tableChnName = this.nameForm.resultName
      resultJosn.schemaName = ''
      resultJosn.T05ModelColumn = []
      for (const [index, iterator] of this.tableData.entries()) {
        resultJosn.T05ModelColumn.push({
          columnNumber: currentTime + index,
          columnName: iterator.newName.columnName,
          columnChnName: iterator.newName.columnChnName,
          columnId: null
        })
      }
      if (this.addJson) {
        const index = this.tableJson.findIndex(item => item.tableNumber === this.addJson.tableNumber)
        this.tableJson.splice(index, 1, resultJosn)
      } else {
        this.tableJson.push(resultJosn)
      }
      const params = {
        tableJson: this.tableJson,
        queryJson: addJson,
        resultJosn: resultJosn,
        type: 'add'
      }
      this.$emit(this.addJson ? 'saveAddUpdate' : 'saveAddCreate', params)
    },
    // 获取追加表所有表列
    getT05UnionTable() {
      const T05UnionTable = []
      const allTables = [this.fromTable].concat(this.headData)
      for (const iterator of allTables) {
        const table = {
          'tableIdx': iterator.tableNumber,
          'tableNumber': iterator.tableNumber,
          'unionType': iterator.unionType,
          'T05UnionColumn': []
        }
        for (const data of this.tableData) {
          const columnNumber = iterator.unionType === '0' ? data['original'] : data[iterator.tableNumber + '']
          table.T05UnionColumn.push({
            'columnIdx': columnNumber,
            'columnNumber': columnNumber
          })
        }
        T05UnionTable.push(table)
      }
      return T05UnionTable
    },
    // 选择union类型
    unionTypeChange(value, item) {
      this.freshTable = false
      this.$nextTick(_ => {
        this.freshTable = true
      })
    },
    // 获取修改列
    updateResultHandle() {
      if (!this.currentRow) {
        return
      }
      this.isUpdateResult = true
      this.addResultVisable = true
      this.addResultData.columnName = this.currentRow.newName.columnName
      this.addResultData.columnChnName = this.currentRow.newName.columnChnName
    },
    // 添加列
    addColumn() {
      if (this.headData.length <= 0) {
        this.$message.warning('请先添加表')
        return
      }
      this.isUpdateResult = false
      this.addResultData.columnName = null
      this.addResultData.columnChnName = null
      this.addResultVisable = true
    },
    // 保存新增列
    saveAddResult() {
      this.$refs.addResultForm.validate(valid => {
        if (valid) {
          if (this.isUpdateResult) {
            this.currentRow.newName.columnChnName = this.addResultData.columnChnName
            this.addResultVisable = false
          } else {
            const data = {}
            for (const iterator of this.headData) {
              data[iterator.tableNumber + ''] = null
            }
            data.newName = {
              columnName: this.addResultData.columnName,
              columnChnName: this.addResultData.columnChnName
            }
            data['original'] = null
            this.tableData.push(data)
            console.log(data)
          }
          this.addResultVisable = false
        } else {
          return false
        }
      })
    },
    // 添加表
    addTable() {
      this.addHeadVisable = true
      const checkedKeys = []
      for (const iterator of this.headData) {
        checkedKeys.push(iterator.tableId)
      }
      this.$nextTick(_ => {
        this.$refs.dataSourceTree.setCheckedKeys(checkedKeys)
      })
    },
    // 添加表确定
    addTableCommit() {
      const selects = this.$refs.dataSourceTree.getCheckedNodes()
      this.headData = this.headData.filter(item =>
        selects.some(it => it.id === item.tableId)
      )
      const currentTime = new Date().getTime()
      for (const [index, iterator] of selects.entries()) {
        if (iterator.type === 'table' && this.headData.every(item => item.tableId !== iterator.id)) {
          this.addToTableSearchColumn(iterator, currentTime + index)
        }
      }
      this.freshTable = false
      this.$nextTick(_ => {
        this.freshTable = true
      })
      this.addHeadVisable = false
    },
    // 添加到表并查询列
    addToTableSearchColumn(node, current) {
      let exsitTbale = null
      if (node.resultTable) {
        exsitTbale = this.tableJson.find(item => item.tableNumber === node.id)
      } else {
        exsitTbale = this.tableJson.find(item => item.tableId === node.id)
      }
      if (exsitTbale) {
        const newTable = deepClone(exsitTbale)
        newTable.unionType = '1'
        this.headData.push(newTable)
        this.freshTable = false
        this.$nextTick(_ => {
          this.freshTable = true
        })
      } else {
        baseRequest('/basic/columns/getColumnsByTableId', { tableId: node.id }).then(response => {
          const colunms = response.data.item
          colunms.map((item, index) => {
            item.columnNumber = current + index + 1
            item.columnChnName = item.columnchnname || ''
            item.columnId = item.columnid
            item.columnName = item.columnname
            return item
          })
          this.headData.push({
            'tableNumber': current,
            'tableType': '1', // '1' 原始表 '2' 结果表
            'tableId': node.id,
            'tableName': node.tableName,
            'tableChnName': node.name || '',
            'schemaName': node.schemaName,
            'T05ModelColumn': colunms,
            'unionType': '1'
          })
          this.freshTable = false
          this.$nextTick(_ => {
            this.freshTable = true
          })
        })
      }
    },
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
    getCurrenthRow(row) {
      this.currentRow = row
    },
    // 删除
    deleteHandle() {
      if (this.currentRow) {
        const index = this.tableData.findIndex((item, index, arr) => {
          return item === this.currentRow
        })
        if (index !== -1) {
          this.tableData.splice(index, 1)
        }
        this.currentRow = null
        this.$nextTick(_ => {
          const allRow = document.querySelectorAll('.addTable .el-table__row')
          for (const rowDom of allRow) {
            rowDom.classList.remove('current-row')
          }
        })
      } else {
        this.$message.warning('请选中数据')
      }
    },
    // 向上
    upHandle() {
      if (this.currentRow) {
        this.tableData.find((item, index, arr) => {
          if (item === this.currentRow && index !== 0) {
            arr.splice(index, 1)
            arr.splice(index - 1, 0, item)
            return
          }
        })
      }
    },
    // 向下
    downHandle() {
      if (this.currentRow) {
        for (const [index, item] of this.tableData.entries()) {
          if (item === this.currentRow && index !== this.tableData.length - 1) {
            this.tableData.splice(index, 1)
            this.tableData.splice(index + 1, 0, item)
            break
          }
        }
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
.dialog-contant-default.addtable-dialog {
  padding-bottom: 0;
}
.addTable {
  height: 100%;
  .el-table th .cell div {
    overflow: initial;
  }
  .at-node {
    border: 1px solid #e4e7ed;
    height: 60px;
    position: relative;
    padding-left: 20px;
    padding-top: 10px;
    h4 {
      margin: 0;
      position: absolute;
      top: -10px;
      left: 20px;
      line-height: 23px;
      background: #fff;
      padding: 0 3px;
    }
  }
  .search-panel {
    height: calc(100% - 70px);
    margin-top: 10px;
    .search-panel-left {
      height: 100%;
      float: left;
      width: calc(100% - 60px);
      .data-table {
        height: 100%;
        overflow: auto;
        // .el-table--striped .el-table__body tr.el-table__row--striped.current-row td, .el-table__body tr.current-row>td, .el-table__body tr.hover-row.current-row>td, .el-table__body tr.hover-row.el-table__row--striped.current-row>td, .el-table__body tr.hover-row.el-table__row--striped>td, .el-table__body tr.hover-row>td{
        //         background-color: #42b983;
        // }
      }
    }
    .search-panel-right {
      float: left;
      width: 60px;
      height: 100%;
      text-align: center;
      background-color: #f3f3f3;
      .right-button {
        margin-top: 15px;
      }
    }
  }
}
</style>
