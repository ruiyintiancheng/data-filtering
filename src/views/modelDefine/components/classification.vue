/*
 * @Author: lk 
 * @Date: 2019-09-23 13:59:57 
 * @Last Modified by: wk
 * @Last Modified time: 2020-05-21 10:34:49
 * @Description:  分组维护
 */
<template>
  <div class="classification">
    <el-table :data="tableData"
              fit
              border
              stripe
              style="width: 100%">
      <el-table-column align="center"
                       label="组别名称">
        <template slot-scope="scope">
          <span v-if="!scope.row.isUpdating">{{scope.row.groupName}}</span>
          <el-input v-else
                    clearable
                    v-model.trim="scope.row.groupName"></el-input>
        </template>
      </el-table-column>
      <el-table-column align="center">
        <template slot="header">
          操作&nbsp;&nbsp;
          <el-button icon="el-icon-plus"
                     size="mini"
                     type="warning"
                     plain
                     @click="addCla()"></el-button>
        </template>
        <template slot-scope="scope">
          <el-button v-if="scope.row.isUpdating"
                     type="success"
                     size="mini"
                     plain
                     @click="saveCla(scope.row)">保存</el-button>
          <el-button v-if="scope.row.isUpdating"
                     size="mini"
                     plain
                     @click="cancelCla(scope)">取消</el-button>
          <el-button v-if="!scope.row.isUpdating"
                     type="primary"
                     size="mini"
                     plain
                     @click="updateCla(scope.row)">修改</el-button>
          <el-button type="danger"
                     size="mini"
                     plain
                     @click="deleteCla(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { baseRequest, baseSearch } from '@/api/base'
export default {
  data() {
    return {
      tableData: []
    }
  },
  mounted() {
    this.getTableData()
  },
  methods: {
    // 获取分类列表
    getTableData() {
      baseSearch('/basic/t05ModelGroup/selects', { groupType: '1' }).then(response => {
        const tableData = response.data.item
        tableData.map(item => {
          item.isUpdating = false
          return item
        })
        this.tableData = tableData
      })
    },
    // 修改
    updateCla(row) {
      row.isUpdating = true
      row.oldName = row.groupName
    },
    // 添加
    addCla() {
      this.tableData.push({
        groupName: null,
        isUpdating: true,
        isAdd: true
      })
    },
    // 取消
    cancelCla(scope) {
      if (scope.row.isAdd) {
        this.tableData.splice(scope.$index, 1)
      } else {
        scope.row.groupName = scope.row.oldName
        scope.row.isUpdating = false
      }
    },
    // 保存
    saveCla(row) {
      if (!row.groupName) {
        this.$message.error('名称不能为空')
        return
      }
      row.groupType = '1'
      baseRequest(row.isAdd ? '/basic/t05ModelGroup/add' : '/basic/t05ModelGroup/update', row).then(_ => {
        this.$message.success('操作成功')
        this.getTableData()
        this.$emit('getClassfyTree')
      })
    },
    // 删除
    deleteCla(row) {
      this.$confirm('确定删除该分类吗, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        baseRequest('/basic/t05ModelGroup/delete', { groupId: row.groupId }).then(_ => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getTableData()
          this.$emit('getClassfyTree')
        })
      })
    }
  }
}
</script>
