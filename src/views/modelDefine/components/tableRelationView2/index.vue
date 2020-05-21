<template>
  <div style="height: 100%;overflow: hidden;">
    <div style="width:80%;float:left;">
      <div id="tableCanvasFlowChart">
        <div class="operating"
             style="position:fixed">
          <el-radio v-model="radio"
                    label="1">完全匹配的记录</el-radio>
          <el-radio v-model="radio"
                    label="2">主表的全部记录</el-radio>
          <el-radio v-model="radio"
                    label="3">关联表的全部记录</el-radio>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
var tablelist = {
  tlist: {},
  put: function(id, obj) {
    tablelist.tlist[id] = obj
  },
  remove: function(id) {
    for (var i in tablelist.tlist) {
      if (i === id) {
        delete tablelist.tlist[i]
      }
    }
  },
  get: function(id) {
    for (var i in tablelist.tlist) {
      if (i === id) {
        return tablelist.tlist[i]
      }
    }
    return null
  }
}
export default {
  props: {
    originalTableDetail: Object,
    relationTableDetail: Object
  },
  mounted() {
    this.initG6()
    if (this.relationTableDetail.joinRelation) {
      this.radio = this.relationTableDetail.joinRelation.type
    }
  },
  data() {
    return {
      sourceData: {},
      net: '',
      activationNode: '', // 当前激活的节点
      isBlank: true, // 当前是空白区
      dragNode: '', // 当前拖动的节点
      shareObject: {
        event: {}
      },
      radio: '1',
      upEv: {}
    }
  },
  methods: {
    // 提交关联表
    relationCommit() {
      const edges = this.net.save().source.edges
      if (edges.length <= 0) {
        return null
      }
      const relations = []
      for (const iterator of edges) {
        const relation = {}
        const sourceIndex = this.getColumnIndex(iterator.sourceAnchor)
        const targetIndex = this.getColumnIndex(iterator.targetAnchor)
        if (iterator.source === 1) {
          relation.originalColumnNumber = this.originalTableDetail.T05ModelColumn[sourceIndex].columnNumber
          relation.relationColumnNumber = this.relationTableDetail.T05ModelColumn[targetIndex].columnNumber
        } else {
          relation.originalColumnNumber = this.relationTableDetail.T05ModelColumn[targetIndex].columnNumber
          relation.relationColumnNumber = this.originalTableDetail.T05ModelColumn[sourceIndex].columnNumber
        }
        relations.push(relation)
      }
      this.relationTableDetail.joinRelation = {
        relations: relations,
        type: this.radio
      }
      this.relationTableDetail.tableIdx = this.relationTableDetail.tableIdx ? this.relationTableDetail.tableIdx : new Date().getTime()
      this.relationTableDetail.T05ModelColumn = this.relationTableDetail.T05ModelColumn.map(item => {
        item.tableIdxColumnNumber = this.relationTableDetail.tableIdx + '' + item.columnNumber
        return item
      })
      this.relationTableDetail.joinType = '1'
      return this.relationTableDetail
    },
    // 获取锚点对应的列序号
    getColumnIndex(num) {
      if (num === 0) {
        return 0
      } else {
        return Math.floor(num / 2)
      }
    },
    initG6() {
      const Canvas = document.querySelector('#relationTable .el-dialog.dialog-default')
      const width = Canvas.clientWidth
      const height = document.querySelector('#relationTable .dialog-contant-default').clientHeight - 30
      const flowChart = document.querySelector('#tableCanvasFlowChart')
      flowChart.oncontextmenu = function(e) {
        return false
      }
      const self = this
      self.Util = window.G6.Util
      self.net = new window.G6.Net({
        id: 'tableCanvasFlowChart', // 容器ID
        mode: 'edit',
        grid: {
          forceAlign: true, // 是否支持网格对齐
          cell: 25 // 网格大小
        },
        modes: {
          edit: [
            'dragNode', 'clickBlankClearActive', 'clickActive', 'dragNodeEndSetActive', 'hoverNodeShowAnchor',
            'multiSelect', 'resizeNode', 'hoverAnchorSetActived', 'dragEdgeEndHideAnchor', 'dragHideTexts', 'shortcut'
          ],
          add: ['clickAddNode', 'dragAddEdge', 'hoverAnchorSetActived', 'hoverNodeShowAnchor'],
          drag: ['shortcut', 'dragCanvas', 'clickFocus']
        },
        width: width,
        height: height
      })
      /** 点击节点*/
      self.net.on('itemclick', function(ev) {
      })
      self.net.on('dblclick', function(ev) {
        // self.save()
      })
      self.net.on('itemremove', function(ev) {

      })
      /** 鼠标放到锚点上 触发画线函数 */
      var dragging = true
      self.net.on('mousedown', function(ev) {
        dragging = false
      })
      self.net.on('mouseup', ev => {
        self.upEv = ev
        dragging = true
      })
      self.net.on('mouseenter', function(ev) {
        if (self.Util.isNode(ev.item)) {
          self.activationNode = ev.item
        }
        var shape = ev.shape
        if (shape && shape.hasClass('anchor-point') && dragging) {
          self.net.beginAdd('edge', {
            shape: 'relationLine'
            // shape: 'polyline'
          })
        }
      })
      self.net.on('mouseleave', function(ev) {
        var shape = ev.shape
        if (shape && shape.hasClass('anchor-point') && dragging) {
          self.net.changeMode('edit')
        }
      })
      self.net.on('itembeforeremove', function(ev) {
        const isnode = self.Util.isNode(ev.item)
        if (!isnode) {
          self.net.remove(ev.item)
        }
      })
      // 注册边
      window.G6.registEdge('relationLine', {
        draw: function(cfg, group) {
          const edgePoints = []
          // const tableWidth = tablelist.get(cfg.model.source)
          var keyShape = ''
          var model = cfg.model
          if (model.source === model.target) {
            return
          }
          var source = self.net.find(model.source)
          var sourcePoints = source.getAnchorPoints()
          var target = self.net.find(model.target)
          var targetPoints = target.getAnchorPoints()
          if (model.targetAnchor === void 0 || model.targetAnchor === null) {
            var minDistance
            for (var i = 0; i < targetPoints.length; i++) {
              var temp = Math.pow(targetPoints[i].x - self.upEv.x, 2) + Math.pow(targetPoints[i].y - self.upEv.y, 2)
              if (!minDistance) {
                minDistance = temp
              }
              if (temp <= minDistance) {
                minDistance = temp
                model.targetAnchor = i
              }
            }
          }
          var sourceEven, sourceOdd, targetEven, targetOdd
          sourceEven = model.sourceAnchor % 2 === 0 ? model.sourceAnchor : model.sourceAnchor - 1
          sourceOdd = sourceEven + 1
          targetEven = model.targetAnchor % 2 === 0 ? model.targetAnchor : model.targetAnchor - 1
          targetOdd = targetEven + 1

          sourcePoints[sourceOdd].x < targetPoints[targetEven].x ? edgePoints.push([sourcePoints[sourceOdd].x, sourcePoints[sourceOdd].y], [targetPoints[targetEven].x, targetPoints[targetEven].y]) : edgePoints.push([targetPoints[targetOdd].x, targetPoints[targetOdd].y], [sourcePoints[sourceEven].x, sourcePoints[sourceEven].y])

          keyShape = group.addShape('polyline', {
            attrs: {
              points: edgePoints,
              stroke: '#ccc',
              lineWidth: '2'
            }
          })
          return keyShape
        }
      })
      // 节点创建
      window.G6.registerNode('table', {
        cssSize: true, // 不使用内部 size 作为节点尺寸
        getHtml: function(cfg, group) {
          const model = cfg.model
          const container = self.Util.createDOM('<div class="node" style="border: 1px solid #ccc;border-radius::4px;"></div>')
          const title = self.Util.createDOM('<div style="padding:5px;text-align:center;background-color: #409EFF;color:#fff">' + model.tableName + '</div>')
          const list = self.Util.createDOM('<div style="padding:8px 0;"></div>')
          self.Util.each(model.fields, function(field, i) {
            const div = self.Util.createDOM("<div style='margin:0 10px;height:25px;'><div>")
            var spanDom = document.createElement('span')
            spanDom.innerHTML = field.columnName + (field.columnChnName ? '(' + field.columnChnName + ')' : '')
            spanDom.style.margin = '0 5px'
            spanDom.style.fontSize = '12px'
            div.appendChild(spanDom)
            list.appendChild(div)
          })
          container.appendChild(title)
          container.appendChild(list)
          return container
        },
        getAnchorPoints: function(cfg, group) { // 锚点位置
          const points = []
          const fields = cfg.model.fields
          const height = fields.length * 25 + 50
          for (var i = 0; i < fields.length; i++) {
            points.push([0, (32 + 12.5 + i * 25) / height, { style: {
              fill: 'red',
              fillOpacity: 0.5
            }}])
            points.push([1, (32 + 12.5 + i * 25) / height, { style: {
              fill: 'red',
              fillOpacity: 0.5
            },
            hoverStyle: {},
            value: fields[i].columnId
            }
            ])
          }
          return points
        },
        afterDraw: function(cfg, group) {
          // tablelist.put(cfg.model.id, cfg.html.offsetWidth)
        }
      }, 'html')
      this.net.render()
      const edges = []
      if (this.relationTableDetail.joinRelation &&
       this.relationTableDetail.joinRelation.relations &&
       this.relationTableDetail.joinRelation.relations.length > 0 &&
       this.relationTableDetail.T05ModelColumn.length > 0 &&
       this.originalTableDetail.T05ModelColumn.length > 0) {
        const currentTime = new Date().getTime()
        this.relationTableDetail.joinRelation.relations.forEach((item, index) => {
          const sourceIndex = this.originalTableDetail.T05ModelColumn.findIndex(it => it.columnNumber === item.originalColumnNumber)
          const targetIndex = this.relationTableDetail.T05ModelColumn.findIndex(it => it.columnNumber === item.relationColumnNumber)
          if (sourceIndex !== -1 && targetIndex !== -1) {
            edges.push({
              'shape': 'relationLine',
              'source': 1,
              'target': 2,
              'id': currentTime + index,
              'sourceAnchor': sourceIndex * 2,
              'targetAnchor': targetIndex * 2
            })
          }
        })
      }
      this.net.source({ 'nodes': [{
        id: 1,
        x: Canvas.clientWidth * 0.3,
        y: 100 + this.originalTableDetail.T05ModelColumn.length * 12.5,
        shape: 'table',
        tableName: this.originalTableDetail.tableName + (this.originalTableDetail.tableChnName ? '(' + this.originalTableDetail.tableChnName + ')' : ''),
        fields: this.originalTableDetail.T05ModelColumn
      }, {
        id: 2,
        x: Canvas.clientWidth * 0.6,
        y: 100 + this.relationTableDetail.T05ModelColumn.length * 12.5,
        shape: 'table',
        tableName: this.relationTableDetail.tableName + (this.relationTableDetail.tableChnName ? '(' + this.relationTableDetail.tableChnName + ')' : ''),
        fields: this.relationTableDetail.T05ModelColumn
      }],
      'edges': edges
      })
      this.net.render()
    },
    save() {
      const data = this.net.save()
      console.log(JSON.stringify(data, null, 2))
    }
  },
  computed: {
    mouseSite: function() {
      return this.shareObject[this.name]
    }
  },
  watch: {
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
.operating {
  position: absolute;
  z-index: 99;
  background-color: #ffffff;
  // padding: 15px 20px;
  left: 35%;
  text-align: center;
  line-height: 50px;
  box-shadow: 1px 1px 4px 0 #0a0a0a2e;
  width: 500px;
  height: 50px;
}
</style>