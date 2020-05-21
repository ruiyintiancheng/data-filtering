/*
 * @Author: lk 
 * @Date: 2019-07-22 14:22:15 
 * @Last Modified by: wk
 * @Last Modified time: 2020-05-21 10:40:53
 * @Description:  sql查询-解析sql表设置
 */
<template>
  <div class="table-setting">
    <!-- 列表开始 -->
    <el-table v-if="visTable"
              :data="tableData"
              v-loading="listLoading"
              element-loading-text="给我一点时间"
              fit
              border
              stripe
              :height="tableHeight"
              style="width: 100%">
      <el-table-column align="center"
                       label="别名">
        <template slot-scope="scope">
          {{scope.row.columnAlias}}
        </template>
      </el-table-column>
      <el-table-column align="center"
                       label="字段">
        <template slot-scope="scope">
          {{scope.row.columnContent}}
        </template>
      </el-table-column>
      <el-table-column align="center"
                       label="表头">
        <template slot-scope="scope">
          <el-input clearable
                    v-model="scope.row.columnName"></el-input>
        </template>
      </el-table-column>
      <el-table-column align="center"
                       label="组件类型"
                       width="280">
        <template slot-scope="scope">
          <el-select style="width:120px;"
                     v-model="scope.row.componentType"
                     @change="componentTypeChange($event,scope.row)">
            <el-option value="1"
                       label="输入框"></el-option>
            <el-option value="2"
                       label="下拉框"></el-option>
            <el-option value="3"
                       label="日期框"></el-option>
            <el-option value="4"
                       label="查询组件"></el-option>
          </el-select>
          <el-select v-if="scope.row.componentType === '2'"
                     style="width:120px;"
                     v-model="scope.row.componentParam"
                     @change="componentParamChange($event,scope.row)">
            <el-option v-for="(text,value) in selectOptions"
                       :key="value"
                       :value="value"
                       :label="text"></el-option>
          </el-select>
          <el-select v-else-if="scope.row.componentType === '3'"
                     style="width:120px;"
                     v-model="scope.row.componentParam"
                     @change="componentParamChange($event,scope.row)">
            <el-option value="1"
                       label="2019"></el-option>
            <el-option value="2"
                       label="201901"></el-option>
            <el-option value="3"
                       label="20190101"></el-option>
            <el-option value="4"
                       label="20190101 23"></el-option>
            <el-option value="5"
                       label="20190101 23:59"></el-option>
            <el-option value="6"
                       label="20190101 23:59:59"></el-option>
            <el-option value="7"
                       label="23"></el-option>
            <el-option value="8"
                       label="23:59"></el-option>
            <el-option value="9"
                       label="23:59:59"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column align="center"
                       label="显示">
        <template slot-scope="scope">
          <el-checkbox v-model="scope.row.displayFlag"
                       true-label="1"
                       false-label="0"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column align="center"
                       label="操作"
                       width="250">
        <template slot-scope="scope">
          <el-button v-if="scope.row.queryJson"
                     size="mini"
                     plain
                     type="primary"
                     @click="updateCondition(scope.row)">修改条件</el-button>
          <el-button v-else
                     size="mini"
                     plain
                     @click="addCondition(scope.row)">添加条件</el-button>
          <el-button :disabled="scope.$index === 0"
                     size="mini"
                     plain
                     @click="upHandle(scope)">上移</el-button>
          <el-button :disabled="scope.$index === tableData.length-1"
                     size="mini"
                     plain
                     @click="downHandle(scope)">下移</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 列表结束 -->
    <!-- 条件筛选开始 -->
    <el-dialog :title="currentRow?currentRow.columnAlias:'条件'"
               append-to-body
               v-el-drag-dialog
               :close-on-click-modal="false"
               :visible.sync="conditionDialogVisable"
               width="40%"
               custom-class="dialog-default">
      <div class="dialog-contant-default"
           v-if="conditionDialogVisable">
        <condition-option ref="conditionOption"
                          :queryJson="queryJson"
                          :componentType="componentType"
                          :componentParam="componentParam"></condition-option>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="conditionDialogVisable = false">取消</el-button>
        <el-button @click="clearCondition">清除</el-button>
        <el-button type="primary"
                   @click="confirmCondition()">保存</el-button>
      </div>
    </el-dialog>
    <!-- 调价筛选结束  -->
  </div>
</template>
<script>
import conditionOption from '../../../components/ConditionOption'
import { baseRequest } from '@/api/base'
export default {
  props: {
    dataSourceCondition: Object
  },
  components: {
    conditionOption
  },
  data() {
    return {
      // 加载遮罩
      listLoading: false,
      // 列表数据
      tableData: [],
      // 排序列表
      orderData: [],
      // 当前添加或修改 1:添加 2修改
      opiontStatus: '1',
      // 操作当前列
      currentRow: null,
      // 筛选弹框显示
      conditionDialogVisable: false,
      // json数据
      queryJson: null,
      // 刷新列表
      visTable: true,
      // 行组件类型
      componentType: null,
      // 下拉类型
      selectOptions: {},
      // 下拉类型值
      componentParam: null
    }
  },
  computed: {
    tableHeight() {
      return this.$store.state.app.dialogHeight - 190
    }
  },
  created() {
    this.getSelectOptions()
    this.getList()
  },
  methods: {
    // 获取下拉类型
    getSelectOptions() {
      baseRequest('/basic/common/getSelectOptions', { dictType: 'basicDictType' }).then(response => {
        this.selectOptions = response.data.item
      })
    },
    // 获取去列表
    getList() {
      this.listLoading = true
      baseRequest('/basic/sqlConfig/parseQuerySql', this.dataSourceCondition).then(response => {
        this.tableData = response.data.item.tableData
        this.orderData = response.data.item.orderData
        this.listLoading = false
      })
    },
    // 改变组件类型
    componentTypeChange(val, row) {
      row.queryJson = null
      row.componentParam = null
      this.visTable = false
      this.$nextTick(_ => {
        this.visTable = true
      })
    },
    // 改变选项类型
    componentParamChange(val, row) {
      row.queryJson = null
      this.visTable = false
      this.$nextTick(_ => {
        this.visTable = true
      })
    },
    // 添加条件
    addCondition(row) {
      if (row.componentType !== '1' && !row.componentParam) {
        this.$message.warning('请选择类型')
        return
      }
      this.opiontStatus = '1'
      this.currentRow = row
      this.queryJson = null
      this.queryJson = [
        {
          symbol: null,
          value: null,
          radio: 'and'
        }
      ]
      this.componentType = row.componentType
      this.componentParam = row.componentParam
      this.conditionDialogVisable = true
    },
    // 修改条件
    updateCondition(row) {
      this.opiontStatus = '2'
      this.currentRow = row
      this.queryJson = JSON.parse(row.queryJson)
      this.componentType = row.componentType
      this.componentParam = row.componentParam
      this.conditionDialogVisable = true
    },
    // 确认条件
    confirmCondition() {
      this.$refs.conditionOption.judgeConditionNull().then(_ => {
        this.currentRow.queryJson = JSON.stringify(this.$refs.conditionOption.queryJson)
        this.conditionDialogVisable = false
        this.visTable = false
        this.$nextTick(_ => {
          this.visTable = true
        })
      }).catch(_ => {
        this.$message.error('保存选项不能为空')
      })
    },
    // 清空条件
    clearCondition() {
      this.currentRow.queryJson = null
      this.conditionDialogVisable = false
      this.visTable = false
      this.$nextTick(_ => {
        this.visTable = true
      })
    },
    // 下移
    downHandle(scope) {
      this.tableData.splice(scope.$index, 1)
      this.tableData.splice(scope.$index + 1, 0, scope.row)
    },
    // 上移
    upHandle(scope) {
      this.tableData.splice(scope.$index, 1)
      this.tableData.splice(scope.$index - 1, 0, scope.row)
    }
  }
}
</script>
