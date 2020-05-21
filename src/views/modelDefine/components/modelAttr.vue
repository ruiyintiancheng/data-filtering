/*
 * @Author: lk 
 * @Date: 2019-09-25 11:50:04 
 * @Last Modified by: lk
 * @Last Modified time: 2019-09-25 16:19:30
 * @Description:  模型属性
 */
<template>
    <div class="model-attr">
         <div class="model-attr-row clearfix">
            <div class="model-attr-cell half label">名称</div>
            <div class="model-attr-cell half result">{{modelAttrData.modelname}}</div>
        </div>
        <div class="model-attr-row clearfix">
            <div class="model-attr-cell label">所在分组</div>
            <div class="model-attr-cell result">{{modelAttrData.groupname}}</div>
            <div class="model-attr-cell label">提交状态 </div>
            <div class="model-attr-cell result">{{modelAttrData.field_convert_map.modelstatus}}</div>
        </div>
        <div class="model-attr-row clearfix">
            <div class="model-attr-cell label">创建人</div>
            <div class="model-attr-cell result">{{modelAttrData.createusername}}</div>
            <div class="model-attr-cell label">修改人</div>
            <div class="model-attr-cell result">{{modelAttrData.updateusername}}</div>
        </div>
    </div>
</template>
<script>
export default {
  props: {
    modelAttrData: Object
  }
}
</script>
<style lang="scss" scoped>
.model-attr{
    border-top:1px solid #ccc;
    border-left:1px solid #ccc;
    .model-attr-row{
        .model-attr-cell{
            float: left;
            width: 25%;
            height: 50px;
            line-height: 50px;
            text-align: center;
            border-right:1px solid #ccc;
            border-bottom:1px solid #ccc;
            &.half{
                width:50%;
            }
            &.label{
                background-color: #ecf5ff;
                color: #909399;
            }
            &.result{
                color: #409EFF;
                font-weight: bold;
            }
        }
    }
}
</style>
