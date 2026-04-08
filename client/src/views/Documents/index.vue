<template>
  <div class="documents-page">
    <div class="page-header">
      <h2>文档管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showUploadDialog = true">
          <el-icon><Plus /></el-icon>
          上传文档
        </el-button>
        <el-button @click="goToArchive">
          <el-icon><FolderOpened /></el-icon>
          一键归档
        </el-button>
      </div>
    </div>

    <!-- 文件夹和项目选择 -->
    <div class="filter-bar">
      <el-select v-model="selectedProject" placeholder="选择项目" clearable style="width: 200px" @change="loadDocuments">
        <el-option v-for="project in projects" :key="project.id" :label="project.name" :value="project.id" />
      </el-select>

      <el-select v-model="selectedCase" placeholder="选择案件" clearable style="width: 200px" @change="loadDocuments">
        <el-option v-for="item in cases" :key="item.id" :label="item.debtor_name" :value="item.id" />
      </el-select>

      <el-input
        v-model="searchKeyword"
        placeholder="搜索文档名称..."
        clearable
        style="width: 300px"
        @clear="loadDocuments"
        @keyup.enter="loadDocuments"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 文档列表 -->
    <el-card class="document-list-card">
      <el-table :data="documents" style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column label="文档名称" prop="title" min-width="200">
          <template #default="scope">
            <div class="document-name">
              <el-icon><Document /></el-icon>
              {{ scope.row.title }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" prop="document_type" width="120">
          <template #default="scope">
            <el-tag :type="getDocTypeTag(scope.row.document_type)" size="small">
              {{ getDocTypeName(scope.row.document_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="关联案件" prop="case_name" width="150" />
        <el-table-column label="文件大小" prop="file_size" width="120">
          <template #default="scope">
            {{ formatFileSize(scope.row.file_size) }}
          </template>
        </el-table-column>
        <el-table-column label="上传时间" prop="uploaded_at" width="150">
          <template #default="scope">
            {{ formatDateTime(scope.row.uploaded_at) }}
          </template>
        </el-table-column>
        <el-table-column label="归档状态" prop="is_archived" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_archived ? 'success' : 'info'" size="small">
              {{ scope.row.is_archived ? '已归档' : '未归档' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="previewDocument(scope.row)">预览</el-button>
            <el-button link type="primary" @click="downloadDocument(scope.row)">下载</el-button>
            <el-button link type="danger" @click="deleteDocument(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadDocuments"
          @current-change="loadDocuments"
        />
      </div>
    </el-card>

    <!-- 上传对话框 -->
    <el-dialog v-model="showUploadDialog" title="上传文档" width="600px">
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="选择文件">
          <el-upload
            ref="uploadRef"
            class="upload-demo"
            action="/api/documents/upload"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-success="handleUploadSuccess"
            :before-remove="beforeRemove"
            :auto-upload="false"
            :limit="5"
            :on-exceed="handleExceed"
            :file-list="fileList"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持PDF、Word、图片等格式，单个文件不超过10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="文档类型">
          <el-select v-model="uploadForm.document_type" placeholder="请选择文档类型" style="width: 100%">
            <el-option label="传票" value="summons" />
            <el-option label="起诉状" value="complaint" />
            <el-option label="判决书" value="judgment" />
            <el-option label="调解书" value="mediation" />
            <el-option label="证据材料" value="evidence" />
            <el-option label="委托合同" value="contract" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="关联案件">
          <el-select v-model="uploadForm.case_id" placeholder="选择关联案件" clearable style="width: 100%">
            <el-option v-for="item in cases" :key="item.id" :label="item.debtor_name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="文档标题">
          <el-input v-model="uploadForm.title" placeholder="请输入文档标题" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" @click="submitUpload">上传</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCases, getProjects } from '@/api/case'
import { formatDate, formatDateTime, formatFileSize } from '@/utils/format'

const router = useRouter()

// 数据
const documents = ref([])
const projects = ref([])
const cases = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 筛选
const selectedProject = ref(null)
const selectedCase = ref(null)
const searchKeyword = ref('')

// 上传
const showUploadDialog = ref(false)
const fileList = ref([])
const uploadForm = ref({
  document_type: '',
  case_id: null,
  title: ''
})

function getDocTypeName(type) {
  const typeMap = {
    'summons': '传票',
    'complaint': '起诉状',
    'judgment': '判决书',
    'mediation': '调解书',
    'evidence': '证据材料',
    'contract': '委托合同',
    'other': '其他'
  }
  return typeMap[type] || type
}

function getDocTypeTag(type) {
  const tagMap = {
    'summons': 'danger',
    'complaint': 'warning',
    'judgment': 'success',
    'mediation': 'primary',
    'evidence': 'info',
    'contract': '',
    'other': ''
  }
  return tagMap[type] || ''
}

function goToArchive() {
  router.push('/documents/archive')
}

async function loadDocuments() {
  loading.value = true
  try {
    // TODO: 调用API加载文档列表
    // 模拟数据
    documents.value = []
    total.value = 0
  } catch (error) {
    ElMessage.error('加载文档列表失败')
  } finally {
    loading.value = false
  }
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
    const response = await getCases({ limit: 100 })
    cases.value = response.cases
  } catch (error) {
    console.error('加载案件列表失败', error)
  }
}

function previewDocument(doc) {
  ElMessage.info('预览功能开发中')
}

function downloadDocument(doc) {
  ElMessage.info('下载功能开发中')
}

async function deleteDocument(id) {
  try {
    await ElMessageBox.confirm('确定要删除这个文档吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // TODO: 调用API删除文档
    ElMessage.success('删除成功')
    loadDocuments()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 上传相关
function handlePreview(file) {
  console.log('Preview:', file)
}

function handleRemove(file, fileList) {
  console.log('Remove:', file, fileList)
}

function handleUploadSuccess(response, file, fileList) {
  ElMessage.success('上传成功')
  showUploadDialog.value = false
  loadDocuments()
}

function beforeRemove(file) {
  return ElMessageBox.confirm(`确定移除 ${file.name}？`)
}

function handleExceed(files, fileList) {
  ElMessage.warning(`最多只能上传 5 个文件`)
}

function submitUpload() {
  // TODO: 提交上传
  ElMessage.success('上传成功')
  showUploadDialog.value = false
}

onMounted(() => {
  loadProjects()
  loadCases()
  loadDocuments()
})
</script>

<style scoped>
.documents-page {
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

.document-list-card {
  border: 1px solid var(--color-border-light);
}

.document-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>
