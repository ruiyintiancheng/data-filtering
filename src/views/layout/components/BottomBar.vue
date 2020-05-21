<template>
    <div class="bottom-bar" :style="{backgroundColor:bgColor}">
        锐银天成EAST系统 fascte@fascte.com
    </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters([
      'bgColor'
    ])
  }
}
</script>
<style scoped>
    .bottom-bar{
        height: 30px;
        width: 100%;
        position: fixed;
        bottom: 0;
        left: 0;
        z-index: 1002;
        border-top: 1px solid #47525a;
        line-height: 30px;
        text-align: center;
        color: #fff;
        font-size: 12px;
    }
</style>

