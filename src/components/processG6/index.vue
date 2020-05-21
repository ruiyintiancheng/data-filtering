<template>
    <div id="flowChart">
        <div class="operating" :style="{display:operaterShow}">
            <div class="btn-group" id="divId">
                <div class="btn node" @click="insertShape('rect')" title="起始节点">
                    <svg-icon icon-class="fangxing" />
                </div>
                <div class="btn node" @click="insertShape('processRect')" title="流程节点">
                    <svg-icon icon-class="fangxing" />
                </div>
            </div>
            <div class="btn-group">
                <div class="btn actived line" @click="draw('arrow')" title="箭头直线">
                    <svg-icon icon-class="zhixianjiantou" />
                </div>
                <div class="btn line"  @click="draw('polyLineFlow')" title="箭头折现">
                    <svg-icon icon-class="zhexian" />
                </div>
            </div>
            <div class="btn-group">
                <div class="btn mode actived" @click="changeMode('edit')" title="选择模式">
                <svg-icon icon-class="mouse" />
                </div>
                <div class="btn mode" @click="changeMode('drag')" title="拖拽模式">
                <svg-icon icon-class="cross" />
                </div>
            </div>
            <div class="btn-group">
                <div class="btn delete" @click="del" style="margin-top: 5px;" title="删除">
                <svg-icon icon-class="delete" />
                </div>
                <div class="btn save" @click="save" title="保存">

                    <svg-icon icon-class="save" />
                </div>
            </div>
            <div style="height:20px"></div>
            <div class="btn-group">
                <el-input size="mini" v-model="workflowName" placeholder="请输入流图名称..."></el-input>
            </div>
        </div>
        <div class="operating" @click="hiddenOperaterMenu()" ref="hiddenDiv" style="margin-left:0;width:20px;line-height: 200px;cursor:pointer;">
            <div style="margin-left:-10px;">
                {{btn}}
            </div>
        </div>
        <div class="info">
            <div class="title">
                <span>{{infoTitle}}属性</span>
            </div>
            <div class="content">
                <el-checkbox v-if="isBlank === true" v-model="checked">网格对齐</el-checkbox>
                <el-form v-else label-position="left" label-width="80px">
                <el-form-item v-if="isNode === true" label="名称">
                    <el-input size="mini" v-model="name"></el-input>
                </el-form-item>
                <el-form-item v-if="isEdge === true" label="行为名称">
                    <el-input size="mini" v-model="behavior"></el-input>
                </el-form-item>
                <el-form-item label="颜色" v-if="isEdge === true">
                    <el-color-picker v-model="color"></el-color-picker>
                </el-form-item>
                </el-form>
            </div>
        </div>
     <el-dialog v-el-drag-dialog title="编辑" @close="cancelOperate()" :visible.sync="formVisible" width="50%" custom-class="dialog-default">
        <el-form ref="updateFrom" style="padding:30px" label-position="left" label-width="120px">
            <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="任务名称:">
                    <el-input ref="currentFocus" size="mini" v-model="title"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="任务分类：">
                    <el-select v-model="taskType" placeholder="请选择">
                      <el-option v-for="item in taskTypeOptions" :key="item.value" :label="item.label" :value="item.value">
                      </el-option>
                   </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="任务描述:">
                    <el-input size="mini" v-model="subtitle"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="serverID：">
                    <el-input size="mini" v-model="serverID"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
             <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="加载方式:">
                    <el-input size="mini" v-model="serverID"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="时间粒度：">
                    <el-input size="mini" v-model="serverID"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
               <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="是否有效:">
                    <el-input size="mini" v-model="serverID"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="是否有子任务：">
                    <el-input size="mini" v-model="serverID"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
               <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="参数1:">
                    <el-input size="mini" v-model="serverID"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="子任务加载：">
                    <el-input size="mini" v-model="serverID"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="参数2:">
                    <el-input size="mini" v-model="serverID"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="前置任务:">
                    <el-input size="mini" v-model="serverID"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="formVisible = false">取消</el-button>
            <el-button type="primary" @click="saveOperate()">保存</el-button>
        </div>
      </el-dialog>
  </div>
</template>
<script>
var currentEdge = 'arrow' // 箭头直线
import elDragDialog from '@/directive/el-dragDialog'
export default {
  currentFun: '',
  directives: { elDragDialog },
  name: 'processG6Index',
  mounted() {
    this.initG6()
    const btns = document.querySelectorAll('.btn-group .btn')
    btns.forEach((val, index) => {
      const btn = val.classList
      val.addEventListener('click', function() {
        // btns.forEach((value, index) => { value.classList.remove('actived') })
        if (!btn.contains('delete') && !btn.contains('save')) {
          if (btn.contains('line')) {
            const lines = document.querySelectorAll('.btn.line')
            lines.forEach((value, index) => { value.classList.remove('actived') })
          } else if (btn.contains('mode')) {
            const modes = document.querySelectorAll('.btn.mode')
            modes.forEach((value, index) => { value.classList.remove('actived') })
          } else if (btn.contains('node')) {
            const nodes = document.querySelectorAll('.btn.node')
            nodes.forEach((value, index) => { value.classList.remove('actived') })
          }
          btn.add('actived')
        }
      }, false)
    })
  },
  props: {
  },
  data() {
    return {
      sourceData: {},
      name: '',
      behavior: '', // 线行为名称
      title: '',
      subtitle: '',
      color: '',
      formVisible: false,
      net: '',
      Util: '',
      workflowName: '',
      activation: '', // 当前激活的节点
      isNode: false, // 当前是节点
      isEdge: false,
      isBlank: true, // 当前是空白区
      checked: true, // 网格对齐
      gridChange: false, // 网格对其按钮发生改变
      infoTitle: '画布', // 属性标题
      oldColor: '', // 获取节点本身颜色
      type: '', // 有值为编辑状态
      isAdd: false,
      missionName: '',
      serverID: '',
      taskTypeOptions: [{ label: '归档系统', value: '归档系统' }, { label: 'EAST系统', value: 'EAST系统' }, { label: '应用分心', value: '应用分心' }],
      taskType: '',
      operaterShow: 'none',
      btn: '》'
    }
  },
  methods: {
    initG6() {
      const self = this
      self.Util = window.G6.Util
      let grid
      if (self.checked) {
        grid = {
          forceAlign: true, // 是否支持网格对齐
          cell: 25 // 网格大小
        }
      } else {
        grid = null
      }
      self.net = new window.G6.Net({
        id: 'flowChart', // 容器ID
        mode: 'edit',
        grid: grid,
        /* width: 500,    // 画布宽*/
        height: 800 // 画布高
      })
      /** 点击节点*/
      self.net.on('itemclick', function(ev) {
        self.isNode = self.Util.isNode(ev.item) // 是否为Node
        self.activation = ev.item
        if (self.isNode) {
          self.name = ev.item._attrs.model.title
          /* 激活节点后节点名称input聚焦*/
          self.$nextTick(() => {
            self.$refs.inputFocus.$el.querySelector('input').focus()
          })
          self.infoTitle = '节点'
          self.isEdge = false
        } else {
          self.isEdge = true
          self.infoTitle = '边'
        }
        self.color = self.oldColor
      })
      self.net.on('click', (ev) => {
        if (!self.Util.isNull(ev.item)) {
          self.isBlank = false
        } else {
          self.isEdge = false
          self.isBlank = true
          self.infoTitle = '画布'
        }
      })
      // 双击事件
      self.net.on('dblclick', (ev) => {
        if (self.Util.isNode(ev.item)) {
          self.formVisible = true
          self.$nextTick(() => {
            self.$refs.currentFocus.focus()
          })
          self.activation = ev.item
          self.title = ev.item._attrs.model.label
          self.ftitle = ev.item._attrs.model.ftitle
        }
      })
      /**
       * 鼠标移入移出事件改变颜色
       */
      self.net.on('itemmouseenter', ev => {
        const item = ev.item
        self.oldColor = item.get('model').color // 获取节点颜色
        self.net.update(item, {
          color: '#108EE9'
        })
        self.net.refresh()
      })
      self.net.on('itemmouseleave', ev => { // 子项鼠标离开事件
        const item = ev.item
        self.net.update(item, {
          color: self.oldColor
        })
        self.net.refresh()
      })
      /**
       * 鼠标放到锚点上 触发画线函数 */
      var dragging = true
      self.net.on('mousedown', function(ev) {
        dragging = false
      })
      self.net.on('mouseup', ev => {
        dragging = true
      })
      self.net.on('mouseenter', function(ev) {
        var shape = ev.shape
        if (shape && shape.hasClass('anchor-point') && dragging) {
          self.net.beginAdd('edge', {
            shape: currentEdge
          })
        }
      })
      self.net.on('mouseleave', function(ev) {
        var shape = ev.shape
        if (shape && shape.hasClass('anchor-point') && dragging) {
          self.net.changeMode('edit')
        }
      })
      /** 图形添加时 监听事件 */
      self.net.on('itemadd', (ev) => {
        if (!this.gridChange) {
          self.isNode = self.Util.isNode(ev.item)
          if (self.isNode) {
            self.isAdd = true
            self.activation = ev.item
            self.title = ''
            self.subtitle = ''
            self.formVisible = true
            self.$nextTick(() => {
              self.$refs.currentFocus.focus()
            })
          }
        }
      })
      // 流程方形 节点创建
      window.G6.registerNode('processRect', {
        cssSize: true, // 不使用内部 size 作为节点尺寸
        getHtml: function(cfg) {
          const model = cfg.model
          const container = self.Util.createDOM('<div style="min-width:100px;padding:2px;height:100%;text-align:center;background:' + model.color + ';border:0 solid #fff;border-radius:5px;overflow:hidden;"></div>')
          const title = self.Util.createDOM('<div style="padding:1px;height:50%;color:#fff;font-size:100%">' + model.title + '</div>')
          container.appendChild(title)
          const list = self.Util.createDOM('<div class="" style="padding:5px;background: #fff;height:50%"><span></span><span><a src="www.baidu.com" style="z-index:100">' + model.subtitle + '</a></span></div>')
          container.appendChild(list)
          return container
        },
        getAnchorPoints: function() { // 锚点位置
          return [
            [0.5, 1],
            [1, 0.5],
            [0, 0.5],
            [0.5, 0]
          ]
        }
      }, 'html')
      self.net.render()
    },
    insertShape(shape) {
      this.net.beginAdd('node', {
        shape: shape,
        color: '#228ACC'
      })
    },
    saveOperate() { // 保存新增 信息
      if (this.isAdd) {
        if (this.title.length !== 0) {
          this.isAdd = false
        }
      } else {
        if (this.title.length === 0) {
          this.$message({ type: 'error', message: '任务名称不能为空' })
          return false
        }
      }
      this.formVisible = false
      this.net.update(this.activation, {
        title: this.title,
        subtitle: this.subtitle
      })
    },
    cancelOperate() { // 取消保存
      if (this.isAdd) {
        this.isAdd = false
        this.openCheck = false
        // 移除 当前节点
        this.net.remove(this.activation)
      }
      const nodes = document.querySelectorAll('.btn.node')
      nodes.forEach((value, index) => { value.classList.remove('actived') })
    },
    draw(operate) {
      currentEdge = operate
    },
    changeMode(mode) { // 拖拽与编辑模式的切换
      this.net.changeMode(mode)
    },
    del() { // 删除
      this.net.del()
    },
    save() { // 保存
      /* 验证流图名称*/
      if (this.workflowName !== '') {
        const data = this.net.save()
        if (data.source.nodes.length === 0) {
          this.$message({ type: 'error', message: '流图内容不能为空' })
          return false
        }
        /* 验证节点名称*/
        for (const item of data.source.nodes) {
          if (item.title === '' || item.title === null || item.title === undefined) {
            this.$message({ type: 'error', message: '节点名称不能为空' })
            return false
          }
        }
        data.source['name'] = this.workflowName
        /* let json = JSON.stringify(data, null, 2);*/
        console.log(JSON.stringify(data, null, 2))
        // this.$emit('saveData', data.source, this.type)
      } else {
        this.$message({ type: 'error', message: '流图名称不能为空' })
      }
      /* console.log(saveData, json);*/
    },
    hiddenOperaterMenu() { // 隐藏操作菜单
      if (this.operaterShow === 'none') {
        this.operaterShow = 'block'
        this.btn = '《'
        this.$refs.hiddenDiv.style.marginLeft = '200px'
      } else {
        this.operaterShow = 'none'
        this.btn = '》'
        this.$refs.hiddenDiv.style.marginLeft = '0'
      }
    },
    update() { // 更新节点
      if (this.activation.get('type') === 'node') {
        this.net.update(this.activation, {
          title: this.name,
          color: this.color
        })
      } else if (this.activation.get('type') === 'edge') {
        this.net.update(this.activation, {
          label: this.behavior,
          color: this.color
        })
      }
    }
  },
  watch: {
    /**
       * 监听输入框
       */
    name: function() {
      this.update()
    },
    behavior: function() {
      this.update()
    },
    color: function() {
      this.update()
    },
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
      console.log('改变了')
      console.log(this.sourceData)
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
  div.g6-html-node-container{
    border:0 solid #fff !important;
  }
</style>