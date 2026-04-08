<template>
  <div class="case-edit-page">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑案件' : '创建案件' }}</h2>
      <div class="header-actions">
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </div>
    </div>

    <el-card>
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="140px">
        <!-- 基础信息 -->
        <div class="form-section">
          <h3>基础信息</h3>
          <el-form-item label="债务人名称" prop="debtor_name">
            <el-input v-model="formData.debtor_name" placeholder="请输入债务人名称" />
          </el-form-item>

          <el-form-item label="所属项目" prop="project_id">
            <el-select v-model="formData.project_id" placeholder="请选择项目" clearable style="width: 100%">
              <el-option v-for="project in projects" :key="project.id" :label="project.name" :value="project.id" />
            </el-select>
          </el-form-item>

          <el-form-item label="案件阶段" prop="stage">
            <el-select v-model="formData.stage" placeholder="请选择阶段" style="width: 100%">
              <el-option label="诉讼中" value="litigation" />
              <el-option label="执行中" value="executing" />
              <el-option label="终本中" value="terminated" />
              <el-option label="结案" value="closed" />
              <el-option label="调解跟进" value="mediation" />
            </el-select>
          </el-form-item>

          <el-form-item label="子阶段" prop="sub_stage">
            <el-input v-model="formData.sub_stage" placeholder="如：已判决、诉前联调等" />
          </el-form-item>
        </div>

        <!-- 诉讼信息 -->
        <div class="form-section">
          <h3>诉讼信息</h3>
          <el-form-item label="一审立案时间" prop="litigation_filing_date">
            <el-date-picker
              v-model="formData.litigation_filing_date"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>

          <el-form-item label="审判案号" prop="trial_case_number">
            <el-input v-model="formData.trial_case_number" placeholder="如：（2025）粤0604民初3231号" />
          </el-form-item>

          <el-form-item label="法官/书记员联系方式" prop="judge_info">
            <el-input
              v-model="formData.judge_info"
              type="textarea"
              :rows="3"
              placeholder="承办法官、书记员及联系方式"
            />
          </el-form-item>

          <el-form-item label="判决/调解时间" prop="judgment_date">
            <el-date-picker
              v-model="formData.judgment_date"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>

          <el-form-item label="诉讼进展" prop="litigation_progress">
            <el-input
              v-model="formData.litigation_progress"
              type="textarea"
              :rows="4"
              placeholder="记录诉讼过程中的重要进展"
            />
          </el-form-item>
        </div>

        <!-- 执行信息 -->
        <div class="form-section">
          <h3>执行信息</h3>
          <el-form-item label="执行立案时间" prop="execution_filing_date">
            <el-date-picker
              v-model="formData.execution_filing_date"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>

          <el-form-item label="执行案号" prop="execution_case_number">
            <el-input v-model="formData.execution_case_number" placeholder="执行案号" />
          </el-form-item>

          <el-form-item label="执行状态" prop="execution_status">
            <el-input v-model="formData.execution_status" placeholder="当前执行状态" />
          </el-form-item>

          <el-form-item label="执行进展" prop="execution_progress">
            <el-input
              v-model="formData.execution_progress"
              type="textarea"
              :rows="4"
              placeholder="记录执行过程中的重要进展"
            />
          </el-form-item>

          <el-form-item label="执行法官联系方式" prop="execution_judge_info">
            <el-input
              v-model="formData.execution_judge_info"
              type="textarea"
              :rows="3"
              placeholder="执行法官、书记员及联系方式"
            />
          </el-form-item>
        </div>

        <!-- 财务信息 -->
        <div class="form-section">
          <h3>财务信息</h3>
          <el-form-item label="基础律师费" prop="base_attorney_fee">
            <el-input-number v-model="formData.base_attorney_fee" :precision="2" :min="0" style="width: 100%" />
          </el-form-item>

          <el-form-item label="清收金额" prop="collection_amount">
            <el-input-number v-model="formData.collection_amount" :precision="2" :min="0" style="width: 100%" />
          </el-form-item>

          <el-form-item label="风险代理费" prop="risk_attorney_fee">
            <el-input-number v-model="formData.risk_attorney_fee" :precision="2" :min="0" style="width: 100%" />
          </el-form-item>
        </div>

        <!-- 查封信息 -->
        <div class="form-section">
          <h3>查封信息</h3>
          <el-form-item label="查封情况" prop="seizure_info">
            <el-input
              v-model="formData.seizure_info"
              type="textarea"
              :rows="4"
              placeholder="记录查封财产的详细信息"
            />
          </el-form-item>

          <el-form-item label="查封到期日" prop="seizure_expiry_date">
            <el-date-picker
              v-model="formData.seizure_expiry_date"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCaseDetail, createCase, updateCase, getProjects } from '@/api/case'

const router = useRouter()
const route = useRoute()

const formRef = ref(null)
const saving = ref(false)
const projects = ref([])

const isEdit = computed(() => !!route.params.id && route.params.id !== 'create')

const formData = ref({
  debtor_name: '',
  project_id: null,
  stage: 'litigation',
  sub_stage: '',
  litigation_filing_date: '',
  trial_case_number: '',
  judge_info: '',
  judgment_date: '',
  litigation_progress: '',
  execution_filing_date: '',
  execution_case_number: '',
  execution_status: '',
  execution_progress: '',
  execution_judge_info: '',
  base_attorney_fee: null,
  collection_amount: null,
  risk_attorney_fee: null,
  seizure_info: '',
  seizure_expiry_date: ''
})

const rules = {
  debtor_name: [
    { required: true, message: '请输入债务人名称', trigger: 'blur' }
  ],
  stage: [
    { required: true, message: '请选择案件阶段', trigger: 'change' }
  ]
}

// 返回列表
function goBack() {
  router.push('/cases')
}

// 保存案件
async function handleSave() {
  try {
    await formRef.value.validate()
    saving.value = true

    if (isEdit.value) {
      await updateCase(route.params.id, formData.value)
      ElMessage.success('更新成功')
    } else {
      await createCase(formData.value)
      ElMessage.success('创建成功')
    }

    goBack()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    }
  } finally {
    saving.value = false
  }
}

// 加载案件详情
async function loadCaseDetail() {
  if (!isEdit.value) return

  try {
    const data = await getCaseDetail(route.params.id)
    formData.value = {
      ...formData.value,
      ...data
    }
  } catch (error) {
    ElMessage.error('加载案件详情失败')
    goBack()
  }
}

// 加载项目列表
async function loadProjects() {
  try {
    const response = await getProjects()
    projects.value = response.projects
  } catch (error) {
    console.error('加载项目列表失败', error)
  }
}

onMounted(() => {
  loadProjects()
  loadCaseDetail()

  // 检查是否有OCR数据
  const ocrData = route.query.ocrData
  if (ocrData) {
    try {
      const data = JSON.parse(ocrData)
      // 填充OCR识别的数据
      formData.value.debtor_name = data.defendant || ''
      formData.value.trial_case_number = data.case_number || ''
      formData.value.litigation_filing_date = data.hearing_date || ''
      formData.value.judge_info = data.judge || ''
      formData.value.stage = 'litigation'
    } catch (error) {
      console.error('解析OCR数据失败', error)
    }
  }
})
</script>

<style scoped>
.case-edit-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border-light);
}

.form-section:last-child {
  border-bottom: none;
}

.form-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 24px;
}
</style>
