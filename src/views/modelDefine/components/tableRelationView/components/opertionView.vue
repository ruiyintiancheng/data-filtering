<template>
  <div>
       <el-menu style="width:100%" default-active="1" class="el-menu-demo" mode="horizontal" active-text-color="#409EFF">
            <el-menu-item style="width:25%;text-align:center;line-height: 28px;" index="1">
                <img :src="innerPic" alt="内部连接" style="width:35px;"><br>
                内部连接</el-menu-item>
            <el-menu-item style="width:25%;text-align:center;line-height: 28px;" index="2">
                <img :src="leftPic" alt="左侧连接" style="width:35px;"><br>
                左侧连接</el-menu-item>
            <el-menu-item style="width:25%;text-align:center;line-height: 28px;"  index="3">
                <img :src="rightPic" alt="右侧连接" style="width:35px;"><br>
                右侧连接</el-menu-item>
            <el-menu-item style="width:25%;text-align:center;line-height: 28px;"  index="4">
                <img :src="All" alt="外部连接" style="width:35px;">
                <br>
                外部连接
            </el-menu-item>
        </el-menu>
        <el-table :data="tableData" fit border stripe style="width: 100%">
        <el-table-column align="center" label="左表数据">
            <template slot-scope="scope">
                <span v-if="!scope.row.status">{{scope.row.leftExpressions}}</span>
                <el-select v-else v-model="scope.row.leftExpressions" placeholder="左表数据">
                        <el-option
                        v-for="(item,index) in leftData"
                        :key="index"
                        :label="item.value"
                        :value="item.value">
                        </el-option>
                    </el-select>
            </template>
        </el-table-column>
        <el-table-column  label="类型" align="center" :width="100">
            <template slot-scope="scope">
                <span v-if="!scope.row.status">{{scope.row.optionSymbol}}</span>
                <el-select v-else v-model="scope.row.optionSymbol">
                        <el-option
                        v-for="(item,index) in optionSymbol"
                        :key="index"
                        :label="item"
                        :value="item">
                        </el-option>
                    </el-select>
            </template>
        </el-table-column>
        <el-table-column align="center" label="右表数据">
            <template slot-scope="scope">
                <span v-if="!scope.row.status">{{scope.row.rightExpressions}}</span>
                <el-select v-else v-model="scope.row.rightExpressions" placeholder="左表数据">
                        <el-option
                        v-for="(item,index) in rightData"
                        :key="index"
                        :label="item.value"
                        :value="item.value">
                        </el-option>
                    </el-select>
            </template>
        </el-table-column>
        <el-table-column  align="center"  width="200" :render-header="renderHeader">
                <template slot-scope="scope">
                    <span v-if="!scope.row.status">
                        <el-button type="primary" plain size="mini" @click="editRow(scope.row)">编辑</el-button>
                        <el-button type="danger" plain size="mini" @click="handleDelete(scope.$index)">删除</el-button>
                    </span>
                    <span v-else>
                        <el-button type="success" plain size="mini" @click="saveOperator(scope.row)">保存</el-button>
                        <el-button plain size="mini" @click="cancleOperator(scope.row)">取消</el-button>
                    </span>
                </template>
            </el-table-column>
        </el-table>
  </div>
</template>
<script>
import All from '../img/all2.png'
import innerPic from '../img/inner.png'
import leftPic from '../img/left.png'
import rightPic from '../img/right.png'
export default {
  currentFun: '',
  directives: { },
  name: 'modelDefineComponentsTableRelationViewComponentsOpertionView',
  data() {
    return {
      All,
      innerPic,
      leftPic,
      rightPic,
      tableData: [{
        leftExpressions: '',
        rightExpressions: '',
        optionSymbol: '=',
        status: false
      }],
      trData: null,
      leftData: [{ value: '金额' }, { value: '日期' }, { value: '姓名' }],
      rightData: [{ value: '金额' }, { value: '日期' }, { value: '姓名' }],
      optionSymbol: ['=', '>', '<', '>=', '<='],
      value: null,
      value1: '=',
      value2: null
    }
  },
  props: {
  },
  mounted() {
    if (!this.trData) {
      this.trData = this.$refs.table.childNodes
      console.log(this.trData)
    }
  },
  methods: {
    editRow(row) {
      row.oldData = JSON.stringify(row)
      row.status = true
    },
    handleDelete(index) {
      this.tableData.splice(index, 1)
    },
    renderHeader(h) {
      return (
        <div>
          <span>操作 </span>
          <el-button onClick={this.addBro} type='warning' icon='el-icon-plus' size='mini'></el-button>
        </div>
      )
    },
    addBro() {
      this.tableData.push({ leftExpressions: '', rightExpressions: '', optionSymbol: '=', status: true, oldData: '{"leftExpressions": "", "rightExpressions": "", "optionSymbol": "=", "status": true}' })
      //   this.$set('tableData', 0, { leftExpressions: '', rightExpressions: '', optionSymbol: '=', status: false })
    //   console.log(this.tableData)
    },
    saveOperator(row) {
      row.status = false
    },
    cancleOperator(row) {
    //   console.log(JSON.parse(row.oldData))
      console.log(row.oldData)
      const row2 = JSON.parse(row.oldData)
      console.log(row2)
      for (var i in row2) {
        row[i] = row2[i]
      }
      //   this.$set(scope, 'row', row)
      row.status = false
    }
  },
  watch: {

  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
</style>