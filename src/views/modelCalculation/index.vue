/*
 * @Author: Wk 
 * @Date: 2019-10-10 09:48:34 
 * @Last Modified by: wk
 * @Last Modified time: 2020-05-21 10:32:28
 * @Description:  数据筛查-数据查询-模型计算
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
                         :width="120">
          <template slot-scope="scope">
            <el-button v-if="scope.row.calStatus !== '1'"
                       type="info"
                       plain
                       size="mini"
                       @click="modelChart(scope.row)">查看</el-button>
            <!-- @click="deleteForm(scope.row)">删除</el-button> -->
          </template>
        </el-table-column>
      </basic-table>
    </div>
    <el-dialog :title="modelName"
               :fullscreen="fullScreen"
               append-to-body
               v-el-drag-dialog
               :close-on-click-modal="false"
               :visible.sync="modelChartVisable"
               top="5vh"
               width="80%"
               custom-class="dialog-default-more model-chart-diaolg">
      <div slot="title"
           class="model-chart-header">
        {{modelName}}
        <a class="el-icon-full-screen full-screen-button"
           @click="fullScreenHandle"></a>
      </div>
      <div class="dialog-contant-default model-chart-dialog"
           v-if="modelChartVisable">
        <model-chart ref="modelChart"
                     :json="modelJson"
                     :modelTaskResults="modelTaskResults"
                     :paramJson="paramJson"></model-chart>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="modelChartVisable = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import { getSearchParam } from '@/utils/index'
import { baseRequest } from '@/api/base'
import ModelChart from './component/Chart'
const url = '/basic/t05ModelTask/selects'
export default {
  name: 'modelCalculationIndex',
  components: {
    SearchForm,
    BasicTable,
    ModelChart
  },
  data() {
    return {
      // 点击查看的taskId
      currentRow: null,
      // 是否全屏
      fullScreen: false,
      // 模型名称
      modelName: '',
      modelChartVisable: false,
      modelJson: null,
      modelTaskResults: [],
      paramJson: {},
      configData: {}, // 模板数据
      searchToggle: true,
      tableToggle: true
    }
  },
  created() {
    this.getOption()
  },
  methods: {
    fullScreenHandle() {
      this.fullScreen = !this.fullScreen
      this.$nextTick(_ => {
        this.$refs.modelChart.resetChart()
      })
    },
    searchOption() {
      this.$refs.basicTable.getData(url, this.$refs.searchForm.searchParam())
    },
    getOption() {
      baseRequest(url, {}).then(response => {
        const result = response.data
        result.formConfig = JSON.parse(result.formConfig)
        result.tableConfig = JSON.parse(result.tableConfig)
        this.configData = result
        const param = getSearchParam(result.formConfig)
        this.$refs.basicTable.getData(url, param)
      })
    },
    // 查看
    modelChart(row) {
      this.fullScreen = false
      this.modelChartRequest(row)
    },
    // 查看请求
    modelChartRequest(row, callback) {
      if (row) {
        this.currentRow = row
      }
      baseRequest('/basic/t05ModelTaskResult/getModelFlowChart', { taskId: this.currentRow.taskId }).then(response => {
        this.modelJson = JSON.parse(response.data.item.modelJson)
        this.modelTaskResults = response.data.item.modelTaskResults
        this.paramJson = JSON.parse(response.data.item.paramJson)
        this.modelName = this.currentRow.modelName
        this.modelChartVisable = true
        callback && callback(response.data.item.modelTaskResults)
      })
    }
  }
}
</script>
<style lang="scss">
.model-chart-header {
  .full-screen-button {
    float: right;
    margin-right: 25px;
    margin-top: 2px;
    font-size: 14px;
  }
}
.model-chart-diaolg.el-dialog.is-fullscreen {
  overflow: hidden;
}
</style>
