<template>
  <div class="settings-page">
    <div class="page-header">
      <h2>系统设置</h2>
    </div>

    <el-card>
      <el-tabs v-model="activeTab">
        <!-- 个人设置 -->
        <el-tab-pane label="个人设置" name="profile">
          <el-form :model="userProfile" label-width="120px" style="max-width: 600px">
            <el-form-item label="用户名">
              <el-input v-model="userProfile.username" disabled />
            </el-form-item>

            <el-form-item label="姓名">
              <el-input v-model="userProfile.full_name" placeholder="请输入姓名" />
            </el-form-item>

            <el-form-item label="邮箱">
              <el-input v-model="userProfile.email" placeholder="请输入邮箱" />
            </el-form-item>

            <el-form-item label="手机号">
              <el-input v-model="userProfile.phone" placeholder="请输入手机号" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveProfile">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 通知设置 -->
        <el-tab-pane label="通知设置" name="notification">
          <el-form label-width="160px" style="max-width: 600px">
            <el-form-item label="邮件通知">
              <el-switch v-model="notificationSettings.email" />
              <span class="setting-desc">接收重要事项的邮件通知</span>
            </el-form-item>

            <el-form-item label="开庭提醒">
              <el-switch v-model="notificationSettings.courtReminder" />
              <span class="setting-desc">开庭前1天发送邮件提醒</span>
            </el-form-item>

            <el-form-item label="待办提醒">
              <el-switch v-model="notificationSettings.todoReminder" />
              <span class="setting-desc">待办事项到期前发送提醒</span>
            </el-form-item>

            <el-form-item label="案件更新">
              <el-switch v-model="notificationSettings.caseUpdate" />
              <span class="setting-desc">案件状态更新时发送通知</span>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveNotificationSettings">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 数据管理 -->
        <el-tab-pane label="数据管理" name="data">
          <div class="data-section">
            <h3>数据同步</h3>
            <p class="section-desc">本地数据与云端同步</p>
            <div class="data-actions">
              <el-button @click="syncData" :loading="syncing">
                <el-icon><Refresh /></el-icon>
                立即同步
              </el-button>
              <span class="last-sync">上次同步：{{ lastSyncTime }}</span>
            </div>
          </div>

          <div class="data-section">
            <h3>数据导出</h3>
            <p class="section-desc">导出所有案件数据为Excel文件</p>
            <div class="data-actions">
              <el-button @click="exportAllData" :loading="exporting">
                <el-icon><Download /></el-icon>
                导出所有数据
              </el-button>
            </div>
          </div>

          <div class="data-section">
            <h3>数据清理</h3>
            <p class="section-desc">清除本地缓存数据</p>
            <div class="data-actions">
              <el-button type="danger" @click="clearCache">
                <el-icon><Delete /></el-icon>
                清除缓存
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <!-- 关于 -->
        <el-tab-pane label="关于" name="about">
          <div class="about-section">
            <h3>律师工作台AI应用</h3>
            <div class="version-info">
              <p>版本：1.0.0</p>
              <p>技术栈：Vue 3 + Element Plus + FastAPI</p>
            </div>

            <div class="feature-list">
              <h4>核心功能</h4>
              <ul>
                <li>✅ 案件全生命周期管理</li>
                <li>✅ 日历待办和开庭管理</li>
                <li>✅ AI智能搜索和文档分析</li>
                <li>✅ OCR传票识别</li>
                <li>✅ 一键归档和结案报告</li>
                <li>✅ 多用户协作</li>
                <li>✅ Excel导入导出</li>
              </ul>
            </div>

            <div class="contact-info">
              <h4>联系我们</h4>
              <p>技术支持：support@example.com</p>
              <p>项目地址：E:\LAI</p>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores'
import { formatDate } from '@/utils/format'

const userStore = useUserStore()
const activeTab = ref('profile')

// 个人资料
const userProfile = ref({
  username: '',
  full_name: '',
  email: '',
  phone: ''
})

// 通知设置
const notificationSettings = ref({
  email: true,
  courtReminder: true,
  todoReminder: true,
  caseUpdate: false
})

// 数据管理
const syncing = ref(false)
const exporting = ref(false)
const lastSyncTime = ref('从未同步')

function saveProfile() {
  ElMessage.success('保存成功')
}

function saveNotificationSettings() {
  ElMessage.success('保存成功')
}

async function syncData() {
  syncing.value = true
  try {
    // TODO: 调用同步API
    await new Promise(resolve => setTimeout(resolve, 2000))
    lastSyncTime.value = formatDate(new Date())
    ElMessage.success('同步成功')
  } catch (error) {
    ElMessage.error('同步失败')
  } finally {
    syncing.value = false
  }
}

async function exportAllData() {
  exporting.value = true
  try {
    // TODO: 调用导出API
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

function clearCache() {
  ElMessage.success('缓存已清除')
}

onMounted(() => {
  // 加载用户信息
  if (userStore.userInfo) {
    userProfile.value = {
      username: userStore.userInfo.username || '',
      full_name: userStore.userInfo.full_name || '',
      email: userStore.userInfo.email || '',
      phone: userStore.userInfo.phone || ''
    }
  }
})
</script>

<style scoped>
.settings-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.setting-desc {
  margin-left: 12px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.data-section {
  padding: 24px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.data-section:last-child {
  border-bottom: none;
}

.data-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.section-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.data-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.last-sync {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.about-section {
  padding: 24px;
}

.about-section h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.about-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
  margin-top: 24px;
}

.version-info p {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.feature-list ul {
  list-style: none;
  padding: 0;
}

.feature-list li {
  padding: 8px 0;
  font-size: 14px;
  color: var(--color-text-primary);
}

.contact-info p {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}
</style>
