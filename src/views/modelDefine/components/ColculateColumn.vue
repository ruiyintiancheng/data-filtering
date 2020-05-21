<template>
    <div>
        <el-dialog title="计算列" v-el-drag-dialog append-to-body :close-on-click-modal="false" :visible.sync="dialogCC" width="30%" custom-class="dialog-default colculate-column">
              <div class="dialog-contant-default">
                  <div class="colculate-column-content">
                      <div class="left-option">
                        <div v-for="(item, index) in columelist" :key="index"
                            :class="columnIndex === index ? 'sel' : ''"
                            @click="columnIndex = index" class="mycolumn">
                            {{item.name}}
                        </div>
                      </div>
                      <div class="right-option">
                          <ul>
                              <li><el-button @click="openCName">新增</el-button></li>
                              <li><el-button @click="editCloumn">编辑</el-button></li>
                              <li><el-button @click="removeCloumn">删除</el-button></li>
                              <li><el-button @click="reNameCloumn">重命名</el-button></li>
                              <li><el-button @click="dialogCC=false">关闭</el-button></li>
                          </ul>
                      </div>
                  </div>
              </div>
              <sql-edit :dbType="dbType" :optionsTree="optionsTree" :modelParam="modelParam" ref="sqlEdit" @saveCloumn="saveCloumn"></sql-edit>
            <el-dialog title="计算列名称" width="30%" v-el-drag-dialog :visible.sync="dialogCName" append-to-body>
              <div style="margin: 10px 50px;">
                <el-form ref="form" :model="form" @submit.native.prevent 
                    label-position="right" size="mini" label-width="100px">
                    <el-form-item label="计算列名称:">
                        <el-input v-model="form.name"></el-input>
                    </el-form-item>
                    <el-form-item label="数据类型:">
                        <el-radio-group v-model="form.type">
                            <el-radio label="1">字符</el-radio>
                            <el-radio label="2">数值</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-form>  
              </div>  
                <span slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="cloumnSubmit">确 定</el-button>
                    <el-button @click="dialogCName = false">取 消</el-button>
                </span>
            </el-dialog>
        </el-dialog>
    </div>
</template>
<script>
import elDragDialog from '@/directive/el-dragDialog'
import { deepClone } from '@/utils/index'
import sqlEdit from './sqlEdit'
export default {
  directives: { elDragDialog },
  components: {
    sqlEdit
  },
  props: {
    optionsTree: Array,
    dbType: String,
    modelParam: Object
  },
  data() {
    return {
      menu: '',
      columnIndex: 0,
      columelist: [
      ],
      dialogCC: false,
      dialogCName: false,
      form: {
        name: '',
        type: '1'
      }
    }
  },
  methods: {
    openColculateClolumn(list) {
      this.columelist = []
      if (list) {
        const temp = deepClone(list)
        for (const iterator of temp) {
          const obj = {
            name: iterator.columnName,
            type: iterator.columnType,
            data: iterator.expression
          }
          this.columelist.push(obj)
        }
      }
      this.dialogCC = true
    },
    openCName() {
      this.dialogCName = true
      this.menu = 'create'
      this.form.name = ''
      this.form.type = '1'
    },
    cloumnSubmit() {
      if (!this.form.name) {
        this.$message.warning('名称不能为空')
        return
      }
      if (this.menu === 'create') {
        this.createCloumn()
      } else if (this.menu === 'rename') {
        const data = this.columelist[this.columnIndex]
        data.name = this.form.name
        data.type = this.form.type
        const params = {
          name: data.name,
          type: data.type,
          index: this.columnIndex
        }
        this.$emit('setExpressionUpdate', params)
      }
      this.dialogCName = false
    },
    saveCloumn(data) { // 保存
      if (this.menu === 'create') {
        const column = {}
        column.name = this.form.name
        column.type = this.form.type
        column.data = data
        this.columelist.push(column)
        this.$emit('setExpressionAdd', column)
      } else if (this.menu === 'edit') {
        this.columelist[this.columnIndex].data = data
        const params = {
          data: data,
          index: this.columnIndex
        }
        this.$emit('setExpressionUpdate', params)
      }
    },
    createCloumn() { // 新增
      this.$refs.sqlEdit.createSqlEdit()
    },
    editCloumn() { // 编辑
      this.menu = 'edit'
      const data = this.columelist[this.columnIndex].data
      this.$refs.sqlEdit.openSqlEdit(deepClone(data))
    },
    removeCloumn() { // 删除
      if (this.columelist.length <= 0) {
        return
      }
      this.columelist.splice(this.columnIndex, 1)
      this.$emit('setExpressionDelete', this.columnIndex)
    },
    reNameCloumn() { // 重命名
      this.menu = 'rename'
      const data = this.columelist[this.columnIndex]
      this.form.name = data.name
      this.form.type = data.type
      this.dialogCName = true
    }
  }
}
</script>
<style lang="scss">
    .colculate-column{
        height: 50%;
        .el-dialog__body{
            height: calc(100% - 60px);
            .colculate-column-content{
                padding:10px;
                height: 100%;
                .left-option{
                    float: left;
                    width: 75%;
                    border: 1px solid #ccc;
                    height: 100%;
                }
                .right-option{
                    float: left;
                    width: 25%;
                    height: 100%;
                    padding-left: 20px;
                    // padding-right: 20px;
                    ul{
                        &:first-child{
                            list-style: none;
                            padding:0;
                            margin:0;
                            height: 100%;
                            li{
                                margin-bottom:12%;
                                .el-button--medium {
                                    width: 80px;
                                    text-align: center;
                                }
                                &:last-child{
                                    margin-bottom:0;
                                }
                                // height: 15%;
                                text-align: center;
                                a{
                                    display: inline-block;
                                    width: 70%;
                                    height: 100%;
                                    line-height:  345%;
                                    text-align: center;
                                    border:1px solid #ccc;
                                    border-radius: 5px;
                                }
                            }
                        }
                    }
                    .contextmenu {
                        margin: 0;
                        background: #fff;
                        z-index: 100;
                        position: fixed;
                        list-style-type: none;
                        padding: 5px 0;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: 400;
                        color: #333;
                        box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
                        li {
                        margin: 0;
                        padding: 7px 16px;
                        cursor: pointer;
                        &:hover {
                            background: #eee;
                        }
                        }
                    }
                }
            }
        }
    }
    .mycolumn {
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      padding-left: 20px;
    }
    .mycolumn.sel {
      background-color: #F5F7FA;
    }
    .mycolumn:hover {
      background-color: #F5F7FA;
    }
</style>

