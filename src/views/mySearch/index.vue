/*
 * @Author: lk 
 * @Date: 2019-08-05 09:14:56 
 * @Last Modified by: wk
 * @Last Modified time: 2020-05-21 10:40:02
 * @Description:  我的查询
 */
<template>
  <div class="my-search">
    <div class="my-search-left"
         :style="{width:explosion?'300px':'0px'}">
      <div class="row-botton">
        <div class="row-title">
          <svg-icon icon-class="tree" />
          <span>我的查询</span>
        </div>
      </div>
      <el-tree :data="claTreeData"
               :props="defaultProps"
               default-expand-all
               :expand-on-click-node="false"
               @node-click="treeNodeHandle">
      </el-tree>
    </div>
    <div class="my-search-button"
         style="width: 20px">
      <div :style="{height: (containHeight / 2 - 7) + 'px', width: '100%'}"></div>
      <div class="botton-body">
        <el-button @click="explosion=!explosion"
                   v-show="!explosion"
                   type="text"
                   icon="el-icon-d-arrow-right"
                   style="margin-left: 0;"></el-button>
        <el-button @click="explosion=!explosion"
                   v-show="explosion"
                   type="text"
                   icon="el-icon-d-arrow-left"
                   style="margin-left: 0;"></el-button>
      </div>
    </div>
    <div class="my-search-right page-tooptip-text"
         v-if="headData.length<=0"
         :style="{width:explosion?'calc(100% - 322px)':'calc(100% - 22px)'}">单击分类下的节点进行查询</div>
    <div class="my-search-right"
         v-show="headData.length>0"
         :style="{width:explosion?'calc(100% - 322px)':'calc(100% - 22px)'}">
      <div class="base-row">
        <div class="row-botton clearfix">
          <div class="row-title">
            <svg-icon icon-class="search" />
            <span>筛选查询</span>
          </div>
          <div class="row-option">
            <el-button icon="el-icon-search"
                       @click="searchOption()"
                       type="primary">查询</el-button>
            <el-button icon="el-icon-refresh"
                       @click="getOption">重置</el-button>
            <a @click="searchToggle=false"
               v-if="searchToggle">
              <svg-icon icon-class="up" />&nbsp;收起</a>
            <a @click="searchToggle=true"
               v-else>
              <svg-icon icon-class="down" />&nbsp;展开</a>
          </div>
        </div>
        <div v-show="searchToggle">
          <div class="search-filter">
            <el-row :gutter="24"
                    v-if="conditionOptionReset">
              <div v-for="(item,prop) in queryJson"
                   :key="prop">
                <el-col v-if="item.criteria.length>0"
                        @click.native="openConditionDialog(prop)"
                        class="search-box"
                        :span="4">
                  <div class="search-item">
                    <span>{{conditionStr(item,prop)}}</span>
                    <div class="filter-delete"
                         @click.stop="clearCondition(prop)"><i class="el-icon-close"></i></div>
                  </div>
                </el-col>
              </div>
            </el-row>
          </div>
        </div>
      </div>
      <div class="base-row">
        <div class="row-botton clearfix">
          <div class="row-title">
            <svg-icon icon-class="ul" />
            <span>{{currentTreeNode.label}}</span>
          </div>
          <div class="row-option">
            <el-dropdown @command="exportHandle">
              <el-button size="mini"
                         :disabled="tableData.length <= 0 || currentHead.length <= 0"
                         :loading="exportLoading">
                导出<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="1">当前页</el-dropdown-item>
                <el-dropdown-item command="2">全部</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-dropdown :hide-on-click="false">
              <el-button size="mini"
                         :disabled="orderJson.length<=0">
                排序选项<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(item,index) in orderJson"
                                  :key="index">
                  <div class="order-options-item clearfix">
                    <span class="order-text-option">
                      {{headData.find(val => val.property === item.column).label}}&nbsp;&nbsp;
                    </span>
                    <i @click="deleteOrderColumn(index)"
                       class="el-icon-delete order-delete-option"></i>
                    <i @click="updateOrderColumn(item)"
                       class="el-icon-sort order-update-option"></i>
                    <span class="order-type-option">
                      {{item.type==='1'?'升序':'降序'}}&nbsp;&nbsp;
                    </span>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-select v-model="chooseFields"
                       collapse-tags
                       multiple
                       placeholder="字段筛选"
                       @change="selectHandle"
                       style="width:250px;">
              <el-option v-for="item in headData"
                         :key="item.property"
                         :label="item.label"
                         :value="item.property">
              </el-option>
            </el-select>
            <a @click="tableToggle=false"
               v-if="tableToggle">
              <svg-icon icon-class="up" />&nbsp;收起</a>
            <a @click="tableToggle=true"
               v-else>
              <svg-icon icon-class="down" />&nbsp;展开</a>
          </div>
        </div>
        <!-- 表格 -->
        <el-table v-show="tableToggle&&headData.length>0"
                  :data="tableData"
                  stripe
                  fit
                  border
                  v-if="conditionReset"
                  v-loading="listLoading"
                  :height="tableHeight"
                  element-loading-text="给我一点时间">
          <el-table-column type="index"
                           width="50"
                           label="序号"></el-table-column>
          <el-table-column v-for="(item,index) in currentHead"
                           min-width="170"
                           align="center"
                           :key="index"
                           :label="item.label"
                           :prop="item.property"
                           :render-header="renderHeader"></el-table-column>
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
    </div>
    <el-dialog :title="currentColumn.label"
               append-to-body
               v-el-drag-dialog
               :close-on-click-modal="false"
               :visible.sync="conditionVisable"
               width="40%"
               custom-class="dialog-default">
      <div class="dialog-contant-default"
           v-if="conditionVisable">
        <condition-option ref="conditionOption"
                          :queryJson="currentJson"
                          :componentType="componentType"
                          :componentParam="componentParam"></condition-option>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="conditionVisable = false">取消</el-button>
        <el-button @click="clearCondition()">清除</el-button>
        <el-button type="primary"
                   @click="confirmCondition()">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { baseRequest } from '@/api/base'
import { basicDownload } from '@/utils/download'
import conditionOption from '../../components/ConditionOption'
import { deepClone } from '@/utils/index'
export default {
  components: {
    conditionOption
  },
  name: 'mySearchIndex',
  computed: {
    containHeight: function() {
      return this.$store.state.app.containHeight - 10
    },
    currentHead: function() {
      return this.headData.filter(item => item.displayFlag === '1')
    }
  },
  data() {
    return {
      // 加载导出
      exportLoading: false,
      // 选中列
      chooseFields: [],
      // 表格高度
      tableHeight: 0,
      pageSize: null,
      pageNo: 1,
      total: null,
      // 当前树节点
      currentTreeNode: {},
      // 遮罩
      listLoading: false,
      // if重新加载dom
      conditionOptionReset: true,
      conditionReset: true,
      // 当前点击列
      currentColumn: {},
      // 当前点击查询json
      currentJson: [],
      // 结果类型
      componentType: '1',
      // 类型选项值
      componentParam: null,
      // 条件开关
      conditionVisable: false,
      // 列信息
      headData: [],
      // 数据信息
      tableData: [],
      // 所有条件JSON
      queryJson: {},
      // 所有排序JSON
      orderJson: [],
      tableToggle: true,
      searchToggle: true,
      // 是否展开
      explosion: true,
      // 分类树数据
      claTreeData: [],
      defaultProps: { // 树对应关系
        children: 'children',
        label: 'groupName'
      }
    }
  },
  created() {
    this.getTree()
  },
  methods: {
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
    // excel下载
    downloadExcel(exportType) {
      this.exportLoading = true
      const currentActions = this.$route.path.split('/')
      const currentActionId = currentActions[currentActions.length - 1]
      const queryJson = {}
      for (const key in this.queryJson) {
        queryJson[key] = {}
        queryJson[key].label = this.queryJson[key].label
        queryJson[key].criteria = JSON.stringify(this.queryJson[key].criteria)
      }
      const params = {
        headData: this.currentHead,
        exportType: exportType,
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        total: this.total,
        sqlId: this.currentTreeNode.data.sqlId,
        dataSourceCode: this.currentTreeNode.data.dataSourceCode,
        queryJson: queryJson,
        orderJson: this.orderJson,
        actionId: currentActionId,
        downloadName: this.currentTreeNode.label
      }
      basicDownload('/basic/sqlConfig/exportExcel', params).then(_ => {
        this.exportLoading = false
      }, _ => {
        this.exportLoading = false
      })
    },
    // CSV格式保存
    saveCsv(downloadName) {
      this.exportLoading = true
      const currentActions = this.$route.path.split('/')
      const currentActionId = currentActions[currentActions.length - 1]
      const queryJson = {}
      for (const key in this.queryJson) {
        queryJson[key] = {}
        queryJson[key].label = this.queryJson[key].label
        queryJson[key].criteria = JSON.stringify(this.queryJson[key].criteria)
      }
      const params = {
        headData: this.currentHead,
        exportType: '3',
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        total: this.total,
        sqlId: this.currentTreeNode.data.sqlId,
        dataSourceCode: this.currentTreeNode.data.dataSourceCode,
        queryJson: queryJson,
        orderJson: this.orderJson,
        actionId: currentActionId,
        downloadName: downloadName
      }
      baseRequest('/basic/sqlConfig/exportCsv', params).then(response => {
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
    },
    // 多选选中事件
    selectHandle(val) {
      this.listLoading = true
      this.currentHead.length = 0
      for (const i of val) {
        this.currentHead.push(this.headData.find(item => item.property === i))
      }
      this.listLoading = false
    },
    // 选中值
    selectArr() {
      this.chooseFields = []
      for (const iterator of this.headData) {
        if (iterator.displayFlag === '1') {
          this.chooseFields.push(iterator.property)
        }
      }
    },
    // 获取表格高度
    getTableHeight() {
      this.$nextTick(_ => {
        const rightDom = document.querySelector('.my-search-right')
        const queryHeight = rightDom.firstElementChild.offsetHeight
        this.tableHeight = this.containHeight - queryHeight - 83
      })
    },
    // 重新渲染
    resetConditionsDom() {
      this.conditionReset = false
      this.$nextTick(_ => {
        this.conditionReset = true
      })
    },
    // 判断该字段是否被查询选中
    isChoose(column) {
      return this.queryJson.hasOwnProperty(column.property) && this.queryJson[column.property].criteria.length > 0 ? ' active' : ''
    },
    // 选项更改排序
    updateOrderColumn(item) {
      item.type = item.type === '1' ? '2' : '1'
    },
    // 选项删除排序
    deleteOrderColumn(index) {
      this.orderJson.splice(index, 1)
    },
    // 判断是否被排序
    isOrder(column, type) {
      return this.orderJson.some(item => item.column === column.property && item.type === type) ? ' current' : ''
    },
    // 点击排序
    sortClick(column, type) {
      const currentOrder = this.orderJson.find(item => item.column === column.property)
      if (currentOrder) {
        if (currentOrder.type === type) {
          const deleteIndex = this.orderJson.findIndex(item => item.column === column.property)
          this.orderJson.splice(deleteIndex, 1)
        } else {
          currentOrder.type = type
        }
      } else {
        this.orderJson.push({
          column: column.property,
          type: type
        })
      }
    },
    // 清除当前条件
    clearCondition(prop) {
      if (prop) {
        delete this.queryJson[prop]
      } else {
        delete this.queryJson[this.currentColumn.property]
      }
      this.conditionVisable = false
      this.resetConditionsDom()
      this.getTableHeight()
    },
    // 确认条件
    confirmCondition() {
      this.$refs.conditionOption.judgeConditionNull().then(_ => {
        if (!this.queryJson[this.currentColumn.property]) {
          this.queryJson[this.currentColumn.property] = {}
          this.queryJson[this.currentColumn.property].label = this.currentColumn.label
          if (this.currentColumn.componentType === '2' && this.currentColumn.componentParam && !this.currentColumn.componentOptions) {
            baseRequest('/basic/common/getSelectOptions', { dictType: this.currentColumn.componentParam }).then(resopnse => {
              this.currentColumn.componentOptions = resopnse.data.item
              this.queryJson[this.currentColumn.property].criteria = this.currentJson
              this.conditionVisable = false
              this.resetConditionsDom()
              this.getTableHeight()
              return
            })
          }
        }
        this.queryJson[this.currentColumn.property].criteria = this.currentJson
        this.conditionVisable = false
        this.resetConditionsDom()
        this.getTableHeight()
      }).catch(_ => {
        this.$message.warning('保存选项不能为空')
      })
    },
    // 获取条件文字
    conditionStr(item, prop) {
      const headItem = this.headData.find(item => item.property === prop)
      let str = item.label + ' '
      for (const [index, iterator] of item.criteria.entries()) {
        str += iterator.symbol + ' ' + (headItem.componentOptions ? headItem['componentOptions'][iterator.value] + ' ' : iterator.value + ' ')
        if (index !== item.criteria.length - 1) {
          str += iterator.radio + ' '
        }
      }
      return str
    },
    // 打开条件
    openConditionDialog(prop) {
      const column = this.headData.find(item => item.property === prop)
      this.currentColumn = column
      this.componentType = column.componentType
      this.componentParam = column.componentParam
      if (this.queryJson.hasOwnProperty(column.property) && this.queryJson[column.property].criteria.length > 0) {
        this.currentJson = deepClone(this.queryJson[column.property].criteria)
      } else {
        this.currentJson = [
          {
            symbol: null,
            value: null,
            radio: 'and'
          }
        ]
      }
      this.conditionVisable = true
    },
    // 列表头选项
    renderHeader(h, { column, $index }) {
      return h('div', { class: 'browse-condition' }, [
        h('span', { class: 'choose-current' + this.isChoose(column) }, column.label + ' '),
        h('a', {
          class: 'choose-current' + this.isChoose(column),
          on: {
            click: () => {
              this.openConditionDialog(column.property)
            }
          }
        }, [
          <svg-icon icon-class='search' />
        ]),
        h('span', {
          class: 'caret-wrapper'
        }, [
          h('i', {
            class: 'sort-caret ascending' + this.isOrder(column, '1'),
            on: {
              click: (e) => {
                this.sortClick(column, '1')
              }
            }
          }),
          h('i', {
            class: 'sort-caret descending' + this.isOrder(column, '2'),
            on: {
              click: (e) => {
                this.sortClick(column, '2')
              }
            }
          })
        ])
      ])
    },
    // 查询
    searchOption(pageNoChange) {
      this.listLoading = true
      const queryJson = {}
      for (const key in this.queryJson) {
        queryJson[key] = {}
        queryJson[key].label = this.queryJson[key].label
        queryJson[key].criteria = JSON.stringify(this.queryJson[key].criteria)
      }
      this.pageNo = pageNoChange ? this.pageNo : 1
      const params = {
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        sqlId: this.currentTreeNode.data.sqlId,
        dataSourceCode: this.currentTreeNode.data.dataSourceCode,
        queryJson: queryJson,
        orderJson: this.orderJson
      }
      baseRequest('/basic/sqlConfig/getCustomSqlData', params).then(response => {
        this.listLoading = false
        this.tableData = response.data.item[0].tableData
        this.pageSize = response.data.pageSize
        this.total = response.data.total
      })
    },
    // 获取条件中的选项
    getComponentOptions() {
      for (const key in this.queryJson) {
        const item = this.headData.find(v => v.property === key)
        if (item.componentType === '2' && item.componentParam) {
          baseRequest('/basic/common/getSelectOptions', { dictType: item.componentParam }).then(resopnse => {
            item['componentOptions'] = resopnse.data.item
            this.conditionOptionReset = false
            this.$nextTick(_ => {
              this.conditionOptionReset = true
            })
          })
        }
      }
    },
    // 重设
    getOption() {
      const params = {
        sqlId: this.currentTreeNode.data.sqlId,
        dataSourceCode: this.currentTreeNode.data.dataSourceCode
      }
      baseRequest('/basic/sqlConfig/getCustomSqlData', params).then(response => {
        this.headData = response.data.item[0].tableHead
        const queryJson = response.data.item[0].queryJson ? response.data.item[0].queryJson : {}
        for (const key in queryJson) {
          queryJson[key].criteria = JSON.parse(queryJson[key].criteria)
        }
        this.queryJson = queryJson
        this.orderJson = response.data.item[0].orderJson ? response.data.item[0].orderJson : []
        this.getComponentOptions()
        this.getTableHeight()
        this.selectArr()
        this.searchOption()
      })
    },
    // 获取树
    getTree() {
      baseRequest('/basic/sqlGroup/selectGroups').then(response => {
        this.claTreeData = response.data.item
      })
    },
    // 点击树
    treeNodeHandle(e, node) {
      if (node.data.children && node.data.children.length > 0) {
        return
      }
      if (!node.data.sqlId && node.data.sqlId !== 0) {
        return
      }
      this.currentTreeNode = node
      this.getOption()
    },
    handleSizeChange(val) { // 分页
      this.pageSize = val
      this.searchOption()
    },
    handleCurrentChange(val) { // 分页
      this.pageNo = val
      this.searchOption(true)
    }
  }
}
</script>
<style lang="scss" scoped>
.my-search {
  height: 100%;
  padding: 5px;
  .my-search-left {
    float: left;
    width: 300px;
    border-right: 1px solid #ccc;
    height: 100%;
    overflow-x: hidden;
    transition: width 0.28s linear;
  }
  .my-search-button {
    float: left;
    height: 100%;
    .botton-body {
      width: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
  }
  .my-search-right {
    float: left;
    transition: width 0.28s linear;
    .base-row {
      margin: 0;
    }
  }
  .search-filter {
    margin-left: 12px;
    padding-top: 10px;
  }
  .search-box {
    border-radius: 4px;
    border: 1px solid #ccc;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-left: 1%;
    margin-bottom: 10px;
    cursor: pointer;
  }
  .search-box:hover {
    border-color: #409eff;
  }
  .search-item {
    height: 50px;
    line-height: 15px;
    font-size: 12px;
    color: #606266;
    width: 94%;
    margin: 5px 3%;
    /* text-align: center; */
    vertical-align: middle;
    position: relative;
  }
  .search-item span {
    display: inline-block;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
  .filter-delete {
    color: #f56c6c;
    position: absolute;
    top: 0;
    right: calc(-3% - 5px);
    font-size: 16px;
    &:hover {
      background: rgba(0, 0, 0, 0.2);
    }
  }
}
</style>

<style lang="scss">
.page-tooptip-text {
  text-align: center;
  font-size: 20px;
  color: #409eff;
  letter-spacing: 1px;
  font-weight: 600;
  height: 100%;
  padding-top: 23%;
}
.my-search {
  .el-table--medium th {
    padding: 0;
  }
  .el-table .browse-condition {
    margin-top: 10px;
  }
  .el-table .browse-condition .caret-wrapper .sort-caret.ascending.current {
    border-bottom-color: #409eff;
  }
  .el-table .browse-condition .caret-wrapper .sort-caret.descending.current {
    border-top-color: #409eff;
  }
  .browse-condition .choose-current.active {
    color: #409eff;
  }
  .browse-table .el-table--medium th {
    padding-bottom: 0;
  }
}
.order-text-option {
  float: left;
}
.order-type-option {
  float: right;
}
.order-delete-option,
.order-update-option {
  margin-top: 9px;
  float: right;
  &:hover {
    color: #f56c6c;
  }
}
</style>
