<template>
  <div class="archive-page">
    <div class="page-header">
      <h2>一键归档</h2>
      <div class="header-actions">
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="handleArchive" :loading="archiving">
          <el-icon><FolderOpened /></el-icon>
          开始归档
        </el-button>
      </div>
    </div>

    <div class="archive-layout">
      <!-- 左侧：案件选择 -->
      <el-card class="case-selector">
        <template #header>
          <h3>选择案件</h3>
        </template>

        <div class="filter-section">
          <el-select v-model="selectedProject" placeholder="选择项目" clearable style="width: 100%" @change="loadCases">
            <el-option v-for="project in projects" :key="project.id" :label="project.name" :value="project.id" />
          </el-select>
        </div>

        <div class="case-list">
          <div
            v-for="item in cases"
            :key="item.id"
            class="case-item"
            :class="{ selected: selectedCaseId === item.id }"
            @click="selectCase(item)"
          >
            <div class="case-title">{{ item.debtor_name }}</div>
            <div class="case-meta">
              <el-tag :type="getStageType(item.stage)" size="small">
                {{ formatStage(item.stage) }}
              </el-tag>
              <span class="case-number">{{ item.trial_case_number || item.execution_case_number }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 右侧：归档预览 -->
      <el-card class="archive-preview">
        <template #header>
          <h3>归档预览</h3>
        </template>

        <div v-if="selectedCase" class="preview-content">
          <!-- 案件信息 -->
          <div class="info-section">
            <h4>案件信息</h4>
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="案件编号">{{ selectedCase.case_number }}</el-descriptions-item>
              <el-descriptions-item label="债务人名称">{{ selectedCase.debtor_name }}</el-descriptions-item>
              <el-descriptions-item label="案件阶段">
                <el-tag :type="getStageType(selectedCase.stage)">
                  {{ formatStage(selectedCase.stage) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="立案时间">
                {{ formatDate(selectedCase.litigation_filing_date) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 电子卷宗材料 -->
          <div class="documents-section">
            <h4>电子卷宗材料（{{ documents.length }}）</h4>

            <div class="document-list">
              <draggable
                v-model="documents"
                item-key="id"
                @end="onDragEnd"
              >
                <template #item="{ element: doc, index }">
                  <div class="document-item">
                    <div class="doc-order">{{ index + 1 }}</div>
                    <div class="doc-icon">
                      <el-icon><Document /></el-icon>
                    </div>
                    <div class="doc-info">
                      <div class="doc-title">{{ doc.title }}</div>
                      <div class="doc-meta">
                        <el-tag size="small">{{ getDocTypeName(doc.document_type) }}</el-tag>
                        <span class="doc-size">{{ formatFileSize(doc.file_size) }}</span>
                      </div>
                    </div>
                    <div class="doc-actions">
                      <el-button link type="primary" @click="previewDoc(doc)">预览</el-button>
                      <el-button link type="danger" @click="removeDoc(doc)">移除</el-button>
                    </div>
                  </div>
                </template>
              </draggable>

              <el-empty v-if="documents.length === 0" description="暂无文档材料" />
            </div>

            <div class="add-documents">
              <el-button @click="showAddDocDialog = true">
                <el-icon><Plus /></el-icon>
                添加文档
              </el-button>
            </div>
          </div>

          <!-- 生成目录预览 -->
          <div class="catalog-section">
            <h4>卷宗目录</h4>
            <div class="catalog-content">
              <div class="catalog-item">一、案件基本信息</div>
              <div class="catalog-item">二、诉讼文书</div>
              <div v-for="(doc, index) in documents" :key="doc.id" class="catalog-item">
                {{ index + 1 }}. {{ doc.title }}
              </div>
              <div class="catalog-item">三、证据材料</div>
              <div class="catalog-item">四、其他材料</div>
            </div>
          </div>

          <!-- 结案报告 -->
          <div class="report-section">
            <h4>结案报告预览</h4>
            <div class="report-preview">
              <div class="report-item">
                <span class="report-label">案件编号：</span>
                <span class="report-value">{{ selectedCase.case_number }}</span>
              </div>
              <div class="report-item">
                <span class="report-label">债务人：</span>
                <span class="report-value">{{ selectedCase.debtor_name }}</span>
              </div>
              <div class="report-item">
                <span class="report-label">立案时间：</span>
                <span class="report-value">{{ formatDate(selectedCase.litigation_filing_date) }}</span>
              </div>
              <div class="report-item">
                <span class="report-label">结案时间：</span>
                <span class="report-value">{{ formatDate(new Date()) }}</span>
              </div>
              <div class="report-item">
                <span class="report-label">案件阶段：</span>
                <span class="report-value">{{ formatStage(selectedCase.stage) }}</span>
              </div>
              <div class="report-item">
                <span class="report-label">基础律师费：</span>
                <span class="report-value">{{ formatMoney(selectedCase.base_attorney_fee) }}</span>
              </div>
              <div class="report-item">
                <span class="report-label">清收金额：</span>
                <span class="report-value">{{ formatMoney(selectedCase.collection_amount) }}</span>
              </div>
              <div class="report-item">
                <span class="report-label">风险代理费：</span>
                <span class="report-value">{{ formatMoney(selectedCase.risk_attorney_fee) }}</span>
              </div>
            </div>
          </div>
        </div>

        <el-empty v-else description="请选择要归档的案件" />
      </el-card>
    </div>

    <!-- 添加文档对话框 -->
    <el-dialog v-model="showAddDocDialog" title="添加文档" width="600px">
      <el-upload
        drag
        action="/api/documents/upload"
        multiple
        :on-success="handleDocUploadSuccess"
        accept=".pdf,.doc,.docx,.jpg,.png"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">拖拽文件到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">支持PDF、Word、图片等格式</div>
        </template>
      </el-upload>

      <template #footer>
        <el-button @click="showAddDocDialog = false">完成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import draggable from 'vuedraggable'
import { getCases, getProjects } from '@/api/case'
import { formatDate, formatMoney, formatFileSize, formatCaseStage } from '@/utils/format'

const router = useRouter()

const archiving = ref(false)
const selectedProject = ref(null)
const selectedCaseId = ref(null)
const selectedCase = ref(null)
const showAddDocDialog = ref(false)

const projects = ref([])
const cases = ref([])
const documents = ref([])

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

function getDocTypeName(type) {
  const typeMap = {
    'summons': '传票',
    'complaint': '起诉状',
    'judgment': '判决书',
    'mediation': '调解书',
    'evidence': '证据',
    'contract': '合同',
    'other': '其他'
  }
  return typeMap[type] || type
}

function goBack() {
  router.push('/documents')
}

async function loadProjects() {
  try {
    const response = await getProjects()
    projects.value = response.projects
  } catch (error) {
    console.error('加载项目列表失败', error)
  }
}

async function loadCases() {
  try {
    const params = {}
    if (selectedProject.value) {
      params.project_id = selectedProject.value
    }
    const response = await getCases(params)
    cases.value = response.cases
  } catch (error) {
    console.error('加载案件列表失败', error)
  }
}

function selectCase(caseItem) {
  selectedCaseId.value = caseItem.id
  selectedCase.value = caseItem
  // 加载案件的文档
  loadCaseDocuments(caseItem.id)
}

async function loadCaseDocuments(caseId) {
  try {
    // TODO: 调用API加载案件文档
    documents.value = []
  } catch (error) {
    console.error('加载案件文档失败', error)
  }
}

function onDragEnd() {
  // 拖拽排序后更新文档顺序
  documents.value.forEach((doc, index) => {
    doc.archive_order = index + 1
  })
}

function previewDoc(doc) {
  ElMessage.info('预览功能开发中')
}

function removeDoc(doc) {
  const index = documents.value.findIndex(d => d.id === doc.id)
  if (index > -1) {
    documents.value.splice(index, 1)
  }
}

function handleDocUploadSuccess(response, file) {
  ElMessage.success('文档上传成功')
  // 重新加载文档列表
  if (selectedCaseId.value) {
    loadCaseDocuments(selectedCaseId.value)
  }
}

async function handleArchive() {
  if (!selectedCase.value) {
    ElMessage.warning('请选择要归档的案件')
    return
  }

  if (documents.value.length === 0) {
    ElMessage.warning('请添加至少一个文档材料')
    return
  }

  archiving.value = true
  try {
    // TODO: 调用归档API
    // await archiveDocuments(selectedCaseId.value, {
    //   documents: documents.value,
    //   generate_catalog: true,
    //   generate_report: true
    // })

    ElMessage.success('归档成功！')
    goBack()
  } catch (error) {
    ElMessage.error('归档失败')
  } finally {
    archiving.value = false
  }
}

onMounted(() => {
  loadProjects()
  loadCases()
})
</script>

<style scoped>
.archive-page {
  max-width: 1400px;
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

.archive-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 24px;
}

.case-selector,
.archive-preview {
  border: 1px solid var(--color-border-light);
  height: fit-content;
}

.case-selector h3,
.archive-preview h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.filter-section {
  margin-bottom: 16px;
}

.case-list {
  max-height: 500px;
  overflow-y: auto;
}

.case-item {
  padding: 12px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.case-item:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.case-item.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.case-title {
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--color-text-primary);
}

.case-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.case-number {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section h4,
.documents-section h4,
.catalog-section h4,
.report-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.document-list {
  margin-bottom: 16px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
  background: white;
  cursor: move;
}

.doc-order {
  width: 24px;
  height: 24px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
}

.doc-icon {
  font-size: 24px;
  color: var(--color-primary);
}

.doc-info {
  flex: 1;
}

.doc-title {
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--color-text-primary);
}

.doc-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-size {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.doc-actions {
  display: flex;
  gap: 8px;
}

.add-documents {
  text-align: center;
}

.catalog-content {
  background: var(--color-bg);
  padding: 16px;
  border-radius: var(--radius-md);
}

.catalog-item {
  padding: 8px 0;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-light);
}

.catalog-item:last-child {
  border-bottom: none;
}

.report-preview {
  background: var(--color-bg);
  padding: 16px;
  border-radius: var(--radius-md);
}

.report-item {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.report-item:last-child {
  border-bottom: none;
}

.report-label {
  width: 120px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.report-value {
  flex: 1;
  color: var(--color-text-secondary);
}
</style>
