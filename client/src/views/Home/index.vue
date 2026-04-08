<template>
  <div class="home">
    <div class="welcome-banner">
      <h1>欢迎使用律师工作台AI应用</h1>
      <p>智能案件管理 · AI辅助办案 · 高效团队协作</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: #E6F4FF;">
          <el-icon color="#1677FF" :size="32"><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalCases }}</div>
          <div class="stat-label">全部案件</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #F6FFED;">
          <el-icon color="#52C41A" :size="32"><Clock /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.activeCases }}</div>
          <div class="stat-label">进行中案件</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #FFF7E6;">
          <el-icon color="#FAAD14" :size="32"><Calendar /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.upcomingCourts }}</div>
          <div class="stat-label">即将开庭</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #F9F0FF;">
          <el-icon color="#722ED1" :size="32"><MagicStick /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.aiAssisted }}</div>
          <div class="stat-label">AI辅助次数</div>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <div class="section">
        <h3>最近案件</h3>
        <el-card class="case-list">
          <div v-for="item in recentCases" :key="item.id" class="case-item">
            <router-link :to="`/cases/${item.id}`" class="case-link">
              <div class="case-title">{{ item.debtor_name }}</div>
              <div class="case-meta">
                <el-tag :type="getStageType(item.stage)" size="small">
                  {{ formatStage(item.stage) }}
                </el-tag>
                <span class="case-date">{{ formatDate(item.updated_at) }}</span>
              </div>
            </router-link>
          </div>
          <el-empty v-if="recentCases.length === 0" description="暂无案件" />
        </el-card>
      </div>

      <div class="section">
        <h3>即将开庭</h3>
        <el-card class="court-list">
          <div v-for="event in upcomingCourts" :key="event.id" class="court-item">
            <div class="court-title">{{ event.title }}</div>
            <div class="court-time">
              <el-icon><Clock /></el-icon>
              {{ formatDateTime(event.start_time) }}
            </div>
            <div class="court-location">
              <el-icon><Location /></el-icon>
              {{ event.location }}
            </div>
          </div>
          <el-empty v-if="upcomingCourts.length === 0" description="暂无开庭安排" />
        </el-card>
      </div>

      <div class="section">
        <h3>待办事项</h3>
        <el-card class="todo-list">
          <div v-for="todo in todos" :key="todo.id" class="todo-item">
            <el-checkbox v-model="todo.completed" @change="toggleTodo(todo)">
              <span :class="{ completed: todo.completed }">{{ todo.title }}</span>
            </el-checkbox>
            <div class="todo-meta">
              <el-tag size="small" :type="getPriorityType(todo.priority)">
                {{ todo.priority }}
              </el-tag>
              <span class="todo-due">{{ formatDate(todo.due_date) }}</span>
            </div>
          </div>
          <el-empty v-if="todos.length === 0" description="暂无待办事项" />
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatDate, formatDateTime, formatCaseStage } from '@/utils/format'

const stats = ref({
  totalCases: 0,
  activeCases: 0,
  upcomingCourts: 0,
  aiAssisted: 0
})

const recentCases = ref([])
const upcomingCourts = ref([])
const todos = ref([])

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

function toggleTodo(todo) {
  // TODO: 更新待办状态
  console.log('Toggle todo:', todo)
}

onMounted(async () => {
  // TODO: 加载首页数据
  console.log('Home mounted')
})
</script>

<style scoped>
.home {
  max-width: 1400px;
  margin: 0 auto;
}

.welcome-banner {
  background: linear-gradient(135deg, var(--color-primary) 0%, #40a9ff 100%);
  color: white;
  padding: 48px 24px;
  border-radius: var(--radius-xl);
  text-align: center;
  margin-bottom: 32px;
}

.welcome-banner h1 {
  font-size: 36px;
  margin-bottom: 12px;
  font-weight: 600;
}

.welcome-banner p {
  font-size: 18px;
  opacity: 0.9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.section h3 {
  font-size: var(--font-size-lg);
  margin-bottom: 16px;
  color: var(--color-text-primary);
}

.case-list,
.court-list,
.todo-list {
  border: 1px solid var(--color-border-light);
}

.case-item,
.court-item,
.todo-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.case-item:last-child,
.court-item:last-child,
.todo-item:last-child {
  border-bottom: none;
}

.case-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.case-title {
  font-size: var(--font-size-md);
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--color-text-primary);
}

.case-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.case-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.court-title {
  font-size: var(--font-size-md);
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--color-text-primary);
}

.court-time,
.court-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.todo-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.todo-item .completed {
  text-decoration: line-through;
  color: var(--color-text-secondary);
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 24px;
}

.todo-due {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
</style>
