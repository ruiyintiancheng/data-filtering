/*
 * @Author: lk 
 * @Date: 2019-07-23 13:41:06 
 * @Last Modified by: wk
 * @Last Modified time: 2020-05-21 10:41:10
 * @Description:  表展示步骤
 */
<template>
  <el-dialog title="字段列表"
             append-to-body
             v-el-drag-dialog
             :close-on-click-modal="false"
             :visible.sync="colmunListVisable"
             width="70%"
             custom-class="dialog-default">
    <div class="dialog-contant-default"
         v-if="colmunListVisable">
      <el-steps :active="active"
                finish-status="success"
                simple>
        <el-step title="条件筛选"></el-step>
        <el-step title="列排序"></el-step>
      </el-steps>
      <column-list ref="columnList"
                   v-if="active === 0"
                   :dataSourceCondition="dataSourceCondition"></column-list>
      <column-order ref="columnOrder"
                    v-else
                    :orderData="orderData"
                    :tableData="tableData"></column-order>
    </div>
    <div slot="footer"
         class="dialog-footer">
      <el-button @click="colmunListVisable = false">取消</el-button>
      <el-button @click="compeleteCurrent"
                 type="primary">{{active===1?'完成':'下一步'}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import columnList from './columnList'
import columnOrder from './columnOrder'
import { baseRequest } from '@/api/base'
export default {
  components: {
    columnList,
    columnOrder
  },
  props: {
    dataSourceCondition: Object
  },
  data() {
    return {
      // 当前步骤
      active: 0,
      // 弹窗开关
      colmunListVisable: false,
      // 解析列
      tableData: [],
      // 排序列
      orderData: []
    }
  },
  watch: {
    colmunListVisable() {
      this.active = 0
    }
  },
  methods: {
    // 下一步/保存
    compeleteCurrent() {
      if (this.active === 0) {
        this.tableData = this.$refs.columnList.tableData
        this.orderData = this.$refs.columnList.orderData
        this.active++
      } else {
        const params = {
          sqlId: this.dataSourceCondition.sqlId,
          dataSourceCode: this.dataSourceCondition.dataSourceCode,
          tableData: this.tableData,
          orderData: this.$refs.columnOrder.data
        }
        baseRequest('/basic/sqlColumn/add', params).then(_ => {
          this.$message.success('操作成功')
          this.colmunListVisable = false
        })
      }
    }
  }
}
</script>
