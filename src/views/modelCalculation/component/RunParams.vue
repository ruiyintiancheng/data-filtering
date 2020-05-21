/*
 * @Author: lk 
 * @Date: 2019-10-18 14:16:16 
 * @Last Modified by: lk
 * @Last Modified time: 2019-10-18 14:19:54
 * @Description:  参数
 */
<template>
    <div class="run-params">
        <el-table
                :data="paramsArr"
                :border="true"
                :fit="true"
                :height="tableHeight"
                style="width: 100%;">
            <el-table-column align="center"
                            label="变量代码">
                            <template slot-scope="scope">
                                {{scope.row.code}}
                            </template>
                        </el-table-column>
                        <el-table-column align="center"
                            label="显示名">
                            <template slot-scope="scope">
                                {{scope.row.name}}
                            </template>
                        </el-table-column>
                        <el-table-column align="center"
                            label="数据类型">
                            <template slot-scope="scope">
                                {{scope.row.type | tableOption}}
                            </template>
                        </el-table-column>
                        <el-table-column align="center"
                            label="默认值">
                            <template slot-scope="scope">
                                {{scope.row.value}}
                            </template>
                        </el-table-column>
                        <el-table-column align="center"
                            label="参数值">
                            <template slot-scope="scope">
                                {{scope.row.paramValue}}
                            </template>
                        </el-table-column>
        </el-table>
    </div>
</template>
<script>
export default {
  props: {
    paramsArr: Array
  },
  computed: {
    tableHeight() {
      return this.$store.state.app.dialogHeight / 0.75 * 0.83 - 140
    }
  },
  filters: {
    tableOption: function(val) {
      const dataType = {
        '1': '字符',
        '2': '数值'
      }
      return dataType[val]
    }
  },
  methods: {
    // 判断字数提示
    textJug(text) {
      if (text) {
        text = text + ''
        if (text.length > 20) {
          return false
        } else {
          return true
        }
      } else {
        return true
      }
    }
  }
}
</script>
