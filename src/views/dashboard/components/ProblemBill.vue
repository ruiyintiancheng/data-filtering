<template>
    <div class="app-container">
        <div class="base-row">
          <el-form ref="form" :inline="true" :model="formData" class="demo-form-inline demo-table-expand">
            <table border="0" style="width:90%;padding-left: 50px;">
              <tr class="tr-height">
                <td class="td-align"><span class="input-label">事项名称</span></td>
                <td colspan="3"><el-input :disabled="disabled" v-model="formData.事项名称" clearable></el-input></td>
              </tr>
              <tr class="tr-height">
                <td class="td-align"><span class="input-label">事项分类</span></td>
                <td>
                  <el-select :disabled="disabled" v-model="formData.事项分类" clearable filterable placeholder="" style="width:100%;">
                    <el-option label="数据质量问题" value="0"></el-option>
                    <el-option label="报送问题" value="1"></el-option>
                    <el-option label="数据格式问题" value="2"></el-option>
                  </el-select>
                </td>
                <td class="td-align"><span class="input-label">填报人姓名</span></td>
                <td><el-input :disabled="disabled" v-model="formData.填报人姓名" clearable></el-input></td>
              </tr>
              <tr class="tr-height">
                <td class="td-align"><span class="input-label">填报OA号</span></td>
                <td><el-input :disabled="disabled" v-model="formData.填报OA号" clearable></el-input></td>
                <td class="td-align"><span class="input-label">填报单位</span></td>
                <td><el-input :disabled="disabled" v-model="formData.填报单位" clearable></el-input></td>
              </tr>
              <tr class="tr-height">
                <td class="td-align"><span class="input-label">联系方式</span></td>
                <td><el-input :disabled="disabled" v-model="formData.联系方式" clearable></el-input></td>
                <td class="td-align"><span class="input-label">处理时限</span></td>
                <td>
                  <el-date-picker
                    :disabled="disabled" 
                    v-model="formData.处理时限"
                    type="date"
                    style="width:100%"
                    clearable
                  ></el-date-picker>
                </td>
              </tr>
              <tr class="tr-height">
                <td class="td-align"><span class="input-label">事项详细描述</span></td>
                <td colspan="3"><el-input :disabled="disabled" type="textarea" v-model="formData.事项详细描述" clearable></el-input></td>
              </tr>
            </table>
          </el-form>
        </div>
        <div class="base-row">
            <div class="row-botton clearfix">
              <div class="row-title">
                <svg-icon icon-class="ul" />
                <span>附件</span>
              </div>
               <div class="row-option">
                <el-upload
                  class="upload-demo"
                  action="">
                  <el-button slot="trigger" icon="el-icon-upload2" @click="uploadAttachment" >上传附件</el-button>
                  <el-button icon="el-icon-download" @click="batchDownload" >批量下载</el-button>
                  <a @click="attachmentTableToggle=false" v-if="attachmentTableToggle"><svg-icon icon-class="up" />&nbsp;收起</a>
                  <a @click="attachmentTableToggle=true" v-else><svg-icon icon-class="down"/>&nbsp;展开</a>
                </el-upload>
               </div>
            </div>
            <basic-table v-show="attachmentTableToggle" noHeight ref="attachmentTable" :tableOption="attachmentConfigData" :pagenation="false" :rowCheck="true" :rowNum="false">
              <template slot="optionColumn">
                <el-table-column label="操作" align="center" fixed="right" width="200px">
                  <template slot-scope="scope">
                      <el-button type="primary" plain size="mini" @click="attchDownload(scope.row)" >下载</el-button>
                      <el-button type="danger" plain size="mini" @click="attchDelete(scope.row)">删除</el-button>
                  </template>
              </el-table-column>
              </template>
            </basic-table>
        </div>
        <div class="base-row">
            <div class="row-botton clearfix">
              <div class="row-title">
                <svg-icon icon-class="ul" />
                <span>处理记录</span>
              </div>
               <div class="row-option">
                <a @click="handleRecordTableToggle=false" v-if="handleRecordTableToggle"><svg-icon icon-class="up" />&nbsp;收起</a>
                <a @click="handleRecordTableToggle=true" v-else><svg-icon icon-class="down"/>&nbsp;展开</a>
               </div>
            </div>
            <basic-table v-show="handleRecordTableToggle" noHeight ref="handleRecordTable" :tableOption="handleRecordConfigData" :pagenation="false" :rowNum="true">
            </basic-table>
        </div>
        <div class="base-row">
          <div class="row-botton clearfix">
            <div class="row-title">
              <svg-icon icon-class="ul" />
              <span>事项处理</span>
            </div>
          </div>
          <el-form ref="itemForm" :inline="true" :model="itemFormData" class="demo-form-inline demo-table-expand">
            <table border="0" style="width:90%;padding-left: 50px;">
              <tr class="tr-height">
                <td class="td-align" style="width:15%;"><span class="input-label">处理人</span></td>
                <td>
                  <el-select v-model="itemFormData.处理人" clearable filterable>
                    <el-option label="处理人" value="1"></el-option>
                  </el-select>
                </td>
              </tr>
              <tr class="tr-height">
                <td class="td-align" style="width:15%;"><span class="input-label">处理意见</span></td>
                <td>
                  <el-input v-model="itemFormData.处理意见" type="textarea" style="width:500px;" clearable></el-input>
                </td>
              </tr>
              <tr class="tr-height">
                <td class="td-align" style="width:15%;"><span class="input-label">通知方式</span></td>
                <td>
                  <el-radio-group v-model="itemFormData.通知方式">
                    <el-radio label="短信" ></el-radio>
                    <el-radio label="邮件"></el-radio>
                  </el-radio-group>
                </td>
              </tr>
            </table>
          </el-form>
        </div>
    </div>
</template>
<script>
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
// import { getSearchParam } from '@/utils/index'
// import { downloadFile } from '@/utils/download'
import { baseRequest } from '@/api/base'
// const url = '/datamgr/problemBill'
const attachmentUrl = '/datamgr/getAttachments'
const handleRecordUrl = '/datamgr/getHandleRecords'
export default {
  name: 'datamgrProblemBill',
  props: {
    fileList: Boolean,
    sourceType: String
  },
  components: {
    SearchForm,
    BasicTable
  },
  data() {
    return {
      configData: {},
      formData: {},
      itemFormData: {},
      disabled: false,
      attachmentConfigData: {},
      handleRecordConfigData: {},
      itemConfigData: {},
      searchToggle: true,
      itemToggle: true,
      attachmentTableToggle: true,
      handleRecordTableToggle: true
    }
  },
  created() {
    this.getFormItems()
    // this.getAttachments()
    // this.getHandleRecords()
  },
  updated() {
    if (this.sourceType === 'problem') {
      this.disabled = true
    } else {
      this.disabled = false
    }
  },
  methods: {
    getFormItems() {
      if (this.sourceType === 'dataSourceValidate') {
        this.formData.事项名称 = '201810月份全流程系统TB_LOAN_ACCT 表ACCT_ID 字段字段长度修改'
        this.formData.事项分类 = '0'
        this.formData.填报人姓名 = '赵某'
        this.formData.填报OA号 = 'A1100130'
        this.formData.填报单位 = '上海市信息科技局'
        this.formData.联系方式 = '15831112555'
        this.formData.处理时限 = '2018-11-30'
        this.formData.事项详细描述 = '201810月份全流程系统TB_LOAN_ACCT 表ACCT_ID 字段字段长度修改'
      } else if (this.sourceType === 'dataValidate') {
        this.formData.事项名称 = '201810月份机构信息表银行机构代码字段数据全部为空'
        this.formData.事项分类 = '0'
        this.formData.填报人姓名 = '赵某'
        this.formData.填报OA号 = 'A1100130'
        this.formData.填报单位 = '上海市信息科技局'
        this.formData.联系方式 = '15831112555'
        this.formData.处理时限 = '2018-11-30'
        this.formData.事项详细描述 = '201810月份机构信息表银行机构代码字段数据全部为空'
      }
    },
    clearFormData() {
      this.formData = {}
    },
    getAttachments() {
      baseRequest(attachmentUrl).then(response => {
        const result = response.data
        result.tableConfig = JSON.parse(result.tableConfig)
        this.attachmentConfigData = result
        this.$refs.attachmentTable.getData(attachmentUrl, {})
      })
    },
    clearAttachments() {
      baseRequest(attachmentUrl).then(response => {
        const result = response.data
        result.tableConfig = JSON.parse(result.tableConfig)
        this.attachmentConfigData = result
        this.$refs.attachmentTable.clearTable()
      })
    },
    getHandleRecords() {
      baseRequest(handleRecordUrl).then(response => {
        const result = response.data
        result.tableConfig = JSON.parse(result.tableConfig)
        this.handleRecordConfigData = result
        this.$refs.handleRecordTable.getData(handleRecordUrl, {})
      })
    },
    clearHandleRecords() {
      baseRequest(handleRecordUrl).then(response => {
        const result = response.data
        result.tableConfig = JSON.parse(result.tableConfig)
        this.handleRecordConfigData = result
        this.$refs.handleRecordTable.clearTable()
      })
    },
    uploadAttachment() {
      console.log()
    },
    batchDownload() {
      console.log()
    },
    attchDownload(row) {
      console.log(row)
    },
    attchDelete(row) {
      this.$confirm('此操作将永久删除该记录,是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(_ => {
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      })
    }
  }
}
</script>
<style scoped>
  .demo-form-inline{
    width:100%;
    display: inline-block;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
  }
  .tr-height{
    height: 52px;
  }
  .td-align{
    text-align: right;
  }
</style>