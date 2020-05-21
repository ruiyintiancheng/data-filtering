<template>
    <div class="run-log">
        <div v-if="nodeData.calLog" class="log-row log-text">
                {{nodeData.calLog}}
        </div>
        <div class="log-row clearfix">
            <div class="log-col">
                开始时间
            </div>
            <div class="log-col">
                {{nodeData.startTime}}
            </div>
        </div>
        <div class="log-row clearfix">
            <div class="log-col">
                结束时间
            </div>
            <div class="log-col">
                {{nodeData.endTime}}
            </div>
        </div>
    </div>
</template>
<script>
export default {
  props: {
    nodeData: Object
  }
}
</script>
<style lang="scss" scoped>
$borderColor:#E4E7ED;
.run-log{
    border-bottom: 1px solid $borderColor;
    .log-row{
        line-height: 30px;
        border-top: 1px solid $borderColor;
        &.log-text{
            padding:5px;
            background-color: #FAFAFA;
        }
        .log-col{
            width: 50%;
            float: left;
            text-align: center;
            &:nth-of-type(2n){
                border-left: 1px solid $borderColor;
            }
        }
    }
}
</style>

