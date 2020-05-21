/*
 * @Author: 1k 
 * @Date: 2019-08-01 10:09:22 
 * @Last Modified by: 1k
 * @Last Modified time: 2019-08-06 13:38:04
 * @Description:  函数配置
 */
<template>
  <div class="app-container">
    <div class="base-row">
      <div class="row-botton clearfix">
        <div class="row-title">
          <svg-icon icon-class="search" />
          <span>筛选查询</span>
        </div>
        <div class="row-option">
          <el-button icon="el-icon-search"
                     @click="searchOption"
                     type="primary">查询</el-button>
          <el-button icon="el-icon-refresh"
                     @click="getOption">重置</el-button>
          <a @click="searchToggle=false"
             v-if="searchToggle">
            <svg-icon icon-class="up" />&nbsp;收起</a>
          <a @click="searchToggle=true"
             v-else>
            <svg-icon icon-class="down" />&nbsp;展开</a>
        </div>
      </div>
      <search-form v-show="searchToggle"
                   ref="searchForm"
                   :searchFormData="configData"></search-form>
    </div>
    <div class="base-row">
      <div class="row-botton clearfix">
        <div class="row-title">
          <svg-icon icon-class="ul" />
          <span>数据列表</span>
        </div>
        <div class="row-option">
          <el-button icon="el-icon-plus"
                     @click="addTask()">添加</el-button>
          <a @click="tableToggle=false"
             v-if="tableToggle">
            <svg-icon icon-class="up" />&nbsp;收起</a>
          <a @click="tableToggle=true"
             v-else>
            <svg-icon icon-class="down" />&nbsp;展开</a>
        </div>
      </div>
      <basic-table v-show="tableToggle"
                   ref="basicTable"
                   :tableOption="configData"
                   :pagenation="true"
                   :rowNum="true">
        <el-table-column slot="optionColumn"
                         label="操作"
                         fixed="right"
                         align="center"
                         width="250">
          <template slot-scope="scope">
            <el-button type="success"
                       plain
                       size="mini"
                       @click="updateCondition(scope.row)">配置</el-button>
            <el-button type="primary"
                       plain
                       size="mini"
                       @click="updateOption(scope.row)">修改</el-button>
            <el-button type="danger"
                       plain
                       size="mini"
                       @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </basic-table>
    </div>
    <!-- 添加  修改 -->
    <el-dialog :title="dialogTitle[operateStatus]"
               :visible.sync="formVisible"
               width="40%"
               custom-class="dialog-default">
      <div class="dialog-contant-default-addOrUpdate">
        <el-form class="baseUpdate-form"
                 ref="form"
                 :rules="addRules"
                 :model="updateFormData"
                 label-width="100px">
          <el-form-item label="数据源类型"
                        prop="dbType">
            <el-select v-model="updateFormData.dbType"
                       size="small"
                       clearable
                       placeholder="">
              <el-option v-for="(item,index) in functionFormData.dbType"
                         :key="index"
                         :label="item"
                         :value="index"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="函数类别"
                        prop="functionType">
            <el-select v-model="updateFormData.functionType"
                       size="small"
                       clearable
                       placeholder="">
              <el-option v-for="(item,index) in functionFormData.functionType"
                         :key="index"
                         :label="item"
                         :value="index"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="函数名称"
                        prop="functionName">
            <el-input class="form-input"
                      v-model="updateFormData.functionName"
                      clearable></el-input>
          </el-form-item>
          <el-form-item label="函数描述">
            <el-input class="form-input"
                      v-model="updateFormData.functionDesc"
                      clearable></el-input>
          </el-form-item>

        </el-form>
      </div>
      <div slot="footer"
           class="dialog-footer-addOrUpdate">
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary"
                   @click="saveOperate()">保存</el-button>
      </div>
    </el-dialog>
    <!-- 条件筛选开始 -->
    <el-dialog :title="currentRow?currentRow.functionName:'条件'"
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
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import UpdateForm from 'update-form-ry'
import conditionOption from './components/index'
import { baseRequest } from '@/api/base'
import { saveUpdate } from '@/utils/validate'
const url = '/basic/t05DbFunction/selects'
export default {
  directives: {},
  name: 'functionConfigurationIndex',
  components: {
    SearchForm,
    BasicTable,
    UpdateForm,
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
      queryJson: {},
      // 刷新列表
      visTable: true,
      // 行组件类型
      componentType: null,
      // 下拉类型
      selectOptions: {},
      // 下拉类型值
      componentParam: null,
      functionFormData: {},
      configData: {}, // 模板数据
      searchToggle: true,
      tableToggle: true,
      updateFormData: {
        dbType: '',
        functionDesc: '',
        functionName: '',
        functionType: ''
      }, // 弹框数据
      formVisible: false, // 弹框开关
      operateStatus: null, // 操作选项
      dialogTitle: { // 弹框标题
        1: '添加',
        2: '修改'
      },
      addRules: {// 校验
        dbType: [{
          required: true, message: '请选择数据源类别'
        }],
        functionType: [{
          required: true, message: '请选择函数类型'
        }],
        functionName: [{
          required: true, message: '请填写函数名称'
        }]
      },
      parameters: {
        dbType: {
          '1': 'mysql',
          '2': 'oracle',
          '3': 'db2',
          '4': 'hive'
        },
        functionType: {
          '1': '聚合',
          '2': '类型转换',
          '3': '数学函数',
          '4': '日期函数',
          '5': '字符串函数'
        }
      }
    }
  },
  created() {
    this.getOption()
  },
  methods: {
    searchOption() {
      this.$refs.basicTable.getData(url, this.$refs.searchForm.searchParam())
    },
    getOption() {
      baseRequest(url, { urlMode: '1' }).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.configData = result
        this.$nextTick(_ => {
          this.searchOption()
        })
      })
    },
    // 添加
    addTask() { // 显示 填写流程名和描述弹窗
      this.updateFormData.dbType = ''
      this.updateFormData.functionDesc = ''
      this.updateFormData.functionName = ''
      this.updateFormData.functionType = ''
      this.updateFormData.functionId = ''
      baseRequest('/basic/t05DbFunction/getAddData').then(response => {
        this.functionFormData = response.data.selectOptions
      })
      this.$nextTick(_ => {
        this.$refs.form.clearValidate()
      })
      this.operateStatus = 1
      this.formVisible = true
    },
    // 修改表单
    updateOption(row) {
      this.operateStatus = 2
      this.getUpdateForm(row)
      this.updateFormData.functionId = row.functionId
      // this.paramData.addFlag = false
      // this.paramData.flowId = row.flowId
      // this.$refs.addFlow.openDialog()
    },
    // 获取修改表单
    getUpdateForm(row) {
      const param = {
        functionId: row.functionId
      }
      baseRequest('/basic/t05DbFunction/select', param).then(response => {
        this.updateFormData = response.data.item
        this.functionFormData = response.data.selectOptions
        this.formVisible = true
      })
    },
    // 保存操作
    saveOperate() {
      if (this.operateStatus === 1) {
        saveUpdate('/basic/t05DbFunction/add', this.updateFormData, this.addRules, this.$refs.form).then(() => {
          this.searchOption()
          this.$Message.success('操作成功')
          this.formVisible = false
        })
      } else {
        saveUpdate('/basic/t05DbFunction/update', this.updateFormData, this.addRules, this.$refs.form).then(() => {
          this.searchOption()
          this.$Message.success('操作成功')
          this.formVisible = false
        })
      }
    },
    handleDelete(row) { // 删除
      this.$confirm('此操作将永久删除该资源, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const param = {
          functionId: row.functionId
        }
        baseRequest('/basic/t05DbFunction/delete', param).then(request => {
          this.searchOption()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      })
    },
    updateCondition(row) {
      if (!row.expression) {
        // if (row.componentType !== '1' && !row.componentParam) {
        //   this.$message.warning('请选择类型')
        //   return
        // }
        this.opiontStatus = '1'
        this.currentRow = row
        this.queryJson = null
        this.queryJson = [
          {
            name: null
          }
        ]

        this.conditionDialogVisable = true
      } else {
        // console.log(row.expression, 1)
        this.opiontStatus = '2'
        this.currentRow = row
        this.queryJson = JSON.parse(row.expression)
        this.conditionDialogVisable = true
        // this.queryJson.chlidren.pop()
        // this.queryJson.chlidren.shift()
        // this.queryJson.chlidren.foreach((item, index) => {
        //   if (item.name === ',') {
        //     this.queryJson.chlidren.splice(index, 1)
        //   }
        // })
      }
    },
    // 确认条件
    confirmCondition() {
      this.$refs.conditionOption.judgeConditionNull().then(_ => {
        const changeJson = this.$refs.conditionOption.queryJson
        // for (const iterator of changeJson.chlidren) {
        //   iterator.name = iterator.name
        //   iterator.value = iterator.name
        // }
        // changeJson.chlidren.foreach((item, index) => {
        //   if (item.name !== ',') {
        //     changeJson.chlidren.splice(index + 1, 1, { name: ',', type: 1, value: ',' })
        //   }
        // })
        // changeJson.chlidren.unshift({ name: '(', type: 1, value: '(' })
        // changeJson.chlidren.push({ name: ')', type: 1, value: ')' })
        // changeJson.value = changeJson.name
        // const lastChangeJson = {}
        // lastChangeJson.naem = changeJson[0].name
        // lastChangeJson.value = changeJson[0].value
        // lastChangeJson.type = 4
        // changeJson.splice(0, 1)
        // lastChangeJson.chlidren = changeJson
        this.currentRow.queryJson = JSON.stringify(changeJson)
        console.log(this.currentRow.queryJson)
        baseRequest('/basic/t05DbFunction/update', { functionId: this.currentRow.functionId, expression: this.currentRow.queryJson }).then(response => {
          this.searchOption()
          this.conditionDialogVisable = false
          this.visTable = false
          this.$Message.success('操作成功')
        })
        this.$nextTick(_ => {
          this.visTable = true
        })
      }).catch(_ => {
        this.$message.error('保存选项不能为空')
      })
    },
    // 清空条件
    clearCondition() {
      this.currentRow.expression = null
      this.conditionDialogVisable = false
      this.visTable = false
      this.$nextTick(_ => {
        this.visTable = true
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.dialog-contant-default-addOrUpdate {
  margin-top: 10px;
  padding: 0px;
  border: 0px;
}
.dialog-contant-default-addOrUpdate {
  .baseUpdate-form {
    margin-left: calc(50% - 150px);
    .form-input {
      width: 200px;
    }
  }
}
.dialog-contant-default-flowInfo {
  padding-top: 30px;
  .baseUpdate-form {
    margin-left: calc(50% - 160px);
    .form-input {
      width: 200px;
    }
  }
}
</style>