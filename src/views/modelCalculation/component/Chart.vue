<template>
    <div class="model-define-chart" v-loading="chartLoading">
          <!--流程图画布 -->
        <div id='flowChart'>
        </div>
        <!-- <div class="options">
            <ul class="clearfix">
                <li class="chart-button" @click="refreshChart">
                    <div>
                      <a class="el-icon-refresh"></a>&nbsp;刷新
                    </div>
                </li>
                <li class="chart-button" @click="refreshChart">
                    <div>
                      <a class="el-icon-tickets"></a>&nbsp;参数
                    </div>
                </li>
            </ul>
        </div> -->
        <div class="legend">
            <ul class="clearfix">
                <li>
                    <span class="legend-title">图例</span>
                </li>
                <li>
                    <img :src="successPic">计算完成
                </li>
                <li>
                    <img :src="errorPic">计算错误
                </li>
                <li>
                    <img :src="noCalculated">未计算
                </li>
                <li>
                    <img :src="runPic">计算中
                </li>
                <li>
                    <span class="legend-title">操作</span>
                </li>
                <li class="chart-button" @click="refreshChart">
                    <div>
                      <a class="el-icon-refresh"></a>&nbsp;刷新
                    </div>
                </li>
                <li class="chart-button" @click="runParamsOpen">
                    <div>
                      <a class="el-icon-tickets"></a>&nbsp;参数
                    </div>
                </li>
            </ul>
        </div>
        <!-- 运行弹框 -->
        <el-dialog :title="tableName" append-to-body v-el-drag-dialog :close-on-click-modal="false" :visible.sync="tableInfoVisable" width="70%" top="5vh" custom-class="dialog-default-more">
          <div class="dialog-contant-default" v-if="tableInfoVisable">
              <el-tabs v-model="activeName" type="card" >
                <el-tab-pane label="运行结果" name="result">
                    <sql-implement :params="params" :title="tableName"></sql-implement>
                </el-tab-pane>
                <el-tab-pane label="运行日志" name="log">
                    <run-log :nodeData="nodeData"></run-log>
                </el-tab-pane>
              </el-tabs>
          </div>
          <div slot="footer" class="dialog-footer">
                <el-button @click="tableInfoVisable = false">关闭</el-button>
            </div>
        </el-dialog>
        <!-- 参数弹框 -->
        <el-dialog title="运行参数" append-to-body v-el-drag-dialog :close-on-click-modal="false" :visible.sync="runParamsVisable" width="70%" top="5vh" custom-class="dialog-default-more">
          <div class="dialog-contant-default" v-if="runParamsVisable">
              <run-params :paramsArr="paramsArr"></run-params>
          </div>
          <div slot="footer" class="dialog-footer">
              <el-button @click="runParamsVisable = false">关闭</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
// import { baseRequest } from '@/api/base'
import { deepClone } from '@/utils'
import tableSheetPic from '../img/tableSheet.png'
import searchPic from '../img/search.png'
import resultPic from '../img/result.png'
import addPic from '../img/add.png'
import successPic from '../img/success.png'
import errorPic from '../img/error.png'
import noCalculated from '../img/noCalculated.png'
import runPic from '../img/run.png'
import SqlImplement from './SqlImplement'
import RunLog from './RunLog'
import RunParams from './RunParams'
export default {
  props: {
    json: Object,
    modelTaskResults: Array,
    paramJson: Object
  },
  components: { SqlImplement, RunLog, RunParams },
  computed: {
    // 绑定json
    modelJson() {
      return deepClone(this.json)
    },
    statusImg() {
      return {
        '0': {
          name: '计算错误',
          img: errorPic
        },
        '1': {
          name: '未计算',
          img: noCalculated
        },
        '2': {
          name: '计算中',
          img: runPic
        },
        '3': {
          name: '计算完成',
          img: successPic
        }
      }
    }
  },
  mounted() {
    this.taskResults = deepClone(this.modelTaskResults)
    this.init()
    const T05ModelNode = this.getNodeFromJson()
    const T05NodeRelation = this.getLineFromJson()
    this.net.source(T05ModelNode, T05NodeRelation)
    this.net.render()
  },
  data() {
    return {
      paramsArr: [],
      runParamsVisable: false,
      chartLoading: false,
      taskResults: [],
      nodeData: {},
      activeName: 'result',
      params: {},
      tableName: '',
      tableInfoVisable: false,
      id: '',
      net: '',
      Util: '',
      activation: '', // 当前激活的节点
      checked: true, // 网格对齐
      gridChange: false, // 网格对其按钮发生改变
      type: '', // 有值为编辑状态
      tableSheetPic,
      searchPic,
      resultPic,
      addPic,
      successPic,
      errorPic,
      noCalculated,
      runPic
    }
  },
  methods: {
    // 打开参数
    runParamsOpen() {
      this.paramsArr = []
      for (const key in this.modelJson.T05ModelParam) {
        let paramValue = null
        if (this.paramJson[key]) {
          paramValue = this.paramJson[key]
        }
        this.paramsArr.push({
          code: key,
          name: this.modelJson.T05ModelParam[key].paramName,
          type: this.modelJson.T05ModelParam[key].paramType,
          value: this.modelJson.T05ModelParam[key].defaultValue,
          paramValue: paramValue
        })
      }
      this.runParamsVisable = true
    },
    // 刷新图
    refreshChart() {
      this.chartLoading = true
      this.$parent.$parent.modelChartRequest(null, taskResults => {
        this.taskResults =
        taskResults
        this.resetChart()
        this.chartLoading = false
      })
    },
    // 根据json定义点
    getNodeFromJson() {
      const T05ModelNode = []
      for (const iterator of this.modelJson.T05ModelNode) {
        const positionsStr = iterator.positions
        const positionsArr = positionsStr.split(',')
        const x = positionsArr[0].split(':')[1]
        const y = positionsArr[1].split(':')[1]
        const newRelationNode = {
          id: iterator.nodeNumber,
          nodeType: iterator.nodeType,
          shape: iterator.nodeType === '3' ? '2' : iterator.nodeType,
          tableNumber: iterator.tableNumber,
          title: iterator.nodeName,
          x: Number(x),
          y: Number(y)
        }
        if (iterator.nodeType === '2') {
          newRelationNode.T05JoinColumn = iterator.T05JoinColumn
          newRelationNode.T05JoinExpression = iterator.T05JoinExpression
          newRelationNode.T05JoinNode = iterator.T05JoinNode
          newRelationNode.T05JoinOrder = iterator.T05JoinOrder
          newRelationNode.T05JoinTable = iterator.T05JoinTable
        } else if (iterator.nodeType === '3') {
          newRelationNode.T05UnionTable = iterator.T05UnionTable
          newRelationNode.T05UnionOrder = iterator.T05UnionOrder
        }
        T05ModelNode.push(newRelationNode)
      }
      return T05ModelNode
    },
    // 根据josn定义线
    getLineFromJson() {
      const T05NodeRelation = []
      for (const iterator of this.modelJson.T05NodeRelation) {
        T05NodeRelation.push({
          'shape': 'arrow',
          'source': iterator.originNodeId,
          'target': iterator.targetNodeId,
          'id': iterator.lineNumber,
          'lineType': iterator.lineType
        })
      }
      return T05NodeRelation
    },
    // 重载画布
    resetChart() {
      const data = this.net.save().source
      this.net.destroy() //  销毁画布
      this.initG6()
      this.net.source(data)
      this.net.render()
    },
    init() {
      const flowChart = document.querySelector('#flowChart')
      flowChart.oncontextmenu = function(e) {
        return false
      }
      flowChart.id = 'flowChart'
      this.id = flowChart.id
      this.initG6()
    },
    initG6() {
      const self = this
      self.Util = window.G6.Util
      self.net = new window.G6.Net({
        id: self.id, // 容器ID
        mode: 'edit',
        modes: {
        // 编辑模式
          edit: [
            'dragCanvas', 'clickBlankClearActive', 'resizeEdge', 'clickActive', 'dragNodeEndSetActive',
            'multiSelect', 'resizeNode', 'shortcut', 'wheelZoom'
          ]
        },
        // fitView: 'tl',
        grid: {
          forceAlign: true, // 是否支持网格对齐
          cell: 25 // 网格大小
        },
        // fitView: '' // 布局
        width: document.querySelector('.model-chart-dialog').offsetWidth,
        height: document.querySelector('.model-chart-dialog').offsetHeight - 30
      })
      self.net.on('dblclick', function(ev) { // 鼠标双击
        const isNode = self.Util.isNode(ev.item) // 判断是否是节点
        if (isNode) {
          const node = ev.item.getModel()
          if (node.nodeType === '3' || node.nodeType === '4') {
            const resultNumber = node.tableNumber
            const resultItem = self.taskResults.find(item => item.resultTableIdx === resultNumber)
            if (resultItem) {
              if (resultItem.calStatus === '1' || resultItem.calStatus === '1') {
                self.$message.warning('该结果未计算或计算中')
              } else {
                const sql = `select * from ${resultItem.resultTableName}`
                self.nodeData = resultItem
                self.params = {
                  datSourceType: self.modelJson.dataSourceType,
                  dataSourceCode: self.modelJson.dataSourceCode,
                  sqlContent: sql
                }
              }
            } else {
              self.$message.warning('未找到该结果')
            }
            self.tableName = node.title
            self.tableInfoVisable = true
          }
        }
      })
      window.G6.registNode('1', {
        // 绘制
        draw: function(cfg, group) {
          const model = cfg.model
          var height = 64 + 30
          var keyShape = group.addShape('rect', {
            attrs: {
              x: cfg.x - 40,
              y: cfg.y - 50,
              width: 80,
              height: height,
              fill: 'white'
            }
          })
          group.addShape('image', {
            attrs: {
              x: cfg.x - 32,
              y: cfg.y - 45,
              width: 64,
              height: 64,
              img: self.tableSheetPic
            }
          })
          group.addShape('text', {
            attrs: {
              x: cfg.x,
              y: cfg.y + 40,
              text: model.title,
              textBaseline: 'bottom',
              textAlign: 'center',
              fontSize: 14,
              fill: '#000'
            }
          })
          return keyShape
        },
        getAnchorPoints: function(cfg) {
          return [[0, 0.5], [1, 0.5], [0.5, 0], [0.5, 1]]
        }
      })
      window.G6.registNode('2', {
        // 绘制
        draw: function(cfg, group) {
          var height = 64 + 20
          var keyShape = group.addShape('rect', {
            attrs: {
              x: cfg.x - 40,
              y: cfg.y - 45,
              width: 80,
              height: height,
              fill: 'white'
            }
          })
          group.addShape('image', {
            attrs: {
              x: cfg.x - 32,
              y: cfg.y - 45,
              width: 64,
              height: 64,
              img: cfg.model.nodeType === '2' ? self.searchPic : self.addPic
            }
          })
          group.addShape('text', {
            attrs: {
              x: cfg.x,
              y: cfg.y + 40,
              text: (cfg.model.nodeType === '2' ? '查询 ' : '追加 ') + cfg.model.title,
              textBaseline: 'bottom',
              textAlign: 'center',
              fontSize: 14,
              fill: '#000'
            }
          })
          return keyShape
        },
        getAnchorPoints: function(cfg) {
          return [[0, 0.5], [1, 0.5], [0.5, 0], [0.5, 1]]
        }
      })
      window.G6.registNode('4', {
        // 绘制
        draw: function(cfg, group) {
          var height = 64 + 30
          var keyShape = group.addShape('rect', {
            attrs: {
              x: cfg.x - 40,
              y: cfg.y - 50,
              width: 80,
              height: height,
              fill: 'white'
            }
          })
          group.addShape('image', {
            attrs: {
              x: cfg.x - 32,
              y: cfg.y - 45,
              width: 64,
              height: 64,
              img: self.resultPic
            }
          })
          const resultItem = self.taskResults.find(item => item.resultTableIdx === cfg.model.tableNumber)
          if (resultItem) {
            group.addShape('image', {
              attrs: {
                x: cfg.x + 15,
                y: cfg.y,
                width: 25,
                height: 25,
                img: self.statusImg[resultItem.calStatus].img
              }
            })
          }
          group.addShape('text', {
            attrs: {
              x: cfg.x,
              y: cfg.y + 40,
              text: '结果 ' + cfg.model.title,
              textBaseline: 'bottom',
              textAlign: 'center',
              fontSize: 14,
              fill: '#000'
            }
          })
          return keyShape
        },
        getAnchorPoints: function(cfg) {
          return [[0, 0.5], [1, 0.5], [0.5, 0], [0.5, 1]]
        }
      })
      // 流程方形 节点创建
      self.net.render()
    },
    saveData(obj) { // 更新数据
      this.net.update(this.activation, {
        title: obj.title,
        subtitle: obj.subtitle
      })
    },
    del() { // 删除
      this.net.del()
    },
    save() { // 保存
      this.net.update(this.activation, {
        title: '52345346546'
      })
      /* 验证流图名称*/
      // const data = this.net.save()
    }
  },
  watch: {
    /**
       * 网格切换
       */
    checked: function() {
      this.gridChange = true // 网格改变触发 添加事件,需要变量来解决弹窗事件
      const _saveData = this.net.save()
      this.net.destroy() // 销毁画布
      this.initG6()
      this.net.read(_saveData)
      this.net.render()
      this.gridChange = false
    },
    sourceData: function() {
      this.gridChange = true //  网格改变触发 添加事件,需要变量来解决弹窗事件
      this.net.destroy() //  销毁画布
      this.initG6()
      this.net.source(this.sourceData.nodes, this.sourceData.edges)
      this.net.render()
      this.gridChange = false
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .model-define-chart{
      position: relative;
      .legend,.options{
          position:absolute;
          top: 1px;
          right: 1px;
          background-color: #fff;
          border-left:1px solid #E4E7ED;
          border-bottom:1px solid #E4E7ED;
          ul{
              list-style: none;
              margin: 0;
              padding: 0;
              padding:0 10px;
              li{
                  float: left;
                  padding:10px 10px;
                  img{
                      width: 17px;
                      display: block;
                      float: left;
                      margin-right: 5px;
                  }
                  .legend-title{
                      font-weight: bold;
                  }
                  &.chart-button{
                    cursor: pointer;
                    padding: 5px;
                    div{
                      border: 1px solid #DCDFE6;
                      padding: 5px 11px;
                      border-radius: 3px;
                    }
                    &:hover{
                      color:#409EFF;
                      div{
                        border: 1px solid #409EFF;
                      }
                    }
                  }
              }
          }
      }
      .options{
          position:absolute;
          top: 1px;
          left: 1px;
          right: auto;
          background-color: #fff;
          border-right:1px solid #E4E7ED;
          border-bottom:1px solid #E4E7ED;
      }
  }
  #flowChart {
    border: 1px solid #ebeef5;
    position: relative;
    overflow: hidden;
  }
  .operating {
    position: absolute;
    z-index: 99;
    background-color: #ffffff;
    padding: 20px 10px;
    box-shadow: 1px 1px 4px 0 #0a0a0a2e;
    width: 200px;
    height: 250px;
  }
  .info {
    position: absolute;
    right: 0;
    z-index: 99;
    box-shadow: 1px 1px 4px 0 #0a0a0a2e;
    .title {
      height: 40px;
      padding-left: 10px;
      border-top: 1px solid #DCE3E8;
      border-bottom: 1px solid #DCE3E8;
      border-left: 1px solid #DCE3E8;
      background: rgb(235, 238, 242);
      line-height: 40px;
      span {
        font-size: 14px;
      }
    }
    .content {
      background: rgba(247, 249, 251, 0.45);
      width: 200px;
      height: 800px;
      border-left: 1px solid #E6E9ED;
      padding: 10px;
    }
  }
  div.g6-html-node-container{
    border:0 solid #fff !important;
  }
  .btn-group {
    // border-right: 1px solid #efefef;
    // display: inline-block;
    padding-left: 10px;
    padding-right: 14px;
    &:last-of-type {
      border-right: 0;
    }
    .btn {
      display: inline-block;
      margin: 2px;
      width: 30px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      cursor: pointer;
      color:#A6A6A8;
      border: 1px solid rgba(233, 233, 233, 0);
      i {
        font-size: 20px;
      }
      &:hover {
        border: 1px solid #E9E9E9;
        color: #767A85;
        border-radius: 2px;
        background: #FAFAFE;
      }
    }
    .btn.actived{
      border: 1px solid #E9E9E9;
        color: #767A85;
        border-radius: 2px;
        background: #FAFAFE;
    }
    .el-form-item {
      margin-bottom: 0 !important;
    }
  }
</style>