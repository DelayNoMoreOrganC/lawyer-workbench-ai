<template>
  <div class="ai-config-page">
    <div class="page-header">
      <h2>AI配置</h2>
      <div class="header-actions">
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存配置</el-button>
      </div>
    </div>

    <el-card>
      <el-form :model="config" label-width="160px">
        <!-- AI模式选择 -->
        <div class="form-section">
          <h3>AI模式选择</h3>
          <el-form-item label="当前模式">
            <el-radio-group v-model="config.mode">
              <el-radio label="deepseek">
                <div class="radio-label">
                  <div class="radio-title">DeepSeek API</div>
                  <div class="radio-desc">使用DeepSeek云端API，需要API密钥</div>
                </div>
              </el-radio>
              <el-radio label="ollama">
                <div class="radio-label">
                  <div class="radio-title">本地Ollama</div>
                  <div class="radio-desc">使用本地Ollama模型，无需联网</div>
                </div>
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- AI状态 -->
          <el-form-item label="AI服务状态">
            <div class="status-check">
              <el-tag :type="aiStatus.healthy ? 'success' : 'danger'">
                {{ aiStatus.healthy ? '正常' : '异常' }}
              </el-tag>
              <el-button @click="checkAIStatus" :loading="checking">重新检查</el-button>
            </div>
          </el-form-item>
        </div>

        <!-- DeepSeek配置 -->
        <div class="form-section" v-if="config.mode === 'deepseek'">
          <h3>DeepSeek API配置</h3>
          <el-form-item label="API密钥">
            <el-input
              v-model="config.deepseekApiKey"
              type="password"
              placeholder="请输入DeepSeek API密钥"
              show-password
              style="width: 400px"
            />
            <div class="form-tip">
              获取API密钥：<a href="https://platform.deepseek.com/" target="_blank">https://platform.deepseek.com/</a>
            </div>
          </el-form-item>

          <el-form-item label="API地址">
            <el-input
              v-model="config.deepseekApiUrl"
              placeholder="DeepSeek API地址"
              style="width: 400px"
            />
          </el-form-item>

          <el-form-item label="模型名称">
            <el-input
              v-model="config.deepseekModel"
              placeholder="如：deepseek-chat"
              style="width: 200px"
            />
          </el-form-item>
        </div>

        <!-- Ollama配置 -->
        <div class="form-section" v-if="config.mode === 'ollama'">
          <h3>Ollama本地配置</h3>
          <el-form-item label="服务地址">
            <el-input
              v-model="config.ollamaBaseUrl"
              placeholder="Ollama服务地址"
              style="width: 400px"
            />
            <div class="form-tip">
              默认地址：http://localhost:11434
            </div>
          </el-form-item>

          <el-form-item label="模型名称">
            <el-input
              v-model="config.ollamaModel"
              placeholder="如：qwen2.5:7b"
              style="width: 200px"
            />
            <div class="form-tip">
              常用模型：qwen2.5:7b, llama2:13b, mistral:7b
            </div>
          </el-form-item>

          <el-form-item label="已安装模型">
            <div class="model-list">
              <el-tag v-for="model in ollamaModels" :key="model" class="model-tag">
                {{ model }}
              </el-tag>
              <el-button @click="loadOllamaModels" :loading="loadingModels">刷新模型列表</el-button>
            </div>
          </el-form-item>
        </div>

        <!-- 功能开关 -->
        <div class="form-section">
          <h3>AI功能开关</h3>
          <el-form-item label="智能搜索">
            <el-switch v-model="features.smartSearch" />
            <span class="feature-desc">启用自然语言搜索案件</span>
          </el-form-item>

          <el-form-item label="文档分析">
            <el-switch v-model="features.documentAnalysis" />
            <span class="feature-desc">自动分析上传的文档内容</span>
          </el-form-item>

          <el-form-item label="待办预测">
            <el-switch v-model="features.todoPrediction" />
            <span class="feature-desc">基于案件状态自动预测待办事项</span>
          </el-form-item>

          <el-form-item label="OCR识别">
            <el-switch v-model="features.ocrRecognition" />
            <span class="feature-desc">自动识别传票等法律文书</span>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <!-- 测试对话框 -->
    <el-dialog v-model="showTestDialog" title="测试AI服务" width="600px">
      <el-form label-width="100px">
        <el-form-item label="测试消息">
          <el-input
            v-model="testMessage"
            type="textarea"
            :rows="4"
            placeholder="输入测试消息，如：帮我搜索关于合同纠纷的案件"
          />
        </el-form-item>
      </el-form>

      <div class="test-result" v-if="testResult">
        <div class="result-label">AI回复：</div>
        <div class="result-content">{{ testResult }}</div>
      </div>

      <template #footer>
        <el-button @click="showTestDialog = false">关闭</el-button>
        <el-button type="primary" @click="testAI" :loading="testing">发送测试</el-button>
      </template>
    </el-dialog>

    <!-- 测试按钮 -->
    <div class="test-actions">
      <el-button @click="showTestDialog = true">测试AI服务</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAIStore } from '@/stores'
import { getAIStatus, switchAIBackend, chatAI } from '@/api/ai'

const router = useRouter()
const aiStore = useAIStore()

const saving = ref(false)
const checking = ref(false)
const testing = ref(false)
const loadingModels = ref(false)
const showTestDialog = ref(false)

const aiStatus = ref({
  mode: 'deepseek',
  healthy: false,
  available_modes: ['deepseek', 'ollama'],
  deepseek_configured: false,
  ollama_available: false
})

const ollamaModels = ref([])

const config = reactive({
  mode: aiStore.config.mode,
  deepseekApiKey: '',
  deepseekApiUrl: 'https://api.deepseek.com/v1',
  deepseekModel: 'deepseek-chat',
  ollamaBaseUrl: 'http://localhost:11434',
  ollamaModel: 'qwen2.5:7b'
})

const features = reactive({
  smartSearch: true,
  documentAnalysis: true,
  todoPrediction: true,
  ocrRecognition: true
})

const testMessage = ref('')
const testResult = ref('')

function goBack() {
  router.push('/ai')
}

async function checkAIStatus() {
  checking.value = true
  try {
    aiStatus.value = await getAIStatus()
  } catch (error) {
    ElMessage.error('检查AI状态失败')
  } finally {
    checking.value = false
  }
}

async function loadOllamaModels() {
  loadingModels.value = true
  try {
    // TODO: 调用Ollama API获取模型列表
    ollamaModels.value = ['qwen2.5:7b', 'llama2:13b']
  } catch (error) {
    ElMessage.error('加载模型列表失败')
  } finally {
    loadingModels.value = false
  }
}

async function handleSave() {
  saving.value = true
  try {
    // 切换模式
    if (config.mode !== aiStore.config.mode) {
      await switchAIBackend(config.mode)
    }

    // 保存配置到Store
    aiStore.setConfig({
      deepseekApiKey: config.deepseekApiKey,
      deepseekApiUrl: config.deepseekApiUrl,
      deepseekModel: config.deepseekModel,
      ollamaBaseUrl: config.ollamaBaseUrl,
      ollamaModel: config.ollamaModel
    })

    ElMessage.success('配置保存成功')
  } catch (error) {
    ElMessage.error('保存配置失败')
  } finally {
    saving.value = false
  }
}

async function testAI() {
  if (!testMessage.value) {
    ElMessage.warning('请输入测试消息')
    return
  }

  testing.value = true
  try {
    const messages = [
      { role: 'system', content: '你是一个法律助手' },
      { role: 'user', content: testMessage.value }
    ]
    const response = await chatAI(messages)
    testResult.value = response.response
  } catch (error) {
    ElMessage.error('测试失败')
  } finally {
    testing.value = false
  }
}

onMounted(() => {
  checkAIStatus()
  if (config.mode === 'ollama') {
    loadOllamaModels()
  }
})
</script>

<style scoped>
.ai-config-page {
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
  margin-bottom: 20px;
}

.radio-label {
  margin-left: 8px;
}

.radio-title {
  font-weight: 500;
  color: var(--color-text-primary);
}

.radio-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.status-check {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-tip {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.model-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.model-tag {
  margin: 0;
}

.feature-desc {
  margin-left: 12px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.test-actions {
  margin-top: 24px;
  text-align: center;
}

.test-result {
  margin-top: 20px;
  padding: 16px;
  background: var(--color-bg);
  border-radius: var(--radius-md);
}

.result-label {
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--color-text-primary);
}

.result-content {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
}
</style>
