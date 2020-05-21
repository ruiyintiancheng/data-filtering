/*
 * @Author: lk 
 * @Date: 2019-10-15 15:04:08 
 * @Last Modified by: wk
 * @Last Modified time: 2020-05-21 10:38:51
 * @Description:  模型定义
 */
<template>
  <div class="model-define">
    <input @change="uploadChangeHandle"
           style="display:none"
           type="file"
           id="import_file"
           name="path" />
    <ul v-show="contextmenuVisable"
        class='contextmenu execute'>
      <li v-show="currentNodeType === '1' || currentNodeType === '4'"
          class="submenu">新增
        <div class="insidemenu-box">
          <ul class='insidemenu'>
            <li @click="addModel">查询</li>
            <li @click="addAgainModel">追加</li>
          </ul>
        </div>
      </li>
      <li v-show="currentNodeType !== '4'"
          @click="nodeDeleteHandle">删除</li>
      <li v-show="currentNodeType === '1' || currentNodeType === '4'"
          @click="execute">数据浏览</li>
      <li v-show="currentNodeType === '4'"
          @click="checkSqlHandle">查看sql</li>
    </ul>
    <div class="header-title">模型设计器</div>
    <div class="header-option">
      <el-menu menu-trigger="hover"
               class="el-menu-demo"
               mode="horizontal"
               unique-opened>
        <el-submenu index="1"
                    popper-class="model-define-submenu">
          <template slot="title"><i class="el-icon-folder"></i>文件</template>
          <el-menu-item index="1-1"
                        @click="addTab">新建</el-menu-item>
          <el-submenu index="1-2"
                      popper-class="model-define-submenu">
            <template slot="title">打开</template>
            <!-- 二级分组菜单开始 -->
            <el-submenu :index="'1-2-'+(index+1)"
                        v-for="(item,index) in classificationList"
                        :key="index"
                        popper-class="model-define-submenu">
              <template slot="title">{{item.name}}</template>
              <el-menu-item :index="'1-2-'+(index+1)+'-'+(i+1)"
                            v-for="(it,i) in item.children"
                            :key="i"
                            @click="openModel(it)">{{it.name}}</el-menu-item>
            </el-submenu>
            <!-- 二级分组菜单结束 -->
          </el-submenu>
          <el-menu-item index="1-3"
                        @click="exportHandle">导出</el-menu-item>
          <el-menu-item index="1-4"
                        @click="importHandle">导入</el-menu-item>
        </el-submenu>
        <el-menu-item index="2"
                      @click="classificationHandle"><i class="el-icon-collection"></i>分组</el-menu-item>
        <el-menu-item index="3"
                      @click="workingHandle"><i class="el-icon-finished"></i>运行</el-menu-item>

        <el-submenu index="4"
                    popper-class="model-define-submenu">
          <template slot="title"><i class="el-icon-office-building"></i>模型</template>
          <el-menu-item index="4-1"
                        @click="modelCommit">提交</el-menu-item>
          <el-menu-item index="4-1"
                        @click="attrClickHandle">属性</el-menu-item>
        </el-submenu>
      </el-menu>
    </div>
    <div v-if="tabArray.length <= 0"
         class="model-add-squire"
         @click="addTab">
      <a class="el-icon-circle-plus"></a>
    </div>
    <div v-else
         class="model-item">
      <el-tabs v-model="shareObject.currentTab"
               type="card"
               closable
               @tab-remove="removeTab">
        <el-tab-pane v-for="(item,index) in tabArray"
                     :key="item.name"
                     :label="item.lable"
                     :name="item.name">
          <div class="model-option">
            <div class="containner clearfix">
              <div class="containner-source"
                   :style="{width:item.leftWidth+'px'}">
                <div class="containner-source-header">数据源({{item.shareObject.dsName}})</div>
                <div class="containner-source-context">
                  <table-tree :shareObject="item.shareObject"
                              :treeData="item.treeData"></table-tree>
                </div>
              </div>
              <div class="containner-botton">
                <div class="botton-body">
                  <el-button @click="leftArrowRight(item)"
                             v-show="!item.openLeft"
                             type="text"
                             icon="el-icon-d-arrow-right"></el-button>
                  <el-button @click="leftArrowLeft(item)"
                             v-show="item.openLeft"
                             type="text"
                             icon="el-icon-d-arrow-left"></el-button>
                </div>
              </div>
              <div class="containner-option"
                   v-centerw="{leftWidth:item.leftWidth,rightWidth:item.rightWidth}">
                <div class="containner-option-header">关系图
                  <div class="containner-option-header-button containner-drag"
                       @click="changeMode(item.dragMode!=='drag'?'drag':'edit',index)">
                    <el-tooltip class="item"
                                effect="dark"
                                :content="(item.dragMode!=='drag'?'拖拽模式':'选择模式')+'(按空格键快捷切换)'"
                                placement="top">
                      <svg-icon :icon-class="item.dragMode!=='drag'?'cross':'mouse'" />
                    </el-tooltip>
                  </div>
                  <div class="containner-option-header-button containner-save"
                       @click="openClassfy">
                    <el-tooltip class="item"
                                effect="dark"
                                content="保存"
                                placement="top">
                      <el-dropdown trigger="click"
                                   @command="saveModel">
                        <span class="el-dropdown-link">
                          <i class="el-icon-check"></i>
                        </span>
                        <el-dropdown-menu v-if="saveChooseClassfy"
                                          slot="dropdown">
                          <el-dropdown-item disabled>选择分组</el-dropdown-item>
                          <el-dropdown-item v-for="(item,index) in classificationList"
                                            :key="index"
                                            :divided="index===0"
                                            :command="item.id">{{item.name}}</el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </el-tooltip>
                  </div>
                  <div class="containner-option-header-button containner-save-as"
                       @click="openClassfySaveAs">
                    <el-tooltip class="item"
                                effect="dark"
                                content="另存为"
                                placement="top">
                      <el-dropdown trigger="click"
                                   @command="saveAsModel">
                        <span class="el-dropdown-link">
                          <i class="el-icon-folder-add"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item disabled>选择分组</el-dropdown-item>
                          <el-dropdown-item v-for="(item,index) in classificationList"
                                            :key="index"
                                            :divided="index===0"
                                            :command="item.id">{{item.name}}</el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </el-tooltip>
                  </div>
                  <div class="containner-option-header-button containner-full-screen"
                       @click="screenHandle(item,index)">
                    <el-tooltip class="item"
                                effect="dark"
                                content="全屏"
                                placement="top">
                      <i class="el-icon-full-screen"></i>
                    </el-tooltip>
                  </div>
                </div>
                <table-view @getClassfyTree="getClassfyTree"
                            @changeName='changeName'
                            @updateQuery="updateQuery"
                            @updateAdd="updateAdd"
                            :ref="item.name"
                            @changeModelResourceTree="changeModelResourceTree"
                            :shareObject="item.shareObject"
                            :json="item.modelObj"></table-view>
              </div>
              <div class="containner-botton">
                <div class="botton-body">
                  <el-button @click="rightArrowRight(item)"
                             v-show="item.openRight"
                             type="text"
                             icon="el-icon-d-arrow-right"></el-button>
                  <el-button @click="rightArrowLeft(item)"
                             v-show="!item.openRight"
                             type="text"
                             icon="el-icon-d-arrow-left"></el-button>
                </div>
              </div>
              <div class="containner-resource"
                   :style="{width:item.rightWidth+'px'}">
                <div class="containner-resource-header">模型资源</div>
                <div class="containner-resource-context">
                  <view-tree :shareObject=shareObject
                             :ref="'$resource'+item.name"
                             @centeNode="centeNode"></view-tree>
                </div>
              </div>
            </div>
            <!-- <div class="model-result">
                      <div class="list-switch">
                        <a @click="tableToggle=false" v-if="tableToggle"><svg-icon icon-class="up" />&nbsp;收起</a>
                        <a  @click="openToggle(tableToggle)" v-else><svg-icon icon-class="down"/>&nbsp;展开</a>
                      </div>
                      <el-tabs v-model="resultTab" type="card" @tab-click="tabClick">
                          <el-tab-pane 
                            v-show="tableToggle && resultTab === item.name"
                            v-for="item in resultTableArray"
                            :key="item.name"
                            :label="item.lable"
                            :name="item.name"
                          >
                            <table-list :shareObject='shareObject' v-if="item.name === 'resultConsole'"></table-list>
                            <div :style="{height:shareObject.containHeight + 42 +'px',backgroundColor:'#fff'}" v-if="item.name === 'runLog'"></div>
                          </el-tab-pane>
                        </el-tabs>
                    </div> -->
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <Search-Create v-if="shareObject.showDialog"
                   :dataSourceTree="dataSourceTree"
                   :fromTableNumber="fromTableNumber"
                   :shareObject='shareObject'
                   :modelJson="modelJson"
                   :qJson="queryJson"
                   @saveQueryCreate="saveQueryCreate"
                   @saveQueryUpdate="saveQueryUpdate"></Search-Create>
    <!-- 选择数据源 -->
    <el-dialog title="选择数据源"
               v-el-drag-dialog
               append-to-body
               :close-on-click-modal="false"
               :visible.sync="dataSourceChooseViasble"
               width="30%"
               custom-class="dialog-default data-source-choose-dialog">
      <div class="dialog-contant-default"
           v-if="dataSourceChooseViasble">
        <el-form class="baseUpdate-form"
                 ref="dataSourceChoose"
                 :model="dataSource"
                 label-width="100px">
          <el-form-item label="数据源"
                        prop="dataSourceId"
                        :rules="[{ required: true, message: '请选择数据源', trigger: 'change' }]">
            <el-select v-model="dataSource.dataSourceId">
              <el-option v-for="(item,index) in dataSourceOptions"
                         :key="index"
                         :label="item.dsName"
                         :value="item.dsId"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <div>
          <el-button type="primary"
                     @click="commitDataSourceChoose"
                     :loading="chooseDataSourceLoading">确定</el-button>
          <el-button @click="dataSourceChooseViasble=false">取消</el-button>
        </div>
      </div>
    </el-dialog>
    <el-dialog title="追加表"
               v-el-drag-dialog
               append-to-body
               :close-on-click-modal="false"
               :visible.sync="addTableVisble"
               width="80%"
               custom-class="dialog-default">
      <div class="dialog-contant-default addtable-dialog">
        <add-table ref="addTableDom"
                   v-if="addTableVisble"
                   :shareObject="shareObject"
                   :dataSourceTree="dataSourceTree"
                   :fromTableNumber="fromTableNumber"
                   :modelJson="modelJson"
                   :addJson="addJson"
                   @saveAddCreate="saveAddCreate"
                   @saveAddUpdate="saveAddUpdate"></add-table>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <div>
          <el-button type="primary"
                     @click="commitAdd">确定</el-button>
          <el-button @click="addTableVisble=false">取消</el-button>
        </div>
      </div>
    </el-dialog>
    <!-- 分类维护开始 -->
    <el-dialog title="分组维护"
               append-to-body
               v-el-drag-dialog
               :close-on-click-modal="false"
               :visible.sync="classificationVisable"
               width="40%"
               custom-class="dialog-default">
      <div class="dialog-contant-default"
           v-if="classificationVisable">
        <classification @getClassfyTree="getClassfyTree"></classification>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="classificationVisable = false">关闭</el-button>
      </div>
    </el-dialog>
    <!-- 分类维护结束  -->
    <!-- 运行操作开始 -->
    <el-dialog title="运行"
               append-to-body
               v-el-drag-dialog
               :close-on-click-modal="false"
               :visible.sync="workingVisable"
               width="70%"
               custom-class="dialog-default">
      <div class="dialog-contant-default"
           v-if="workingVisable">
        <el-form ref="workingForm"
                 :model="workingItem"
                 class="working-form">
          <el-form-item label="计算描述"
                        prop="taskDesc">
            <el-input v-model="workingItem.taskDesc"
                      clearable
                      style="width:250px;"></el-input>
          </el-form-item>
        </el-form>
        <div class="base-row">
          <div class="row-botton clearfix">
            <div class="row-title">
              <svg-icon icon-class="ul" />
              <span>计算列表</span>
            </div>
            <div class="row-option">
              <a @click="tableToggleColculate=false"
                 v-if="tableToggleColculate">
                <svg-icon icon-class="up" />&nbsp;收起</a>
              <a @click="tableToggleColculate=true"
                 v-else>
                <svg-icon icon-class="down" />&nbsp;展开</a>
            </div>
          </div>

          <el-table v-if="tableToggleColculate"
                    border
                    stripe
                    :data="colculateData"
                    style="width: 100%">
            <el-table-column align="center"
                             label="计算描述">
              <template slot-scope="scope">
                {{scope.row.taskDesc}}
              </template>
            </el-table-column>
            <el-table-column align="center"
                             label="计算状态">
              <template slot-scope="scope">
                {{scope.row.field_convert_map.calStatus}}
              </template>
            </el-table-column>
            <el-table-column align="center"
                             label="处理状态">
              <template slot-scope="scope">
                {{scope.row.field_convert_map.taskModelStatus}}
              </template>
            </el-table-column>
            <el-table-column align="center"
                             label="添加时间">
              <template slot-scope="scope">
                {{scope.row.addTime}}
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="base-row">
          <div class="row-botton clearfix">
            <div class="row-title">
              <svg-icon icon-class="ul" />
              <span>参数列表</span>
            </div>
            <div class="row-option">
              <a @click="tableToggleParams=false"
                 v-if="tableToggleParams">
                <svg-icon icon-class="up" />&nbsp;收起</a>
              <a @click="tableToggleParams=true"
                 v-else>
                <svg-icon icon-class="down" />&nbsp;展开</a>
            </div>
          </div>

          <el-table v-if="tableToggleParams"
                    border
                    stripe
                    :data="workingData"
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
            <el-table-column align="center"
                             label="参数值">
              <template slot-scope="scope">
                <el-input v-model="scope.row.resetValue"
                          clearable></el-input>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="workingSubmit"
                   type="primary">提交</el-button>
        <el-button @click="workingVisable = false">关闭</el-button>
      </div>
    </el-dialog>
    <!-- 运行操作结束  -->
    <!-- 模型属性开始 -->
    <el-dialog title="模型属性"
               append-to-body
               v-el-drag-dialog
               :close-on-click-modal="false"
               :visible.sync="modelAttrVisable"
               width="40%"
               custom-class="dialog-default">
      <div class="dialog-contant-default"
           v-if="modelAttrVisable">
        <model-attr :modelAttrData="modelAttrData"></model-attr>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="modelAttrVisable = false">关闭</el-button>
      </div>
    </el-dialog>
    <!-- 模型属性结束  -->
    <!-- 查看sql开始 -->
    <el-dialog :title="checkSqlTitle"
               append-to-body
               v-el-drag-dialog
               :close-on-click-modal="false"
               :visible.sync="checkSqlVisable"
               width="40%"
               custom-class="dialog-default">
      <div class="dialog-contant-default"
           v-if="checkSqlVisable">
        <sql-input :sql="resultSql"></sql-input>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="checkSqlVisable = false">关闭</el-button>
      </div>
    </el-dialog>
    <!-- 模型属性结束  -->
    <!-- 执行sql开始 -->
    <el-dialog :title="checkSqlTitle"
               append-to-body
               v-el-drag-dialog
               :close-on-click-modal="false"
               :visible.sync="implementSqlVisable"
               width="60%"
               custom-class="dialog-default">
      <div class="dialog-contant-default"
           v-if="implementSqlVisable">
        <sql-implement :params="sqlParams"
                       :title="checkSqlTitle"></sql-implement>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="implementSqlVisable = false">关闭</el-button>
      </div>
    </el-dialog>
    <!-- 执行sql结束  -->
  </div>
</template>
<script>
const barWidth = 250
import { baseRequest, baseSearch } from '@/api/base'
import tableView from './components/tableView'
import tableTree from './components/tableTree'
import viewTree from './components/viewTree'
import SearchCreate from './components/SearchCreate'
import tableList from './components/tableList'
import addTable from './components/addTable'
import sqlInput from './components/sqlInput'
import classification from './components/classification'
import modelAttr from './components/modelAttr'
import sqlImplement from './components/sqlImplement'
import { deepClone } from '@/utils'
export default {
  name: 'modelDefineIndex',
  components: {
    tableView, tableTree, viewTree, SearchCreate, tableList, addTable, classification, modelAttr, sqlInput, sqlImplement
  },
  data() {
    return {
      // 运行计算描述
      workingItem: {
        taskDesc: ''
      },
      // 计算列表
      colculateData: [],
      // 展开收起开关参数
      tableToggleParams: true,
      tableToggleColculate: true,
      // 导出加载
      exportLoading: false,
      // 执行sql参数
      sqlParams: {},
      // 执行sql开关
      implementSqlVisable: false,
      // 结果sql
      resultSql: '',
      // 查看sql标题
      checkSqlTitle: '',
      // 查看sql开关
      checkSqlVisable: false,
      // 右键节点类型 1 原始表,2 查询节点 3 追加节点 4 结果集',
      currentNodeType: null,
      // 右键操作菜单
      contextmenuVisable: false,
      // 保存时下拉分组开关
      saveChooseClassfy: true,
      // 模型属性值
      modelAttrData: {},
      // 模型属性开关
      modelAttrVisable: false,
      // 运行数据
      workingData: [],
      // 运行开关
      workingVisable: false,
      // 分裂开关
      classificationVisable: false,
      // 分类列表
      classificationList: [],
      // 全屏展示
      fullScreen: false,
      // 追加表弹框
      addTableVisble: false,
      // 传入的数据源树
      dataSourceTree: [],
      // 数据源选择遮罩
      dataSourceChooseViasble: false,
      // 数据源下拉
      dataSourceOptions: [],
      // 选中数据源
      dataSource: {
        dataSourceId: null
      },
      resultTab: '0',
      resultTableArray: [{ lable: '运行结果', name: 'resultConsole' }, { lable: '运行日志', name: 'runLog' }],
      tabArray: [],
      shareObject: {
        event: {},
        showDialog: false,
        containHeight: 300
      },
      modelJson: null,
      queryJson: null,
      addJson: null,
      fromTableNumber: null,
      kTop: 0,
      tableToggle: false,
      // 选择数据源loding
      chooseDataSourceLoading: false
    }
  },
  created() {
    this.getDataSourceOptions()
    // 获取分组树
    this.getClassfyTree()
  },
  directives: {
    centerw: {
      update: function(el, binding) {
        const reduceWidth = binding.value.leftWidth + binding.value.rightWidth + 42
        el.style.width = 'calc(100% - ' + reduceWidth + 'px'
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
  methods: {
    // 空格切换事件
    spaceSwich() {
      if (this.$refs[this.shareObject.currentTab]) {
        const tab = this.tabArray.find(item => item.name === this.shareObject.currentTab)
        if (tab) {
          this.$set(tab, 'dragMode', tab.dragMode === 'drag' ? 'edit' : 'drag')
        }
      }
    },
    // 切换模式
    changeMode(mode, index) { // 拖拽与编辑模式的切换
      this.$refs[this.shareObject.currentTab][0].changeMode(mode)
      this.$set(this.tabArray[index], 'dragMode', mode)
    },
    // 点击查看sql
    checkSqlHandle() {
      const model = this.$refs[this.shareObject.currentTab][0].activation.getModel()
      const sqlArr = this.$refs[this.shareObject.currentTab][0].modelJson.resultSql
      const tableNumber = model.tableNumber
      this.resultSql = sqlArr.find(item => item.tableNumber === tableNumber).sql
      this.checkSqlTitle = model.title
      this.contextmenuVisable = false
      this.checkSqlVisable = true
    },
    // 点击删除节点
    nodeDeleteHandle() {
      this.$refs[this.shareObject.currentTab][0].nodeDelete()
    },
    // 点击属性
    attrClickHandle() {
      if (this.$refs[this.shareObject.currentTab]) {
        if (this.$refs[this.shareObject.currentTab][0].modelJson.modelId !== null) {
          baseRequest('/basic/t05ModelDef/multiTable', { modelId: this.$refs[this.shareObject.currentTab][0].modelJson.modelId }).then(response => {
            this.modelAttrData = response.data.item
            this.modelAttrVisable = true
          })
        } else {
          this.$message.warning('请先保存该模型')
        }
      } else {
        this.$message.warning('当前没有模型')
      }
    },
    // 点击模型提交
    modelCommit() {
      if (this.$refs[this.shareObject.currentTab]) {
        if (this.$refs[this.shareObject.currentTab][0].modelJson.modelId !== null) {
          if (this.$refs[this.shareObject.currentTab][0].modelJson.modelStatus === '1') {
            baseRequest('/basic/t05ModelDef/update', { modelId: this.$refs[this.shareObject.currentTab][0].modelJson.modelId,
              modelStatus: '2' }).then(response => {
              this.$refs[this.shareObject.currentTab][0].modelJson.modelStatus = '2'
              this.$message.success('提交成功')
            })
          } else {
            this.$message.warning('该模型当前状态不可提交')
          }
        } else {
          this.$message.warning('请先保存该模型')
        }
      } else {
        this.$message.warning('当前没有模型')
      }
    },
    // 提交运行
    workingSubmit() {
      this.$refs[this.shareObject.currentTab][0].saveModelData()
      const modelJson = this.$refs[this.shareObject.currentTab][0].modelJson
      const T05ModelNode = modelJson.T05ModelNode
      let resultSql = modelJson.resultSql
      if (!Number.isFinite(modelJson.modelId)) {
        this.$message.warning('请先保存模型')
        return
      }
      if (resultSql.length <= 0) {
        this.$message.warning('当前无关系连线')
        return
      }
      const orderSqls = []
      for (const iterator of T05ModelNode) {
        if (iterator.nodeType === '2') {
          if (iterator.T05JoinTable.every(item => {
            return resultSql.every(it => item.tableNumber !== it.tableNumber)
          })) {
            orderSqls.push(resultSql.find(item => item.tableNumber === iterator.tableNumber))
          }
        } else if (iterator.nodeType === '3') {
          if (iterator.T05UnionTable.every(item => {
            return resultSql.every(it => item.tableNumber !== it.tableNumber)
          })) {
            orderSqls.push(resultSql.find(item => item.tableNumber === iterator.tableNumber))
          }
        }
      }
      for (const iterator of orderSqls) {
        this.addOrderSql(T05ModelNode, orderSqls, resultSql, iterator.tableNumber)
      }
      resultSql = orderSqls
      const workingObj = {}
      for (const iterator of this.workingData) {
        workingObj[iterator.code + ''] = iterator.resetValue ? iterator.resetValue : iterator.value
      }
      baseRequest('/basic/t05ModelTask/add', { modelJson: JSON.stringify(modelJson), paramJson: JSON.stringify(workingObj), taskDesc: this.workingItem.taskDesc }).then(resoponse => {
        this.$message.success('模型已提交计算，请到模型计算页面查看结果')
        this.workingVisable = false
      })
    },
    // 递归添加sql排序
    addOrderSql(T05ModelNode, orderSqls, resultSql, currentTableNumber) {
      for (const iterator of T05ModelNode) {
        if (iterator.nodeType === '2' || iterator.nodeType === '3') {
          const otherTable = iterator.nodeType === '2' ? iterator.T05JoinTable : iterator.T05UnionTable
          for (const it of otherTable) {
            if (it.tableNumber === currentTableNumber) {
              if (orderSqls.every(item => item.tableNumber !== iterator.tableNumber)) {
                orderSqls.push(resultSql.find(item => item.tableNumber === iterator.tableNumber))
              }
              this.addOrderSql(T05ModelNode, orderSqls, resultSql, iterator.tableNumber)
            }
          }
        }
      }
    },
    // 点击运行
    workingHandle() {
      if (this.$refs[this.shareObject.currentTab]) {
        const modelJson = this.$refs[this.shareObject.currentTab][0].modelJson
        this.workingItem.taskDesc = modelJson.modelName
        const resultSql = modelJson.resultSql
        if (!Number.isFinite(modelJson.modelId)) {
          this.$message.warning('请先保存模型')
          return
        }
        if (resultSql.length <= 0) {
          this.$message.warning('当前无关系连线')
          return
        }
        const T05ModelParam = modelJson.T05ModelParam
        // if (Object.keys(T05ModelParam).length > 0) {
        this.workingData = []
        for (const key in T05ModelParam) {
          this.workingData.push({
            code: key,
            name: T05ModelParam[key].paramName,
            type: T05ModelParam[key].paramType,
            value: T05ModelParam[key].defaultValue,
            resetValue: null
          })
        }
        baseRequest('/basic/t05ModelTask/selects', { modelId: modelJson.modelId }).then(response => {
          this.colculateData = response.data.item
          this.workingVisable = true
        })
        // } else {
        // this.workingSubmit()
        // }
      } else {
        this.$message.warning('请先创建模型')
      }
    },
    // 打开模型
    openModel(item) {
      baseRequest('/basic/t05ModelDef/select', { modelId: item.id }).then(response => {
        this.newModel(response.data.item.modelJson, item.id)
      })
    },
    // 打开新模型
    newModel(modelStr, modelId) {
      const modelObj = JSON.parse(modelStr)
      if (typeof (modelId) !== 'undefined') {
        modelObj.modelId = modelId
      }
      const dsId = modelObj.dataSourceId
      const dsName = this.dataSourceOptions.find(item => item.dsId === dsId).dsName
      const dsType = this.dataSourceOptions.find(item => item.dsId === dsId).dsType
      const dsCode = this.dataSourceOptions.find(item => item.dsId === dsId).dsCode
      baseRequest('/basic/dataResources/getDataToTableTrees', { dsId: dsId }).then(response => {
        let treeData = []
        treeData = treeData.concat(response.data.item)
        baseRequest('/basic/t05ResultTable/getResultTableTrees', { dsId: dsId }).then(response => {
          const newTabName = new Date().getTime() + ''
          treeData = treeData.concat(response.data.item)
          this.$set(this.tabArray, this.tabArray.length, {
            lable: modelObj.modelName,
            modelObj: modelObj,
            name: newTabName,
            treeData: treeData,
            openLeft: true,
            openRight: true,
            leftWidth: barWidth,
            rightWidth: barWidth,
            shareObject: {
              currentTab: newTabName,
              event: {},
              showDialog: false,
              containHeight: 300,
              dsType,
              dsId,
              dsName,
              dsCode
            }
          })
          this.shareObject.currentTab = newTabName
        })
      })
    },
    // 导出
    exportHandle() {
      if (this.$refs[this.shareObject.currentTab]) {
        this.$refs[this.shareObject.currentTab][0].exportModel()
      } else {
        this.$message.warning('请先创建模型')
      }
    },
    // 导入
    importHandle() {
      document.getElementById('import_file').click()
    },
    // 导入选中
    uploadChangeHandle() {
      const fileDom = document.getElementById('import_file')
      if (fileDom.value) {
        const file = fileDom.files[0]
        if (file.name.endsWith('.md')) {
          const reader = new FileReader()
          const that = this
          reader.onload = function() {
            try {
              that.newModel(decodeURI(this.result))
            } catch (e) {
              that.$message.warning('文件格式不正确')
            }
          }
          reader.readAsText(file)
        } else {
          this.$message.warning('文件格式不正确')
        }
        fileDom.value = ''
      }
    },
    // 获取分组树
    getClassfyTree() {
      baseSearch('/basic/t05ModelGroup/getModelGroupTree', { groupType: '1' }).then(response => {
        this.classificationList = response.data.item
      })
    },
    // 展开分类
    openClassfy() {
      const modelJson = this.$refs[this.shareObject.currentTab][0].modelJson
      if (modelJson.modelId === null) {
        if (this.classificationList.length <= 0) {
          this.$message.warning('暂无分组数据,请先添加分组')
        } else {
          this.saveChooseClassfy = true
        }
      } else {
        this.saveChooseClassfy = false
        this.$refs[this.shareObject.currentTab][0].saveModel()
      }
    },
    // 另存为
    openClassfySaveAs() {
      if (this.classificationList.length <= 0) {
        this.$message.warning('暂无分组数据,请先添加分组')
      } else {
        this.saveChooseClassfy = true
      }
    },
    // 保存模型
    saveModel(groupId) {
      if (this.$refs[this.shareObject.currentTab]) {
        this.$refs[this.shareObject.currentTab][0].saveModel(groupId)
      } else {
        this.$message.warning('请先创建模型')
      }
    },
    // 保存另存为模型
    saveAsModel(groupId) {
      this.$prompt('请输入名称', '模型名称', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '模型名称不能为空'
      }).then(({ value }) => {
        this.$refs[this.shareObject.currentTab][0].saveModelData()
        const modelJson = deepClone(this.$refs[this.shareObject.currentTab][0].modelJson)
        modelJson.modelName = value
        modelJson.groupId = groupId
        modelJson.modelStatus = '1'
        modelJson.modelId = null
        modelJson.createUserId = null
        baseRequest('/basic/t05ModelDef/analysisJson', { modelJson: JSON.stringify(modelJson) }).then(resoponse => {
          modelJson.modelId = resoponse.data.item.modelId
          this.newModel(JSON.stringify(modelJson))
          this.getClassfyTree()
          this.$message({
            type: 'success',
            message: '保存成功'
          })
        })
      })
    },
    // 分组操作
    classificationHandle() {
      this.classificationVisable = true
    },
    // 点击全屏操作
    screenHandle(item, index) {
      const mpdelDom = document.querySelectorAll('.model-option')[index]
      if (this.fullScreen) {
        mpdelDom.style.position = 'static'
        item.leftWidth = barWidth
        item.openLeft = true
        item.rightWidth = barWidth
        item.openRight = true
      } else {
        mpdelDom.style.position = 'fixed'
        item.leftWidth = 0
        item.openLeft = false
        item.rightWidth = 0
        item.openRight = false
      }
      this.fullScreen = !this.fullScreen
      this.$refs[this.shareObject.currentTab][0].resetChart()
    },
    // 点击模型资源改变中心点
    centeNode(node) {
      this.$refs[this.shareObject.currentTab][0].centeNode(node)
    },
    // 改变模型资源
    changeModelResourceTree(tableJson) {
      const resourceDom = this.$refs[`$resource${this.shareObject.currentTab}`][0]
      this.$set(resourceDom, 'treeData', tableJson)
    },
    // 保存追加
    commitAdd() {
      this.$refs.addTableDom.saveHandle()
    },
    // 点击追加
    addAgainModel() {
      if (this.$refs[this.shareObject.currentTab][0].juageAddNode()) { // 已存在追加节点
        const json = this.$refs[this.shareObject.currentTab][0].juageAddNode()
        this.updateAdd(json)
      } else {
        this.addJson = null
        this.getDataSourceTree()
        this.modelJson = this.$refs[this.shareObject.currentTab][0].modelJson
        this.fromTableNumber = this.$refs[this.shareObject.currentTab][0].activation.getModel().tableNumber
        this.addTableVisble = true
      }
      this.contextmenuVisable = false
    },
    // 获取当前数据源树
    getDataSourceTree() {
      this.dataSourceTree = this.tabArray.find(item => item.name === this.shareObject.currentTab).treeData
    },
    // 确定选择数据源
    commitDataSourceChoose() {
      this.$refs.dataSourceChoose.validate(valid => {
        if (valid) {
          this.chooseDataSourceLoading = true
          const newTabName = new Date().getTime() + ''
          const def = '未命名'
          var lable = def
          var count = 1
          while (this.tabArray.some(item => item.lable === lable)) { // 检查是否存在这个名字,存在就再加 1
            lable = def + count++
          }
          const dsId = this.dataSource.dataSourceId
          const dsName = this.dataSourceOptions.find(item => item.dsId === dsId).dsName
          const dsType = this.dataSourceOptions.find(item => item.dsId === dsId).dsType
          const dsCode = this.dataSourceOptions.find(item => item.dsId === dsId).dsCode
          baseRequest('/basic/dataResources/getDataToTableTrees', { dsId: dsId }).then(response => {
            let treeData = []
            treeData = treeData.concat(response.data.item)
            baseRequest('/basic/t05ResultTable/getResultTableTrees', { dsId: dsId }).then(response => {
              treeData = treeData.concat(response.data.item)
              this.$set(this.tabArray, this.tabArray.length, {
                lable: lable,
                name: newTabName,
                treeData: treeData,
                openLeft: true,
                openRight: true,
                leftWidth: barWidth,
                rightWidth: barWidth,
                shareObject: {
                  currentTab: newTabName,
                  event: {},
                  showDialog: false,
                  containHeight: 300,
                  dsType,
                  dsCode,
                  dsId,
                  dsName
                }
              })
              this.shareObject.currentTab = newTabName
              this.chooseDataSourceLoading = false
              this.dataSourceChooseViasble = false
            })
          })
        } else {
          return false
        }
      })
    },
    // 获取数据源下拉
    getDataSourceOptions() {
      baseRequest('/basic/dataResources/selects', {}).then(response => {
        this.dataSourceOptions = response.data.item
      })
    },
    // 修改追加
    updateAdd(addJson) {
      this.addJson = addJson
      this.getDataSourceTree()
      this.modelJson = this.$refs[this.shareObject.currentTab][0].modelJson
      this.addTableVisble = true
    },
    // 修改查询
    updateQuery(queryJson) {
      this.queryJson = queryJson
      this.getDataSourceTree()
      this.modelJson = this.$refs[this.shareObject.currentTab][0].modelJson
      this.shareObject.showDialog = true
    },
    // 保存
    saveQueryCreate(params) {
      this.$refs[this.shareObject.currentTab][0].saveQueryCreate(params)
    },
    saveQueryUpdate(params) {
      this.$refs[this.shareObject.currentTab][0].saveQueryUpdate(params)
    },
    // 保存追加
    saveAddCreate(params) {
      this.addTableVisble = false
      this.$refs[this.shareObject.currentTab][0].saveQueryCreate(params)
    },
    saveAddUpdate(params) {
      this.addTableVisble = false
      this.$refs[this.shareObject.currentTab][0].saveQueryUpdate(params)
    },
    // 新增查询
    addModel() {
      this.getDataSourceTree()
      this.queryJson = null
      this.modelJson = this.$refs[this.shareObject.currentTab][0].modelJson
      this.fromTableNumber = this.$refs[this.shareObject.currentTab][0].activation.getModel().tableNumber
      this.shareObject.showDialog = true
      this.contextmenuVisable = false
    },
    // 展开右键点击节点菜单
    // contextmenuShow(name) {
    //   this.currentName = name
    // },
    // 点击左侧切换
    leftArrowLeft(item) {
      item.leftWidth = 0
      item.openLeft = !item.openLeft
    },
    // 点击左侧切换
    leftArrowRight(item) {
      item.leftWidth = barWidth
      item.openLeft = !item.openLeft
    },
    // 点击右侧切换
    rightArrowLeft(item) {
      item.rightWidth = barWidth
      item.openRight = !item.openRight
    },
    // 点击右侧切换
    rightArrowRight(item) {
      item.rightWidth = 0
      item.openRight = !item.openRight
    },
    // 点击浏览数据
    execute() {
      const node = this.$refs[this.shareObject.currentTab][0].activation.getModel()
      const modelJson = this.$refs[this.shareObject.currentTab][0].modelJson
      let sql = ''
      if (node.nodeType === '1') {
        const oriTable = modelJson.T05ModelTable.find(item => item.tableNumber === node.tableNumber)
        sql = `select * from ${oriTable.tableName}`
      } else {
        const currentSql = modelJson.resultSql.find(item => item.tableNumber === node.tableNumber).sql
        sql = this.replacePlaceholder(currentSql, modelJson.resultSql, modelJson.T05ModelParam)
      }
      this.sqlParams = {
        datSourceType: modelJson.dataSourceType,
        dataSourceCode: modelJson.dataSourceCode,
        sqlContent: sql
      }
      this.checkSqlTitle = node.title
      this.contextmenuVisable = false
      this.implementSqlVisable = true
    },
    // 替换占位符
    replacePlaceholder(sql, resultSql, params) {
      const holderReg = new RegExp(/#{\d*}/, 'g')
      const holderRegParams = new RegExp(/\${[^\s]*}/, 'g')
      const arr = sql.match(holderReg)
      const arrParams = sql.match(holderRegParams)
      if (arrParams) {
        for (const iterator of arrParams) {
          const holderName = iterator.substring(2, iterator.length - 1)
          const value = params[holderName] ? params[holderName].defaultValue : ''
          const regParams = new RegExp('\\${' + holderName + '\\}', 'g')
          sql = sql.replace(regParams, value)
        }
      }
      if (arr) {
        for (const iterator of arr) {
          const holderNumber = iterator.substring(2, iterator.length - 1)
          const replaceObj = resultSql.find(item => item.tableNumber + '' === holderNumber)
          if (replaceObj) {
            const insideSql = this.replacePlaceholder(replaceObj.sql, resultSql, params)
            const reg = new RegExp('#{' + holderNumber + '\\}', 'g')
            sql = sql.replace(reg, `(${insideSql})`)
          }
        }
      }
      return sql
    },
    removeTab(targetName) { // 删除页签
      const tabs = this.tabArray
      let activeName = this.shareObject.currentTab
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) { // 获取下一个标签页
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            } else {
              activeName = undefined
            }
          }
        })
      }

      this.shareObject.currentTab = activeName // 将下一个标签页设置活跃
      this.tabArray = tabs.filter(tab => tab.name !== targetName) // 删除当前标签页
    },
    // 添加新的页签
    addTab(command) {
      this.dataSource.dataSourceId = null
      this.dataSourceChooseViasble = true
    },
    // 改变名称
    changeName(name) {
      this.tabArray.find(item => item.name === this.shareObject.currentTab).lable = name
    },
    // changeSize(e) { // 改变大小
    //   this.changeSizeBoolean = true
    //   const ev = e || window.event
    //   this.kTop = ev.y
    // },
    // changeSizeEnd() {
    //   this.changeSizeBoolean = false
    // },
    tabClick() {
      this.tableToggle = true
    },
    openToggle() {
      if (this.resultTab === '0') {
        this.resultTab = this.resultTableArray[0].name
      }
      this.tableToggle = true
    }
  }
}
</script>

<style lang="scss" scoped>
$mdcolor: #f3f3f3;
$mdfcolor: #9d9399;
$mdbcolor: #ccc;
@mixin title() {
  background-color: $mdcolor;
  color: $mdfcolor;
  height: 40px;
  line-height: 40px;
  padding-left: 20px;
  font-size: 14px;
  font-weight: bold;
}
.model-define {
  height: 100%;
  position: relative;
  .header-title {
    @include title();
    border-bottom: 1px solid $mdbcolor;
  }
  .header-option {
    color: $mdfcolor;
    height: 28px;
    font-size: 14px;
    border-bottom: 1px solid $mdbcolor;
    .el-dropdown {
      float: left;
    }
    .el-button-group > .el-dropdown > .el-button {
      border-radius: 0;
      border-top: none;
      border-bottom: none;
      &:active {
        border-color: #dcdfe6;
      }
      // padding: 8px 15px;
    }
    .el-dropdown-menu {
      margin: 0;
    }
  }
  .model-option {
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 1003;
    background-color: #fff;
  }
  .containner {
    height: calc(100% - 114px);
    overflow: hidden;
    .containner-source {
      // width: 250px;
      transition: width 0.28s linear;
      height: 100%;
      float: left;
      overflow: hidden;
      border-right: 1px solid $mdbcolor;
      .containner-source-header {
        @include title();
        border-bottom: 1px solid $mdbcolor;
      }
      .containner-source-context {
        height: calc(100% - 41px);
        overflow: auto;
      }
    }
    .containner-botton {
      float: left;
      width: 20px;
      height: 100%;
      line-height: 100%;
      position: relative;
      .botton-body {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 0;
        width: 20px;
        // margin: 0 10px 0 0;
        border: 1px solid $mdbcolor;
        border-radius: 5px;
        .el-button + .el-button {
          margin-left: 0;
        }
      }
    }
    .containner-option {
      transition: width 0.28s linear;
      float: left;
      width: calc(100% - 540px);
      height: 100%;
      border-left: 1px solid $mdbcolor;
      border-right: 1px solid $mdbcolor;
      overflow: hidden;
      .containner-option-header {
        @include title();
        border-bottom: 1px solid $mdbcolor;
        position: relative;
        .containner-option-header-button {
          position: absolute;
          top: 0;
          cursor: pointer;
          &:hover {
            color: #409eff;
          }
        }
        .containner-full-screen {
          right: 20px;
        }
        .containner-save-as {
          right: 50px;
        }
        .containner-save {
          right: 80px;
        }
        .containner-drag {
          right: 110px;
          // &::after{
          //   content: " |";
          //   margin-top:-5px;
          // }
        }
      }
    }
    .containner-resource {
      transition: width 0.28s linear;
      // width: 250px;
      height: 100%;
      float: left;
      overflow: hidden;
      border-left: 1px solid $mdbcolor;
      .containner-resource-header {
        @include title();
        border-bottom: 1px solid $mdbcolor;
      }
      .containner-resource-context {
        height: calc(100% - 41px);
        overflow: auto;
      }
    }
  }
  .model-result {
    z-index: 2;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    // border-top:1px solid $mdbcolor;
    border-bottom: 1px solid $mdbcolor;
    .model-result-move {
      width: 100%;
      height: 1px;
      cursor: n-resize;
      background-color: $mdbcolor;
    }
    .result-title {
      @include title();
    }
    .list-switch {
      position: absolute;
      top: 15px;
      right: 20px;
      z-index: 2;
      font-size: 14px;
      color: $mdfcolor;
    }
  }
}
</style>
<style lang="scss">
$mdcolor: #f3f3f3;
.model-define {
  .containner-option {
    .el-tabs__header {
      background-color: $mdcolor;
    }
  }
}
.contextmenu.execute,
.insidemenu {
  margin: 0;
  background: #fff;
  z-index: 10000000;
  position: fixed;
  list-style-type: none;
  padding: 5px 0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  // display: none;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
  li {
    margin: 0;
    padding: 7px 16px;
    cursor: pointer;
    &:hover {
      background: #eee;
    }
  }
}
.contextmenu .submenu {
  position: relative;
  &:hover .insidemenu-box {
    display: block;
  }
  .insidemenu-box {
    position: absolute;
    display: none;
    top: -5px;
    left: 100%;
    padding-left: 5px;
    .insidemenu {
      display: block;
      position: static;
      li {
        width: 70px;
      }
    }
  }
}
.containner-option,
.model-result {
  .el-tabs__header {
    margin: 0;
    background: $mdcolor;
  }
}
.model-define-downbutton {
  margin: 0;
  .popper__arrow {
    display: none;
  }
  li.el-dropdown-menu__item {
    font-size: 12px;
  }
  &.el-popper {
    margin-top: 0;
    padding: 0;
  }
}
.model-add-squire {
  width: 30%;
  height: 30%;
  margin: 150px auto 0;
  border: 1px dashed #8492a6;
  background-color: #fbfbfb;
  border-radius: 5px;
  position: relative;
  cursor: pointer;
  &:hover {
    background-color: #e2fafa;
    a {
      color: #409eff;
    }
  }
  a {
    font-size: 70px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    color: #e2fafa;
  }
}
.model-item {
  height: calc(100% - 69px);
  .el-tabs {
    height: 100%;
    .el-tabs__content {
      height: calc(100% - 41px);
      .el-tab-pane {
        height: 100%;
        .containner {
          height: 100%;
        }
      }
    }
  }
  .el-tabs__header {
    margin: 0;
  }
}

.data-source-choose-dialog.dialog-default {
  height: 280px;
  .dialog-contant-default {
    padding-top: 57px;
    .baseUpdate-form {
      margin-left: calc(50% - 150px);
    }
  }
}
</style>
<style lang="scss">
// 运行form
.working-form {
  padding-left: 10px;
  padding-top: 10px;
  .el-form-item {
    // margin-bottom: 0px;
  }
}
// 设计器菜单
.header-option {
  height: 28px;
  overflow: hidden;
  border-bottom: 1px solid #ccc;
  .el-menu--horizontal > .el-menu-item,
  .el-menu--horizontal > .el-submenu .el-submenu__title {
    height: 30px;
    line-height: 28px;
    color: #606266;
    font-size: 12px;
    padding-left: 10px;
    padding-right: 15px;
    border-right: 1px solid #dcdfe6;
    .el-icon-arrow-down {
      display: none;
    }
    [class^="el-icon-"] {
      margin-right: 0px;
      font-size: 12px;
    }
    &:hover {
      color: #409eff;
      border-color: #c6e2ff;
      background-color: #ecf5ff;
      [class^="el-icon-"] {
        color: #409eff;
      }
    }
  }
}
.model-define-submenu {
  .el-menu--popup-bottom-start {
    margin-top: 0;
  }
  .el-menu--collapse .el-menu .el-submenu,
  .el-menu--popup {
    min-width: 74px;
  }
  .el-submenu .el-menu-item,
  .el-submenu {
    min-width: 74px;
    text-align: center;
  }
  &.el-menu--horizontal {
    .el-menu .el-menu-item,
    .el-menu .el-submenu__title {
      font-size: 12px;
      height: 28px;
      line-height: 28px;
      text-align: center;
      padding: 0 20px;
      color: #909399;
      &:hover {
        color: #409eff;
        background-color: #ecf5ff;
      }
      .el-submenu__icon-arrow {
        right: 5px;
        margin-top: -6px;
      }
    }
  }
  .el-menu--horizontal .el-menu .el-menu-item.is-active,
  .el-menu--horizontal .el-menu .el-submenu.is-active > .el-submenu__title {
    color: #909399;
  }
}
</style>

