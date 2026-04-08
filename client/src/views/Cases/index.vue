<template>
  <div class="cases-page">
    <div class="page-header">
      <h2>案件管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="goToCreate">
          <el-icon><Plus /></el-icon>
          新建案件
        </el-button>
        <el-button @click="showImportDialog = true">
          <el-icon><Upload /></el-icon>
          导入Excel
        </el-button>
        <el-button @click="exportCases">
          <el-icon><Download /></el-icon>
          导出Excel
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索案件名称、案号..."
        clearable
        style="width: 300px"
        @clear="loadCases"
        @keyup.enter="loadCases"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="filterStage" placeholder="案件阶段" clearable style="width: 150px" @change="loadCases">
        <el-option label="诉讼中" value="litigation" />
        <el-option label="执行中" value="executing" />
        <el-option label="终本中" value="terminated" />
        <el-option label="结案" value="closed" />
        <el-option label="调解跟进" value="mediation" />
      </el-select>

      <el-select v-model="filterProject" placeholder="选择项目" clearable style="width: 150px" @change="loadCases">
        <el-option v-for="project in projects" :key="project.id" :label="project.name" :value="project.id" />
      </el-select>
    </div>

    <!-- 案件列表 -->
    <el-card class="case-list-card">
      <el-table :data="cases" style="width: 100%" v-loading="loading">
        <el-table-column prop="case_number" label="案件编号" width="150" />
        <el-table-column prop="debtor_name" label="债务人名称" width="150" />
        <el-table-column prop="stage" label="阶段" width="120">
          <template #default="scope">
            <el-tag :type="getStageType(scope.row.stage)">
              {{ formatStage(scope.row.stage) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="trial_case_number" label="审判案号" width="180" />
        <el-table-column prop="execution_case_number" label="执行案号" width="180" />
        <el-table-column prop="litigation_filing_date" label="立案时间" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.litigation_filing_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="viewCase(scope.row.id)">查看</el-button>
            <el-button link type="primary" @click="editCase(scope.row.id)">编辑</el-button>
            <el-button link type="danger" @click="deleteCase(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadCases"
          @current-change="loadCases"
        />
      </div>
    </el-card>

    <!-- 导入Excel对话框 -->
    <el-dialog v-model="showImportDialog" title="导入案件Excel" width="500px">
      <el-upload
        class="upload-area"
        drag
        action="/api/cases/import"
        :on-success="handleImportSuccess"
        :on-error="handleImportError"
        accept=".xlsx,.xls"
        :auto-upload="false"
        ref="uploadRef"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽Excel文件到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持.xlsx和.xls格式，单个案件格式或汇总表格式
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" @click="uploadRef?.submit()">开始导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCases, getProjects, importCases, exportCases as exportCasesAPI, deleteCase as deleteCaseAPI } from '@/api/case'
import { formatDate, formatCaseStage } from '@/utils/format'

const router = useRouter()

// 数据
const cases = ref([])
const projects = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 搜索和筛选
const searchKeyword = ref('')
const filterStage = ref('')
const filterProject = ref('')

// 导入对话框
const showImportDialog = ref(false)
const uploadRef = ref(null)

// 格式化阶段
function formatStage(stage) {
  return formatCaseStage(stage)
}

// 获取阶段类型
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

// 加载案件列表
async function loadCases() {
  loading.value = true
  try {
    const params = {
      skip: (currentPage.value - 1) * pageSize.value,
      limit: pageSize.value,
      search: searchKeyword.value,
      stage: filterStage.value,
      project_id: filterProject.value
    }
    const response = await getCases(params)
    cases.value = response.cases
    total.value = response.total
  } catch (error) {
    ElMessage.error('加载案件列表失败')
  } finally {
    loading.value = false
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

// 跳转到创建页面
function goToCreate() {
  router.push('/cases/create')
}

// 查看案件
function viewCase(id) {
  router.push(`/cases/${id}`)
}

// 编辑案件
function editCase(id) {
  router.push(`/cases/${id}`)
}

// 删除案件
async function deleteCase(id) {
  try {
    await ElMessageBox.confirm('确定要删除这个案件吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteCaseAPI(id)
    ElMessage.success('删除成功')
    loadCases()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 导出案件
async function exportCases() {
  try {
    const response = await exportCasesAPI({
      search: searchKeyword.value,
      stage: filterStage.value,
      project_id: filterProject.value
    })

    // 创建下载链接
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `案件导出_${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 导入成功
function handleImportSuccess(response) {
  ElMessage.success('导入成功')
  showImportDialog.value = false
  loadCases()
}

// 导入失败
function handleImportError(error) {
  ElMessage.error('导入失败')
}

// 页面加载时获取数据
onMounted(() => {
  loadCases()
  loadProjects()
})
</script>

<style scoped>
.cases-page {
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

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.case-list-card {
  border: 1px solid var(--color-border-light);
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.upload-area {
  margin-bottom: 20px;
}
</style>
