<template>
    <div class="matter">
        <el-dialog title="事项处理单" v-el-drag-dialog :close-on-click-modal="false" :visible.sync="dialogBillVisible" width="80%" custom-class="dialog-default">
              <div class="dialog-contant-default">
                <problem-bill ref="problemBill" sourceType="problem"></problem-bill>
              </div>
              <div slot="footer" class="dialog-footer">
                <div>
                    <el-button type="primary" @click="onSubmit">转派</el-button>
                    <el-button type="primary" @click="onSubmit">提交</el-button>
                    <el-button type="primary" @click="onSubmit">退回</el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import elDragDialog from '@/directive/el-dragDialog'
import ProblemBill from './ProblemBill'
export default {
  directives: { elDragDialog },
  components: {
    ProblemBill
  },
  data() {
    return {
      dialogBillVisible: false
    }
  },
  methods: {
    onSubmit() {
      this.dialogBillVisible = false
    },
    seeView(row) {
      this.dialogBillVisible = true
      this.$nextTick(function() {
        this.$refs.problemBill.formData.事项名称 = row.事项名称
        this.$refs.problemBill.formData.填报人姓名 = row.提出人
        this.$refs.problemBill.formData.处理时限 = row.处理时限
        this.$refs.problemBill.getAttachments()
        this.$refs.problemBill.getHandleRecords()
      })
    }
  }
}
</script>
