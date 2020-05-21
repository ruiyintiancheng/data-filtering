<template>
  <div class="model-sql clearfix">
      <textarea id="modelSql" name="code" style="width:100%;height:100%;display:none"></textarea>
  </div>
</template>
<script>
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
  props: {
    sql: String
  },
  data() {
    return {
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
      editor: null
    }
  },
  methods: {
    getData() {
      // 出书画编辑区域
      var mime = 'text/x-sql'
      this.editor = CodeMirror.fromTextArea(
        document.getElementById('modelSql'),
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
          gutters: ['CodeMirror-lint-markers']
          // hintOptions: {
          //   tables: data
          // }
        }
      )
      this.setSql(this.sql)
      this.formatter()
      this.editor.setSize(this.codeWidth, this.codeHeigth)
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
    }
  },

  mounted() {
    this.codeWidth = '100%'
    const height = this.$store.state.app.dialogHeight - 140
    this.codeHeigth = height + 'px'
    this.getData()
  }
}
</script>

<style lang="scss">
.model-sql{
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


