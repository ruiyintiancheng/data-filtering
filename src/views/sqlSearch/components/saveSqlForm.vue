/*
 * @Author: lk 
 * @Date: 2019-07-25 09:34:52 
 * @Last Modified by: wk
 * @Last Modified time: 2020-05-21 10:41:35
 * @Description:  保存sql表单
 */
<template>
  <div class="save-sql">
    <el-form :rules="rules"
             class="baseUpdate-form"
             ref="form"
             :model="updateFormData"
             label-width="100px">
      <el-form-item label="名称"
                    prop="sqlName">
        <el-input class="form-input"
                  v-model="updateFormData.sqlName"
                  clearable></el-input>
      </el-form-item>
      <el-form-item label="所属分类"
                    prop="groupId">
        <el-select class="form-input"
                   v-model="updateFormData.groupId">
          <el-option v-for="(item,index) in classificationOptions"
                     :key="index"
                     :label="item.groupName"
                     :value="item.groupId"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import { baseRequest } from '@/api/base'
import { saveUpdate } from '@/utils/validate'
export default {
  props: {
    sqlSaveParams: {
      type: Object,
      default: _ => { }
    }
  },
  mounted() {
    baseRequest('/basic/sqlGroup/selects').then(response => {
      this.classificationOptions = response.data.item
    })
    if (this.sqlSaveParams.sqlId || this.sqlSaveParams.sqlId === 0) {
      baseRequest('/basic/sqlConfig/select', { sqlId: this.sqlSaveParams.sqlId }).then(response => {
        this.updateFormData.sqlName = response.data.item.sqlName
        this.updateFormData.groupId = response.data.item.groupId
      })
    }
  },
  data() {
    return {
      // 分类选项
      classificationOptions: [],
      updateFormData: {
        sqlName: null,
        groupId: null
      },
      rules: {
        sqlName: [
          { required: true, message: '名称不能为空' }
        ],
        groupId: [
          { required: true, message: '所属分类不能为空' }
        ]
      }
    }
  },
  methods: {
    // 保存
    saveHandle() {
      return new Promise((resolve, reject) => {
        this.updateFormData.dataSourceCode = this.sqlSaveParams.dataSourceCode
        this.updateFormData.sqlContent = this.sqlSaveParams.sqlContent
        // 修改
        if (this.sqlSaveParams.sqlId || this.sqlSaveParams.sqlId === 0) {
          this.updateFormData.sqlId = this.sqlSaveParams.sqlId
          saveUpdate('/basic/sqlConfig/add', this.updateFormData, this.rules, this.$refs.form).then(response => {
            if (response.data.item.status === '0') {
              this.$message.error(response.data.item.msg)
              return
            }
            this.updateFormData.isEqual = response.data.item.isEqual
            resolve(this.updateFormData)
          })
          // 新增
        } else {
          saveUpdate('/basic/sqlConfig/add', this.updateFormData, this.rules, this.$refs.form).then(response => {
            if (response.data.item.status === '0') {
              this.$message.error(response.data.item.msg)
              return
            }
            this.updateFormData.sqlId = response.data.item.sqlId
            this.updateFormData.isEqual = response.data.item.isEqual
            resolve(this.updateFormData)
          })
        }
      })
    }
  }
}
</script>
