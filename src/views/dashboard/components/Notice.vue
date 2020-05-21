<template>
  <div class="notice">
    <el-dialog title="工作通知"
               v-el-drag-dialog
               append-to-body
               :visible.sync="formVisible"
               width="78%"
               custom-class="dialog-default">
      <div class="dialog-contant-default">
        <el-form ref="formData"
                 :model="formData"
                 style="padding:30px"
                 label-width="80px">
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="标题:">
                <el-input :disabled="true"
                          v-model="formData.标题"
                          style="width: 250px"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="概述:">
                <el-input :disabled="true"
                          v-model="formData.概述"
                          style="width: 250px"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="状态:">
                <el-select value=""
                           :disabled="true"
                           v-model="formData.状态"
                           style="width: 250px"></el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="有效期:">
                <el-date-picker :disabled="true"
                                v-model="formData.有效期"
                                type="date"
                                style="width: 250px"></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="正文">
            <tinymce :height="300"
                     :toolbar="toolbar"
                     v-model="formData.正文"
                     :noRead="1"
                     :menubar="false"></tinymce>
          </el-form-item>
          <el-form-item label="附件">
            <el-upload :disabled="true"
                       class="upload-demo"
                       multiple
                       :limit="3"
                       :file-list="fileList"
                       action="">
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer"
           class="dialog-footer">
        <el-button type="primary"
                   @click="formVisible=false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Tinymce from '@/components/Tinymce'
import elDragDialog from '@/directive/el-dragDialog'
import { baseRequest } from '@/api/base'
export default {
  directives: { elDragDialog },
  components: {
    Tinymce
  },
  data() {
    return {
      formData: {},
      formVisible: false,
      toolbar: ['fullscreen'],
      fileList: [{ name: 'food.txt', url: '' }, { name: 'food2.txt', url: '' }]
    }
  },
  methods: {
    seeView(item) {
      baseRequest('/basic/announcement/getOption').then(response => {
        const result = response.data
        this.formData = result.item
        this.formVisible = true
      })
    }
  }
}
</script>
