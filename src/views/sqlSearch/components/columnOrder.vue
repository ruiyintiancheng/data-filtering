/*
 * @Author: lk 
 * @Date: 2019-07-23 14:10:48 
 * @Last Modified by: lk
 * @Last Modified time: 2019-07-25 18:37:27
 * @Description: 列排序 
 */
<template>
    <div class="column-order">
        <!-- 列表开始 -->
        <el-table
        :data="data"
        fit
        border
        stripe
        :height="tableHeight"
        style="width: 100%"
        v-if="freshTable"
        >
            <el-table-column align="center" label="别名">
                <template slot-scope="scope">
                    {{scope.row.columnAlias}}
                </template>
            </el-table-column>
            <el-table-column align="center" label="字段">
                <template slot-scope="scope">
                    {{scope.row.columnContent}}
                </template>
            </el-table-column>
            <el-table-column align="center" label="表头">
                <template slot-scope="scope">
                    {{scope.row.columnName}}
                </template>
            </el-table-column>
            <el-table-column align="center" label="排序" min-width="100">
                <template slot-scope="scope">
                    <el-select v-model="scope.row.orderbyType">
                      <el-option value="1" label="升序"></el-option>
                      <el-option value="2" label="降序"></el-option>
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column align="center"  width="250">
              <template slot="header">
                <span>操作</span>
                    <el-dropdown trigger="click" @command="addOrder">
                      <el-button  size="mini" plain>
                        {{tableOptions.length!==0?'添加排序':'无更多'}}<i class="el-icon-arrow-down el-icon--right"></i>
                      </el-button>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item v-for="(item,index) in tableOptions"  :command="item" :key="index">{{item.columnAlias}}&nbsp;&nbsp;{{item.columnContent}}</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                </template>
                <template slot-scope="scope">
                  <el-button :disabled="scope.$index === 0" size="mini" plain  @click="upHandle(scope)">上移</el-button>
                  <el-button :disabled="scope.$index === data.length-1" size="mini" plain  @click="downHandle(scope)">下移</el-button>
                  <el-button type="danger"  size="mini" plain  @click="deleteHandle(scope)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 列表结束 -->
    </div>
</template>
<script>
export default {
  props: {
    orderData: Array,
    tableData: Array
  },
  data() {
    return {
      // 刷新table
      freshTable: true,
      // 选项
      tableOptions: [],
      data: []
    }
  },
  mounted() {
    this.tableOptions = this.tableData.filter(item => {
      return true
    })
    const list = []
    if (this.orderData && this.orderData.length > 0) {
      for (const iterator of this.orderData) {
        const temp = {
          columnId: iterator.columnId,
          columnAlias: iterator.columnAlias,
          columnContent: iterator.columnContent,
          columnName: iterator.columnName,
          orderbyType: '1'
        }
        list.push(temp)
      }
    }
    this.data = list
  },
  computed: {
    tableHeight() {
      return this.$store.state.app.dialogHeight - 190
    },
    dataLength() {
      return this.data.length
    }
  },
  watch: {
    dataLength() {
      this.tableOptions = this.tableData.filter(item => {
        return !this.data.find(val => val.columnAlias === item.columnAlias)
      })
      this.freshTable = false
      this.$nextTick(_ => {
        this.freshTable = true
      })
    }
  },
  methods: {
    // 添加排序
    addOrder(row) {
      row.orderbyType = '1'
      this.data.push(row)
      this.tableOptions.splice(0, 1)
    },
    // 下移
    downHandle(scope) {
      this.data.splice(scope.$index, 1)
      this.data.splice(scope.$index + 1, 0, scope.row)
    },
    // 上移
    upHandle(scope) {
      this.data.splice(scope.$index, 1)
      this.data.splice(scope.$index - 1, 0, scope.row)
    },
    // 删除
    deleteHandle(scope) {
      this.data.splice(scope.$index, 1)
    }
  }
}
</script>
<style lang="scss">
.column-order{
  .el-dropdown{
    vertical-align: middle;
    color: #909399;
  }
  .el-table--medium td, .el-table--medium th {
    padding:3px;
  }
}
</style>
