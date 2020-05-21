<template>
    <div class="search-create">
        <el-dialog title="查询生成器" v-el-drag-dialog :close-on-click-modal="false" :visible.sync="shareObject.showDialog" width="70%" top="7vh" custom-class="dialog-default-more">
              <div class="dialog-contant-default">
                  <div class="header-form">
                      <el-form v-model="searchItem" inline>
                           <el-form-item label="查询名称" class="is-required">
                                <el-input v-model="searchItem.searchName" size="mini"></el-input>
                            </el-form-item>
                           <el-form-item label="输出名称" class="is-required">
                                <el-input v-model="searchItem.outputName" size="mini"></el-input>
                            </el-form-item>
                      </el-form>
                  </div>
                  <div class="header-options">
                      <a @click="openColculateClolumn">计算列</a>
                      <a @click="openParamManagement">参数管理器</a>
                  </div>
                  <el-row class="search-create-content">
                    <el-col class="left-part" :span="6">
                        <div class="tree-header">
                            <a @click="associationTable">关联表</a>&nbsp;&nbsp;
                            <!-- <a>删除表</a>&nbsp;&nbsp; -->
                            <!-- <a @click="addTable">追加表</a> -->
                        </div>
                        <div class="tree-content" v-if="treeStatus">
                            <el-tree default-expand-all
                                ref="optionsTreeRef"
                                :data="optionsTree"
                                :props="defaultProps"
                                :show-checkbox="showCheckbox"
                                node-key="tableIdxColumnNumber"
                                >
                                <div slot-scope="{ node ,data }" :draggable="draggable(data)" @dragstart="dragstart($event,node)">
                                  {{(data.tableName||data.tableChnName)? (data.tableName + (data.tableChnName?'('+data.tableChnName+')':'')) : (data.columnName + (data.columnChnName?'('+data.columnChnName+')':''))}}
                                </div>
                            </el-tree>
                        </div>
                    </el-col>
                    <el-col class="right-part" :span="18">
                        <el-tabs v-model="activeName" style="height:100%;">
                            <el-tab-pane class="search-panel clearfix" label="选择数据" name="search">
                              <div class="search-panel-left" @drop="drop" @dragover="allowDrop">
                                <div class="data-table">
                                    <el-table
                                    row-key="id"
                                        border
                                        highlight-current-row
                                        :data="tableData.search"
                                        @row-click="getSearchRow"
                                        ref="search"
                                        style="width: 100%"
                                        empty-text="请拖动左侧列到此选择"
                                        >
                                        <el-table-column align="center" label="序号" width="65" type="index">
                                        </el-table-column>
                                        <el-table-column align="center"
                                            label="列名">
                                            <template slot-scope="scope">
                                                {{`${scope.row.newName.columnName}(${scope.row.newName.columnChnName})`}}
                                            </template>
                                        </el-table-column>
                                        <el-table-column align="center"
                                            label="输入">
                                            <template slot-scope="scope">
                                                 {{`${scope.row.tableChnName}.${scope.row.columnName}`}}
                                            </template>
                                        </el-table-column>
                                        <el-table-column align="center"
                                            label="汇总">
                                            <template slot-scope="scope">
                                                <el-select :disabled="!(scope.row.expressionNumber === undefined || scope.row.expressionNumber === null || scope.row.expressionNumber === '')" v-model="scope.row.groupFunc" clearable @change="autoGroup()">
                                                  <el-option label="MAX" value="MAX"></el-option>
                                                  <el-option label="MIN" value="MIN"></el-option>
                                                  <el-option label="SUM" value="SUM"></el-option>
                                                  <el-option label="AVG" value="AVG"></el-option>
                                                  <el-option label="AVGCOUNT" value="AVGCOUNT"></el-option>
                                                </el-select>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </div>
                                <div class="total-group">
                                    <h3 class="total-group-title">汇总组(GroupBy)</h3>
                                    <div class="total-group-options clearfix">
                                        <div class="total-group-options-fl fl">
                                          <el-checkbox v-model="totalGroup.autoGroupFlag" false-label="0" true-label="1">自动分组</el-checkbox>    
                                          <el-checkbox v-model="totalGroup.distinctFlag" false-label="0" true-label="1">仅选择非重复值</el-checkbox>
                                        </div>
                                        <div class="total-group-options-fr fr">
                                          <el-button v-if="!showCheckbox" @click="updateGroupHandle" :disabled="totalGroup.autoGroupFlag==='1'" size="mini" plain>编辑组</el-button>
                                          <template v-else>
                                            <el-button @click="submitGroupHandle" type="primary" size="mini" >确定</el-button>
                                            <el-button @click="showCheckbox=false" size="mini" plain>取消</el-button>
                                          </template>
                                        </div>    
                                    </div>
                                    <div class="total-group-area">
                                       <el-row v-for="(table,index) in totalGroup.groupInfo" :key="index" :gutter="10" class="total-group-area-row">
                                         <el-tooltip class="item" effect="dark" :content="table.tableName" placement="left">
                                            <el-col :span="4" class="total-group-area-table">
                                                  <span>{{table.tableName}}</span>
                                            </el-col>
                                         </el-tooltip>
                                         <el-col :span="20" class="total-group-area-column">
                                           <span v-for="(column,index) in table.columns" :key="index" class="total-group-area-column-name">{{column.columnName}}</span>
                                         </el-col>
                                       </el-row>
                                    </div>
                                </div>
                              </div>
                              <div class="search-panel-right">
                                <el-tooltip class="item" effect="dark" content="修改" placement="right"><el-button @click="updateResultHandle" class="right-button" icon="el-icon-edit-outline" size="mini"></el-button></el-tooltip><br>
                                <el-tooltip class="item" effect="dark" content="删除" placement="right"><el-button @click="deleteResultHandle" class="right-button" icon="el-icon-delete" size="mini"></el-button></el-tooltip><br>
                                <el-tooltip class="item" effect="dark" content="向上" placement="right"><el-button class="right-button" @click="upHandle('search')" icon="el-icon-arrow-up" size="mini"></el-button></el-tooltip><br>
                                <el-tooltip class="item" effect="dark" content="向下" placement="right"><el-button class="right-button" @click="downHandle('search')" icon="el-icon-arrow-down" size="mini"></el-button></el-tooltip>
                              </div>
                            </el-tab-pane>
                            <el-tab-pane class="search-panel clearfix search-filter" label="过滤数据" name="filter">
                              <div class="search-query" :style="{height:searchToggleFilter2?'calc(100% - 30px)':'30px'}">
                                  <div class="search-query-title">where
                                    <div class="row-option">
                                      <a @click="searchToggleFilter2=false;searchToggleFilter1=true;" v-if="searchToggleFilter2"><svg-icon icon-class="up" />&nbsp;收起</a>
                                      <a @click="searchToggleFilter2=true;searchToggleFilter1=false;" v-else><svg-icon icon-class="down"/>&nbsp;展开</a>
                                    </div>
                                  </div>
                                  <div class="search-query-body">
                                    <div class="search-panel-left">
                                      <div class="filter-table data-table-where">
                                        <el-table
                                            row-key="id"
                                            border
                                            stripe
                                            default-expand-all
                                            highlight-current-row
                                            @row-click="getFilterRow($event,'where')"
                                            :data="tableData.where"
                                            :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
                                            ref="where"
                                            empty-text="请在右侧添加条件"
                                            style="width: 100%">
                                            <el-table-column align="left"
                                                label="表达式">
                                                <template slot-scope="scope">
                                                    {{filter2String(scope.row)}}
                                                </template>
                                            </el-table-column>
                                        </el-table>
                                      </div>
                                      <div class="filter-text-area" v-html="filterStr.where"></div>
                                    </div>
                                    <div class="search-panel-right">
                                      <el-tooltip class="item" effect="dark" content="and" placement="right"><el-button :disabled="tableData.where.length > 0 && !currentRow.where" class="right-button" @click="linkHandle('and','where')" size="mini">与</el-button></el-tooltip><br>
                                      <el-tooltip class="item" effect="dark" content="or" placement="right"><el-button :disabled="tableData.where.length <= 0 || !currentRow.where" class="right-button" @click="linkHandle('or','where')"  size="mini">或</el-button></el-tooltip><br>
                                      <el-tooltip class="item" effect="dark" content="修改" placement="right"><el-button :disabled="tableData.where.length <= 0 || !currentRow.where || currentRow.where.type !== '1'" class="right-button" @click="linkUpdate('where')" icon="el-icon-edit-outline" size="mini"></el-button></el-tooltip><br>
                                      <el-tooltip class="item" effect="dark" content="删除" placement="right"><el-button :disabled="tableData.where.length <= 0 || !currentRow.where" class="right-button" @click="filterDeleteHandle('where')" icon="el-icon-delete" size="mini"></el-button></el-tooltip><br>
                                    </div>
                                  </div>
                                </div>
                                <div class="search-query" :style="{height:searchToggleFilter1?'calc(100% - 30px)':'30px'}">
                                  <div class="search-query-title">having
                                    <div class="row-option">
                                      <a @click="searchToggleFilter1=false;searchToggleFilter2=true;" v-if="searchToggleFilter1"><svg-icon icon-class="up" />&nbsp;收起</a>
                                      <a @click="searchToggleFilter1=true;searchToggleFilter2=false;" v-else><svg-icon icon-class="down"/>&nbsp;展开</a>
                                    </div>
                                  </div>
                                  <div class="search-query-body">
                                    <div class="search-panel-left">
                                      <div class="filter-table">
                                        <el-table
                                        row-key="id"
                                            border
                                            stripe
                                            default-expand-all
                                            highlight-current-row
                                            @row-click="getFilterRow($event,'having')"
                                            :data="tableData.having"
                                            ref="having"
                                            :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
                                            empty-text="请在右侧添加条件"
                                            style="width: 100%">
                                            <el-table-column align="left"
                                                label="表达式">
                                                <template slot-scope="scope">
                                                     {{filter2String(scope.row)}}
                                                </template>
                                            </el-table-column>
                                        </el-table>
                                      </div>
                                      <div class="filter-text-area" v-html="filterStr.having"></div>
                                    </div>
                                    <div class="search-panel-right">
                                      <el-tooltip class="item" effect="dark" content="and" placement="right"><el-button :disabled="tableData.having.length > 0 && !currentRow.having" class="right-button" @click="linkHandle('and','having')" size="mini">与</el-button></el-tooltip><br>
                                      <el-tooltip class="item" effect="dark" content="or" placement="right"><el-button :disabled="tableData.having.length <= 0 || !currentRow.having" class="right-button" @click="linkHandle('or','having')"  size="mini">或</el-button></el-tooltip><br>
                                      <el-tooltip class="item" effect="dark" content="修改" placement="right"><el-button :disabled="tableData.having.length <= 0 || !currentRow.having || currentRow.having.type !== '1'" class="right-button" @click="linkUpdate('having')" icon="el-icon-edit-outline" size="mini"></el-button></el-tooltip><br>
                                      <el-tooltip class="item" effect="dark" content="删除" placement="right"><el-button :disabled="tableData.having.length <= 0 || !currentRow.having" class="right-button" @click="filterDeleteHandle('having')" icon="el-icon-delete" size="mini"></el-button></el-tooltip><br>
                                    </div>
                                  </div>
                                </div>
                                
                            </el-tab-pane>
                            <el-tab-pane class="search-panel clearfix" label="数据排序" name="order">
                              <div class="search-panel-left"  @drop="dropOrder" @dragover="allowDrop">
                                <div class="data-table-order">
                                    <el-table
                                    row-key="id"
                                    empty-text="请拖动左侧列到此选择"
                                        highlight-current-row
                                        border
                                        :data="tableData.order"
                                        @row-click="getOrderRow"
                                        style="width: 100%">
                                        <el-table-column align="center" label="序号" width="65" type="index">
                                        </el-table-column>
                                        <el-table-column align="center"
                                            label="输入">
                                            <template slot-scope="scope">
                                                 {{`${scope.row.tableChnName}.${scope.row.columnName}`}}
                                            </template>
                                        </el-table-column>
                                        <el-table-column align="center"
                                            label="排序">
                                            <template slot-scope="scope">
                                                <el-select v-model="scope.row.orderType" clearable>
                                                  <el-option label="升序" value="1"></el-option>
                                                  <el-option label="降序" value="2"></el-option>
                                                </el-select>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </div>
                              </div>
                               <div class="search-panel-right">
                                <el-tooltip class="item" effect="dark" content="删除" placement="right"><el-button class="right-button" @click="deleteResultOrder" icon="el-icon-delete" size="mini"></el-button></el-tooltip><br>
                                <el-tooltip class="item" effect="dark" content="向上" placement="right"><el-button class="right-button" @click="upHandle('order')" icon="el-icon-arrow-up" size="mini"></el-button></el-tooltip><br>
                                <el-tooltip class="item" effect="dark" content="向下" placement="right"><el-button class="right-button" @click="downHandle('order')" icon="el-icon-arrow-down" size="mini"></el-button></el-tooltip>
                              </div> 
                            </el-tab-pane>
                        </el-tabs>
                    </el-col>
                  </el-row>
              </div>
              <div slot="footer" class="dialog-footer">
                <div>
                    <el-button type="primary" @click="saveHandle">保存</el-button>
                    <el-button @click="shareObject.showDialog=false">取消</el-button>
                </div>
            </div>
            <colculate-column ref="colculateColumn" :modelParam="modelParam" :dbType="dbType" :optionsTree="optionsTree" @setExpressionAdd="setExpressionAdd" @setExpressionUpdate="setExpressionUpdate" @setExpressionDelete="setExpressionDelete"></colculate-column>
        </el-dialog>
        <el-dialog id="relationTable" title="关联表" v-el-drag-dialog append-to-body :close-on-click-modal="false" :visible.sync="TableRelationShow" width="70%" custom-class="dialog-default">
              <div class="dialog-contant-default" v-if="TableRelationShow">
                 <table-relation ref="tableRelation" :originalTableDetail="optionsTree[0]" :relationTableDetail="relationTableDetail"></table-relation>
              </div>
              <div slot="footer" class="dialog-footer">
                <div>
                    <el-button type="primary" @click="relationCommit">确定</el-button>
                    <el-button @click="TableRelationShow=false">取消</el-button>
                </div>
            </div>
        </el-dialog>
        <el-dialog  title="添加结果" v-el-drag-dialog append-to-body :close-on-click-modal="false" :visible.sync="addResultVisable" width="30%" custom-class="dialog-default add-result">
              <div class="dialog-contant-default">
                 <el-form :rules="addResultRules" class="baseUpdate-form" ref="addResultForm" :model="addResultData" label-width="100px">
                    <el-form-item label="列名" prop="columnName">
                        <el-input :disabled="isUpdateResult" class="form-input" v-model="addResultData.columnName" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="中文名" prop="columnChnName">
                        <el-input class="form-input" v-model="addResultData.columnChnName" clearable></el-input>
                    </el-form-item>
                  </el-form>
              </div>
              <div slot="footer" class="dialog-footer">
                <div>
                    <el-button type="primary" @click="saveAddResult">确定</el-button>
                    <el-button @click="addResultVisable=false">取消</el-button>
                </div>
            </div>
        </el-dialog>
        <sql-edit :dbType="dbType" :optionsTree="optionsTree" :modelParam="modelParam" ref="sqlEdit" @saveCloumn="saveCloumn"></sql-edit>
        <!-- <add-table ref="addTable"></add-table> -->
        <relation-table :dataSourceTree="dataSourceTree" @openRelationDialog="openRelationDialog" ref="relationTable" :tableJson="tableJson" :shareObject="shareObject" :modelJson="modelJson" :fromTableNumber="fromTableNumber"></relation-table>
        <param-management ref="paramManagement" :modelParam="modelParam" @saveParamManagement="saveParamManagement"></param-management>
    </div>
</template>
<script>
import { deepClone } from '@/utils/index'
import elDragDialog from '@/directive/el-dragDialog'
import ColculateColumn from './ColculateColumn'
import tableRelation from './tableRelationView2/index'
import sqlEdit from './sqlEdit'
// import addTable from './addTable'
import paramManagement from './paramManagement'
import relationTable from './addTable2'
export default {
  directives: { elDragDialog },
  components: {
    ColculateColumn, tableRelation, sqlEdit, relationTable, paramManagement
  },
  props: {
    shareObject: { type: Object, default: { showDialog: false }},
    dataSourceTree: Array,
    // 整体json
    modelJson: Object,
    // 查询节点json
    qJson: Object,
    // 新增节点 来源
    fromTableNumber: Number
  },
  computed: {
    // 参数管理器
    modelParam: function() {
      return deepClone(this.modelJson.T05ModelParam)
    },
    // 数据源类型
    dbType: function() {
      return this.modelJson.dataSourceType
    },
    dialogVisible: function() {
      return this.shareObject.showDialog
    },
    tableJson: function() {
      return deepClone(this.modelJson.T05ModelTable)
    },
    resultJson: function() {
      if (this.qJson) {
        const tableNumber = this.qJson.tableNumber
        return this.tableJson.find(item => item.tableNumber === tableNumber)
      } else {
        return {}
      }
    },
    // 树列表
    optionsTree: function() {
      if (this.qJson) {
        const T05JoinTable = this.qJson.T05JoinTable
        const treeData = []
        for (const iterator of T05JoinTable) {
          const table = deepClone(this.tableJson.find(item => item.tableNumber === iterator.tableNumber))
          table.tableIdx = iterator.tableIdx
          table.joinType = iterator.joinType
          table.joinRelation = iterator.joinRelation
          table.T05ModelColumn = table.T05ModelColumn.map(item => {
            item.tableIdxColumnNumber = table.tableIdx + '' + item.columnNumber
            return item
          })
          treeData.push(table)
        }
        if (this.qJson.T05JoinExpression.length > 0) {
          const expressionColumns = []
          const tableIdx = new Date().getTime()
          for (const iterator of this.qJson.T05JoinExpression) {
            expressionColumns.push({
              columnChnName: '',
              columnId: iterator.columnIdx,
              columnIdx: iterator.columnIdx,
              columnName: iterator.columnName,
              columnNumber: null,
              expression: iterator.expression,
              columnType: iterator.columnType,
              tableIdxColumnNumber: tableIdx + '' + iterator.columnIdx
            })
          }
          treeData.push({
            T05ModelColumn: expressionColumns,
            joinRelation: null,
            joinType: null,
            schemaName: null,
            tableChnName: '计算列',
            tableId: null,
            tableIdx: tableIdx,
            tableName: '计算列',
            tableNumber: null,
            tableType: null
          })
        }
        return treeData
      } else {
        const treeData = []
        const table = deepClone(this.tableJson.find(item => item.tableNumber === this.fromTableNumber))
        table.tableIdx = new Date().getTime()
        table.joinType = '0'
        table.joinRelation = null
        table.T05ModelColumn = table.T05ModelColumn.map(item => {
          item.tableIdxColumnNumber = table.tableIdx + '' + item.columnNumber
          return item
        })
        treeData.push(table)
        return treeData
      }
    },
    autoGroupFlag: function() {
      return this.totalGroup.autoGroupFlag
    }
  },
  mounted() {
    if (this.qJson) {
      // 名称赋值
      this.searchItem.searchName = this.qJson.title
      this.searchItem.outputName = this.resultJson.tableChnName
      // 汇总赋值
      for (const key in this.totalGroup) {
        this.totalGroup[key] = this.qJson['T05JoinNode'][key]
      }

      // 选择数据赋值 查询
      const T05JoinColumn = this.qJson.T05JoinColumn
      this.tableData.search = []
      for (const iterator of T05JoinColumn) {
        let paramsOri = {}
        if (iterator.expressionNumber) {
          paramsOri = this.getExOriName(iterator.expressionNumber)
        } else {
          paramsOri = this.getResultOriName(iterator.tableNumber, iterator.columnNumber)
        }
        const paramsNew = this.resultJson.T05ModelColumn.find(item => item.columnNumber === iterator.columnIdx)
        const column = {
          columnIdx: iterator.columnIdx,
          tableIdx: iterator.tableIdx,
          tableNumber: iterator.tableNumber,
          columnNumber: iterator.columnNumber,
          expressionNumber: iterator.expressionNumber,
          groupFunc: iterator.groupFunc,
          orderType: null,
          tableChnName: paramsOri.tableChnName,
          columnName: paramsOri.columnName,
          newName: {
            columnName: paramsNew.columnName,
            columnChnName: paramsNew.columnChnName
          }
        }
        this.tableData.search.push(column)
      }
      // 选择数据赋值 排序
      const T05JoinOrder = this.qJson.T05JoinOrder
      this.tableData.order = []
      for (const iterator of T05JoinOrder) {
        let paramsOri = {}
        if (iterator.expressionNumber) {
          paramsOri = this.getExOriName(iterator.expressionNumber)
        } else {
          paramsOri = this.getResultOriName(iterator.tableNumber, iterator.columnNumber)
        }
        const column = {
          columnIdx: iterator.columnIdx,
          tableIdx: iterator.tableIdx,
          tableNumber: iterator.tableNumber,
          columnNumber: iterator.columnNumber,
          expressionNumber: iterator.expressionNumber,
          orderType: iterator.orderType,
          tableChnName: paramsOri.tableChnName,
          columnName: paramsOri.columnName
        }
        this.tableData.order.push(column)
      }
      // 过滤数据赋值
      if (this.qJson.T05JoinFilter.where && this.qJson.T05JoinFilter.where.length > 0) {
        this.tableData.where = deepClone(this.qJson.T05JoinFilter.where)
        this.getFilterStr('where')
      }
      // 过滤数据赋值
      if (this.qJson.T05JoinFilter.hive && this.qJson.T05JoinFilter.hive.length > 0) {
        this.tableData.having = deepClone(this.qJson.T05JoinFilter.hive)
        this.getFilterStr('having')
      }
    }
  },
  watch: {
    autoGroupFlag(val) {
      if (val === '1') {
        this.autoGroup()
      } else {
        this.totalGroup.groupInfo = []
      }
    }
  },
  data() {
    return {
      // 判断当前是where 还是having
      condition: '',
      // and or
      filterType: null,
      // 添加或修改过滤
      filterStatus: '0', // 0添加  1修改
      // 树是否显示复选框
      showCheckbox: false,
      // 重新加载tree
      treeStatus: true,
      // 添加表 传入关联表的 关联表
      relationTableDetail: {},
      isUpdateResult: false,
      // 添加结果数据
      addResultData: {
        columnName: null,
        columnChnName: null
      },
      // 添加结果校验
      addResultRules: {
        columnName: [
          {
            required: true, message: '列名不能为空'
          },
          {
            validator: (rule, value, callback) => {
              if (this.isUpdateResult) {
                callback()
              } else {
                if (this.tableData.search.some(item => item.newName.columnName === value)) {
                  callback(new Error('该列名已存在'))
                } else {
                  callback()
                }
              }
            }
          }
        ],
        columnChnName: [
          {
            required: true, message: '列中文名名不能为空'
          }
        ]
      },
      // 添加结果显示
      addResultVisable: false,
      // 拖动节点
      dragNode: null,
      searchItem: {
        searchName: null,
        outputName: null
      },
      TableRelationShow: false,
      totalGroup: {
        autoGroupFlag: '0',
        distinctFlag: '0',
        groupInfo: []
      },
      activeName: 'search',
      defaultProps: {
        children: 'T05ModelColumn',
        label: 'columnName'
      },
      filterStr: {
        where: '',
        having: ''
      },
      searchToggleFilter1: false,
      searchToggleFilter2: true,
      tableData: {
        search: [],
        order: [],
        where: [],
        having: []
      },
      currentRow: {
        search: null,
        order: null,
        where: null,
        having: null
      }
    }
  },
  methods: {
    // 拼接条件字符串
    getFilterStr(condition) {
      this.filterStr[condition] = ''
      if (this.tableData[condition].length > 0) {
        if (this.tableData[condition][0].type === '1') {
          if (this.tableData[condition][0].value) {
            this.filterStr[condition] += this.expressionText('', this.tableData[condition][0].value) + ' '
          }
        } else {
          this.condition = condition
          this.getChildrenFilterStr(this.tableData[condition][0], true)
        }
      }
    },
    // 递归获取值
    getChildrenFilterStr(node, first) {
      if (!first) {
        this.filterStr[this.condition] += '<b>(</b>'
      }
      for (const [index, iterator] of node.children.entries()) {
        if (index === 1) {
          this.filterStr[this.condition] += '<i>&nbsp;' + node.value + '</i> '
        }
        if (iterator.type === '1') {
          this.filterStr[this.condition] += '<span class="condition">'
          // for (const it of iterator.value) {
          //   this.filterStr[this.condition] += it.value + ' '
          // }
          this.filterStr[this.condition] += this.expressionText('', iterator.value) + ' '
          this.filterStr[this.condition] += '</span>'
        } else {
          this.getChildrenFilterStr(iterator)
        }
      }
      if (!first) {
        this.filterStr[this.condition] += '<b>)</b> '
      }
    },
    // 递归获取表达式
    expressionText(text, arr) {
      for (const iterator of arr) {
        text += iterator.value + ' '
        if (iterator.children && iterator.children.length > 0) {
          text = this.expressionText(text, iterator.children)
        }
      }
      return text
    },
    // 点击filter节点
    getFilterRow(row, type) {
      this.currentRow[type] = row
    },
    // 获取过滤字符串
    filter2String(row) {
      if (row.type === '0') {
        let value = ''
        switch (row.value) {
          case 'and':
            value = '与'
            break
          case 'or':
            value = '或'
            break
        }
        return value
      } else {
        return this.expressionText('', row.value) + ' '
      }
    },
    // 保存过滤编辑器
    saveCloumn(data) { // 保存
      // 添加保存
      if (this.filterStatus === '0') {
        const currentTime = new Date().getTime()
        if (this.tableData[this.condition].length <= 0) {
          this.tableData[this.condition].push({
            id: currentTime,
            value: data,
            type: '1' // 0 连接符 1条件
          })
        } else {
          const children = [
            {
              id: this.currentRow[this.condition].id,
              value: this.currentRow[this.condition].value,
              type: this.currentRow[this.condition].type
            },
            {
              id: currentTime + 1,
              value: data,
              type: '1'
            }
          ]
          this.currentRow[this.condition].id = currentTime
          this.currentRow[this.condition].value = this.filterType
          this.currentRow[this.condition].type = '0'
          // this.currentRow[this.condition].children = children
          this.$set(this.currentRow[this.condition], 'children', children)
          this.$nextTick(_ => {
            const allRow = document.querySelectorAll('.data-table-where .el-table__row')
            for (const rowDom of allRow) {
              rowDom.classList.remove('current-row')
            }
          })
          this.currentRow[this.condition] = null
        }
      } else {
        // 修改保存
        this.$set(this.currentRow[this.condition], 'value', data)
      }
      this.getFilterStr(this.condition)
    },
    // 删除过滤事件
    filterDeleteHandle(condition) {
      this.condition = condition
      if (this.currentRow[condition].id === this.tableData[condition][0].id) {
        this.tableData[condition].splice(0, 1)
      } else {
        const fatherNode = this.findFilterFather(this.tableData[condition][0])
        if (fatherNode) {
          const theOtherNode = fatherNode.children.find(item => item.id !== this.currentRow[condition].id)
          fatherNode.id = theOtherNode.id
          fatherNode.value = theOtherNode.value
          fatherNode.type = theOtherNode.type
          if (theOtherNode.children) {
            fatherNode.children = theOtherNode.children
          } else {
            delete fatherNode.children
          }
        }
      }
      this.$nextTick(_ => {
        const allRow = document.querySelectorAll('.data-table-where .el-table__row')
        for (const rowDom of allRow) {
          rowDom.classList.remove('current-row')
        }
      })
      this.currentRow[condition] = null
      this.getFilterStr(condition)
    },
    // 找到删除过滤点的父节点
    findFilterFather(node) {
      if (node.children) {
        for (const iterator of node.children) {
          if (iterator.id === this.currentRow[this.condition].id) {
            return node
          }
          const result = this.findFilterFather(iterator)
          if (result) {
            return result
          }
        }
      }
    },
    // 删除树表加载编辑组
    deleteTableGroup() {
      if (this.totalGroup.autoGroupFlag === '1') return
      this.totalGroup.groupInfo = this.totalGroup.groupInfo.filter(item => {
        return this.optionsTree.some(it => it.tableIdx === item.tableIdx)
      })
    },
    // 针对计算列改变更新编辑组
    updateGroupForColculate() {
      if (this.totalGroup.autoGroupFlag === '1') return
      const exTable = this.optionsTree.find(item => !item.joinType)
      if (!exTable) return
      const groupExTable = this.totalGroup.groupInfo.find(item => item.tableIdx === exTable.tableIdx)
      if (!groupExTable) return
      groupExTable.columns.forEach((item, index) => {
        const exColumn = exTable.T05ModelColumn.find(it => it.columnIdx === item.expressionNumber)
        if (exColumn) {
          item.columnName = exColumn.columnName
        } else {
          groupExTable.columns.splice(index, 1)
        }
      })
      if (groupExTable.columns.length <= 0) {
        const groupExTableIndex = this.totalGroup.groupInfo.findIndex(item => item.tableIdx === exTable.tableIdx)
        this.totalGroup.groupInfo.splice(groupExTableIndex, 1)
      }
    },
    // 确定编辑组
    submitGroupHandle() {
      if (this.totalGroup.autoGroupFlag === '1') return
      this.totalGroup.groupInfo = []
      // this.$refs.optionsTreeRef.setChecked(224, true)
      const checkedAll = this.$refs.optionsTreeRef.getCheckedNodes(false, true)
      let currentTable = null
      for (const iterator of checkedAll) {
        if (iterator.tableIdx) {
          currentTable = {}
          currentTable.tableIdx = iterator.tableIdx
          currentTable.tableName = iterator.tableChnName
          currentTable.columns = []
          this.totalGroup.groupInfo.push(currentTable)
        } else {
          if (currentTable) {
            currentTable.columns.push({
              columnNumber: iterator.columnNumber,
              columnName: iterator.columnName,
              expressionNumber: iterator.columnIdx
            })
          }
        }
      }
      this.showCheckbox = false
    },
    // 禁用计算列勾选
    forbidenCollulate() {
      for (const iterator of this.optionsTree) {
        if (!iterator.joinType) {
          iterator.disabled = true
          for (const it of iterator.T05ModelColumn) {
            it.disabled = true
          }
        }
      }
    },
    // 点击编辑组
    updateGroupHandle() {
      // 禁用计算列勾选
      this.forbidenCollulate()
      this.optionsTree[0].disabled = true
      this.showCheckbox = true
      this.$nextTick(_ => {
        // 清空
        this.$refs.optionsTreeRef.setCheckedKeys([])
        // 勾选
        for (const table of this.totalGroup.groupInfo) {
          const treeTable = this.optionsTree.find(item => item.tableIdx === table.tableIdx)
          if (treeTable) {
            for (const iterator of table.columns) {
              const columnTree = treeTable.T05ModelColumn.find(item => iterator.expressionNumber ? (item.columnIdx === iterator.expressionNumber) : (item.columnNumber === iterator.columnNumber))
              if (columnTree) {
                this.$refs.optionsTreeRef.setChecked(columnTree.tableIdxColumnNumber, true)
              }
            }
          }
        }
      })
    },
    // 自动分组
    autoGroup() {
      if (this.totalGroup.autoGroupFlag !== '1') return
      this.totalGroup.groupInfo = []
      for (const iterator of this.tableData.search) {
        if (!iterator.groupFunc && (!iterator.expressionNumber && iterator.expressionNumber !== 0)) {
          const groupTable = this.totalGroup.groupInfo.find(item => item.tableIdx === iterator.tableIdx)
          if (groupTable) {
            if (groupTable.columns.every(item => iterator.expressionNumber ? (item.expressionNumber !== iterator.expressionNumber) : (item.columnNumber !== iterator.columnNumber))) {
              groupTable.columns.push({
                columnNumber: iterator.columnNumber,
                columnName: iterator.columnName,
                expressionNumber: iterator.expressionNumber
              })
            }
          } else {
            const tempTable = {
              tableIdx: iterator.tableIdx,
              tableName: iterator.tableChnName,
              columns: [{
                columnNumber: iterator.columnNumber,
                columnName: iterator.columnName,
                expressionNumber: iterator.expressionNumber
              }]
            }
            this.totalGroup.groupInfo.push(tempTable)
          }
        }
      }
    },
    // 保存参数管理器
    saveParamManagement(obj) {
      for (const key in this.modelParam) {
        delete this.modelParam[key]
      }
      for (const key in obj) {
        this.modelParam[key] = obj[key]
      }
      this.modelJson.T05ModelParam
      this.$set(this.modelJson, 'T05ModelParam', this.modelParam)
    },
    // 添加计算列
    setExpressionAdd(column) {
      const currentTime = new Date().getTime()
      const exTable = this.optionsTree.find(item => !item.joinType)
      const expressionColumn =
      {
        columnChnName: '',
        columnId: currentTime + 1,
        columnIdx: currentTime + 1,
        columnName: column.name,
        columnNumber: null,
        expression: column.data,
        columnType: column.type
      }
      if (exTable) {
        expressionColumn.tableIdxColumnNumber = exTable.tableIdx + '' + expressionColumn.columnIdx
        exTable.T05ModelColumn.push(expressionColumn)
      } else {
        expressionColumn.tableIdxColumnNumber = currentTime + '' + expressionColumn.columnIdx
        const expressionTable = {
          T05ModelColumn: [expressionColumn],
          joinRelation: null,
          joinType: null,
          schemaName: null,
          tableChnName: '计算列',
          tableId: null,
          tableIdx: currentTime,
          tableName: '计算列',
          tableNumber: null,
          tableType: null
        }
        this.optionsTree.push(expressionTable)
      }
      this.resetTree()
    },
    // 修改计算列
    setExpressionUpdate(params) {
      const exTable = this.optionsTree.find(item => !item.joinType)
      const column = exTable.T05ModelColumn[params.index]
      if (params.data) {
        column.expression = params.data
      } else if (params.name) {
        column.columnName = params.name
        column.columnType = params.type
        this.resetNameColculateSearchAndOrder(this.tableData.search, column)
        this.resetNameColculateSearchAndOrder(this.tableData.order, column)
        this.autoGroup()
        this.resetTree()
        this.updateGroupForColculate()
      }
    },
    // 删除计算列
    setExpressionDelete(index) {
      const exTable = this.optionsTree.find(item => !item.joinType)
      this.deleteColculateSearchAndOrder(exTable.T05ModelColumn[index])
      exTable.T05ModelColumn.splice(index, 1)
      if (exTable.T05ModelColumn.length <= 0) {
        const tableIndex = this.optionsTree.findIndex(item => !item.joinType)
        this.optionsTree.splice(tableIndex, 1)
        this.deleteTableGroup()
      } else {
        this.updateGroupForColculate()
      }
    },
    // 修改计算列名称对应的结果和排序
    resetNameColculateSearchAndOrder(tableData, column) {
      const resultColumn = tableData.find(item => item.expressionNumber === column.columnIdx)
      if (resultColumn) {
        resultColumn.columnName = column.columnName
      }
      for (const item of tableData) {
        if (item.expressionNumber === column.columnIdx) {
          item.columnName = column.columnName
        }
      }
    },
    // 删除计算列对应的结果和排序
    deleteColculateSearchAndOrder(column) {
      this.tableData.search = this.tableData.search.filter(item => item.expressionNumber !== column.columnIdx)
      this.tableData.order = this.tableData.order.filter(item => item.expressionNumber !== column.columnIdx)
      this.autoGroup()
    },
    // 重新加载树
    resetTree() {
      this.treeStatus = false
      this.$nextTick(_ => {
        this.treeStatus = true
      })
    },
    // 关联表提交
    relationCommit() {
      const result = this.$refs.tableRelation.relationCommit()
      if (!result) {
        this.$message.warning('请在表之间添加字段关系连线')
        return
      }
      if (!this.tableJson.some(item => item.tableId === result.tableId)) {
        this.tableJson.length = 0
        for (const iterator of this.modelJson.T05ModelTable) {
          this.tableJson.push(iterator)
        }
        const table = {
          'tableNumber': result.tableNumber,
          'tableType': '1', // '1' 原始表 '2' 结果表
          'tableId': result.tableId,
          'tableName': result.tableName,
          'tableChnName': result.tableChnName,
          'schemaName': result.schemaName,
          'T05ModelColumn': result.T05ModelColumn
        }
        this.tableJson.push(table)
      }
      const index = this.optionsTree.findIndex(item => item.joinType === '1')
      if (index !== -1) {
        this.$set(this.optionsTree, index, result)
      } else {
        this.$set(this.optionsTree, this.optionsTree.length, result)
      }
      this.deleteRelationSearchAndOrder()
      this.resetTree()
      this.deleteTableGroup()
      this.TableRelationShow = false
    },
    // 重新关联表删除已选择和排序
    deleteRelationSearchAndOrder() {
      this.tableData.search = this.tableData.search.filter(item => {
        if (item.expressionNumber) {
          return true
        } else {
          return this.optionsTree.some(it => it.tableNumber === item.tableNumber)
        }
      })
      this.autoGroup()
      this.tableData.order = this.tableData.order.filter(item => {
        if (item.expressionNumber) {
          return true
        } else {
          return this.optionsTree.some(it => it.tableNumber === item.tableNumber)
        }
      })
    },
    // 获取原始表中文名 以及 列英文名
    getResultOriName(tableNumber, columnNumber) {
      const table = this.optionsTree.find(item => item.tableNumber === tableNumber)
      const column = table ? (table.T05ModelColumn.find(item => item.columnNumber === columnNumber)) : null
      return {
        tableChnName: table ? (table.tableChnName ? table.tableChnName : table.tableName) : '',
        columnName: column ? column.columnName : ''
      }
    },
    // 获取计算列中文名 及 列名
    getExOriName(expressionNumber) {
      // 计算列
      const T05JoinExpression = this.qJson.T05JoinExpression
      const item = T05JoinExpression.find(item => item.columnIdx === expressionNumber)
      return {
        tableChnName: item ? '计算列' : '',
        columnName: item ? item.columnName : ''
      }
    },
    // 向上
    upHandle(type) {
      if (this.currentRow[type]) {
        this.tableData[type].find((item, index, arr) => {
          if (item === this.currentRow[type] && index !== 0) {
            arr.splice(index, 1)
            arr.splice(index - 1, 0, item)
            return
          }
        })
      }
    },
    // 向下
    downHandle(type) {
      if (this.currentRow[type]) {
        for (const [index, item] of this.tableData[type].entries()) {
          if (item === this.currentRow[type] && index !== this.tableData[type].length - 1) {
            this.tableData[type].splice(index, 1)
            this.tableData[type].splice(index + 1, 0, item)
            break
          }
        }
      }
    },
    getSearchRow(row) {
      this.currentRow.search = row
    },
    getOrderRow(row) {
      this.currentRow.order = row
    },
    openColculateClolumn() {
      this.showCheckbox = false
      const table = this.optionsTree.find(item => !item.joinType)
      if (table) {
        this.$refs.colculateColumn.openColculateClolumn(table.T05ModelColumn)
      } else {
        this.$refs.colculateColumn.openColculateClolumn()
      }
    },
    // 打开关联表添加选表
    associationTable() {
      this.showCheckbox = false
      const item = this.optionsTree.find(item => item.joinType === '1')
      this.$refs.relationTable.openDialog(item)
    },
    addTable() {
      this.$refs.addTable.openDialog()
    },
    openRelationDialog(relationTableDetail) {
      this.relationTableDetail = relationTableDetail
      this.TableRelationShow = true
    },
    openParamManagement() {
      this.$refs.paramManagement.openDialog()
    },
    linkHandle(type, condition) {
      if (this.currentRow[condition] && this.currentRow[condition].type === '0') {
        this.currentRow[condition].value = type
        this.getFilterStr(condition)
      } else {
        this.condition = condition
        this.filterType = type
        this.filterStatus = '0'
        this.$refs.sqlEdit.createSqlEdit()
      }
    },
    linkUpdate(condition) {
      this.filterStatus = '1'
      this.condition = condition
      this.$refs.sqlEdit.openSqlEdit(deepClone(this.currentRow[condition].value))
    },
    // 保存
    saveHandle() {
      if (!this.searchItem.searchName || !this.searchItem.outputName) {
        this.$message.warning('查询名称和输出名称不能为空')
        return
      }
      if (this.tableData.search.length <= 0) {
        this.$message.warning('查询结果列不能为空')
        return
      }
      const resultTableNumber = this.qJson ? this.qJson.tableNumber : new Date().getTime()
      // 保存查询节点
      const queryJson = {}
      queryJson.id = this.qJson ? this.qJson.id : new Date().getTime()
      queryJson.tableNumber = resultTableNumber
      queryJson.T05JoinNode = deepClone(this.totalGroup)
      queryJson.x = this.qJson ? this.qJson.x : null
      queryJson.y = this.qJson ? this.qJson.y : null
      queryJson.shape = '2'
      queryJson.nodeType = '2'
      queryJson.title = this.searchItem.searchName
      queryJson.T05JoinTable = []
      queryJson.T05JoinExpression = []
      // 关联表
      for (const iterator of this.optionsTree) {
        if (iterator.tableType === '1' || iterator.tableType === '2') {
          queryJson.T05JoinTable.push({
            tableIdx: iterator.tableIdx,
            tableNumber: iterator.tableNumber,
            joinType: iterator.joinType,
            joinRelation: iterator.joinRelation
          })
        } else {
          // 计算列
          for (const it of iterator.T05ModelColumn) {
            queryJson.T05JoinExpression.push({
              'columnIdx': it.columnIdx,
              'columnType': it.columnType, // '计算列类型 1 字符 2 数值',
              'expression': it.expression,
              'columnName': it.columnName
            })
          }
        }
      }
      // 结果列
      queryJson.T05JoinColumn = []
      for (const iterator of this.tableData.search) {
        queryJson.T05JoinColumn.push({
          columnIdx: iterator.columnIdx,
          tableIdx: iterator.tableIdx,
          tableNumber: iterator.tableNumber,
          columnNumber: iterator.columnNumber,
          expressionNumber: iterator.expressionNumber,
          groupFunc: iterator.groupFunc
        })
      }
      queryJson.T05JoinFilter = {
        where: this.tableData.where,
        hive: this.tableData.having
      }
      queryJson.T05JoinOrder = []
      // 排序
      for (const iterator of this.tableData.order) {
        queryJson.T05JoinOrder.push({
          columnIdx: iterator.columnIdx,
          tableIdx: iterator.tableIdx,
          tableNumber: iterator.tableNumber,
          columnNumber: iterator.columnNumber,
          expressionNumber: iterator.expressionNumber,
          orderType: iterator.orderType
        })
      }
      // 保存结果表
      const resultJosn = {}
      resultJosn.tableNumber = resultTableNumber
      resultJosn.tableType = '2'
      resultJosn.tableId = resultTableNumber
      resultJosn.tableName = ''
      resultJosn.tableChnName = this.searchItem.outputName
      resultJosn.schemaName = ''
      resultJosn.T05ModelColumn = []
      for (const iterator of this.tableData.search) {
        resultJosn.T05ModelColumn.push({
          columnNumber: iterator.columnIdx,
          columnName: iterator.newName.columnName,
          columnChnName: iterator.newName.columnChnName,
          columnId: null
        })
      }
      if (this.qJson) {
        const index = this.tableJson.findIndex(item => item.tableNumber === this.qJson.tableNumber)
        this.tableJson.splice(index, 1, resultJosn)
      } else {
        this.tableJson.push(resultJosn)
      }
      const params = {
        tableJson: this.tableJson,
        queryJson: queryJson,
        resultJosn: resultJosn
      }
      this.$emit(this.qJson ? 'saveQueryUpdate' : 'saveQueryCreate', params)
      this.shareObject.showDialog = false
    },
    // 是否可拖动
    draggable(data) {
      return data.columnName
    },
    dragstart(ev, data) {
      this.dragNode = data
    },
    allowDrop(ev) {
      ev.preventDefault()
    },
    // 多动到选择数据
    drop(ev) {
      ev.preventDefault()
      this.addResultData.columnName = this.dragNode.data.columnName || null
      this.addResultData.columnChnName = this.dragNode.data.columnChnName || null
      // for (const key in this.addResultData) {
      //   this.addResultData[key] = null
      // }
      this.addResultVisable = true
      this.isUpdateResult = false
      this.$nextTick(_ => {
        this.$refs.addResultForm.clearValidate()
      })
    },
    dropOrder(ev) {
      ev.preventDefault()
      // 计算列
      if (this.dragNode.data.expression) {
        if (this.tableData.order.find(item => item.expressionNumber === this.dragNode.data.columnIdx)) {
          this.$message.warning('该列已存在')
        } else {
          const result = {
            columnIdx: new Date().getTime(),
            tableIdx: null,
            tableNumber: null,
            columnNumber: null,
            expressionNumber: this.dragNode.data.columnIdx,
            orderType: null,
            tableChnName: '计算列',
            columnName: this.dragNode.data.columnName
          }
          this.tableData.order.push(result)
        }
      // 原始表 关联表
      } else {
        if (this.tableData.order.find(item => item.tableNumber === this.dragNode.parent.data.tableNumber && item.columnNumber === this.dragNode.data.columnNumber)) {
          this.$message.warning('该列已存在')
        } else {
          const relationtable = this.optionsTree.find(item => item.joinType === '1')
          let dragColumn = this.dragNode.data
          let dragParent = this.dragNode.parent.data
          if (relationtable) {
            const oriTable = this.optionsTree.find(item => item.joinType === '0')
            if (relationtable.tableNumber === oriTable.tableNumber) {
              dragParent = oriTable
              dragColumn = oriTable.T05ModelColumn.find(item => item.columnId === dragColumn.columnId)
            }
          }
          const result = {
            columnIdx: new Date().getTime(),
            tableIdx: dragParent.tableIdx,
            tableNumber: dragParent.tableNumber,
            columnNumber: dragColumn.columnNumber,
            expressionNumber: null,
            orderType: null,
            tableChnName: dragParent.tableChnName || dragParent.tableName,
            columnName: dragColumn.columnName
          }
          this.tableData.order.push(result)
        }
      }
    },
    // 删除结果列
    deleteResultHandle() {
      if (this.currentRow.search) {
        const searchIndex = this.tableData.search.findIndex(item => item.columnIdx === this.currentRow.search.columnIdx)
        const orderhIndex = this.tableData.order.findIndex(item => item.columnIdx === this.currentRow.search.columnIdx)
        if (searchIndex !== -1) {
          this.tableData.search.splice(searchIndex, 1)
        }
        if (orderhIndex !== -1) {
          this.tableData.order.splice(orderhIndex, 1)
        }
        this.currentRow.search = null
        this.$nextTick(_ => {
          const allRow = document.querySelectorAll('.data-table .el-table__row')
          for (const rowDom of allRow) {
            rowDom.classList.remove('current-row')
          }
        })
        this.autoGroup()
      }
    },
    // 删除结果排序列
    deleteResultOrder() {
      if (this.currentRow.order) {
        const orderhIndex = this.tableData.order.findIndex(item => item.columnIdx === this.currentRow.order.columnIdx)
        if (orderhIndex !== -1) {
          this.tableData.order.splice(orderhIndex, 1)
        }
        this.$nextTick(_ => {
          const allRow = document.querySelectorAll('.data-table-order .el-table__row')
          for (const rowDom of allRow) {
            rowDom.classList.remove('current-row')
          }
        })
        this.currentRow.order = null
      }
    },
    // 获取修改列
    updateResultHandle() {
      if (!this.currentRow.search) {
        return
      }
      this.isUpdateResult = true
      this.addResultVisable = true
      this.addResultData.columnName = this.currentRow.search.newName.columnName
      this.addResultData.columnChnName = this.currentRow.search.newName.columnChnName
    },
    // 保存新增列
    saveAddResult() {
      this.$refs.addResultForm.validate(valid => {
        if (valid) {
          if (this.isUpdateResult) {
            this.currentRow.search.newName.columnChnName = this.addResultData.columnChnName
            this.addResultVisable = false
          } else {
            const result = {
              columnIdx: new Date().getTime(),
              tableIdx: this.dragNode.data.expression ? null : this.dragNode.parent.data.tableIdx,
              tableNumber: this.dragNode.data.expression ? null : this.dragNode.parent.data.tableNumber,
              columnNumber: this.dragNode.data.expression ? null : this.dragNode.data.columnNumber,
              expressionNumber: this.dragNode.data.expression ? this.dragNode.data.columnIdx : null,
              groupFunc: null,
              tableChnName: this.dragNode.parent.data.tableChnName || this.dragNode.parent.data.tableName,
              columnName: this.dragNode.data.columnName,
              newName: {
                columnName: this.addResultData.columnName,
                columnChnName: this.addResultData.columnChnName
              }
            }
            this.tableData.search.push(result)
            this.addResultVisable = false
            this.autoGroup()
          }
        } else {
          return false
        }
      })
    }
  }
}
</script>
<style lang="scss">
    $scBgc:#EBE9ED;
    $scDeepBgc:#F3F3F3;
    $scborderColor:#e4e7ed;
    $scborderColor2:#B3ACBC;
    .search-create{
      .fl{
        float: left;
      }
      .fr{
        float: right;
      }
        .dialog-contant-default{
            background-color: $scBgc;
            padding:0;
            .header-form{
                height: 40px;
                padding-top:3px;
                padding-left:5px;
                border: 1px solid $scborderColor2;
                background-color: #fff;
            }
            .header-options{
                height: 25px;
                line-height: 25px;
                background-color: $scDeepBgc;
                border-bottom: 1px solid $scborderColor2;
                a{
                    display: inline-block;
                    font-size: 12px;
                    height: 100%;
                    padding-left: 10px;
                    padding-right: 10px;
                    border-right: 1px solid $scborderColor2;
                }
            }
            .search-create-content{
                height: calc(100% - 65px);
                padding-right: 5px;
                .left-part{
                    height: 100%;
                    padding:5px 5px 0 5px;
                    .tree-header{
                        background-color: $scDeepBgc;
                        height: 30px;
                        line-height: 30px;
                        padding-left: 5px;
                        border: 1px solid $scborderColor2;
                        border-bottom: 0;
                        a{
                            font-size: 12px;
                            font-weight: bold;
                        }
                    }
                    .tree-content{
                        position: relative;
                        height: calc(100% - 30px);
                        border: 1px solid $scborderColor2;
                        border-top:0;
                        background-color: #fff;
                        overflow: auto;
                        .el-tree{
                          position:absolute;
                        }
                    }
                }
                .right-part{
                    height: calc(100% - 5px);
                    margin-top: 5px;
                    border: 1px solid $scborderColor2;
                    .el-tabs__header{
                        margin:0;
                        padding-left: 20px;
                        background-color: $scDeepBgc;
                        .el-tabs__item{
                            height: 30px;
                            line-height: 30px;
                            // padding:0 20px;
                        }
                    }
                    .el-tabs__content{
                        height: calc(100% - 30px);
                        .search-panel{
                          height: 100%;
                          background-color: #fff;
                          // padding:5px;
                          .search-panel-left{
                            height: 100%;
                            float: left;
                            width: calc(100% - 60px);
                            .data-table{
                              height: calc(100% - 158px);
                              overflow: auto;
                              // .el-table--striped .el-table__body tr.el-table__row--striped.current-row td, .el-table__body tr.current-row>td, .el-table__body tr.hover-row.current-row>td, .el-table__body tr.hover-row.el-table__row--striped.current-row>td, .el-table__body tr.hover-row.el-table__row--striped>td, .el-table__body tr.hover-row>td{
                              //   background-color: #42b983;
                              // }
                            }
                            .data-table-order{
                              height: 100%;
                              overflow: auto;
                              // .el-table--striped .el-table__body tr.el-table__row--striped.current-row td, .el-table__body tr.current-row>td, .el-table__body tr.hover-row.current-row>td, .el-table__body tr.hover-row.el-table__row--striped.current-row>td, .el-table__body tr.hover-row.el-table__row--striped>td, .el-table__body tr.hover-row>td{
                              //   background-color: #42b983;
                              // }
                            }
                            .total-group{
                                background-color:$scDeepBgc;
                                margin-top:5px;
                                padding-bottom: 5px;
                                border:1px solid $scborderColor;
                                .total-group-title{
                                    margin:0;
                                    padding-left: 5px;
                                    height: 25px;
                                }
                                .total-group-options{
                                    height: 25px;
                                    margin-top: 5px;
                                    padding-left: 5px;
                                    .total-group-options-fr{
                                      margin-top:-7px;
                                      margin-right:5px;
                                    }
                                }
                                .total-group-area{
                                    margin:5px;
                                    padding:5px;
                                    border:1px solid #ccc;
                                    height: 83px;
                                    background-color: #fff;
                                    overflow: auto;
                                    .total-group-area-row{
                                      height: 23px;
                                      line-height: 23px;
                                      .total-group-area-table{
                                        white-space: nowrap;
                                        overflow: hidden;
                                        text-overflow: ellipsis;
                                        padding-right: 10px;
                                        color:#409EFF;
                                      }
                                      .total-group-area-column-name{
                                          margin-right:25px;
                                          color:#909399;
                                      }
                                    }
                                }
                            }
                            
                          }
                          .search-panel-right{
                            float: left;
                            width: 60px;
                            height: 100%;
                            text-align: center;
                            background-color: $scDeepBgc;
                            .right-button{
                              margin-top:15px;
                            }
                          }
                          &.search-filter{
                              overflow: auto;
                              .search-query{
                                height: calc(100% - 30px);
                                border:1px solid $scborderColor;
                                overflow: hidden;
                                transition: height 0.28s linear;
                                .search-query-title{
                                  padding-left: 5px;
                                  padding-right: 5px;
                                  height: 30px;
                                  line-height: 30px;
                                  font-weight: bold;
                                  background-color: $scBgc;
                                  .row-option{
                                    float: right;
                                    font-weight: normal;
                                  }
                                }
                                .search-query-body{
                                  height: calc(100% - 30px);
                                  // padding:5px;
                                  .filter-table{
                                    height: calc(100% - 110px);
                                    overflow: auto;
                                  }
                                  .filter-text-area{
                                    border: 1px solid $scborderColor;
                                    border-radius: 5px;
                                    padding:5px;
                                    margin:5px;
                                    width:calc(100% - 10px);
                                    height:100px;
                                    line-height: 20px;
                                    overflow: auto;
                                    .condition{
                                      background-color: #f9e8ab;
                                    }
                                    i,b{
                                      color:#F56C6C;
                                    }
                                  }
                                }
                              }
                            }
                        }
                    }
                }
            }
        }
    }
.sortable-ghost{
  opacity: .8;
  color: #fff!important;
  background: #42b983!important;
}
</style>
<style lang="scss">
.add-result.dialog-default{
  height: 300px;
}
</style>
