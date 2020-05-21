/*
 * @Author: lk 
 * @Date: 2019-10-15 10:23:33 
 * @Last Modified by: wk
 * @Last Modified time: 2020-05-21 10:32:00
 * @Description:  执行sql
 */
<template>
  <div class="sql-implement">
    <div class="base-row">
      <div class="row-botton clearfix">
        <div class="row-title">
          <svg-icon icon-class="ul" />
          <span>数据列表</span>
        </div>
        <div class="row-option">
          <el-dropdown @command="exportHandle">
            <el-button size="mini"
                       :disabled="tableData.length <= 0 || tableHead.length <= 0"
                       :loading="exportLoading">
              导出<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="1">当前页</el-dropdown-item>
              <el-dropdown-item command="2">全部</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>
    <el-table v-loading="loading"
              :data="tableData"
              :border="true"
              :fit="true"
              :height="tableHeight"
              :empty-text="sqlMessage"
              style="width: 100%;">
      <el-table-column align="center"
                       v-for="(item,index) in tableHead"
                       :label="item.label"
                       :property="item.property"
                       :key="index"
                       min-width="180">
        <template slot-scope="scope">
          <el-tooltip :disabled="textJug(scope.row[item.property])"
                      :content="scope.row[item.property]?scope.row[item.property]+'':''"
                      placement="top"
                      effect="light"
                      :visible-arrow="false">
            <div class="basic-table-column">
              {{scope.row[item.property]}}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination background
                   @size-change="handleSizeChange"
                   @current-change="handleCurrentChange"
                   :current-page="pageNo"
                   :page-sizes="[10,20,30,50]"
                   :page-size="pageSize"
                   layout="total, sizes, prev, pager, next, jumper"
                   :total="total">
    </el-pagination>
  </div>
</template>
<script>
import { baseRequest } from '@/api/base'
import { basicDownload } from '@/utils/download'
export default {
  props: {
    params: Object,
    title: String
  },
  data() {
    return {
      loading: false,
      tableData: [],
      tableHead: [],
      sqlMessage: '',
      pageNo: 1,
      pageSize: null,
      total: null,
      exportLoading: false
    }
  },
  computed: {
    tableHeight() {
      return this.$store.state.app.dialogHeight / 0.75 * 0.83 - 285
    }
  },
  mounted() {
    this.searchHandle()
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
    },
    searchHandle() {
      this.loading = true
      this.params.pageNo = this.pageNo
      this.params.pageSize = this.pageSize
      baseRequest('/basic/sqlQuerys/selectBySql', this.params).then(response => {
        const result = response.data.item[0]
        this.sqlMessage = result.resultMessage
        // 查询结果存储到查询的历史数据的对象中 resultMessage
        this.tableHead = result.tableHead
        this.tableData = result.tableData
        this.total = response.data.total
        this.pageSize = response.data.pageSize
        this.loading = false
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.searchHandle()
    },
    handleCurrentChange(val) {
      this.pageNo = val
      this.searchHandle()
    },
    // 下载点击事件
    exportHandle(exportType) {
      if (exportType === '2') {
        baseRequest('/basic/configs/selectByConfigCode', { configCode: 'exportExcelMaxCount' }).then(response => {
          const exportExcelMaxCount = response.data.item.configValue
          if (this.total > exportExcelMaxCount) {
            this.$prompt(`导出记录数超过${exportExcelMaxCount}行,将以CSV格式导出`, '请输入查询名称', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputPattern: /\S/,
              inputErrorMessage: '查询名称不能为空'
            }).then(({ value }) => {
              this.saveCsv(value)
            })
          } else {
            this.downloadExcel(exportType)
          }
        })
      } else {
        this.downloadExcel(exportType)
      }
    },
    // 下载点击事件
    downloadExcel(exportType) {
      const currentActions = this.$route.path.split('/')
      const currentActionId = currentActions[currentActions.length - 1]
      this.exportLoading = true
      var param = {}
      param.sqlContent = this.params.sqlContent
      param.datSourceType = this.params.datSourceType || this.params.dataSourceType
      param.dataSourceCode = this.params.dataSourceCode
      param.pageNo = this.pageNo || 1
      param.pageSize = this.pageSize || null
      param.total = this.total
      param.exportType = exportType
      param.actionId = currentActionId
      param.downloadName = this.title
      basicDownload('/basic/sqlQuerys/exportExcel', param).then(_ => {
        this.exportLoading = false
      }, _ => {
        this.exportLoading = false
      })
    },
    // CSV格式保存
    saveCsv(downloadName) {
      const currentActions = this.$route.path.split('/')
      const currentActionId = currentActions[currentActions.length - 1]
      this.exportLoading = true
      var param = {}
      param.sqlContent = this.params.sqlContent
      param.datSourceType = this.params.datSourceType || this.params.dataSourceType
      param.dataSourceCode = this.params.dataSourceCode
      param.pageNo = this.pageNo || 1
      param.pageSize = this.pageSize || null
      param.total = this.total
      param.exportType = '3'
      param.actionId = currentActionId
      param.downloadName = downloadName
      baseRequest('/basic/sqlQuerys/exportCsv', param).then(response => {
        const fileName = response.data.item.fileName
        const routers = this.$store.getters.addRouters
        this.exportLoading = false
        baseRequest('/basic/configs/selectByConfigCode', { configCode: 'createFileActionID' }).then(response => {
          const createFileActionID = response.data.item.configValue
          const router = routers.find(item => {
            const routerPaths = item.children[0].path.split('/')
            const actionId = routerPaths[routerPaths.length - 1]
            return actionId === createFileActionID + ''
          })
          if (router) {
            const routerItem = router.children[0]
            this.$confirm(`文件${fileName}处理中,请到${routerItem.meta.title}查看进度并下载`, '提示', {
              confirmButtonText: '跳转',
              cancelButtonText: '关闭',
              type: 'warning'
            }).then(() => {
              this.$router.push('/' + routerItem.path)
            })
          }
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.sql-implement {
  .base-row {
    margin: 0;
    border-bottom-width: 0px;
  }
}
</style>
