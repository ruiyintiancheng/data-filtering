<template>
  <div style="height: 100%;overflow: hidden;">
    <div style="width:20%;height:100%;float:left;border:1px solid rgb(187, 216, 216);">
      <table-tree :shareObject = shareObject></table-tree>
    </div>
    <div style="width:80%;float:left;">
      <div id="tableCanvasFlowChart">
      </div>
    </div>
    <el-dialog id="relationTable" title="操作类型" v-el-drag-dialog append-to-body :close-on-click-modal="false" :visible.sync="opertionShow" width="30%" custom-class="dialog-default">
      <div class="dialog-contant-default">
          <opertion-view></opertion-view>
      </div>
      <div slot="footer" class="dialog-footer">
        <div>
            <el-button @click="opertionShow=false">确定</el-button>
            <el-button @click="opertionShow=false">取消</el-button>
        </div>
      </div>
    </el-dialog>
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
import elDragDialog from '@/directive/el-dragDialog'
import rightPic from './img/right.png'
import innerPic from './img/inner.png'
import leftPic from './img/right.png'
import allPic from './img/all2.png'
import tableTree from './components/tableTree'
import opertionView from './components/opertionView'
export default {
  name: 'modelDefineComponentsTableRelationViewIndex',
  directives: { elDragDialog },
  components: {
    tableTree, opertionView
  },
  mounted() {
    this.initG6()
    // const that = this
    // document.querySelector('body').onkeydown = function(event) {
    //   if (event.keyCode === 13) {
    //     var model = that.net.getModel()
    //     if (model === 'drag') {
    //       that.net.changeMode('drag')
    //     } else {
    //       that.net.changeMode('edit')
    //     }
    //   } else if (event.keyCode === 46 || event.keyCode === 8) {
    //     that.net.del()
    //   }
    // }
  },
  props: {
  },
  data() {
    return {
      opertionShow: false,
      sourceData: {},
      net: '',
      activationNode: '', // 当前激活的节点
      isBlank: true, // 当前是空白区
      type: '', // 有值为编辑状态
      dragNode: '', // 当前拖动的节点
      rightPic,
      innerPic,
      leftPic,
      allPic,
      shareObject: {
        event: {}
      }
    }
  },
  methods: {
    initG6() {
      const Canvas = document.querySelector('#relationTable .el-dialog.dialog-default')
      const width = Canvas.clientWidth * 0.8
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
          drag: ['shortcut', 'dragCanvas', 'wheelZoom', 'clickFocus']
        },
        width: width,
        height: height
      })
      /** 点击节点*/
      self.net.on('itemclick', function(ev) {
        console.log('节点点击')
        if (self.Util.isEdge(ev.item)) {
          self.opertionShow = true
        }
      })
      /** 鼠标放到锚点上 触发画线函数 */
      var dragging = true
      self.net.on('mousedown', function(ev) {
        dragging = false
      })
      self.net.on('mouseup', ev => {
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
          })
        }
      })
      self.net.on('mouseleave', function(ev) {
        var shape = ev.shape
        if (shape && shape.hasClass('anchor-point') && dragging) {
          self.net.changeMode('edit')
        }
      })
      // 注册边
      window.G6.registEdge('relationLine', {
        draw: function(cfg, group) {
          const tableWidth = tablelist.get(cfg.model.source)
          var keyShape = ''
          var model = cfg.model
          const spacing = 32
          var source = self.net.find(model.source)
          var sourcePoints = source.getAnchorPoints()
          var target = self.net.find(model.target)
          var targetPoints = target.getAnchorPoints()
          if ((sourcePoints[1].x <= targetPoints[0].x && sourcePoints[1].x + 2 * spacing > targetPoints[0].x) ||
          (sourcePoints[1].x <= targetPoints[1].x && sourcePoints[1].x + 2 * spacing > targetPoints[1].x) ||
          (targetPoints[1].x <= sourcePoints[0].x && targetPoints[1].x + 2 * spacing > sourcePoints[0].x) ||
          (targetPoints[1].x <= sourcePoints[1].x && targetPoints[1].x + 2 * spacing > sourcePoints[1].x) ||
          (sourcePoints[0].x <= targetPoints[0].x && sourcePoints[0].x + tableWidth + 2 * spacing > targetPoints[0].x) ||
          (targetPoints[0].x <= sourcePoints[0].x && targetPoints[0].x + tableWidth + 2 * spacing > sourcePoints[0].x)
          ) {
            model.targetAnchor = 1
            model.sourceAnchor = 1
            keyShape = group.addShape('polyline', {
              attrs: {
                points: [
                  [sourcePoints[1].x, sourcePoints[1].y],
                  [sourcePoints[1].x > targetPoints[1].x ? (sourcePoints[1].x + spacing) : (targetPoints[1].x + spacing), sourcePoints[1].y],
                  [sourcePoints[1].x > targetPoints[1].x ? (sourcePoints[1].x + spacing) : (targetPoints[1].x + spacing), targetPoints[1].y],
                  [targetPoints[1].x, targetPoints[1].y]
                ],
                stroke: 'black',
                lineWidth: '2'
              }
            })
            group.addShape('image', {
              attrs: {
                x: sourcePoints[1].x > targetPoints[1].x ? sourcePoints[1].x : targetPoints[1].x,
                y: sourcePoints[1].y + (targetPoints[1].y - sourcePoints[1].y) / 2 - spacing,
                width: 2 * spacing,
                height: spacing,
                img: self.innerPic
              }
            })
          } else {
            var b = true
            sourcePoints[1].x + 4 * spacing >= targetPoints[0].x ? (model.targetAnchor = 0, model.sourceAnchor = 1, b = false) : ''
            targetPoints[1].x + 4 * spacing >= sourcePoints[0].x ? (model.targetAnchor = 1, model.sourceAnchor = 0, b = false) : ''
            if (b) {
              model.targetAnchor = null
              model.sourceAnchor = null
            }
            keyShape = group.addShape('polyline', {
              attrs: {
                points: [
                  [sourcePoints[0].x > targetPoints[1].x ? sourcePoints[0].x : sourcePoints[1].x, sourcePoints[0].y],
                  [sourcePoints[0].x > targetPoints[1].x ? (sourcePoints[0].x - spacing) : (sourcePoints[1].x + spacing), sourcePoints[0].y],
                  [sourcePoints[0].x > targetPoints[1].x ? (sourcePoints[0].x - spacing) : (sourcePoints[1].x + spacing), sourcePoints[0].y + (targetPoints[0].y - sourcePoints[0].y) / 2],
                  [sourcePoints[0].x > targetPoints[1].x ? (targetPoints[1].x + spacing) : (targetPoints[0].x - spacing), sourcePoints[0].y + (targetPoints[0].y - sourcePoints[0].y) / 2],
                  [sourcePoints[0].x > targetPoints[1].x ? (targetPoints[1].x + spacing) : (targetPoints[0].x - spacing), targetPoints[0].y],
                  [sourcePoints[0].x > targetPoints[1].x ? targetPoints[0].x : targetPoints[1].x, targetPoints[0].y]
                ],
                //   points: [
                //     [cfg.points[0].x, cfg.points[0].y],
                //     [cfg.points[0].x + (cfg.points[1].x - cfg.points[0].x) / 2, cfg.points[0].y],
                //     [cfg.points[0].x + (cfg.points[1].x - cfg.points[0].x) / 2, cfg.points[1].y],
                //     [cfg.points[1].x, cfg.points[1].y]
                //   ],
                stroke: 'black',
                lineWidth: '2'
              }
            })
            group.addShape('image', {
              attrs: {
                x: cfg.points[0].x + (cfg.points[1].x - cfg.points[0].x) / 2 - spacing,
                y: cfg.points[0].y + (cfg.points[1].y - cfg.points[0].y) / 2 - spacing / 2,
                width: 2 * spacing,
                height: spacing,
                img: self.innerPic
              }
            })
          }
          return keyShape
        }
      })
      // 节点创建
      window.G6.registerNode('table', {
        cssSize: true, // 不使用内部 size 作为节点尺寸
        getHtml: function(cfg, group) {
          const model = cfg.model
          const container = self.Util.createDOM('<div class="node" style="border: 1px solid black;border-radius::4px;"></div>')
          const title = self.Util.createDOM('<div style="padding:5px;text-align:center;background-color: #387dfd;">' + model.tableName + '</div>')
          const list = self.Util.createDOM('<div style="padding:5px 0;"></div>')
          self.Util.each(model.fields, function(field, i) {
            const div = self.Util.createDOM("<div style='margin-left:10px;height:25px;'><div>")
            var spanDom = document.createElement('span')
            spanDom.innerHTML = field.name
            spanDom.style.margin = '0 5px'
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
          const height = fields.length * 25 + 28
          points.push([0, 14 / height, { style: {
            fill: 'red',
            fillOpacity: 0.7
          }}])
          points.push([1, 14 / height, { style: {
            fill: 'red',
            fillOpacity: 0.7
          }}])
          return points
        },
        afterDraw: function(cfg, group) {
          tablelist.put(cfg.model.id, cfg.html.offsetWidth)
        }
      }, 'html')
      // self.net.render()

      this.net.source({ nodes: [{
        id: 123345454,
        x: 100,
        y: 100,
        shape: 'table',
        nodeType: 0,
        tableName: 'table',
        fields: [{ name: '员工id', id: 1001 }, { name: '年龄', id: 1003 }, { name: '性别', id: 1004 }, { name: '简历', id: 1005 }]
      }] })
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
    },
    mouseSite: function() {
      // 发现坐标改变,在新坐标处添加图形
      const id = 'node' + new Date().getTime()
      var e = this.shareObject.event
      this.net.get('eventAssist')._processEventObj(e)
      const ev = this.net.get('eventAssist').currentEventObj
      this.net.source({ nodes: [{
        id: id,
        x: ev.x,
        y: ev.y,
        shape: 'table',
        nodeType: 0,
        tableName: 'table',
        fields: [{ name: '员工id', id: 1001 }, { name: '年龄', id: 1003 }, { name: '性别', id: 1004 }, { name: '简历', id: 1005 }]
      }] })
      this.net.render()
      // 右侧列表添加
      this.$set(this.nodeList, { 'id': id })
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  // div.g6-html-node-container{
  //   border:0 solid #fff !important;
  // }
</style>