<template>
  <div class="model-define-chart">
    <!--流程图画布 -->
    <div :id="'flowChart'+shareObject.currentTab">
    </div>
    <!-- 表信息弹框 -->
    <el-dialog :title="tableName"
               append-to-body
               v-el-drag-dialog
               :close-on-click-modal="false"
               :visible.sync="tableInfoVisable"
               width="40%"
               custom-class="dialog-default">
      <div class="dialog-contant-default"
           v-if="tableInfoVisable">
        <el-table border
                  highlight-current-row
                  :data="currentTableColumns"
                  style="width: 100%">
          <el-table-column align="center"
                           label="字段英文名"
                           prop="columnName"></el-table-column>
          <el-table-column align="center"
                           label="字段中文名"
                           prop="columnChnName"></el-table-column>
        </el-table>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click="tableInfoVisable = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { baseRequest } from '@/api/base'
import { deepClone } from '@/utils'
import tableSheetPic from '../img/tableSheet.png'
import searchPic from '../img/search.png'
import resultPic from '../img/result.png'
import addPic from '../img/add.png'
// import { searchSql, addSql } from './createSql'
const joinType = {
  '1': 'inner join',
  '2': 'left join',
  '3': 'right join'
}
const uninoMap = {
  '1': 'union',
  '2': 'union all'
}
export default {
  currentFun: '',
  name: 'modelDefineComponentsTableView',
  components: {
  },
  props: {
    shareObject: Object,
    json: Object
  },
  computed: {
    // 绑定json
    modelJson() {
      if (this.json) {
        return deepClone(this.json)
      } else {
        return {
          'modelId': null,
          'modelName': '',
          'modelType': '1',
          'groupId': null,
          'modelStatus': '1',
          'createUserId': null,
          'T05ModelTable': [],
          'T05ModelParam': {
          },
          'T05ModelNode': [],
          'T05NodeRelation': [],
          'resultSql': []
        }
      }
    },
    mouseSite: function() {
      return this.shareObject.dragTime
    }
  },
  mounted() {
    this.init()
    const T05ModelNode = this.getNodeFromJson()
    const T05NodeRelation = this.getLineFromJson()
    this.net.source(T05ModelNode, T05NodeRelation)
    this.net.render()
    this.changeModelResourceTree()
  },
  data() {
    return {
      currentTableColumns: [],
      tableName: '',
      tableInfoVisable: false,
      id: '',
      color: '',
      net: '',
      Util: '',
      workflowName: '',
      activation: '', // 当前激活的节点
      checked: true, // 网格对齐
      gridChange: false, // 网格对其按钮发生改变
      type: '', // 有值为编辑状态
      param: {},
      tableSheetPic,
      searchPic,
      resultPic,
      addPic,
      nodeList: []
    }
  },
  methods: {
    // 切换模式
    changeMode(mode) { // 拖拽与编辑模式的切换
      this.net.changeMode(mode)
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
    // 导出模型
    exportModel() {
      if (!this.modelJson.modelName) {
        this.$prompt('请输入名称', '模型名称', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /\S/,
          inputErrorMessage: '模型名称不能为空'
        }).then(({ value }) => {
          const modelJson = deepClone(this.modelJson)
          modelJson.modelName = value
          this.saveModelData()
          const exportModelStr = JSON.stringify(modelJson)
          this.exportHandle(exportModelStr, value)
        })
      } else {
        this.saveModelData()
        const exportModelStr = JSON.stringify(this.modelJson)
        this.exportHandle(exportModelStr, this.modelJson.modelName)
      }
    },
    // 导出操作
    exportHandle(str, name) {
      const exportName = name + '.md'
      // name = decodeURI(name)
      str = encodeURI(str)
      const blob = new Blob([str])
      const url = window.URL.createObjectURL(new Blob([str]))
      if ('download' in document.createElement('a')) {
        const link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.setAttribute('download', exportName)

        document.body.appendChild(link)
        link.click()
      } else {
        navigator.msSaveBlob(blob, exportName)
      }
    },
    // 保存模型
    saveModel(groupId) {
      if (typeof (this.modelJson.dataSourceId) === 'undefined') {
        this.modelJson.dataSourceId = this.shareObject.dsId
        this.modelJson.dataSourceId = this.shareObject.dsCode
        this.modelJson.dataSourceName = this.shareObject.dsName
        this.modelJson.dataSourceType = this.shareObject.dsType
      }
      if (this.modelJson.modelId !== null) {
        this.saveModelData()
        baseRequest('/basic/t05ModelDef/analysisJson', { modelJson: JSON.stringify(this.modelJson) }).then(resoponse => {
          this.$message({
            type: 'success',
            message: '保存成功'
          })
          this.$emit('getClassfyTree')
        })
      } else {
        this.$prompt('请输入名称', '模型名称', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /\S/,
          inputErrorMessage: '模型名称不能为空'
        }).then(({ value }) => {
          this.$emit('changeName', value)
          this.modelJson.modelName = value
          if (typeof (groupId) !== 'undefined') {
            this.modelJson.groupId = groupId
          }
          this.saveModelData()
          baseRequest('/basic/t05ModelDef/analysisJson', { modelJson: JSON.stringify(this.modelJson) }).then(resoponse => {
            this.modelJson.modelId = resoponse.data.item.modelId
            this.$message({
              type: 'success',
              message: '保存成功'
            })
            this.$emit('getClassfyTree')
          })
        })
      }
    },
    // 保存模型数据处理
    saveModelData() {
      const nodes = this.net.save().source.nodes
      const edges = this.net.save().source.edges
      this.modelJson.T05ModelNode.length = 0
      this.modelJson.T05NodeRelation.length = 0
      for (const iterator of nodes) {
        if (iterator.shape === '2') {
          if (iterator.nodeType === '2') {
            this.modelJson.T05ModelNode.push({
              nodeNumber: iterator.id,
              nodeName: iterator.title,
              tableNumber: iterator.tableNumber,
              nodeType: iterator.nodeType,
              positions: `x:${iterator.x},y:${iterator.y}`,
              T05JoinColumn: iterator.T05JoinColumn || [],
              T05JoinExpression: iterator.T05JoinExpression || [],
              T05JoinNode: iterator.T05JoinNode || {},
              T05JoinOrder: iterator.T05JoinOrder || [],
              T05JoinTable: iterator.T05JoinTable || []
            })
          } else {
            this.modelJson.T05ModelNode.push({
              nodeNumber: iterator.id,
              nodeName: iterator.title,
              tableNumber: iterator.tableNumber,
              nodeType: iterator.nodeType,
              positions: `x:${iterator.x},y:${iterator.y}`,
              T05UnionTable: iterator.T05UnionTable || [],
              T05UnionOrder: iterator.T05UnionOrder || []
            })
          }
        } else {
          this.modelJson.T05ModelNode.push({
            nodeNumber: iterator.id,
            nodeName: iterator.title,
            tableNumber: iterator.tableNumber,
            nodeType: iterator.nodeType,
            positions: `x:${iterator.x},y:${iterator.y}`
          })
        }
      }
      for (const iterator of edges) {
        this.modelJson.T05NodeRelation.push({
          lineNumber: iterator.id,
          originNodeId: iterator.source,
          targetNodeId: iterator.target,
          lineType: iterator.lineType,
          lineStyle: {
            shape: iterator.shape
          }
        })
      }
    },
    // 删除节点
    nodeDelete() {
      this.$parent.$parent.$parent.contextmenuVisable = false
      const currentNode = this.activation.getModel()
      if (currentNode.nodeType === '1') {
        this.deleteOriNode(this.activation)
      } else {
        // 删除新增节点
        this.deleteMiddleNode()
      }
      this.changeModelResourceTree()
    },
    // 删除原始节点
    deleteOriNode(currentNode) {
      const allLine = this.net.getEdges()
      if (allLine.some(item => item._attrs.source._attrs.id === currentNode._attrs.id || (item._attrs.target._attrs.id === currentNode._attrs.id))) {
        this.$message.warning('该原始表存在其他关联连线')
      } else {
        const tableNumber = currentNode.getModel().tableNumber
        this.modelJson.T05ModelTable = this.modelJson.T05ModelTable.filter(item => item.tableNumber !== tableNumber)
        this.net.remove(currentNode)
      }
    },
    // 删除添加追加节点
    deleteMiddleNode() {
      const resultNode = this.activation.getEdges().find(item => item.getModel().lineType === '1')._attrs.target
      if (resultNode.getEdges().length > 1) {
        this.$message.warning('该结果表存在其他关联连线')
      } else {
        const temp = this.activation.getEdges().concat({})
        for (const iterator of temp) {
          if (iterator._attrs) {
            this.deleteNode(iterator.getModel().lineType === '1' ? iterator._attrs.target : iterator._attrs.source)
          }
        }
        const tableNumber = this.activation.getModel().tableNumber
        this.modelJson.T05ModelTable = this.modelJson.T05ModelTable.filter(item => item.tableNumber !== tableNumber)
        this.net.remove(this.activation)
        this.changeModelResourceTree()
        this.modelJson.resultSql = this.modelJson.resultSql.filter(item => item.tableNumber !== tableNumber)
      }
    },
    // 删除单个节点
    deleteNode(node) {
      if (node.getEdges().length <= 1) {
        const tableNumber = node.getModel().tableNumber
        this.modelJson.T05ModelTable = this.modelJson.T05ModelTable.filter(item => item.tableNumber !== tableNumber)
        this.net.remove(node)
      }
    },
    // 改变模型资源树
    changeModelResourceTree() {
      const data = []
      for (const iterator of this.net.getNodes()) {
        const temp = {
          id: iterator._attrs.model.id,
          title: iterator._attrs.model.title,
          nodeType: iterator._attrs.model.nodeType
        }
        data.push(temp)
      }
      this.$emit('changeModelResourceTree', data)
    },
    // 改变中心点
    centeNode(node) {
      const currentNode = this.net.getNodes().find(item => item._attrs.id === node.id)
      if (currentNode) {
        const point = {}
        point.x = currentNode._attrs.model.x + 250
        point.y = currentNode._attrs.model.y
        this.net.focusPoint(point)
      }
    },
    // 判断追加时是否存在追加节点
    juageAddNode() {
      const addLine = this.activation.getEdges().find(item => item._attrs.model.lineType === '0' && item._attrs.target.getModel().nodeType === '3')
      if (addLine) {
        this.activation = addLine._attrs.target
        // self.$emit('updateQuery', this.activation.getModel())
        return this.activation.getModel()
      } else {
        return false
      }
    },
    // 保存生成器
    saveQueryCreate(params) {
      const currentTime = new Date().getTime()
      // 改变总表
      this.modelJson.T05ModelTable = params.tableJson
      // this.modelJson.T05ModelParam = params.modelParam
      const allLine = this.net.getEdges()
      let nodeCount = 0
      for (const iterator of allLine) {
        if (iterator._attrs.source._attrs.id === this.activation._attrs.id) {
          nodeCount++
        }
      }
      // const isSouceNode = this.activation._attrs.model.shape === '1'
      const queryJson = params.queryJson
      const resultJosn = params.resultJosn
      // 生成查询节点
      queryJson.x =
        // isSouceNode ?
        this.activation._attrs.model.x + 300
      //  : this.activation._attrs.model.x + 300 * nodeCount
      queryJson.y =
        // isSouceNode ?
        this.activation._attrs.model.y + 180 * nodeCount
      // : this.activation._attrs.model.y + 180
      const nodeResultId = currentTime + 1
      this.net.add('node', queryJson)
      const edge = {
        'shape': 'arrow',
        'source': this.activation._attrs.id,
        'target': queryJson.id,
        'id': currentTime + 2,
        'lineType': '0'
      }
      this.net.add('edge', edge)

      // 生成关联节点
      if (params.type === 'add') {
        if (queryJson.T05UnionTable.length > 1) {
          for (let x = 1; x < queryJson.T05UnionTable.length; x++) {
            const T05UnionTable = queryJson.T05UnionTable
            this.addAddLine(T05UnionTable[x], currentTime, x, queryJson)
          }
        }
      } else {
        this.addRelationLine(queryJson, currentTime)
      }
      // 生成结果节点
      const nodeResult = {
        id: nodeResultId,
        tableNumber: resultJosn.tableNumber,
        x:
          // isSouceNode ?
          this.activation._attrs.model.x + 600,
        //  : this.activation._attrs.model.x + 300 * nodeCount,
        y:
          // isSouceNode ?
          this.activation._attrs.model.y + 180 * nodeCount,
        // : this.activation._attrs.model.y + 300,
        title: resultJosn.tableChnName,
        shape: '4',
        nodeType: '4'
      }
      this.net.add('node', nodeResult)
      const edgeResult = {
        'shape': 'arrow',
        'source': queryJson.id,
        'target': nodeResultId,
        'id': currentTime + 5,
        'lineType': '1'
      }
      this.net.add('edge', edgeResult)
      this.changeModelResourceTree()
      let sql = ''
      if (params.type === 'add') {
        sql = this.addSql(this.modelJson, queryJson)
      } else {
        sql = this.searchSql(this.modelJson, queryJson)
      }
      this.modelJson.resultSql.push({
        tableNumber: nodeResult.tableNumber,
        sql: sql
      })
    },
    // 添加追加节点连线
    addAddLine(table, currentTime, index, queryJson) {
      const allNode = this.net.getNodes()
      const currentRelationTable = allNode.find(item => item._attrs.model.shape !== '2' && item._attrs.model.tableNumber === table.tableNumber)
      if (!currentRelationTable) {
        const relationTable = this.modelJson.T05ModelTable.find(item => item.tableNumber === table.tableNumber)
        const allLine = this.net.getEdges()
        let nodeCount = 0
        for (const iterator of allLine) {
          if (iterator._attrs.target._attrs.id === queryJson.id) {
            nodeCount++
          }
        }
        const newRelationNode = {
          id: currentTime + 6 + index * 2,
          nodeType: '1',
          shape: '1',
          tableNumber: table.tableNumber,
          title: relationTable.tableName + (relationTable.tableChnName ? '(' + relationTable.tableChnName + ')' : ''),
          x: queryJson.x + 150 * nodeCount,
          y: queryJson.y + 90
        }
        this.net.add('node', newRelationNode)
        const edge = {
          'shape': 'arrow',
          'source': currentTime + 6 + index * 2,
          'target': queryJson.id,
          'id': currentTime + 7 + index * 2,
          'lineType': '2'
        }
        this.net.add('edge', edge)
      } else {
        const allLine = this.net.getEdges()
        const hasLine = allLine.some(item => {
          return item._attrs.source._attrs.id === currentRelationTable._attrs.id && item._attrs.target._attrs.id === queryJson.id
        })
        if (!hasLine) {
          const edge = {
            'shape': 'arrow',
            'source': currentRelationTable._attrs.id,
            'target': queryJson.id,
            'id': currentTime + 7 + index * 2,
            'lineType': '2'
          }
          this.net.add('edge', edge)
        }
      }
    },
    // 添加关联节点连线
    addRelationLine(queryJson, currentTime) {
      const allNode = this.net.getNodes()

      // 判断改查询是否关联表
      const relationNode = queryJson.T05JoinTable.find(item => item.joinType === '1')
      if (relationNode) {
        // const relationNode = queryJson['T05JoinTable'][1]
        // 判断节点上是否存在关联表
        const newRelationNodeId = currentTime + 3
        const currentRelationTable = allNode.find(item => item._attrs.model.shape !== '2' && item._attrs.model.tableNumber === relationNode.tableNumber)
        if (!currentRelationTable) {
          const relationTable = this.modelJson.T05ModelTable.find(item => item.tableNumber === relationNode.tableNumber)
          const newRelationNode = {
            id: newRelationNodeId,
            nodeType: '1',
            shape: '1',
            tableNumber: relationNode.tableNumber,
            title: relationTable.tableName + (relationTable.tableChnName ? '(' + relationTable.tableChnName + ')' : ''),
            x: queryJson.x + 150,
            y: queryJson.y + 90
          }
          this.net.add('node', newRelationNode)
          const edge = {
            'shape': 'arrow',
            'source': newRelationNodeId,
            'target': queryJson.id,
            'id': currentTime + 4,
            'lineType': '2'
          }
          this.net.add('edge', edge)
        } else {
          const edge = {
            'shape': 'arrow',
            'source': currentRelationTable._attrs.id,
            'target': queryJson.id,
            'id': currentTime + 4,
            'lineType': '2'
          }
          this.net.add('edge', edge)
        }
      }
    },
    // 生成器修改
    saveQueryUpdate(params) {
      const queryJson = params.queryJson
      const resultJosn = params.resultJosn
      // 保存model表
      this.modelJson.T05ModelTable = params.tableJson
      // 保存参数管理器
      // this.modelJson.T05ModelParam = params.modelParam
      // 保存查询节点
      this.net.update(this.activation, queryJson)
      const allLine = this.net.getEdges()
      // 判断生成器或追加
      if (params.type === 'add') {
        for (const item of allLine) {
          if (item._attrs.model.lineType === '2' && item._attrs.target._attrs.id === this.activation._attrs.id) {
            const relationNode = item._attrs.source
            const newAddNode = queryJson.T05UnionTable.find(it => it.tableNumber === relationNode._attrs.model.tableNumber)
            if (!newAddNode) {
              this.net.remove(item)
              const relationLines = allLine.filter(item => item._attrs.source === relationNode || item._attrs.target === relationNode)
              if (relationLines.length === 0) {
                this.net.remove(relationNode)
              }
            }
          }
        }
        // 添加追加节点
        const currentTime = new Date().getTime()
        if (queryJson.T05UnionTable.length > 1) {
          for (let x = 1; x < queryJson.T05UnionTable.length; x++) {
            const T05UnionTable = queryJson.T05UnionTable
            this.addAddLine(T05UnionTable[x], currentTime, x, queryJson)
          }
        }
      } else {
        // 删除关联节点
        const relationLine = allLine.find(item => item._attrs.model.lineType === '2' && item._attrs.target._attrs.id === this.activation._attrs.id)
        if (relationLine) {
          const newRelationNode = queryJson.T05JoinTable.find(item => item.joinType === '1')
          if (relationLine._attrs.source._attrs.model.tableNumber !== newRelationNode.tableNumber) {
            const relationNode = relationLine._attrs.source
            this.net.remove(relationLine)
            const relationLines = allLine.filter(item => item._attrs.source === relationNode || item._attrs.target === relationNode)
            if (relationLines.length === 0) {
              this.net.remove(relationNode)
            }
            // 添加关联节点
            this.addRelationLine(queryJson, new Date().getTime())
          }
        } else {
          // 添加关联节点
          this.addRelationLine(queryJson, new Date().getTime())
        }
      }
      // 保存结果节点
      const resulNode = allLine.find(item => item._attrs.model.lineType === '1' && item._attrs.source._attrs.id === this.activation._attrs.id)._attrs.target
      this.net.update(resulNode, { title: resultJosn.tableChnName })
      this.changeModelResourceTree()
      let sql = ''
      if (params.type === 'add') {
        sql = this.addSql(this.modelJson, queryJson)
      } else {
        sql = this.searchSql(this.modelJson, queryJson)
      }
      this.modelJson.resultSql.find(item => item.tableNumber === resultJosn.tableNumber).sql = sql
    },
    init() {
      const flowChart = document.querySelector('#flowChart' + this.shareObject.currentTab)
      flowChart.oncontextmenu = function(e) {
        return false
      }
      flowChart.id = 'flowChart' + this.shareObject.currentTab
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
            'dragNode', 'clickBlankClearActive', 'resizeEdge', 'clickActive', 'dragNodeEndSetActive',
            'multiSelect', 'resizeNode', 'shortcut', 'wheelZoom'
          ],
          // 拖动模式（查看模式）
          drag: ['shortcut', 'dragCanvas']
        },
        // fitView: 'tl',
        grid: {
          forceAlign: true, // 是否支持网格对齐
          cell: 25 // 网格大小
        },
        // fitView: '' // 布局
        width: document.querySelector('#pane-' + this.shareObject.currentTab + ' .containner').offsetWidth,
        height: document.querySelector('#pane-' + this.shareObject.currentTab + ' .containner-option').offsetHeight - 41// 画布高
      })
      self.net.on('contextmenu', function(ev) { // 鼠标右键
        const isNode = self.Util.isNode(ev.item) // 判断是否是节点
        if (isNode) {
          self.activation = ev.item
          self.$parent.$parent.$parent.currentNodeType = self.activation.getModel().nodeType
          self.$parent.$parent.$parent.contextmenuVisable = true
          self.$nextTick(_ => {
            const contextmenu = document.querySelector('.contextmenu.execute') // 找右键的菜单
            if (contextmenu) { // 找到菜单
              // const model = document.querySelector('.model-define')
              const style = contextmenu.style // 获取style 属性
              style.left = ev.domEvent.clientX + 'px' // 获取当前鼠标的位置并设置菜单的 x
              style.top = ev.domEvent.clientY + 'px'
              // style.display = 'block' // 设置显示
            } else {
              alert('未找到菜单')
            }
          })
        }
      })
      self.net.on('keyup', function(ev) {
        if (ev.keyCode === 32) {
          self.$parent.$parent.$parent.spaceSwich()
        }
      })
      self.net.on('dblclick', function(ev) { // 鼠标双击
        self.$parent.$parent.$parent.contextmenuVisable = false
        const isNode = self.Util.isNode(ev.item) // 判断是否是节点
        if (isNode) {
          if (ev.item.getModel().shape === '2') {
            if (ev.item.getModel().nodeType === '2') {
              self.activation = ev.item
              self.$emit('updateQuery', ev.item.getModel())
            } else {
              self.activation = ev.item
              self.$emit('updateAdd', ev.item.getModel())
            }
          } else {
            const node = ev.item.getModel()
            self.tableName = node.title
            self.currentTableColumns = self.modelJson.T05ModelTable.find(item => item.tableNumber === node.tableNumber).T05ModelColumn
            self.tableInfoVisable = true
          }
        }
      })
      self.net.on('click', function(ev) { // 鼠标双击
        // const isNode = self.Util.isNode(ev.item) // 判断是否是节点
        // if (!isNode) {
        // const contextmenu = document.querySelector('.contextmenu.execute') // 找右键的菜单
        // if (contextmenu) { // 找到菜单
        //   const style = contextmenu.style // 获取style 属性
        //   style.display = 'none' // 设置显示
        // } else {
        //   alert('未找到菜单')
        // }
        self.$parent.$parent.$parent.contextmenuVisable = false
        // }
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
    },
    addTable(currentTreeNode, callback) {
      if (this.modelJson.T05ModelTable.find(item => item.tableId === currentTreeNode.id)) {
        this.$message.warning('该节点已存在')
        return
      }
      baseRequest('/basic/columns/getColumnsByTableId', { tableId: currentTreeNode.id }).then(response => {
        const colunms = response.data.item
        colunms.map((item, index) => {
          item.columnNumber = index
          item.columnChnName = item.columnchnname || ''
          item.columnId = item.columnid
          item.columnName = item.columnname
          return item
        })
        const tableNumber = new Date().getTime()
        if (this.modelJson.T05ModelTable.length === 0) {
          this.modelJson.dataSourceId = this.shareObject.dsId
          this.modelJson.dataSourceName = this.shareObject.dsName
          this.modelJson.dataSourceType = this.shareObject.dsType
          this.modelJson.dataSourceCode = this.shareObject.dsCode
        }
        this.modelJson.T05ModelTable.push({
          'tableNumber': tableNumber,
          'tableType': '1', // '1' 原始表 '2' 结果表
          'tableId': currentTreeNode.id,
          'tableName': currentTreeNode.tableName,
          'tableChnName': currentTreeNode.name || '',
          'schemaName': currentTreeNode.schemaName,
          'T05ModelColumn': colunms
        })
        if (callback) callback(tableNumber)
      })
    },
    // sql 处理
    /**
 * 生成查询sql
 * @param {*} modelJson
 * @param {查询节点} middleNode
 */
    searchSql(modelJson, middleNode) {
      let sql = 'select '
      if (middleNode.T05JoinNode.distinctFlag === '1') {
        sql += 'distinct '
      }
      const aliasMap = {}
      const T05JoinColumn = middleNode.T05JoinColumn
      const mainNode = middleNode.T05JoinTable.find(it => it.joinType === '0')
      const mainTable = modelJson.T05ModelTable.find(item => item.tableNumber === mainNode.tableNumber)
      let joinTable = null
      const joinNode = middleNode.T05JoinTable.find(it => it.joinType === '1')
      if (joinNode) {
        joinTable = modelJson.T05ModelTable.find(item => item.tableNumber === joinNode.tableNumber)
      }
      // 添加主表和关联表的别名到集合
      if (!aliasMap[mainNode.tableIdx + '']) {
        aliasMap[mainNode.tableIdx + ''] = 'A' + mainNode.tableIdx
      }
      if (joinTable && !aliasMap[joinNode.tableIdx + '']) {
        aliasMap[joinNode.tableIdx + ''] = 'A' + joinNode.tableIdx
      }
      // 结果表
      const resultTable = modelJson.T05ModelTable.find(item => item.tableNumber === middleNode.tableNumber)
      // 遍历查询结果
      sql += this.resultColumn(T05JoinColumn, middleNode, modelJson, resultTable, aliasMap)
      sql += 'from '
      if (mainTable.tableType === '2') {
        sql += '#{' + mainTable.tableNumber + '}'
      } else {
        sql += mainTable.tableName
      }
      if (modelJson.dataSourceType !== '1') {
        sql += ' as'
      }
      sql += ' ' + aliasMap[mainNode.tableIdx + ''] + ' '
      // 关联条件
      if (joinTable) {
        sql += this.joinCondition(joinNode, joinTable, mainTable, mainNode, aliasMap, modelJson)
      }
      // where
      if (middleNode.T05JoinFilter.where.length > 0) {
        sql += 'where '
        sql += this.getFilterStr(middleNode.T05JoinFilter.where, aliasMap)
      }
      // groupBy
      if (middleNode.T05JoinNode.groupInfo.length > 0) {
        sql += 'group by '
        const groupByStr = this.getGroupByStr(middleNode.T05JoinNode.groupInfo, aliasMap)
        sql += groupByStr.substring(0, groupByStr.length - 1) + ' '
      }
      // orderBy
      if (middleNode.T05JoinOrder.length > 0) {
        sql += this.getOrderByStr(middleNode.T05JoinOrder, middleNode, modelJson, aliasMap) + ' '
      }
      // having
      if (middleNode.T05JoinFilter.hive.length > 0) {
        sql += 'having '
        sql += this.getFilterStr(middleNode.T05JoinFilter.hive, aliasMap)
      }
      return sql
    },
    /**
 * 生成追加sql
 * @param {*} modelJson
 * @param {追加节点} middleNode
 */
    addSql(modelJson, middleNode) {
      let sql = 'select '
      const T05UnionTable = middleNode.T05UnionTable
      const resultTable = modelJson.T05ModelTable.find(item => item.tableNumber === middleNode.tableNumber)
      for (const [index, iterator] of T05UnionTable.entries()) {
        const oriTable = modelJson.T05ModelTable.find(item => item.tableNumber === iterator.tableNumber)
        const T05UnionColumn = iterator.T05UnionColumn
        if (iterator.unionType !== '0') {
          sql += uninoMap[iterator.unionType] + ' select '
        }
        const currentTime = new Date().getTime()
        for (const [i, it] of T05UnionColumn.entries()) {
          const oriColumn = oriTable.T05ModelColumn.find(item => item.columnNumber === it.columnNumber)
          const resultColumn = resultTable.T05ModelColumn[i]
          if (i !== 0) {
            sql += ','
          }
          sql += 'A' + currentTime + index + '.' + oriColumn.columnName + ' '
          sql += 'as ' + resultColumn.columnName
          if (i === T05UnionColumn.length - 1) {
            sql += ' '
          }
        }
        if (oriTable.tableType === '1') {
          sql += 'from ' + oriTable.tableName
        } else {
          sql += 'from ' + '#{' + oriTable.tableNumber + '}'
        }
        if (modelJson.dataSourceType !== '1') {
          sql += ' as'
        }
        sql += ' A' + currentTime + index + ' '
      }
      return sql
    },
    /**
 * 结果列
 * @param {*} T05JoinColumn
 * @param {*} middleNode
 * @param {*} modelJson
 * @param {*} resultTable
 * @param {*} aliasMap
 */
    resultColumn(T05JoinColumn, middleNode, modelJson, resultTable, aliasMap) {
      let sql = ''
      // 遍历查询结果
      for (const [index, iterator] of T05JoinColumn.entries()) {
        if (index !== 0) {
          sql += ','
        }
        if (Number.isFinite(iterator.expressionNumber)) {
          const joinExpression = middleNode.T05JoinExpression.find(item => item.columnIdx === iterator.expressionNumber)
          sql += this.expressionText('', joinExpression.expression, aliasMap)
        } else {
          const tableNumber = iterator.tableNumber
          const tableIdx = iterator.tableIdx
          const modelTable = modelJson.T05ModelTable.find(item => item.tableNumber === tableNumber)
          const modelColumn = modelTable.T05ModelColumn.find(item => item.columnNumber === iterator.columnNumber)
          if (iterator.groupFunc) {
            sql += iterator.groupFunc + '('
            sql += aliasMap[tableIdx + ''] + '.' + modelColumn.columnName
            sql += ') '
          } else {
            sql += aliasMap[tableIdx + ''] + '.' + modelColumn.columnName + ' '
          }
        }
        sql += 'as ' + resultTable.T05ModelColumn[index].columnName + ' '
      }
      return sql
    },
    /**
 * 关联表
 * @param {*} joinNode
 * @param {*} joinTable
 * @param {*} mainTable
 * @param {*} mainNode
 * @param {*} aliasMap
 */
    joinCondition(joinNode, joinTable, mainTable, mainNode, aliasMap, modelJson) {
      let sql = ''
      sql += joinType[joinNode.joinRelation.type] + ' '
      if (joinTable.tableType === '2') { // 关联为结果表
        sql += '#{' + joinTable.tableNumber + '}'
      } else { // 关联为原始表
        sql += joinTable.tableName
      }
      if (modelJson.dataSourceType !== '1') {
        sql += ' as'
      }
      sql += ' ' + aliasMap[joinNode.tableIdx + ''] + ' '
      const mainColumn = mainTable.T05ModelColumn.find(item => item.columnNumber === joinNode.joinRelation.relations[0].originalColumnNumber)
      const joinColumn = joinTable.T05ModelColumn.find(item => item.columnNumber === joinNode.joinRelation.relations[0].relationColumnNumber)
      sql += 'on ' + aliasMap[mainNode.tableIdx + ''] + '.' + mainColumn.columnName + ' '
      sql += '= '
      sql += aliasMap[joinNode.tableIdx + ''] + '.' + joinColumn.columnName + ' '
      return sql
    },
    /**
 * 获取计算列表达式
 * @param {结果} text
 * @param {递归children} arr
 * @param {别名集合} aliasMap
 */
    expressionText(text, arr, aliasMap) {
      for (const iterator of arr) {
        if (iterator.type === 2) {
          text += aliasMap[iterator.tableIdx + ''] + '.' + iterator.columnName + ' '
        } else if (iterator.type === 3) {
          text += '${' + iterator.value + '}' + ' '
        } else {
          text += iterator.value + ' '
        }
        if (iterator.children && iterator.children.length > 0) {
          text = this.expressionText(text, iterator.children, aliasMap)
        }
      }
      return text
    },
    /**
 * 获取filter
 * @param {*} filter
 * @param {*} aliasMap
 */
    getFilterStr(filter, aliasMap) {
      let result = ''
      if (filter[0].type === '1') {
        result += this.expressionText('', filter[0].value, aliasMap)
      } else {
        result = this.getChildrenFilterStr(filter[0], aliasMap, result, true)
      }
      return result
    },
    /**
 * 获取filter递归
 * @param {*} node
 * @param {*} aliasMap
 * @param {*} result
 */
    getChildrenFilterStr(node, aliasMap, result, first) {
      if (!first) {
        result += '('
      }
      for (const [index, iterator] of node.children.entries()) {
        if (index === 1) {
          result += node.value + ' '
        }
        if (iterator.type === '1') {
          result += this.expressionText('', iterator.value, aliasMap)
        } else {
          result = this.getChildrenFilterStr(iterator, aliasMap, result)
        }
      }
      if (!first) {
        result += ')'
      }
      return result
    },

    /**
 * 分组
 * @param {*} groupInfo
 * @param {*} aliasMap
 */
    getGroupByStr(groupInfo, aliasMap) {
      let groupByStr = ''
      for (const table of groupInfo) {
        for (const column of table.columns) {
          groupByStr += aliasMap[table.tableIdx + ''] + '.' + column.columnName + ','
        }
      }
      return groupByStr
    },
    getOrderByStr(T05JoinOrder, middleNode, modelJson, aliasMap) {
      let sql = 'order by '
      // 遍历查询结果
      for (const [index, iterator] of T05JoinOrder.entries()) {
        if (index !== 0) {
          sql += ','
        }
        if (Number.isFinite(iterator.expressionNumber)) {
          const joinExpression = middleNode.T05JoinExpression.find(item => item.columnIdx === iterator.expressionNumber)
          sql += this.expressionText('', joinExpression.expression, aliasMap)
        } else {
          const tableNumber = iterator.tableNumber
          const tableIdx = iterator.tableIdx
          const modelTable = modelJson.T05ModelTable.find(item => item.tableNumber === tableNumber)
          const modelColumn = modelTable.T05ModelColumn.find(item => item.columnNumber === iterator.columnNumber)
          sql += aliasMap[tableIdx + ''] + '.' + modelColumn.columnName + ' '
        }
        sql += iterator === '2' ? 'desc' : 'asc'
      }
      return sql
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
    },
    mouseSite: function() {
      // 发现坐标改变,在新坐标处添加图形
      const id = new Date().getTime()
      var e = this.shareObject.event
      this.net.get('eventAssist')._processEventObj(e)
      const ev = this.net.get('eventAssist').currentEventObj
      this.addTable(this.shareObject.currentTreeNode, function(tableNumber) {
        const node = {
          id: id,
          tableNumber: tableNumber,
          x: ev.x,
          y: ev.y,
          title: this.shareObject.currentTreeNode.tableName + (this.shareObject.currentTreeNode.name ? '(' + this.shareObject.currentTreeNode.name + ')' : ''),
          shape: '1',
          nodeType: '1'
        }
        this.net.source({ nodes: [node] })
        this.net.render()
        // 右侧列表添加
        this.changeModelResourceTree()
      }.bind(this))
    }

  }

}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
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
    border-top: 1px solid #dce3e8;
    border-bottom: 1px solid #dce3e8;
    border-left: 1px solid #dce3e8;
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
    border-left: 1px solid #e6e9ed;
    padding: 10px;
  }
}
div.g6-html-node-container {
  border: 0 solid #fff !important;
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
    color: #a6a6a8;
    border: 1px solid rgba(233, 233, 233, 0);
    i {
      font-size: 20px;
    }
    &:hover {
      border: 1px solid #e9e9e9;
      color: #767a85;
      border-radius: 2px;
      background: #fafafe;
    }
  }
  .btn.actived {
    border: 1px solid #e9e9e9;
    color: #767a85;
    border-radius: 2px;
    background: #fafafe;
  }
  .el-form-item {
    margin-bottom: 0 !important;
  }
}
</style>