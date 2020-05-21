/*
 * @Author: lk 
 * @Date: 2019-10-15 15:03:51 
 * @Last Modified by: wk
 * @Last Modified time: 2020-05-21 10:43:08
 * @Description:  sql查询
 */

<template>
  <div class="app-container"
       style="margin-left:5px;">
    <div class="my-col"
         :style="{'width': leftWidth + 'px'}">
      <div class="row-botton clearfix">
        <div class="row-title">
          <svg-icon icon-class="tree" />
          <span>数据源树</span>
        </div>
        <div class="row-option">
          <el-tooltip class="item"
                      effect="dark"
                      content="分类维护"
                      placement="top">
            <el-button icon="el-icon-files"
                       plain
                       size="mini"
                       @click="classificationVisable=true"></el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="tree-tabs"
           :style="{height:treeHeight+'px'}">
        <el-tabs v-model="treeTab"
                 stretch
                 type="card">
          <el-tab-pane label="数据源"
                       name="first">
            <el-input placeholder="筛选"
                      v-model="filterText"
                      style="padding:5px 10px;width:85%;"></el-input>
            <el-tree class="filter-tree"
                     :filter-node-method="filterNode"
                     :data="treeData"
                     :props="treeOptionSource"
                     default-expand-all
                     :expand-on-click-node="false"
                     @node-contextmenu="rightClick"
                     empty-text=""
                     ref="tree2">
            </el-tree>
          </el-tab-pane>
          <el-tab-pane label="我的分类"
                       name="second">
            <el-input placeholder="筛选"
                      v-model="filterClasifition"
                      style="padding:5px 10px;width:85%;"></el-input>
            <el-tree class="filter-tree classfy-tree"
                     :filter-node-method="filterNode2"
                     :data="claTreeData"
                     :props="defaultProps"
                     default-expand-all
                     :expand-on-click-node="false"
                     empty-text=""
                     @node-click="clasifitionHandle"
                     ref="filterClasifition">
              <span class="classfy-node-show"
                    slot-scope="{ node ,data}">
                <span>{{ node.label }}</span>
                <div title="删除"
                     @click.stop="deleteClassfy(data.sqlId)"
                     class="classfy-node-delete"
                     v-if="data.sqlId || data.sqlId === 0"><i class="el-icon-close"></i></div>
              </span>
            </el-tree>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div class="my-col my-col-button"
         style="width: 20px">
      <div :style="{height: (containHeight / 2 - 7) + 'px', width: '100%'}"></div>
      <div class="botton-body">
        <el-button @click="leftArrowRight"
                   v-show="!openLeft"
                   type="text"
                   icon="el-icon-d-arrow-right"
                   style="margin-left: 0;"></el-button>
        <el-button @click="leftArrowLeft"
                   v-show="openLeft"
                   type="text"
                   icon="el-icon-d-arrow-left"
                   style="margin-left: 0;"></el-button>
      </div>
    </div>
    <div class="my-col"
         v-centerw="{leftWidth}">
      <div v-show="editableTabs2<=0"
           class="page-tooptip-text">在数据源上右键新建查询或点击我的分类下已保存的查询</div>
      <div class="sqlWindow">
        <el-tabs v-model="editableTabsValue2"
                 type="card"
                 closable
                 @tab-remove="removeTab"
                 @tab-click="switchTabs">
          <el-tab-pane v-for="(demo, index) in editableTabs2"
                       :key="demo.name"
                       :label="demo.title"
                       :name="demo.name"
                       style="margin:0">
            <div class="base-row base-row-self">
              <div class="row-botton clearfix">
                <div class="row-title">
                  <span>sql输入框</span>
                </div>
                <div class="row-option">
                  <el-button-group>
                    <el-tooltip class="item"
                                effect="dark"
                                content="查询"
                                placement="top">
                      <el-button icon="el-icon-search"
                                 @click="searchOptionSql(demo)"></el-button>
                    </el-tooltip>
                    <el-tooltip class="item"
                                effect="dark"
                                content="格式化"
                                placement="top">
                      <el-button icon="el-icon-scissors"
                                 @click="formatterSql(demo.name)"></el-button>
                    </el-tooltip>
                    <el-tooltip class="item"
                                effect="dark"
                                content="保存"
                                placement="top">
                      <el-button icon="el-icon-check"
                                 @click="saveOptionSql(demo.name)"></el-button>
                    </el-tooltip>
                    <el-tooltip class="item"
                                effect="dark"
                                content="配置"
                                placement="top">
                      <el-button icon="el-icon-setting"
                                 @click="openColumnStep"></el-button>
                    </el-tooltip>
                  </el-button-group>
                  <a @click="sqlUp(demo)"
                     v-if="demo.searchToggle">
                    <svg-icon icon-class="up" />&nbsp;收起</a>
                  <a @click="sqlDown(demo)"
                     v-else>
                    <svg-icon icon-class="down" />&nbsp;展开</a>
                </div>
              </div>
              <div class="sqlArea"
                   v-show="demo.searchToggle">
                <div class="sqlInputDiv"
                     style="200px">
                  <sql-input :contentHeight="contentHeightDefault"
                             :code="editableTabs2[index].name"
                             :ref="demo.name"
                             :id="'id'+demo.name"
                             :dataSourceCondition='dataSourceCondition'></sql-input>
                </div>
              </div>
            </div>
            <div class="base-row tableList">
              <div class="row-botton clearfix">
                <div class="row-title">
                  <svg-icon icon-class="ul" />
                  <span>数据列表</span>
                </div>
                <div class="row-option">
                  <el-dropdown @command="exportHandle($event,demo)">
                    <el-button size="mini"
                               :disabled="demo.tableData.length <= 0 || demo.tableHead.length <= 0"
                               :loading="demo.exportLoading">
                      导出<i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="1">当前页</el-dropdown-item>
                      <el-dropdown-item command="2">全部</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                  <el-button v-if="nodeType == '3'">加载更新</el-button>
                  <a @click="tableUp(demo)"
                     v-if="demo.tableToggle">
                    <svg-icon icon-class="up" />&nbsp;收起</a>
                  <a @click="tableDown(demo)"
                     v-else>
                    <svg-icon icon-class="down" />&nbsp;展开</a>
                </div>
              </div>
              <div v-show="demo.tableToggle">
                <el-table :data="demo.tableData"
                          class="tb-edit"
                          :border="true"
                          :fit="true"
                          :height="demo.tableDataH"
                          :empty-text="demo.sqlMessage"
                          style="width: 100%;">
                  <el-table-column v-for="item in demo.tableHead"
                                   :label="item.label"
                                   :property="item.property"
                                   :key="item.aaa"
                                   width="180">
                  </el-table-column>
                </el-table>
                <el-pagination background
                               @size-change="handleSizeChange($event,demo)"
                               @current-change="handleCurrentChange($event,demo)"
                               :current-page="demo.pageNo"
                               :page-sizes="[10,20,30,50]"
                               :page-size="demo.pageSize"
                               layout="total, sizes, prev, pager, next, jumper"
                               :total="demo.total">
                </el-pagination>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <el-popover placement="bottom"
                trigger="manual"
                v-model="visible">
      <el-menu show-timeout=0
               class="el-menu-vertical-demo"
               @select="selectOption">
        <el-menu-item index="1"
                      style="height: 30px;line-height: 30px;">
          <span slot="title">新建</span>
        </el-menu-item>
      </el-menu>
    </el-popover>
    <column-step ref="columnStep"
                 :dataSourceCondition="dataSourceCondition"></column-step>
    <!-- 分类维护开始 -->
    <el-dialog title="分类维护"
               append-to-body
               v-el-drag-dialog
               :close-on-click-modal="false"
               :visible.sync="classificationVisable"
               width="40%"
               custom-class="dialog-default">
      <div class="dialog-contant-default"
           v-if="classificationVisable">
        <classification @getClasifitionTree="getClasifitionTree"></classification>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="classificationVisable = false">关闭</el-button>
      </div>
    </el-dialog>
    <!-- 分类维护结束  -->
    <!-- 保存sql开始 -->
    <el-dialog title="sql保存"
               append-to-body
               v-el-drag-dialog
               :close-on-click-modal="false"
               :visible.sync="sqlSaveVisable"
               width="40%"
               custom-class="dialog-default">
      <div class="dialog-contant-default"
           v-if="sqlSaveVisable">
        <save-sql-form ref="saveSqlForm"
                       :sqlSaveParams="sqlSaveParams"></save-sql-form>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="sqlSaveVisable = false">取消</el-button>
        <el-button type="primary"
                   @click="sqlSaveSave">保存</el-button>
      </div>
    </el-dialog>
    <!-- 保存sql结束  -->
  </div>
</template>
<script>
import { download } from '@/utils/download'
import columnStep from './components/columnStep'
import classification from './components/classification'
import saveSqlForm from './components/saveSqlForm.vue'
import { deepClone } from '@/utils/index'
import SearchForm from 'search-form-ry'
import BasicTable from 'basic-table-ry'
import { baseRequest } from '@/api/base'
import elDragDialog from '@/directive/el-dragDialog'
import sqlInput from './components/sqlInput'
const dataSourceUrl = '/basic/sqlExecute/getDataSourceByName'
export default {
  directives: {
    elDragDialog,
    centerw: {
      update: function(el, binding) {
        const reduceWidth = binding.value.leftWidth + 21
        el.style.width = 'calc(100% - ' + reduceWidth + 'px'
      }
    }
  },
  name: 'sqlSearchIndex',
  components: {
    SearchForm,
    BasicTable,
    sqlInput,
    columnStep,
    classification,
    saveSqlForm
  },
  computed: {
    treeHeight() {
      return this.$store.state.app.containHeight - 58
    }
  },
  data() {
    return {
      // 导出加载
      exportLoading: false,
      // 保存时ref页签名\
      saveRefName: null,
      // sql保存参数
      sqlSaveParams: {},
      // 保存sql弹框
      sqlSaveVisable: false,
      // 树页签
      treeTab: 'first',
      // 分类维护
      classificationVisable: false,
      // 分类值查询
      filterClasifition: '',
      // 分类输数据
      claTreeData: [],
      filterText: '',
      treeData: [], // 树数据
      defaultProps: { // 树对应关系
        children: 'children',
        label: 'groupName'
      },
      contentHeightDefault: '150px', // sql输入框高度
      openLeft: true, // 数据源展开
      leftWidth: 300, // 数据源宽度

      configData: {}, // 表格数据
      configColumnData: {},
      searchToggle: true, // 查询下拉切换
      tableToggle: false, // 数据列表展示
      searchColumnToggle: true,
      tableColumnToggle: true,
      dialogSourceVisible: false,
      dialogSourceUserVisible: false,
      dialogSourceTableVisible: false,
      dialogSourceColumnVisible: false,
      dialogColumnVisible: false,
      sourceTitle: '',
      sourceUserTitle: '',
      sourceTableTitle: '',
      columnTitle: '',
      formData: {},
      userFormData: {},
      tableFormData: {},
      formColumnData: {},
      nodeType: '1',
      containHeight: null,
      // sql输入框参数的配置开始
      indentWithTabs: true,
      smartIndent: true, // 默认缩进
      styleActiveLine: true, // 当前行高亮
      lineNumbers: true, // 显示行数
      lineWrapping: true, // 自动换行
      matchBrackets: true, // 括号匹配
      autofocus: true, // 自动获取焦点
      extraKeys: { 'Ctrl-Space': 'autocomplete' },
      // theme: 'blackboard', // 编辑框的主题
      indentUnit: 2, // 缩进,默认为2
      abSize: 4, // tab字符的宽度，默认为4
      // sql输入框参数的配置开始
      // 表头
      tableHead: [], // 查询结果表头
      // 数据值
      tableData: [], // 查询结果数据
      treeOptionSource: { // 树的配置信息
        label: 'name'
      },
      rightClickDialogVisible: false, // 右键面板
      rightClickDialogleft: null,
      rightClickDialogtop: null,
      visible: false,
      selectDataSource: null,
      // 标签的
      editableTabsValue2: '1',
      // editableTabs2: [{
      //   title: 'Tab 1',
      //   name: '1',
      //   content: 'Tab 1 content'
      // }],
      editableTabs2: [

      ],
      tabIndex: 1,
      dataSourceCondition: null
    }
  },
  created() {
    this.containHeight = this.$store.state.app.containHeight - 16
    this.contentHeightDefault = (this.$store.state.app.containHeight - 185) + 'px'
    this.getTrees()
    var self = this
    document.querySelector('body').onclick = function() {
      self.visible = false
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree2.filter(val)
    },
    filterClasifition(val) {
      this.$refs.filterClasifition.filter(val)
    }
  },
  mounted() {
    this.editableTabs2 = []
    this.getClasifitionTree()
  },
  methods: {
    // 下载点击事件
    exportHandle(exportType, ref) {
      if (exportType === '2') {
        baseRequest('/basic/configs/selectByConfigCode', { configCode: 'exportExcelMaxCount' }).then(response => {
          const exportExcelMaxCount = response.data.item.configValue
          if (ref.total > exportExcelMaxCount) {
            this.$prompt(`导出记录数超过${exportExcelMaxCount}行,将以CSV格式导出`, '请输入查询名称', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              inputPattern: /\S/,
              inputErrorMessage: '查询名称不能为空'
            }).then(({ value }) => {
              this.saveCsv(value, ref)
            })
          } else {
            this.downloadExcel(exportType, ref)
          }
        })
      } else {
        this.downloadExcel(exportType, ref)
      }
    },
    // 下载点击事件
    downloadExcel(exportType, ref) {
      const currentActions = this.$route.path.split('/')
      const currentActionId = currentActions[currentActions.length - 1]
      ref.exportLoading = true
      var text = this.$refs[ref.name][0].getSql()
      var param = {}
      param.sqlContent = text
      param.datSourceType = this.dataSourceCondition.datSourceType || this.dataSourceCondition.dataSourceType
      param.dataSourceCode = this.dataSourceCondition.dataSourceCode
      param.pageNo = ref.pageNo || 1
      param.pageSize = ref.pageSize || null
      param.total = ref.total
      param.exportType = exportType
      param.actionId = currentActionId
      param.downloadName = ref.title
      download('/basic/sqlQuerys/exportExcel', param, function() {
        ref.exportLoading = false
      }, function() {
        ref.exportLoading = false
      })
    },
    // CSV格式保存
    saveCsv(downloadName, ref) {
      const currentActions = this.$route.path.split('/')
      const currentActionId = currentActions[currentActions.length - 1]
      ref.exportLoading = true
      var text = this.$refs[ref.name][0].getSql()
      var param = {}
      param.sqlContent = text
      param.datSourceType = this.dataSourceCondition.datSourceType || this.dataSourceCondition.dataSourceType
      param.dataSourceCode = this.dataSourceCondition.dataSourceCode
      param.pageNo = ref.pageNo || 1
      param.pageSize = ref.pageSize || null
      param.total = ref.total
      param.exportType = '3'
      param.actionId = currentActionId
      param.downloadName = downloadName
      baseRequest('/basic/sqlQuerys/exportCsv', param).then(response => {
        const fileName = response.data.item.fileName
        const routers = this.$store.getters.addRouters
        ref.exportLoading = false
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
    // 删除我的分类
    deleteClassfy(sqlId) {
      this.$confirm('确定删除该查询吗, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        baseRequest('/basic/sqlConfig/delete', { sqlId }).then(_ => {
          const deleteIndex = this.editableTabs2.findIndex(item => item.sqlId === sqlId)
          if (deleteIndex !== -1) {
            this.editableTabs2.splice(deleteIndex, 1)
            if (this.editableTabs2.length > 0) {
              this.editableTabsValue2 = this.editableTabs2[this.editableTabs2.length - 1].name
            }
          }
          this.getClasifitionTree()
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
      })
    },
    // 获取我的分类树
    getClasifitionTree() {
      baseRequest('/basic/sqlGroup/selectGroups').then(response => {
        this.claTreeData = response.data.item
      })
    },
    // 配置
    openColumnStep() {
      if (this.dataSourceCondition.sqlId || this.dataSourceCondition.sqlId === 0) {
        this.$refs.columnStep.colmunListVisable = true
      } else {
        this.$message.warning('请先保存sql')
      }
    },
    getTrees(dataSourceName) {
      var params = { dataSourceName: null }
      baseRequest(dataSourceUrl, params).then(response => {
        this.treeData = response.data.item
      })
    },
    // 重置
    reset(id) {
      this.$refs.searchForm.resetForm()
      document.getElementById(id)
    },
    filterNode(value, data) { // 树的查询
      if (!value) return true
      return data['name'].indexOf(value) !== -1
    },
    filterNode2(value, data) { // 树的查询
      if (!value) return true
      return data['groupName'].indexOf(value) !== -1
    },
    searchOptionSql(ref) { // sql编辑框sql的执行
      var text = this.$refs[ref.name][0].getSql()
      var param = {}
      param.sqlContent = text
      param.datSourceType = this.dataSourceCondition.datSourceType || this.dataSourceCondition.dataSourceType
      param.dataSourceCode = this.dataSourceCondition.dataSourceCode
      param.pageNo = ref.pageNo || 1
      param.pageSize = ref.pageSize || null
      baseRequest('/basic/sqlQuerys/selectBySql', param).then(response => {
        const result = response.data.item[0]
        ref.sqlMessage = result.resultMessage
        // 查询结果存储到查询的历史数据的对象中 resultMessage
        ref.tableHead = result.tableHead
        ref.tableData = result.tableData
        ref.total = response.data.total
        ref.pageSize = response.data.pageSize
        if (ref.searchToggle) {
          ref.tableDataH = this.$store.state.app.containHeight - 365
        } else {
          ref.tableDataH = this.$store.state.app.containHeight - 214
        }
        this.tableDown(ref)
      })
    }, // sql编辑框sql的格式化
    formatterSql(ref) {
      this.$refs[ref][0].formatter()
    },
    // 保存事件
    saveOptionSql(ref) {
      if (!this.claTreeData || this.claTreeData.length <= 0 || !this.claTreeData[0].children || this.claTreeData[0].children.length <= 0) {
        this.$message.warning('请添加分类')
        return
      }
      if (!this.$refs[ref][0].getSql()) {
        this.$message.warning('sql不能为空')
        return
      }
      this.sqlSaveParams = {
        sqlId: this.$refs[ref][0].dataSourceCondition.sqlId,
        dataSourceCode: this.$refs[ref][0].dataSourceCondition.dataSourceCode,
        sqlContent: this.$refs[ref][0].getSql()
      }

      this.saveRefName = ref
      this.sqlSaveVisable = true
    },
    // 保存保存事件
    sqlSaveSave() {
      this.$refs.saveSqlForm.saveHandle().then(item => {
        this.dataSourceCondition.sqlId = item.sqlId
        if (item.isEqual) {
          this.editableTabs2.map(val => {
            if (val.name === this.saveRefName) {
              val.sqlId = item.sqlId
              val.title = item.sqlName
            }
            return val
          })
          this.sqlSaveVisable = false
          this.getClasifitionTree()
          this.$message.success('操作成功')
        } else {
          this.$confirm('查询字段变更需要重新进行配置, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            baseRequest('/basic/sqlConfig/update', item).then(_ => {
              this.editableTabs2.map(val => {
                if (val.name === this.saveRefName) {
                  val.sqlId = item.sqlId
                  val.title = item.sqlName
                }
                return val
              })
              this.sqlSaveVisable = false
              this.getClasifitionTree()
              this.openColumnStep()
            })
          })
        }
      })
    },
    rightClick(data, row) { // 数据源右键事件
      if (row.children && row.children.length > 0) return
      this.selectDataSource = deepClone(row)
      this.visible = true
      this.$nextTick(function() {
        var tooltip = document.querySelector('.el-popover')
        tooltip.style.left = data.clientX + 'px'
        tooltip.style.top = data.clientY + 'px'
        tooltip.style.padding = '5px'
      })
    },
    selectOption(index) {
      if (index === '1') {
        this.addTab(this.editableTabsValue2)
      }
    },
    clasifitionHandle(e, node) {
      if (node.data.children && node.data.children.length > 0) {
        return
      }
      if (!node.data.sqlId && node.data.sqlId !== 0) {
        return
      }
      this.selectDataSource = deepClone(node.data)
      this.addTabCla()
    },
    addTabCla() {
      const item = this.editableTabs2.find(item => item.sqlId === this.selectDataSource.sqlId)
      if (item) {
        this.editableTabsValue2 = item.name
      } else {
        this.addTab()
      }
    },
    addTab(targetName) { // 添加标签
      var newTabName = ++this.tabIndex + ''
      this.editableTabs2.push({// 标签中需要带的属性
        title: this.selectDataSource.name || this.selectDataSource.groupName, // 数据源的名称
        name: newTabName,
        dataSourceType: this.selectDataSource.datSourceType || this.selectDataSource.dataSourceType, // 数据源的类型
        dataSourceCode: this.selectDataSource.dataSourceCode, // 数据源的编号,后台通过这个属性进行数据源的识别
        dataSourceName: this.selectDataSource.dataSourceName, // 数据源名称
        sqlMessage: '', // sql 执行返回消息
        content: 'New Tab content',
        sqlId: this.selectDataSource.sqlId,
        tableData: [],
        tableHead: [],
        searchToggle: true,
        tableToggle: false,
        selectDataSource: this.selectDataSource,
        exportLoading: false
      })
      this.editableTabsValue2 = newTabName
      this.selectDataSource.sqlId = this.selectDataSource.sqlId
      this.dataSourceCondition = this.selectDataSource
    },
    removeTab(targetName) { // 删除标签
      var tabs = this.editableTabs2
      let activeName = this.editableTabsValue2
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            }
          }
        })
      }
      this.editableTabsValue2 = activeName
      this.editableTabs2 = tabs.filter(tab => tab.name !== targetName)
      // 删除标签,清除查询结果历史对象的对应内容
    },
    switchTabs(tabs) { // 切换标签
      this.dataSourceCondition = this.editableTabs2.find(item => item.name === tabs.name).selectDataSource
    },
    leftArrowLeft() { // 数据源收缩
      this.leftWidth = 0
      this.openLeft = !this.openLeft
    },
    leftArrowRight() { // 数据源展开
      this.leftWidth = 300
      this.openLeft = !this.openLeft
    },
    sqlUp(ref) {
      ref.searchToggle = false
      ref.tableDataH = this.$store.state.app.containHeight - 214
    },
    sqlDown(ref) {
      ref.searchToggle = true
      ref.tableDataH = this.$store.state.app.containHeight - 365
    },
    tableUp(ref) { // 数据列表收起
      ref.tableToggle = false
      this.$refs[ref.name][0].setSqlnputCss('', this.contentHeightDefault)
    },
    tableDown(ref) { // 数据列表展开
      ref.tableToggle = true
      //  this.contentHeight = '150px'
      this.$refs[ref.name][0].setSqlnputCss('', '150px')
    },
    handleSizeChange(val, demo) { // 分页
      demo.pageSize = val
      this.searchOptionSql(demo)
    },
    handleCurrentChange(val, demo) { // 分页
      demo.pageNo = val
      this.searchOptionSql(demo)
    }
  }
}
</script>
<style scoped>
.app-container .code-tree {
  margin-top: 5px;
  overflow: auto;
  position: relative;
  border: 1px solid #e4e4e4;
}
.app-container .sqlWindow .base-row-self {
  margin: 5px 0;
}
.app-container .sqlWindow {
  margin: 5px 15px;
}
.is-top {
  margin: 5px 15px;
  margin-left: 60px;
}
.app-container .sqlWindow .tableList {
  margin: 0;
}
/* .sqlButton{
      margin-right: 0px;

    } */
.app-container .sqlWindow .sqlArea .sql-button {
  text-align: right;
  padding: 5px;
}
.my-col {
  height: 100%;
  float: left;
  overflow: hidden;
  transition: width 0.28s linear 0s;
}
.page-tooptip-text {
  margin: -15% auto;
  width: 100%;
  height: 260px;
  padding: 120px 0;
  text-align: center;
  position: relative;
  top: 50%;
  font-size: 20px;
  color: #409eff;
  letter-spacing: 1px;
  font-weight: 600;
  /* border: 1px dashed #ccc; */
  /* border-radius: 4px; */
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04) */
}
.my-col-button {
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
}
.botton-body {
  width: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.tree-tabs {
  padding: 10px;
}
</style>
<style lang="scss">
.classfy-tree {
  .el-tree-node {
    position: relative;
    &:hover > .el-tree-node__content .classfy-node-delete {
      display: block;
    }
    .classfy-node-show {
      font-size: 14px;
    }
    .classfy-node-delete {
      // display: none;
      position: absolute;
      right: 10px;
      top: 5px;
      color: #f56c6c;
      display: none;
      &:hover {
        color: red;
      }
      .el-icon-close {
        cursor: pointer;
      }
    }
  }
}
</style>
