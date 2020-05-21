<template>
  <div>
    <el-dialog title="参数管理器" v-el-drag-dialog append-to-body :close-on-click-modal="false" :visible.sync="dialogVisible" width="60%" custom-class="dialog-default">
            <div class="dialog-contant-default">
                <div class="param-management">
                    <el-table
                        border
                        stripe
                        :data="tableData"
                        style="width: 100%">
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
                        <el-table-column align="center">
                <template slot="header">
                    操作&nbsp;&nbsp;
                    <el-button icon="el-icon-plus" size="mini" type="warning" plain @click="addData()"></el-button>
                </template>
                <template slot-scope="scope">
                   <el-button @click="updateData(scope.row)" size="mini" type="primary" plain>修改</el-button>
                    <el-button @click="deleteData(scope)" size="mini" type="danger" plain>删除</el-button>
                </template>
            </el-table-column>
                    </el-table>
                </div>
            </div>
            <div slot="footer" class="dialog-footer">
                <div>
                    <el-button type="primary" @click="commitHandle">保存</el-button>
                    <el-button @click="dialogVisible=false">取消</el-button>
                </div>
            </div>
        </el-dialog>

        <el-dialog :title="updateTypeOption[updateType]+'参数'" v-el-drag-dialog append-to-body :close-on-click-modal="false" :visible.sync="dialogUpdateVisible" width="30%" custom-class="dialog-default">
            <div class="dialog-contant-default">
                <el-form class="baseUpdate-form" ref="form" label-width="100px" :model="item" :rules="rules" label-position="left">
                    <el-form-item prop="code" label="变量代码">
                        <el-input style="width:155px;" clearable v-model.trim="item.code"></el-input>
                    </el-form-item>
                    <el-form-item  prop="name" label="显示名">
                        <el-input style="width:155px;" clearable v-model.trim="item.name"></el-input>
                    </el-form-item>
                    <el-form-item prop="type" label="数据类型">
                        <el-radio v-model="item.type" label="1">字符</el-radio>
                        <el-radio v-model="item.type" label="2">数值</el-radio>
                    </el-form-item>
                    <el-form-item  prop="value" label="默认值">
                        <el-input style="width:155px;" clearable v-model.trim="item.value"></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <div slot="footer" class="dialog-footer">
                <div>
                    <el-button type="primary" @click="saveUpdate">确定</el-button>
                    <el-button @click="dialogUpdateVisible=false">关闭</el-button>
                </div>
            </div>
        </el-dialog>
  </div>
</template>
<script>
import elDragDialog from '@/directive/el-dragDialog'
export default {
  directives: { elDragDialog },
  props: {
    modelParam: Object
  },
  data() {
    return {
      tableData: [],
      dialogVisible: false,
      dialogUpdateVisible: false,
      currentRow: null,

      updateType: null,
      updateTypeOption: {
        '0': '添加',
        '1': '修改'
      },
      item: {
        code: null,
        name: null,
        type: '1',
        value: null
      },
      rules: {
        code: [
          { required: true, message: '请输入变量代码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (this.tableData.some(item => {
                if (this.updateType === '1') {
                  const currnet = this.currentRow
                  if (currnet.code === value) {
                    return false
                  } else {
                    return item.code === value
                  }
                } else {
                  return item.code === value
                }
              })) {
                callback(new Error('该代码已存在'))
              } else {
                callback()
              }
            }
          }
        ],
        name: [
          { required: true, message: '请输入显示名', trigger: 'blur' }
        ]
      }
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
  watch: {
    dialogUpdateVisible: function(val) {
      if (val === false) {
        this.$refs.form.resetFields()
      }
    }
  },
  methods: {
    // 保存参数管理器
    commitHandle() {
      const result = {}
      for (const iterator of this.tableData) {
        result[iterator.code] = {
          'paramName': iterator.name,
          'paramType': iterator.type,
          'defaultValue': iterator.value
        }
      }
      this.$emit('saveParamManagement', result)
      this.dialogVisible = false
    },
    openDialog() {
      this.tableData = []
      for (const key in this.modelParam) {
        this.tableData.push({
          code: key,
          name: this.modelParam[key].paramName,
          type: this.modelParam[key].paramType,
          value: this.modelParam[key].defaultValue
        })
      }
      this.dialogVisible = true
    },
    deleteData(scope) {
      this.tableData.splice(scope.$index, 1)
    },
    searchDelete(row) {
      for (const [index, item] of this.tableData.entries()) {
        if (item === row) {
          this.tableData.splice(index, 1)
          break
        }
      }
    },
    addData() {
      this.updateType = '0'
      this.item = {
        code: null,
        name: null,
        type: '1',
        value: null
      }
      this.dialogUpdateVisible = true
    },
    updateData(row) {
      this.currentRow = row
      for (const key in this.item) {
        this.item[key] = row[key]
      }
      this.updateType = '1'
      this.dialogUpdateVisible = true
    },
    saveUpdate() {
      let boo = false
      this.$refs.form.validate((valid) => {
        if (!valid) {
          return false
        } else {
          boo = true
        }
      })
      if (boo) {
        if (this.updateType === '0') {
          const temp = {}
          for (const key in this.item) {
            temp[key] = this.item[key]
          }
          this.tableData.push(temp)
        } else {
          for (const key in this.item) {
            this.currentRow[key] = this.item[key]
          }
        }
        this.dialogUpdateVisible = false
      }
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss">
.param-management-form{
    .param-label{
        width: 100px;
        padding-left: 5px;
        display: inline-block;
        &.description{
            line-height: 75px;
        }
    }
}
</style>
