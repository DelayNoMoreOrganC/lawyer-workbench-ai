<template>
  <div class="case-detail-page">
    <div class="page-header">
      <h2>案件详情</h2>
      <div class="header-actions">
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="editCase">编辑</el-button>
      </div>
    </div>

    <el-card v-loading="loading">
      <div v-if="caseDetail">
        <!-- 基础信息 -->
        <div class="detail-section">
          <h3>基础信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="案件编号">{{ caseDetail.case_number }}</el-descriptions-item>
            <el-descriptions-item label="债务人名称">{{ caseDetail.debtor_name }}</el-descriptions-item>
            <el-descriptions-item label="案件阶段">
              <el-tag :type="getStageType(caseDetail.stage)">
                {{ formatStage(caseDetail.stage) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="子阶段">{{ caseDetail.sub_stage || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 诉讼信息 -->
        <div class="detail-section">
          <h3>诉讼信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="一审立案时间">
              {{ formatDate(caseDetail.litigation_filing_date) || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="审判案号">{{ caseDetail.trial_case_number || '-' }}</el-descriptions-item>
            <el-descriptions-item label="法官/书记员联系方式" :span="2">
              {{ caseDetail.judge_info || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="判决/调解时间">
              {{ formatDate(caseDetail.judgment_date) || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="诉讼进展" :span="2">
              {{ caseDetail.litigation_progress || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 执行信息 -->
        <div class="detail-section">
          <h3>执行信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="执行立案时间">
              {{ formatDate(caseDetail.execution_filing_date) || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="执行案号">{{ caseDetail.execution_case_number || '-' }}</el-descriptions-item>
            <el-descriptions-item label="执行状态">{{ caseDetail.execution_status || '-' }}</el-descriptions-item>
            <el-descriptions-item label="执行进展">{{ caseDetail.execution_progress || '-' }}</el-descriptions-item>
            <el-descriptions-item label="执行法官联系方式" :span="2">
              {{ caseDetail.execution_judge_info || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 财务信息 -->
        <div class="detail-section">
          <h3>财务信息</h3>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="基础律师费">
              {{ formatMoney(caseDetail.base_attorney_fee) }}
            </el-descriptions-item>
            <el-descriptions-item label="清收金额">
              {{ formatMoney(caseDetail.collection_amount) }}
            </el-descriptions-item>
            <el-descriptions-item label="风险代理费">
              {{ formatMoney(caseDetail.risk_attorney_fee) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 查封信息 -->
        <div class="detail-section">
          <h3>查封信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="查封情况" :span="2">
              {{ caseDetail.seizure_info || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="查封到期日">
              {{ formatDate(caseDetail.seizure_expiry_date) || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 时间信息 -->
        <div class="detail-section">
          <h3>时间信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="创建时间">
              {{ formatDateTime(caseDetail.created_at) }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ formatDateTime(caseDetail.updated_at) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCaseDetail } from '@/api/case'
import { formatDate, formatDateTime, formatMoney, formatCaseStage } from '@/utils/format'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const caseDetail = ref(null)

function formatStage(stage) {
  return formatCaseStage(stage)
}

function getStageType(stage) {
  const typeMap = {
    'litigation': 'primary',
    'executing': 'success',
    'terminated': 'warning',
    'closed': 'info',
    'mediation': ''
  }
  return typeMap[stage] || ''
}

function goBack() {
  router.push('/cases')
}

function editCase() {
  router.push(`/cases/${route.params.id}`)
}

async function loadCaseDetail() {
  loading.value = true
  try {
    caseDetail.value = await getCaseDetail(route.params.id)
  } catch (error) {
    ElMessage.error('加载案件详情失败')
    goBack()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCaseDetail()
})
</script>

<style scoped>
.case-detail-page {
  max-width: 1200px;
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

.detail-section {
  margin-bottom: 32px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}
</style>
