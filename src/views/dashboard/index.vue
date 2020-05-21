/*
 * @Author: lk 
 * @Date: 2018-11-21 14:55:40 
 * @Last Modified by: lk
 * @Last Modified time: 2019-03-13 12:47:31
 * @Description:  首页
 */
<template>
  <div class="dashboard-container">
    <el-row :gutter="15">
      <el-col :sm="12" :lg="6">
        <div class="dashboard-card">
          <div class="dashboard-card-title">报送情况</div>
          <div class="dashboard-card-context">
            <p>报送版本：2018-10-31</p>
            <p>报送模式：持续采集</p>
            <p>字段填报率：74%</p>
          </div>
        </div>
      </el-col>
      <el-col :sm="12" :lg="6">
        <div class="dashboard-card">
          <div class="dashboard-card-title" @click="resizeChart()">报送情况</div>
          <div class="dashboard-card-context">
             <custom-echarts ref="baosongqingkuangChart"  propsHeight="170px" id="baosongqingkuang" :option="baosongqingkuang"></custom-echarts>
          </div>
        </div>
      </el-col>
      <el-col :sm="12" :lg="6">
        <div class="dashboard-card">
          <div class="dashboard-card-title">字段报送统计</div>
          <div class="dashboard-card-context">
             <custom-echarts ref="ziduanbaosongtongjiChart" propsHeight="170px" id="ziduanbaosongtongji" :option="ziduanbaosongtongji"></custom-echarts>
          </div>
        </div>
      </el-col>
      <el-col :sm="12" :lg="6">
        <div class="dashboard-card">
          <div class="dashboard-card-title">问题统计</div>
          <div class="dashboard-card-context">
             <custom-echarts ref="wentitongjiChart" propsHeight="170px" id="wentitongji" :option="wentitongji"></custom-echarts>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="15">
      <el-col :span="18">
        <div class="dashboard-status">
          <custom-echarts ref="dituChart" propsHeight="500px" id="ditu" :option="ditu"></custom-echarts>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="dashboard-status dashboard-messages">
          <div class="dashboard-panel">
            <h3 class="dashboard-panel-title">
              工作通知
            </h3>
            <div class="dashboard-panel-context">
              <a href="javascript:;" v-for="(item,index) in noticeList" :key="index" @click="openDetail(item,1)"><svg-icon class="svgI" icon-class="icon" /> {{item.title}}</a>
            </div>
          </div>
          <div class="dashboard-panel">
            <h3 class="dashboard-panel-title">
              待办事项
            </h3>
            <div class="dashboard-panel-context">
              <a href="javascript:;" v-for="(item,index) in matterList" :key="index" @click="openDetail(item,2)"><svg-icon class="svgI" icon-class="clock" /> {{item.title}}</a>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <div class="dashboard-chart">
      <custom-echarts ref="lineBarChart" propsHeight="400px" id="lineBar" :option="lineBar"></custom-echarts>
    </div>
    <notice ref='notice'></notice>
    <matter ref='matter'></matter>
  </div>
</template>

<script>
import 'echarts/map/js/china.js'
import CustomEcharts from '@/components/Charts/CustomEcharts'
import Notice from './components/Notice'
import Matter from './components/Matter'
export default {
  name: 'dashboard',
  components: {
    CustomEcharts,
    Notice,
    Matter
  },
  data() {
    return {
      baosongqingkuang: {}, // 报送情况
      ziduanbaosongtongji: {}, // 字段报送统计
      wentitongji: {}, // 问题统计
      ditu: {}, // 地图
      mapData: {}, // 地图数据
      lineBar: {}, // 折线柱状图
      noticeList: [
        {
          'title': '2018年9月份银监会上报数据',
          'id': '1'
        },
        {
          'title': '2018年8月份银监会上报数据',
          'id': '2'
        },
        {
          'title': '2018年7月份银监会上报数据',
          'id': '3'
        }
      ],
      matterList: [
        {
          'title': '厦门分行接口人变更',
          'id': '1'
        },
        {
          'title': '深圳分行数据导入失败',
          'id': '2'
        },
        {
          'title': '四川分行机构地址错误',
          'id': '3'
        }
      ]
    }
  },
  mounted() {
    this.getOption()
  },
  activated() {
    this.resizeChart()
  },
  methods: {
    resizeChart() {
      for (const key in this.$refs) {
        if (key.endsWith('Chart')) {
          this.$refs[key].chart.resize()
        }
      }
    },
    getOption() {
      this.baosongqingkuang = {
        tooltip: {
          show: true,
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        // title: {
        //   text: '2018-10-31',
        //   x: 'center',
        //   textStyle: {
        //     fontSize: 13,
        //     fontStyle: 'normal',
        //     fontWeight: 'normal',
        //     color: '#666'
        //   }
        // },
        legend: {
          orient: 'vertical',
          x: 'right',
          icon: 'circle',
          data: [{
            name: '报送表',
            icon: 'roundRect'
          }, '有数据', '无数据(无变化)', {
            name: '未报送表',
            icon: 'roundRect'
          }, '未开展业务', '待持续建设']
        },
        calculable: false,
        series: [
          {
            name: '报送情况',
            type: 'pie',
            center: ['25%', '50%'],
            radius: '50%',
            // color: ['#C23531', '#2F4554'],
            itemStyle: {
              normal: {
                label: {
                  position: 'inner',
                  formatter: function(params) {
                    return params.value
                  }
                },
                labelLine: {
                  show: false
                }
              },
              emphasis: {
                label: {
                  show: true,
                  formatter: '{b}\n{d}%'
                }
              }
            },
            data: [
              { value: 42, name: '报送表' },
              { value: 16, name: '未报送表' }
            ]
          },
          {
            name: '报送情况',
            type: 'pie',
            center: ['25%', '50%'],
            radius: ['60%', '80%'],
            // color: ['#61A0A8', '#D48265', '#91C7AE', '#749F83', '#CA8622'],
            itemStyle: {
              normal: {
                label: {
                  position: 'inner',
                  formatter: function(params) {
                    return params.value
                  }
                },
                labelLine: {
                  show: false
                }
              }
            },
            data: [
              { value: 32, name: '有数据' },
              { value: 10, name: '无数据(无变化)' },
              { value: 14, name: '未开展业务' },
              { value: 2, name: '待持续建设' }
            ]
          }
        ]
      }
      this.ziduanbaosongtongji = {
        tooltip: {
          show: true,
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        // title: {
        //   text: '2018-10-31',
        //   x: 'center',
        //   textStyle: {
        //     fontSize: 13,
        //     fontStyle: 'normal',
        //     fontWeight: 'normal',
        //     color: '#666'
        //   }
        // },
        legend: {
          orient: 'vertical',
          x: 'right',
          icon: 'circle',
          data: [{
            name: '报送字段',
            icon: 'roundRect'
          }, '无空值字段', '部分空字段', '全空字段', {
            name: '未报字段',
            icon: 'roundRect'
          }, '无此业务字段', '待建设字段']
        },
        calculable: false,
        series: [
          {
            name: '字段报送统计',
            type: 'pie',
            center: ['25%', '50%'],
            radius: '50%',
            // color: ['#C23531', '#2F4554'],
            itemStyle: {
              normal: {
                label: {
                  position: 'inner',
                  formatter: function(params) {
                    return params.value
                  }
                },
                labelLine: {
                  show: false
                }
              },
              emphasis: {
                label: {
                  show: true,
                  formatter: '{b}\n{d}%'
                }
              }
            },
            data: [
              { value: 1210, name: '报送字段' },
              { value: 305, name: '未报字段' }
            ]
          },
          {
            name: '字段报送统计',
            type: 'pie',
            center: ['25%', '50%'],
            radius: ['60%', '80%'],
            // color: ['#61A0A8', '#D48265', '#91C7AE', '#749F83', '#CA8622'],
            itemStyle: {
              normal: {
                label: {
                  position: 'inner',
                  formatter: function(params) {
                    return params.value
                  }
                },
                labelLine: {
                  show: false
                }
              }
            },
            data: [
              { value: 800, name: '无空值字段' },
              { value: 290, name: '部分空字段' },
              { value: 120, name: '全空字段' },
              { value: 45, name: '待建设字段' },
              { value: 260, name: '无此业务字段' }
            ]
          }
        ]
      }
      this.wentitongji = {
        tooltip: {
          show: true,
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        // title: {
        //   text: '2018-10-31',
        //   x: 'center',
        //   textStyle: {
        //     fontSize: 13,
        //     fontStyle: 'normal',
        //     fontWeight: 'normal',
        //     color: '#666'
        //   }
        // },
        legend: {
          orient: 'vertical',
          x: 'right',
          icon: 'circle',
          data: [{
            name: '问题总计',
            icon: 'roundRect'
          }, '业务问题', '数据质量问题', '转码问题', '数据格式问题', '接送问题', '系统使用问题']
        },
        calculable: false,
        series: [
          {
            name: '问题统计',
            type: 'pie',
            center: ['25%', '50%'],
            radius: '50%',
            // color: ['#C23531'],
            itemStyle: {
              normal: {
                label: {
                  position: 'inner',
                  formatter: function(params) {
                    return params.value
                  }
                },
                labelLine: {
                  show: false
                }
              },
              emphasis: {
                label: {
                  show: true,
                  formatter: '{b}\n{d}%'
                }
              }
            },
            data: [
              { value: 55, name: '问题总计' }
            ]
          },
          {
            name: '问题统计',
            type: 'pie',
            center: ['25%', '50%'],
            radius: ['60%', '80%'],
            // color: ['#2F4554', '#61A0A8', '#D48265', '#91C7AE', '#749F83', '#CA8622'],
            itemStyle: {
              normal: {
                label: {
                  position: 'inner',
                  formatter: function(params) {
                    return params.value
                  }
                },
                labelLine: {
                  show: false
                }
              }
            },
            data: [
              { value: 20, name: '业务问题' },
              { value: 5, name: '数据质量问题' },
              { value: 8, name: '转码问题' },
              { value: 4, name: '数据格式问题' },
              { value: 6, name: '接送问题' },
              { value: 12, name: '系统使用问题' }
            ]
          }
        ]
      }
      this.mapData = {
        '海门': [121.15, 31.89],
        '鄂尔多斯': [109.781327, 39.608266],
        '招远': [120.38, 37.35],
        '舟山': [122.207216, 29.985295],
        '齐齐哈尔': [123.97, 47.33],
        '盐城': [120.13, 33.38],
        '赤峰': [118.87, 42.28],
        '青岛': [120.33, 36.07],
        '乳山': [121.52, 36.89],
        '金昌': [102.188043, 38.520089],
        '泉州': [118.58, 24.93],
        '莱西': [120.53, 36.86],
        '日照': [119.46, 35.42],
        '胶南': [119.97, 35.88],
        '南通': [121.05, 32.08],
        '西藏': [91.11, 29.97],
        '云浮': [112.02, 22.93],
        '梅州': [116.1, 24.55],
        '文登': [122.05, 37.2],
        '上海': [121.48, 31.22],
        '攀枝花': [101.718637, 26.582347],
        '威海': [122.1, 37.5],
        '承德': [117.93, 40.97],
        '厦门': [118.1, 24.46],
        '汕尾': [115.375279, 22.786211],
        '潮州': [116.63, 23.68],
        '丹东': [124.37, 40.13],
        '太仓': [121.1, 31.45],
        '曲靖': [103.79, 25.51],
        '烟台': [121.39, 37.52],
        '福建': [119.3, 26.08],
        '瓦房店': [121.979603, 39.627114],
        '即墨': [120.45, 36.38],
        '抚顺': [123.97, 41.97],
        '玉溪': [102.52, 24.35],
        '张家口': [114.87, 40.82],
        '阳泉': [113.57, 37.85],
        '莱州': [119.942327, 37.177017],
        '湖州': [120.1, 30.86],
        '汕头': [116.69, 23.39],
        '昆山': [120.95, 31.39],
        '宁波': [121.56, 29.86],
        '湛江': [110.359377, 21.270708],
        '揭阳': [116.35, 23.55],
        '荣成': [122.41, 37.16],
        '连云港': [119.16, 34.59],
        '葫芦岛': [120.836932, 40.711052],
        '常熟': [120.74, 31.64],
        '东莞': [113.75, 23.04],
        '河源': [114.68, 23.73],
        '淮安': [119.15, 33.5],
        '泰州': [119.9, 32.49],
        '广西': [108.33, 22.84],
        '营口': [122.18, 40.65],
        '惠州': [114.4, 23.09],
        '江阴': [120.26, 31.91],
        '蓬莱': [120.75, 37.8],
        '韶关': [113.62, 24.84],
        '嘉峪关': [98.289152, 39.77313],
        '广东': [113.23, 23.16],
        '延安': [109.47, 36.6],
        '山西': [112.53, 37.87],
        '清远': [113.01, 23.7],
        '中山': [113.38, 22.52],
        '云南': [102.73, 25.04],
        '寿光': [118.73, 36.86],
        '盘锦': [122.070714, 41.119997],
        '长治': [113.08, 36.18],
        '深圳': [114.07, 22.62],
        '珠海': [113.52, 22.3],
        '宿迁': [118.3, 33.96],
        '咸阳': [108.72, 34.36],
        '铜川': [109.11, 35.09],
        '平度': [119.97, 36.77],
        '佛山': [113.11, 23.05],
        '海南': [110.35, 20.02],
        '江门': [113.06, 22.61],
        '章丘': [117.53, 36.72],
        '肇庆': [112.44, 23.05],
        '大连': [121.62, 38.92],
        '临汾': [111.5, 36.08],
        '吴江': [120.63, 31.16],
        '石嘴山': [106.39, 39.04],
        '辽宁': [123.38, 41.8],
        '苏州': [120.62, 31.32],
        '茂名': [110.88, 21.68],
        '嘉兴': [120.76, 30.77],
        '长春': [125.35, 43.88],
        '胶州': [120.03336, 36.264622],
        '宁夏': [106.27, 38.47],
        '张家港': [120.555821, 31.875428],
        '三门峡': [111.19, 34.76],
        '锦州': [121.15, 41.13],
        '江西': [115.89, 28.68],
        '柳州': [109.4, 24.33],
        '三亚': [109.511909, 18.252847],
        '自贡': [104.778442, 29.33903],
        '吉林': [126.57, 43.87],
        '阳江': [111.95, 21.85],
        '泸州': [105.39, 28.91],
        '青海': [101.74, 36.56],
        '宜宾': [104.56, 29.77],
        '呼和浩特': [111.65, 40.82],
        '四川': [104.06, 30.67],
        '大同': [113.3, 40.12],
        '镇江': [119.44, 32.2],
        '桂林': [110.28, 25.29],
        '张家界': [110.479191, 29.117096],
        '宜兴': [119.82, 31.36],
        '北海': [109.12, 21.49],
        '陕西': [108.95, 34.27],
        '金坛': [119.56, 31.74],
        '东营': [118.49, 37.46],
        '牡丹江': [129.58, 44.6],
        '遵义': [106.9, 27.7],
        '绍兴': [120.58, 30.01],
        '扬州': [119.42, 32.39],
        '常州': [119.95, 31.79],
        '潍坊': [119.1, 36.62],
        '重庆': [106.54, 29.59],
        '台州': [121.420757, 28.656386],
        '江苏': [118.78, 32.04],
        '滨州': [118.03, 37.36],
        '贵州': [106.71, 26.57],
        '无锡': [120.29, 31.59],
        '本溪': [123.73, 41.3],
        '克拉玛依': [84.77, 45.59],
        '渭南': [109.5, 34.52],
        '马鞍山': [118.48, 31.56],
        '宝鸡': [107.15, 34.38],
        '焦作': [113.21, 35.24],
        '句容': [119.16, 31.95],
        '北京': [116.46, 39.92],
        '徐州': [117.2, 34.26],
        '衡水': [115.72, 37.72],
        '内蒙古': [110, 40.58],
        '绵阳': [104.73, 31.48],
        '新疆': [87.68, 43.77],
        '枣庄': [117.57, 34.86],
        '浙江': [120.19, 30.26],
        '淄博': [118.05, 36.78],
        '鞍山': [122.85, 41.12],
        '溧阳': [119.48, 31.43],
        '库尔勒': [86.06, 41.68],
        '安阳': [114.35, 36.1],
        '开封': [114.35, 34.79],
        '山东': [117, 36.65],
        '德阳': [104.37, 31.13],
        '温州': [120.65, 28.01],
        '九江': [115.97, 29.71],
        '邯郸': [114.47, 36.6],
        '临安': [119.72, 30.23],
        '甘肃': [103.73, 36.03],
        '沧州': [116.83, 38.33],
        '临沂': [118.35, 35.05],
        '南充': [106.110698, 30.837793],
        '天津': [117.2, 39.13],
        '富阳': [119.95, 30.07],
        '泰安': [117.13, 36.18],
        '诸暨': [120.23, 29.71],
        '河南': [113.65, 34.76],
        '黑龙江': [126.63, 45.75],
        '聊城': [115.97, 36.45],
        '芜湖': [118.38, 31.33],
        '唐山': [118.02, 39.63],
        '平顶山': [113.29, 33.75],
        '邢台': [114.48, 37.05],
        '德州': [116.29, 37.45],
        '济宁': [116.59, 35.38],
        '荆州': [112.239741, 30.335165],
        '宜昌': [111.3, 30.7],
        '义乌': [120.06, 29.32],
        '丽水': [119.92, 28.45],
        '洛阳': [112.44, 34.7],
        '秦皇岛': [119.57, 39.95],
        '株洲': [113.16, 27.83],
        '河北': [114.48, 38.03],
        '莱芜': [117.67, 36.19],
        '常德': [111.69, 29.05],
        '保定': [115.48, 38.85],
        '湘潭': [112.91, 27.87],
        '金华': [119.64, 29.12],
        '岳阳': [113.09, 29.37],
        '湖南': [113, 28.21],
        '衢州': [118.88, 28.97],
        '廊坊': [116.7, 39.53],
        '菏泽': [115.480656, 35.23375],
        '安徽': [117.27, 31.86],
        '湖北': [114.31, 30.52],
        '大庆': [125.03, 46.58]
      }
      this.ditu = {
        title: {
          y: 10,
          text: '**银行EAST报送状况',
          // subtext: '2018-11-30  持续采集\n增量表33张、变化量20张、全量表2张',
          left: 'center',
          textStyle: {
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}'
        },
        visualMap: {
          type: 'piecewise',
          min: 0,
          max: 1,
          splitNumber: 2,
          left: 'left',
          top: 'bottom',
          text: ['已报送', '未报送'], // 文本，默认为数值文本
          inRange: {
            color: ['#0f608f', '#42B983'] // '#779ef6'   ,'#94b2f6'
          },
          calculable: true
        },
        toolbox: {
          show: true,
          orient: 'vertical',
          left: 'right',
          top: 'center',
          feature: {
            mark: { show: true },
            dataView: {
              show: true,
              readOnly: false,
              optionToContent: function(opt) {
                console.log(opt)
                var series = opt.series[0].data
                var table = '<table style="width:100%;text-align:center"><tbody>'
                for (var i = 0, l = series.length; i < l; i++) {
                  table += '<tr>' +
                            '<td>' + series[i]['name'] + '</td>' +
                            '<td>' + series[i]['value'][0] + '</td>' +
                            '<td>' + series[i]['value'][1] + '</td>' +
                            '<td>' + series[i]['value'][2] + '</td>' +
                            '</tr>'
                }
                table += '</tbody></table>'
                return table
              }
            },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        geo: {
          map: 'china',
          zoom: 1.2,
          label: {
            emphasis: {
              show: false
            }
          },
          itemStyle: {
            normal: {
              areaColor: '#d1d7fc', // '#dde8e9',//'#323c48',
              borderColor: '#111'
            },
            emphasis: {
              areaColor: '#acd7dd'
            }
          }
        },
        series: [
          {
            name: '20181031报送情况',
            type: 'scatter',
            coordinateSystem: 'geo',
            data: this.convertData([
              { name: '北京', value: '1' },
              { name: '天津', value: '1' },
              { name: '河北', value: '1' },
              { name: '山西', value: '1' },
              { name: '内蒙古', value: '1' },
              { name: '辽宁', value: '0' },
              { name: '大连', value: '1' },
              { name: '吉林', value: '1' },
              { name: '黑龙江', value: '0' },
              { name: '上海', value: '1' },
              { name: '江苏', value: '0' },
              { name: '苏州', value: '1' },
              { name: '宁波', value: '1' },
              { name: '浙江', value: '0' },
              { name: '安徽', value: '0' },
              { name: '福建', value: '1' },
              { name: '厦门', value: '1' },
              { name: '江西', value: '0' },
              { name: '山东', value: '0' },
              { name: '青岛', value: '0' },
              { name: '河南', value: '0' },
              { name: '湖北', value: '1' },
              { name: '湖南', value: '0' },
              { name: '广东', value: '1' },
              { name: '深圳', value: '0' },
              { name: '广西', value: '1' },
              { name: '海南', value: '1' },
              { name: '重庆', value: '1' },
              { name: '四川', value: '1' },
              { name: '贵州', value: '1' },
              { name: '云南', value: '0' },
              { name: '西藏', value: '1' },
              { name: '陕西', value: '1' },
              { name: '甘肃', value: '1' },
              { name: '青海', value: '1' },
              { name: '宁夏', value: '1' },
              { name: '新疆', value: '0' }
            ]),
            symbolSize: 12,
            label: {
              normal: {
                show: false
              },
              emphasis: {
                show: false
              }
            },
            itemStyle: {
              emphasis: {
                borderColor: '#fff',
                borderWidth: 1
              }
            }
          }
        ]
      }
      this.lineBar = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        toolbox: {
          feature: {
            dataView: {
              show: true,
              readOnly: false,
              optionToContent: function(opt) {
                var axisData = opt.xAxis[0].data
                var series = opt.series
                var table = '<table style="width:100%;text-align:center"><tbody><tr>' +
                                 '<td>地理位置</td>' +
                                 '<td>' + series[0].name + '</td>' +
                                 '<td>' + series[1].name + '</td>' +
                                 '</tr>'
                for (var i = 0, l = axisData.length; i < l; i++) {
                  table += '<tr>' +
                                 '<td>' + axisData[i] + '</td>' +
                                 '<td>' + series[0].data[i] + '</td>' +
                                 '<td>' + series[1].data[i] + '</td>' +
                                 '</tr>'
                }
                table += '</tbody></table>'
                return table
              }
            },
            magicType: { show: true, type: ['line', 'bar'] },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        legend: {
          data: ['问题数', '填报率'],
          y: 10
        },
        // color: ['#2F4554', '#C23531'],
        xAxis: [
          {
            type: 'category',
            data: ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '大连', '吉林', '黑龙江', '上海', '江苏', '苏州', '宁波', '浙江', '安徽', '福建', '厦门', '江西', '山东', '青岛', '河南', '湖北', '湖南', '广东', '深圳', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆'],
            axisLabel: {
              interval: 0,
              rotate: 45, // 倾斜度 -90 至 90 默认为0
              margin: 15
            },
            axisPointer: {
              type: 'shadow'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '填报率',
            min: 0,
            max: 100,
            interval: 10,
            axisLabel: {
              formatter: '{value} %'
            }
          },
          {
            type: 'value',
            name: '问题数',
            min: 0,
            max: 200,
            interval: 20,
            axisLabel: {
              formatter: '{value}个'
            }
          }
        ],
        series: [
          {
            name: '问题数',
            type: 'bar',
            yAxisIndex: 1,
            data: [2.0, 4.0, 7.0, 23.0, 25.0, 76.0, 135.0, 162.0, 32.0, 20.0, 6.0, 3.0, 2.0, 70.0, 175.0, 182.0, 48.0, 18.0, 6.0, 2.0, 135.0, 162.0, 32.0, 20.0, 6.0, 3.0, 2.0, 50, 9.0, 26.0, 28.0, 162.0, 32.0, 20.0, 6.0, 3.0, 2.0]
          },
          {
            name: '填报率',
            type: 'line',
            data: [90, 72, 83, 75, 63, 32, 53, 34, 90, 65, 100, 82, 70, 82, 93, 75, 63, 42, 73, 84, 80, 55, 70, 92, 62, 23, 94, 30, 45, 70, 72, 50, 62, 63, 52, 36, 20]
          }
        ]
      }
    },
    convertData(data) {
      var res = []
      for (var i = 0; i < data.length; i++) {
        var geoCoord = this.mapData[data[i].name]
        if (geoCoord) {
          res.push({
            name: data[i].name,
            value: geoCoord.concat(data[i].value)
          })
        }
      }
      return res
    },
    openDetail(item, index) {
      if (index === 1) {
        this.$refs.notice.seeView(item)
      } else {
        this.$refs.matter.seeView(item)
      }
    }
  }
}
</script>
<style lang="scss">
    .dashboard-container{
      background-color: #EFF1F4;
      padding:0 15px 15px;
      .dashboard-card{
        height: 220px;
        margin-top:15px;
        background-color: #fff;
        .dashboard-card-title{
          text-align: left;
          font-weight: bold;
          font-size: 20px;
          height: 40px;
          line-height: 40px;
          margin-left: 20px;
        }
        .dashboard-card-context{
          margin-left:20px;
          height: 190px;
          p{
            margin: 0;
            height: 52px;
            line-height: 52px;
            font-size: 18px;
          }
        }
      }
      .dashboard-status{
        height: 500px;
        overflow:hidden;
        margin-top:15px;
        background-color: #fff;
        &.dashboard-messages{
          background-color: #EFF1F4;
          .dashboard-panel{
            height: calc(50% - 10px);
            background-color: #fff;
            &:last-child{
              margin-top: 20px;
            }
            .dashboard-panel-title{
              height: 60px;
              line-height: 60px;
              font-size: 20px;
              margin:0;
              padding-left:10px;
            }
            .dashboard-panel-context{
              height: calc(100% - 60px);
              padding: 10px;
              padding-left: 30px;
              overflow: auto;
              a{
                display: block;
                height: 40px;
                line-height: 40px;
                color: #85C1FF;
                text-decoration: underline;
                font-size: 23px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                .svgI{
                  color:#000;
                }
              }
            }
          }
        }
      }
      .dashboard-chart{
        height: 400px;
        margin-top:15px;
        background-color: #fff;
        textarea{
          height: 95%;
        }
      }
    }
</style>
