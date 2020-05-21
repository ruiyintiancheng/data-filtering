<template>
  <div>
    <el-dialog title="表达式编辑器"
               v-el-drag-dialog
               append-to-body
               :close-on-click-modal="false"
               :visible.sync="dialogBDS"
               width="70%"
               top="5vh"
               custom-class="dialog-default express-edit-dialog">
      <div class="dialog-contant-default express-dialog">
        <div class="express-content">
          <div class="express-tool">
            <div class="express-text-area"><span>表达式文本: </span><br /><span style="color: #F56C6C;">{{ expressText }}</span></div>
            <div class="express-btn-area"
                 style="width: 100%; min-height: 40px; border: 1px solid #ccc; padding: 5px;">
              <el-button size="mini"
                         v-for="(item,index) in expressArray"
                         :key="index"
                         :type="currentValue === item.id ? 'primary' : ''"
                         @click="selectValue(expressData, index, item)">
                {{ item.name }}
              </el-button>
            </div>
            <!-- <el-input type="textarea" disabled v-model="expressText"  autosize ></el-input> -->
            <div class="express-options">
              <el-button v-for="(item, index) in experessOption"
                         :key="index"
                         @click="addText(item.name, item.type, item.value)"
                         size="mini"
                         :class="item.class">
                {{item.name}}
              </el-button>
            </div>
            <div class="express-status clearfix">
              <div class="is-null">
                <el-button size="mini"
                           @click="addText('IS NULL', 1,'is null')">IS NULL</el-button>
                <el-button size="mini"
                           @click="addText('IS NOT NULL', 1,'is not null')">IS NOT NULL</el-button>
                <el-button size="mini"
                           @click="openParam">可变参数</el-button>
              </div>
              <div class="update">
                <!-- <el-button size="small" @click="revocation">撤销</el-button> -->
                <el-button size="small"
                           @click="menuType = 'insert'"
                           :type="menuType === 'insert' ? 'primary' : ''">
                  插入
                </el-button>
                <!-- <el-button size="small" @click="menuType = 'update'"
                            :type="menuType === 'update' ? 'primary' : ''">
                            修改
                          </el-button> -->
                <el-button type='danger'
                           size="small"
                           @click="deleteData">删除</el-button>
                <el-button type='danger'
                           size="small"
                           @click="removeExpress">清除表达式</el-button>
              </div>
            </div>
          </div>
          <el-tabs v-model="activeName"
                   type="card"
                   class="data-options">
            <el-tab-pane label="数据"
                         name="sqlData">
              <el-row :gutter="20"
                      :style="{marginLeft:0,marginRight:0}">
                <el-col :style="{height:optionsHeight+'px',overflowY:'hidden'}"
                        :span="8">
                  <h3 class="express-data-title">字段</h3>
                  <div class="express-data-abledField">
                    <el-tree default-expand-all
                             :data="treeData"
                             :props="defaultProps"
                             @node-click="treeClick">
                    </el-tree>
                  </div>
                </el-col>
                <el-col :style="{height:optionsHeight+'px',overflowY:'hidden'}"
                        :span="16">
                  <h3 class="express-data-title">参数</h3>
                  <div class="express-data-valueField">
                    <el-table border
                              stripe
                              fit
                              :data="tableColum"
                              @row-click="tableClick"
                              style="width: 100%; cursor: pointer;">
                      <el-table-column align="center"
                                       prop="name"
                                       label="参数名称"></el-table-column>
                      <el-table-column align="center"
                                       prop="label"
                                       label="参数描述"></el-table-column>
                    </el-table>
                  </div>
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane label="函数"
                         name="sqlMethod">
              <el-row :gutter="20"
                      :style="{marginLeft:0,marginRight:0}">
                <el-col :style="{height:optionsHeight2+'px',overflowY:'hidden'}"
                        :span="12">
                  <h3 class="express-data-title">类别:</h3>
                  <div class="express-data-abledField">
                    <div v-for="(item, index) in funData"
                         :key="index"
                         :class="funIndex === index ? 'sel' : ''"
                         @click="funIndex = index"
                         class="mycolumn">
                      {{item.name}}
                    </div>
                  </div>
                </el-col>
                <el-col :style="{height:optionsHeight2+'px',overflowY:'hidden'}"
                        :span="12">
                  <h3 class="express-data-title">函数:</h3>
                  <div class="express-data-valueField"
                       style="user-select: none;">
                    <div v-for="(item, index) in funColumn"
                         :key="index"
                         class="sqlEditMycolumn"
                         @click="addFunDesc(item)">
                      <span>{{item.name}} </span>
                      <el-button type="text"
                                 size="mini"
                                 @click="addValue(item.data);revocation()"
                                 style="margin-left: 10px; padding: 5px;float:right;">添加</el-button>
                    </div>
                  </div>
                </el-col>
              </el-row>
              <div style="width: 100%; min-height: 60px; border: 1px solid #ccc; padding: 5px;">
                {{ funDesc }}
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <div>
          <el-button type="primary"
                     @click="saveSqlEdit">确定</el-button>
          <el-button @click="dialogBDS=false">关闭</el-button>
        </div>
      </div>
      <el-dialog title="参数编辑"
                 width="30%"
                 :visible.sync="dialogParam"
                 append-to-body>
        <div style="margin: 10px 50px;">
          <el-form @submit.native.prevent
                   label-position="right"
                   size="mini"
                   label-width="100px">
            <el-form-item label="参数内容:">
              <el-input v-model="paramText"></el-input>
            </el-form-item>
          </el-form>
        </div>
        <span slot="footer"
              class="dialog-footer">
          <el-button type="primary"
                     @click="submitParam">确 定</el-button>
          <el-button @click="dialogParam = false">取 消</el-button>
        </span>
      </el-dialog>
    </el-dialog>
  </div>
</template>
<script>
import elDragDialog from '@/directive/el-dragDialog'
import { baseRequest } from '@/api/base'
export default {
  directives: { elDragDialog },
  props: {
    optionsTree: Array,
    modelParam: Object,
    dbType: String
  },
  computed: {
    tableData: function() {
      return this.modelParam
    },
    // treeData: function() {
    //   return this.optionsTree.filter(item => item.joinType)
    // },
    expressText: function() {
      var text = ''
      this.expressArray.forEach(item => {
        if (item.type === 4) {
          text += item.name
        } else {
          text += item.name + ' '
        }
      })
      return text
    },
    expressArray: function() {
      const arr = []
      this.traverse('', this.deCopy(this.expressData), arr)
      return arr
    },
    tableColum: function() {
      const data = []
      for (const per in this.tableData) {
        data.push({
          'name': per,
          'label': this.tableData[per].paramName,
          'value': this.tableData[per].defaultValue
        })
      }
      return data
    },
    funColumn: function() {
      return this.funData[this.funIndex] ? this.funData[this.funIndex].children : []
    },
    expressArrayLength: function() {
      return this.expressArray.length
    }
  },
  watch: {
    expressArrayLength() {
      this.getExpressHeight()
    },
    menuType(value) {
      if (value === 'update') {
        document.querySelector('.data-options').addEventListener('click', this.revocation)
      } else {
        document.querySelector('.data-options').removeEventListener('click', this.revocation)
      }
    }
  },
  // type: 1:运算符 2 连接符 3 常量 4 字段(表idx.字段idx) 5 函数 6 函数参数 7 函数固定值 8 可变参数 9.变量
  // type: 1.固定字符 2.字段 3.变量 4.函数 5.可变参数
  data() {
    return {
      treeData: [],
      // 选项高度
      optionsHeight: 0,
      optionsHeight2: 0,
      dialogBDS: false,
      dialogParam: false,
      activeName: 'sqlData',
      currentData: null,
      currentValue: null, // 选中的按钮
      menuType: '', // 功能类型
      paramText: '', // 可变参数
      experessOption: [
        { name: '+', class: '', type: 1, value: '+' },
        { name: '-', class: '', type: 1, value: '-' },
        { name: '*', class: '', type: 1, value: '*' },
        { name: '/', class: '', type: 1, value: '/' },
        { name: '%', class: '', type: 1, value: '%' },
        { name: 'and', class: 'first', type: 1, value: 'and' },
        { name: 'or', class: '', type: 1, value: 'or' },
        { name: 'not', class: '', type: 1, value: 'not' },
        { name: '=', class: 'first', type: 1, value: '=' },
        { name: '<>', class: '', type: 1, value: '<>' },
        { name: '<', class: '', type: 1, value: '<' },
        { name: '<=', class: '', type: 1, value: '<=' },
        { name: '>', class: '', type: 1, value: '>' },
        { name: '>=', class: '', type: 1, value: '>=' },
        { name: 'like', class: '', type: 1, value: 'like' },
        { name: '(X)', class: 'first', type: 1, value: '(X)' },
        { name: '\'X\'', class: '', type: 1, value: '\'X\'' },
        { name: ',', class: '', type: 1, value: ',' }
      ],
      expressValue: '',
      expressData: [],
      defaultProps: {
        children: 'T05ModelColumn',
        label: function(data, node) {
          return node.isLeaf ? `${data.columnName}(${data.columnChnName})` : `${data.tableName}(${data.tableChnName})`
        }
      },
      // 函数数据
      funIndex: 0,
      funData: [],
      funDesc: '函数描述' // 函数描述
    }
  },
  methods: {
    // 获取选项的高度
    getExpressHeight() {
      this.$nextTick(_ => {
        const textArea = document.querySelector('.express-tool')
        this.optionsHeight = window.innerHeight * 0.9 - 186 - textArea.offsetHeight
        this.optionsHeight2 = window.innerHeight * 0.9 - 266 - textArea.offsetHeight
      })
    },
    traverse(index, data, array) { // 树的前序遍历
      for (let i = 0; i < data.length; i++) {
        const d = data[i]
        d.id = index + i
        array.push(d)
        const children = d.children
        if (children) {
          this.traverse(d.id + '-', children, array)
        }
      }
      return array
    },
    // 获取函数
    getDecode() {
      baseRequest('/basic/t05DbFunction/getDbFunctions', { dbType: this.dbType }).then(response => {
        this.funData = response.data.item
      })
    },
    createSqlEdit() { // 新建表达式编辑器
      this.treeData = this.optionsTree.filter(item => item.joinType)
      this.getDecode()
      this.expressData = []
      this.removeExpress()
      this.dialogBDS = true
      this.getExpressHeight()
    },
    openSqlEdit(data) { // 编辑
      this.treeData = this.optionsTree.filter(item => item.joinType)
      this.getDecode()
      this.expressData = data
      this.revocation()
      this.dialogBDS = true
      this.getExpressHeight()
    },
    saveSqlEdit() {
      if (this.expressData.length <= 0) {
        this.$message.warning('表达式不能为空')
        return
      }
      this.dialogBDS = false
      this.$emit('saveCloumn', this.expressData)
    },
    removeSqlEdit() {
      this.removeExpress()
    },
    removeExpress() { // 清空表达式
      this.expressData = []
      this.revocation()
    },
    treeClick(data, node) { // 添加字段
      if (node.isLeaf === false) {
        return
      }
      const parent = node.parent.data
      const name = node.parent.label + '.' + node.label
      // const name = parent.tableChnName + '.' + data.columnChnName
      const value = parent.tableName ? parent.tableName : parent.tableChnName + '.' + data.columnName
      const columnName = data.columnName
      this.addValue({ 'name': name, 'type': 2, 'value': value, 'tableIdx': parent.tableIdx, 'columnName': columnName })
      this.revocation()
    },
    tableClick(row) { // 添加变量
      this.addValue({ 'name': row.label, 'type': 3, 'value': row.name })
      this.revocation()
    },
    selectValue(data, index, val) {
      this.menuType = 'update'
      this.currentValue = val.id
      this.currentData = data
    },
    openParam() {
      this.paramText = ''
      this.dialogParam = true
    },
    addFunDesc(item) { // 函数描述
      this.funDesc = item.functionDesc
    },
    submitParam() {
      this.addValue({ 'name': this.paramText, 'type': 5, 'value': this.paramText })
      this.dialogParam = false
    },
    addText(name, type, value) {
      if (name === '(X)') {
        this.addValue({ 'name': '(', 'type': type, 'value': '(' })
        this.addValue({ 'name': 'X', 'type': type, 'value': 'X' })
        this.addValue({ 'name': ')', 'type': type, 'value': ')' })
      } else if (name === '\'X\'') {
        this.addValue({ 'name': '\'', 'type': type, 'value': '\'' })
        this.addValue({ 'name': 'X', 'type': type, 'value': 'X' })
        this.addValue({ 'name': '\'', 'type': type, 'value': '\'' })
      } else {
        this.addValue({ 'name': name, 'type': type, 'value': value })
      }
      this.revocation()
    },
    addValue(val) { // 添加
      val = this.deCopy(val)
      if (this.menuType === 'insert') {
        this.insertData(val)
        this.menuType = ''
      } else if (this.menuType === 'update') {
        this.updateData(val)
        this.menuType = ''
      } else {
        this.expressData.push(val)
      }
    },
    revocation() { // 撤销
      this.currentValue = null
      this.menuType = ''
    },
    insertData(val) { // 插入
      this.getExpressById(this.currentValue, (parent, index) => {
        parent.splice(index, 0, val)
      })
    },
    updateData(val) { // 修改
      this.getExpressById(this.currentValue, (parent, index) => {
        this.$set(parent, index, val)
      })
    },
    deleteData() { // 删除
      if (this.currentValue === null) {
        return
      }
      this.getExpressById(this.currentValue, (parent, index) => {
        parent.splice(index, 1)
      })
      this.revocation()
    },
    getExpressById(id, callback) { // 根据id获取对应数据
      const indexs = id.split('-')
      let data = this.expressData
      let parent = null
      let index = null
      for (let i = 0; i < indexs.length; i++) {
        index = parseInt(indexs[i])
        parent = data
        data = data[index].children
      }

      callback(parent, index) // parent 所在的数组 index 对应数组的位置
    },
    deCopy(data) { // 深拷贝
      return JSON.parse(JSON.stringify(data))
    }
  }
}
</script>
<style lang="scss">
.express-edit-dialog {
  height: 90%;
}
.dialog-contant-default.express-dialog {
  padding-bottom: 0;
  .express-content {
    .express-text-area {
      line-height: 20px;
    }
    .express-options {
      .el-button + .el-button {
        margin-top: 10px;
        margin-left: 3px;
        &.first {
          margin-left: 20px;
        }
      }
    }
    .express-status {
      margin-top: 10px;
      .is-null {
        width: 50%;
        float: left;
      }
      .update {
        width: 50%;
        float: left;
        text-align: right;
      }
    }
    .express-data-title {
      margin: 0;
    }
    .express-data-abledField,
    .express-data-valueField {
      // height: 400px;
      // border:1px solid #ccc;
      overflow: auto;
      background-color: #fff;
      height: calc(100% - 18px);
    }
  }
}
.sqlEditMycolumn {
  cursor: pointer;
  height: 26px;
  line-height: 26px;
  padding-left: 20px;
}
.sqlEditMycolumn.sel {
  background-color: #f5f7fa;
}
.sqlEditMycolumn:hover {
  background-color: #f5f7fa;
}
</style>

