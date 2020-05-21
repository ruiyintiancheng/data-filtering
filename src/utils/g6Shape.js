export function registG6Shape() {
  window.G6.registerNode('processRect', {
    draw: function(cfg, group) {
      var model = cfg.model
      var color = model.color
      var keyShape
      keyShape = group.addShape('rect', {
        attrs: {
          x: cfg.x - 75,
          y: cfg.y - 30,
          width: 150,
          height: 60,
          fill: 'white',
          radius: 15,
          stroke: '#999'
        }
      })
      group.addShape('rect', {
        attrs: {
          x: cfg.x - 75,
          y: cfg.y - 30,
          width: 150,
          height: 40,
          fill: color,
          clip: keyShape
        }
      })
      group.addShape('text', { // 标题
        attrs: {
          x: cfg.x,
          y: cfg.y + 2,
          text: cfg.model.title,
          textBaseline: 'bottom',
          textAlign: 'center',
          fontSize: 20,
          fill: 'white'
        }
      })
      group.addShape('text', { // 副标题
        attrs: {
          x: cfg.x,
          y: cfg.y + 10,
          text: cfg.model.subtitle,
          textBaseline: 'top',
          textAlign: 'center',
          fontSize: 12,
          fill: 'black'
        }
      })
      return keyShape
    },
    getAnchorPoints: function() { // 锚点位置
      return [
        [0.5, 1],
        [1, 0.5],
        [0, 0.5],
        [0.5, 0]
      ]
    }
  })
  window.G6.registerNode('startRect', {
    draw: function(cfg, group) {
      var keyShape
      keyShape = group.addShape('rect', {
        attrs: {
          x: cfg.x - 75,
          y: cfg.y - 30,
          width: 150,
          height: 60,
          fill: cfg.model.color,
          radius: 15
        }
      })
      group.addShape('text', { // 标题
        attrs: {
          x: cfg.x,
          y: cfg.y - 20,
          text: cfg.model.title,
          textBaseline: 'top',
          textAlign: 'center',
          fontSize: 25,
          fill: 'white'
        }
      })
      return keyShape
    },
    getAnchorPoints: function() { // 锚点位置
      return [
        [0.5, 1],
        [0.5, 0]
      ]
    }
  })
}

