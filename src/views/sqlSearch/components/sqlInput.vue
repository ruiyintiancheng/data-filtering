<template>
  <div class="sql-input-fa clearfix">
    <div class="sql-input-le">
      <textarea :id="code"
                name="code"
                style="width:100%;height:100%;display:none"></textarea>
    </div>
    <div class="sql-input-ri"
         v-if="tableInfo"
         :style="{height:codeHeigth}">
      <div class="table-currnet-title">表信息</div>
      <el-input placeholder="输入表或用户查询"
                v-model="filterText">
        <el-button @click="searchTables"
                   slot="append"
                   icon="el-icon-search"></el-button>
      </el-input>
      <div :style="{height:'calc('+codeHeigth+' - 66px)',paddingTop:'10px',overflow:'auto'}">
        <el-tree class="filter-tree"
                 :data="treeData"
                 default-expand-all
                 ref="tree">
          <template slot-scope="{ node, data }">
            <!-- <el-tooltip class="item" effect="dark" :content="data.displayText" placement="top"> -->
            {{data.displayText}}
            <!-- </el-tooltip> -->
          </template>
        </el-tree>
      </div>
    </div>
  </div>
</template>
<script>
import { baseRequest } from '@/api/base'
import CodeMirror from 'codemirror'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/rubyblue.css'
require('script-loader!jsonlint')
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/json-lint'

import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/mode/sql/sql'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/sql-hint'
import 'codemirror/addon/selection/active-line'
import 'codemirror/theme/blackboard.css'
import sqlFormatter from 'sql-formatter'
export default {
  components: {
    baseRequest,
    CodeMirror,
    sqlFormatter
  },
  props: {
    contentHeight: String,
    id: String,
    code: String,
    dataSourceCondition: Object
  },
  data() {
    return {
      tableInfo: false,
      selText: '',
      codeWidth: null, // sql编辑区域的宽
      codeHeigth: null, // sql编辑区域的高
      smartIndent: true,
      styleActiveLine: true,
      lineNumbers: true, // 显示行号
      lineWrapping: true, // 自动换行
      matchBrackets: true, // 括号匹配
      autofocus: true, // 自动获取焦点
      indentUnit: 2, // 缩进,默认为2
      abSize: 4, // tab字符的宽度，默认为4
      returnData: null, // 执行sql返回的数据
      editor: null,
      tables: null, // 数据源表字段信息
      columns: null,
      filterText: '',
      treeData: []
    }
  },
  methods: {
    // 查询生成列
    searchTables() {
      const filterTextUp = this.filterText.toUpperCase()
      const filterTextLo = this.filterText.toLowerCase()
      if (this.tables.hasOwnProperty(filterTextUp)) {
        this.treeData = this.tables[filterTextUp]
      } else if (this.tables.hasOwnProperty(filterTextLo)) {
        this.treeData = this.tables[filterTextLo]
      } else {
        this.treeData = []
        this.$message.warning('没有查到该信息')
      }
    },
    getData() {
      // 出书画编辑区域
      const param = { dataSourceMessage: this.dataSourceCondition, dsCode: this.dataSourceCondition.dataSourceCode }
      baseRequest('/basic/sqlExecute/getTablesAndColumns', param).then(response => {
        const data = response.data.item
        this.tables = data
        var mime = 'text/x-sql'
        this.editor = CodeMirror.fromTextArea(
          document.getElementById(this.code),
          {
            mode: mime, // 模型类型
            indentWithTabs: true,
            smartIndent: this.smartIndent, // 默认缩进
            styleActiveLine: this.styleActiveLine, // 当前行高亮
            lineNumbers: this.lineNumbers, // 显示行号
            lineWrapping: this.lineWrappingthis, // 自动换行
            matchBrackets: this.matchBrackets, // 括号匹配
            autofocus: this.autofocus, // 自动获取焦点
            extraKeys: { 'Ctrl-Space': 'autocomplete' },
            // theme: 'blackboard', // 编辑框的主题
            indentUnit: this.indentUnit, // 缩进,默认为2
            abSize: this.abSize, // tab字符的宽度，默认为4
            gutters: ['CodeMirror-lint-markers'],
            hintOptions: {
              tables: data
            }
          }
        )
        this.editor.on('keyup', function(cm, event) {
          // 所有的字母和'$','{','.'在键按下之后都将触发自动完成
          if (
            !cm.state.completionActive &&
            ((event.keyCode >= 65 && event.keyCode <= 90) ||
              event.keyCode === 52 ||
              event.keyCode === 219 ||
              event.keyCode === 190)
          ) {
            CodeMirror.commands.autocomplete(cm, null, {
              completeSingle: false
            })
          }
        })
        // this.editor.on('cursorActivity', this.hiddenColumn)
        // this.editor.on('dblclick', this.showColumn) // 双击事件

        this.editor.setSize(this.codeWidth, this.codeHeigth)
        if (this.dataSourceCondition.sqlId || this.dataSourceCondition.sqlId === 0) {
          baseRequest('/basic/sqlConfig/select', { sqlId: this.dataSourceCondition.sqlId }).then(response => {
            this.setSql(response.data.item.sqlContent)
          })
        }
        this.tableInfo = true
      })
    },
    setSqlnputCss(width, height) {
      // 设置输入sql区域的大小
      // this.codeWidth = width
      this.codeHeigth = height
      this.editor.setSize(this.codeWidth, this.codeHeigth)
    },
    getConfig(faConfig, defaultConfig) {
      // 将子组件和父组件的配置进行整合
      if (typeof faConfig === 'undefined') {
        return defaultConfig
      } else {
        return faConfig
      }
    },
    formatter() {
      // 输入sql进行格式化
      this.editor.setValue(sqlFormatter.format(this.editor.getValue()))
    },
    getSql() {
      // 获取sql语句
      return this.editor.getValue()
    },
    setSql(sql) {
      // 设置sql语句
      this.editor.setValue(sql)
    },
    reset(sqlValue) {
      // 设置sql编辑区域的值
      this.editor.setValue('')
    },
    searchOptionSql() {
      this.selText = this.editor.getSelection()
    }
  },

  mounted() {
    // 初始化编辑框的属性,调用的组件未传值的使用默认值
    this.smartIndent = this.$options.methods.getConfig(
      this.$parent.smartIndent,
      this.smartIndent
    )
    this.styleActiveLine = this.$options.methods.getConfig(
      this.$parent.styleActiveLine,
      this.styleActiveLine
    )
    this.lineNumbers = this.$options.methods.getConfig(
      this.$parent.lineNumbers,
      this.lineNumbers
    )
    this.lineWrapping = this.$options.methods.getConfig(
      this.$parent.lineWrapping,
      this.lineWrapping
    )
    this.matchBrackets = this.$options.methods.getConfig(
      this.$parent.matchBrackets,
      this.matchBrackets
    )
    this.autofocus = this.$options.methods.getConfig(
      this.$parent.autofocus,
      this.autofocus
    )
    this.indentUnit = this.$options.methods.getConfig(
      this.$parent.indentUnit,
      this.indentUnit
    )
    this.abSize = this.$options.methods.getConfig(
      this.$parent.abSize,
      this.abSize
    )
    this.codeWidth = this.$parent.codeWidth || '100%'
    // this.codeHeigth = this.$parent.codeHeigth || '150px'
    this.codeHeigth = this.$parent.codeHeigth || this.contentHeight
    // 创建编辑框
    // this.$options.methods.formatter()
    this.getData()
  }
}
</script>

<style lang="scss">
.sql-input-fa {
  .sql-input-le {
    float: left;
    width: calc(100% - 300px);
  }
  .sql-input-ri {
    float: left;
    width: 300px;
    border-left: 1px solid #ccc;
    .table-currnet-title {
      font-size: 14px;
      height: 30px;
      line-height: 30px;
      padding-left: 10px;
      background: #f3f3f3;
      color: #9d9399;
    }
    .el-tree-node__content {
      font-size: 12px;
    }
  }
  .sqlInputDiv .CodeMirror {
    padding: 0;
    min-height: 150px;
  }
  .sqlInputDiv .CodeMirror .CodeMirror-scroll {
    min-height: 150px;
  }
  .columnInfo {
    background-color: white;
    border: 1px solid gray;
    font-size: 13px;
    padding: 5px;
    position: absolute;
    right: 0;
    z-index: 10;
    max-height: 150px;
    overflow-y: auto;
  }
  .columnInfo > ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
}
</style>


