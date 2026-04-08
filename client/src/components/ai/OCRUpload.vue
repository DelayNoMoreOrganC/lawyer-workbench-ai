<template>
  <div class="ocr-upload">
    <el-upload
      class="upload-area"
      drag
      action="/api/ai/ocr/summons"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
      accept="image/*,.pdf"
      :auto-upload="true"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        拖拽传票图片到此处，或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          支持jpg/png/pdf格式，自动识别案件信息
        </div>
      </template>
    </el-upload>

    <!-- 识别结果展示 -->
    <div v-if="ocrResult" class="ocr-result">
      <div class="result-header">
        <h3>识别结果</h3>
        <el-tag type="success">识别成功</el-tag>
      </div>

      <el-form :model="ocrResult" label-width="120px" class="result-form">
        <el-form-item label="案号">
          <el-input v-model="ocrResult.case_number" placeholder="案号" />
        </el-form-item>

        <el-form-item label="法院">
          <el-input v-model="ocrResult.court_name" placeholder="法院名称" />
        </el-form-item>

        <el-form-item label="被告">
          <el-input v-model="ocrResult.defendant" placeholder="被告名称" />
        </el-form-item>

        <el-form-item label="原告">
          <el-input v-model="ocrResult.plaintiff" placeholder="原告名称" />
        </el-form-item>

        <el-form-item label="开庭日期">
          <el-date-picker
            v-model="ocrResult.hearing_date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="开庭时间">
          <el-time-picker
            v-model="ocrResult.hearing_time"
            placeholder="选择时间"
            style="width: 100%"
            value-format="HH:mm"
          />
        </el-form-item>

        <el-form-item label="开庭地点">
          <el-input v-model="ocrResult.location" placeholder="开庭地点" />
        </el-form-item>

        <el-form-item label="案件类型">
          <el-select v-model="ocrResult.case_type" placeholder="选择案件类型" style="width: 100%">
            <el-option label="民事诉讼" value="civil" />
            <el-option label="刑事诉讼" value="criminal" />
            <el-option label="行政诉讼" value="administrative" />
          </el-select>
        </el-form-item>

        <el-form-item label="法官信息">
          <el-input
            v-model="ocrResult.judge"
            type="textarea"
            :rows="2"
            placeholder="法官及书记员联系方式"
          />
        </el-form-item>
      </el-form>

      <div class="result-actions">
        <el-button @click="discardResult">丢弃</el-button>
        <el-button type="primary" @click="confirmAndCreate">确认并创建案件</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const ocrResult = ref(null)

function beforeUpload(file) {
  const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf'
  if (!isValidType) {
    ElMessage.error('只能上传图片或PDF文件')
    return false
  }

  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB')
    return false
  }

  return true
}

function handleSuccess(response) {
  if (response.success) {
    ocrResult.value = response.data

    // 转换日期格式
    if (ocrResult.value.hearing_date) {
      ocrResult.value.hearing_date = new Date(ocrResult.value.hearing_date)
    }

    ElMessage.success('识别成功')
  } else {
    ElMessage.error('识别失败')
  }
}

function handleError(error) {
  console.error('OCR error:', error)
  ElMessage.error('识别失败，请重试')
}

function discardResult() {
  ocrResult.value = null
}

function confirmAndCreate() {
  // 将OCR数据传递给案件创建页面
  router.push({
    path: '/cases/create',
    query: {
      ocrData: JSON.stringify(ocrResult.value)
    }
  })
}
</script>

<style scoped>
.ocr-upload {
  width: 100%;
}

.upload-area {
  margin-bottom: 24px;
}

.ocr-result {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: 24px;
  background: white;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.result-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.result-form {
  margin-bottom: 24px;
}

.result-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
