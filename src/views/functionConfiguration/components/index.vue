/*
 * @Author: 1k 
 * @Date: 2019-08-01 17:33:34 
 * @Last Modified by: 1k
 * @Last Modified time: 2019-08-02 10:49:01
 * @Description:  函数配置-表操作-条件筛选 
 */
<template>
  <div class="condition-option">
    <ul class="ul-condition">
      <!-- <li>
        <span> 函数名称:</span>
        <el-input v-model="queryJson.name"
                  class="input-condition"></el-input>
      </li> -->
      <li v-for="(item,index) in queryJson"
          :key="index">
        <span v-if="index === 0"> 函数名称:</span>
        <span v-else>&nbsp;&nbsp;&nbsp;&nbsp; 参数{{index }}:</span>
        <el-input v-model="item.name"
                  class="input-condition"></el-input>
        <el-button v-if="index === (queryJson.length - 1)"
                   @click="addCondition"
                   icon="el-icon-plus"></el-button>
        <el-button v-if="index !== 0"
                   icon="el-icon-minus"
                   @click="reduceCondition(index)"></el-button>
      </li>
    </ul>
  </div>
</template>
<script>
// import { baseRequest } from '@/api/base'
export default {
  name: 'functionConfigurationComponentsIndex',

  props: {
    // 条件json
    queryJson: {
      type: [Array, Object]
      // default: function() {
      //   return [
      //     {
      //       name: null,
      //       value: null,
      //       type: 1
      //     }
      //   ]
      // }
    },
    componentType: {
      type: String,
      default: '1'
    },
    componentParam: String
  },
  data() {
    return {
      // 下拉框选项
      selectOptions: {}
    }
  },
  mounted() {

  },
  methods: {
    // 添加条件
    addCondition() {
      // this.queryJson[this.queryJson.length - 1]['radio'] = 'and'
      this.queryJson.push({
        name: null

      })
    },
    // 删除条件
    reduceCondition(index) {
      this.queryJson.splice(index, 1)
    },
    // 判断条件是否为空
    judgeConditionNull() {
      return new Promise((resolve, reject) => {
        if (!this.queryJson) {
          reject()
        }
        resolve()
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.condition-option {
  .ul-condition {
    list-style: none;
    margin-left: calc(50% - 150px);
    padding: 0;
    .input-condition {
      width: 155px;
      margin-bottom: 10px;
    }
    .condition-radioes {
      padding: 10px 0;
    }
  }
}
</style>