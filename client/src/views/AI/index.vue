<template>
  <div class="ai-page">
    <div class="page-header">
      <h2>AI助手</h2>
      <div class="header-actions">
        <el-button @click="goToConfig">
          <el-icon><Setting /></el-icon>
          AI配置
        </el-button>
      </div>
    </div>

    <div class="ai-layout">
      <!-- 功能卡片 -->
      <div class="feature-grid">
        <el-card class="feature-card" @click="showOCRDialog = true">
          <div class="feature-icon" style="background: #E6F4FF;">
            <el-icon color="#1677FF" :size="32"><Document /></el-icon>
          </div>
          <div class="feature-content">
            <h3>OCR传票识别</h3>
            <p>拖拽上传传票图片，自动识别案件信息</p>
          </div>
        </el-card>

        <el-card class="feature-card" @click="showSearchDialog = true">
          <div class="feature-icon" style="background: #F6FFED;">
            <el-icon color="#52C41A" :size="32"><Search /></el-icon>
          </div>
          <div class="feature-content">
            <h3>智能搜索</h3>
            <p>使用自然语言搜索案件信息</p>
          </div>
        </el-card>

        <el-card class="feature-card" @click="showDocAnalysisDialog = true">
          <div class="feature-icon" style="background: #FFF7E6;">
            <el-icon color="#FAAD14" :size="32"><FolderOpened /></el-icon>
          </div>
          <div class="feature-content">
            <h3>文档分析</h3>
            <p>自动分析文档内容并提取关键信息</p>
          </div>
        </el-card>

        <el-card class="feature-card" @click="showTodoDialog = true">
          <div class="feature-icon" style="background: #F9F0FF;">
            <el-icon color="#722ED1" :size="32"><Calendar /></el-icon>
          </div>
          <div class="feature-content">
            <h3>待办预测</h3>
            <p>基于案件状态自动生成待办事项</p>
          </div>
        </el-card>
      </div>

      <!-- AI对话 -->
      <el-card class="chat-card">
        <template #header>
          <div class="chat-header">
            <span>AI对话助手</span>
            <el-tag :type="aiStatus.healthy ? 'success' : 'danger'" size="small">
              {{ aiStatus.healthy ? '在线' : '离线' }}
            </el-tag>
          </div>
        </template>

        <div class="chat-messages" ref="messagesRef">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="message"
            :class="message.role"
          >
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">{{ formatTime(message.time) }}</div>
          </div>
          <div v-if="typing" class="message assistant typing">
            <div class="message-content">正在输入...</div>
          </div>
        </div>

        <div class="chat-input">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="3"
            placeholder="输入你的问题，如：帮我搜索关于合同纠纷的案件..."
            @keyup.ctrl.enter="sendMessage"
          />
          <div class="input-actions">
            <span class="input-tip">Ctrl + Enter 发送</span>
            <el-button
              type="primary"
              @click="sendMessage"
              :loading="sending"
              :disabled="!inputMessage.trim()"
            >
              发送
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- OCR识别对话框 -->
    <el-dialog v-model="showOCRDialog" title="OCR传票识别" width="700px">
      <OCRUpload />
    </el-dialog>

    <!-- 智能搜索对话框 -->
    <el-dialog v-model="showSearchDialog" title="智能搜索" width="600px">
      <el-form label-width="80px">
        <el-form-item label="搜索问题">
          <el-input
            v-model="searchQuery"
            type="textarea"
            :rows="4"
            placeholder="输入自然语言搜索，如：上个月的离婚案件有哪些？"
          />
        </el-form-item>
      </el-form>

      <div class="search-results" v-if="searchResults.length > 0">
        <div class="results-header">搜索结果（{{ searchResults.length }}）</div>
        <div class="result-list">
          <div v-for="result in searchResults" :key="result.id" class="result-item">
            <div class="result-title">{{ result.debtor_name }}</div>
            <div class="result-meta">
              <el-tag :type="getStageType(result.stage)" size="small">
                {{ formatStage(result.stage) }}
              </el-tag>
              <span class="result-case">{{ result.trial_case_number || result.execution_case_number }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showSearchDialog = false">关闭</el-button>
        <el-button type="primary" @click="handleSearch" :loading="searching">搜索</el-button>
      </template>
    </el-dialog>

    <!-- 文档分析对话框 -->
    <el-dialog v-model="showDocAnalysisDialog" title="文档分析" width="600px">
      <el-upload
        drag
        action="/api/ai/analyze/document"
        accept=".pdf,.doc,.docx"
        :on-success="handleDocAnalysisSuccess"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">拖拽文档到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">支持PDF、Word格式，自动分析文档内容</div>
        </template>
      </el-upload>

      <div v-if="analysisResult" class="analysis-result">
        <div class="result-header">分析结果</div>
        <div class="result-content">{{ analysisResult }}</div>
      </div>

      <template #footer>
        <el-button @click="showDocAnalysisDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 待办预测对话框 -->
    <el-dialog v-model="showTodoDialog" title="待办预测" width="600px">
      <el-form label-width="100px">
        <el-form-item label="选择案件">
          <el-select v-model="predictCaseId" placeholder="选择要预测待办的案件" style="width: 100%">
            <el-option v-for="item in cases" :key="item.id" :label="item.debtor_name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>

      <div v-if="predictedTodos.length > 0" class="predicted-todos">
        <div class="result-header">预测的待办事项（{{ predictedTodos.length }}）</div>
        <div class="todo-list">
          <div v-for="todo in predictedTodos" :key="todo.id" class="todo-item">
            <el-checkbox>{{ todo.title }}</el-checkbox>
            <div class="todo-meta">
              <el-tag :type="getPriorityType(todo.priority)" size="small">
                {{ todo.priority }}
              </el-tag>
              <span class="todo-due">{{ formatDate(todo.due_date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showTodoDialog = false">关闭</el-button>
        <el-button type="primary" @click="handlePredictTodos" :loading="predicting">预测</el-button>
        <el-button v-if="predictedTodos.length > 0" type="success" @click="addPredictedTodos">添加到待办</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAIStatus, smartSearch, analyzeDocument, predictTodos } from '@/api/ai'
import { getCases } from '@/api/case'
import { formatDate, formatCaseStage } from '@/utils/format'
import OCRUpload from '@/components/ai/OCRUpload.vue'

const router = useRouter()
const messagesRef = ref(null)

// 对话消息
const messages = ref([
  {
    role: 'assistant',
    content: '你好！我是AI助手，可以帮你搜索案件、分析文档、识别传票等。有什么可以帮你的吗？',
    time: new Date()
  }
])

const inputMessage = ref('')
const sending = ref(false)
const typing = ref(false)

// AI状态
const aiStatus = ref({
  mode: 'deepseek',
  healthy: false
})

// 功能对话框
const showOCRDialog = ref(false)
const showSearchDialog = ref(false)
const showDocAnalysisDialog = ref(false)
const showTodoDialog = ref(false)

// 搜索
const searchQuery = ref('')
const searching = ref(false)
const searchResults = ref([])

// 文档分析
const analysisResult = ref('')

// 待办预测
const predictCaseId = ref(null)
const predicting = ref(false)
const predictedTodos = ref([])
const cases = ref([])

function goToConfig() {
  router.push('/ai/config')
}

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

function getPriorityType(priority) {
  const typeMap = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'info'
  }
  return typeMap[priority] || ''
}

function formatTime(date) {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

async function sendMessage() {
  if (!inputMessage.value.trim()) return

  const userMessage = {
    role: 'user',
    content: inputMessage.value,
    time: new Date()
  }

  messages.value.push(userMessage)
  const query = inputMessage.value
  inputMessage.value = ''

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  // 显示输入状态
  typing.value = true
  sending.value = true

  try {
    const messages_ai = messages.value.map(m => ({
      role: m.role,
      content: m.content
    }))

    const response = await chatAI(messages_ai)

    typing.value = false
    messages.value.push({
      role: 'assistant',
      content: response.response,
      time: new Date()
    })

    await nextTick()
    scrollToBottom()
  } catch (error) {
    typing.value = false
    ElMessage.error('发送失败，请检查AI配置')
  } finally {
    sending.value = false
  }
}

function scrollToBottom() {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

async function handleSearch() {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索问题')
    return
  }

  searching.value = true
  try {
    const response = await smartSearch(searchQuery.value)
    searchResults.value = response.results
  } catch (error) {
    ElMessage.error('搜索失败')
  } finally {
    searching.value = false
  }
}

function handleDocAnalysisSuccess(response) {
  analysisResult.value = response.result || '分析完成'
  ElMessage.success('文档分析完成')
}

async function handlePredictTodos() {
  if (!predictCaseId.value) {
    ElMessage.warning('请选择案件')
    return
  }

  predicting.value = true
  try {
    const response = await predictTodos(predictCaseId.value)
    predictedTodos.value = response.todos || []
  } catch (error) {
    ElMessage.error('预测失败')
  } finally {
    predicting.value = false
  }
}

function addPredictedTodos() {
  ElMessage.success('已添加到待办事项')
  showTodoDialog.value = false
}

async function loadCases() {
  try {
    const response = await getCases({ limit: 100 })
    cases.value = response.cases
  } catch (error) {
    console.error('加载案件列表失败', error)
  }
}

async function checkAIStatus() {
  try {
    aiStatus.value = await getAIStatus()
  } catch (error) {
    console.error('获取AI状态失败', error)
  }
}

onMounted(() => {
  checkAIStatus()
  loadCases()
})
</script>

<style scoped>
.ai-page {
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

.ai-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.feature-card {
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--color-border-light);
}

.feature-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.feature-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.feature-content p {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.chat-card {
  border: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-messages {
  flex: 1;
  min-height: 400px;
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  margin-bottom: 16px;
}

.message {
  margin-bottom: 16px;
}

.message.user {
  text-align: right;
}

.message.user .message-content {
  background: var(--color-primary);
  color: white;
  display: inline-block;
  padding: 8px 16px;
  border-radius: 12px 12px 0 12px;
  max-width: 80%;
}

.message.assistant .message-content {
  background: white;
  color: var(--color-text-primary);
  display: inline-block;
  padding: 8px 16px;
  border-radius: 12px 12px 12px 0;
  max-width: 80%;
  border: 1px solid var(--color-border-light);
}

.message.typing .message-content {
  background: white;
  color: var(--color-text-secondary);
  font-style: italic;
}

.message-time {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.chat-input {
  border-top: 1px solid var(--color-border-light);
  padding-top: 16px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.input-tip {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.search-results,
.analysis-result,
.predicted-todos {
  margin-top: 20px;
}

.results-header,
.result-header {
  font-weight: 500;
  margin-bottom: 12px;
  color: var(--color-text-primary);
}

.result-list {
  max-height: 300px;
  overflow-y: auto;
}

.result-item {
  padding: 12px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
}

.result-title {
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--color-text-primary);
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-case {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.result-content {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
}

.todo-list {
  max-height: 300px;
  overflow-y: auto;
}

.todo-item {
  padding: 12px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  margin-left: 24px;
}

.todo-due {
  font-size: 12px;
  color: var(--color-text-secondary);
}
</style>
