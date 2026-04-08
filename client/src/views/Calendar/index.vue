<template>
  <div class="calendar-page">
    <div class="page-header">
      <h2>日历待办</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showEventDialog = true">
          <el-icon><Plus /></el-icon>
          新建日程
        </el-button>
      </div>
    </div>

    <div class="calendar-layout">
      <!-- 日历视图 -->
      <el-card class="calendar-card">
        <el-calendar v-model="currentDate">
          <template #date-cell="{ data }">
            <div class="calendar-cell">
              <div class="date-number">{{ data.day.split('-').slice(2).join('-') }}</div>
              <div class="event-dots">
                <div
                  v-for="event in getEventsForDate(data.day)"
                  :key="event.id"
                  class="event-dot"
                  :class="`event-dot-${event.type}`"
                  :title="event.title"
                ></div>
              </div>
            </div>
          </template>
        </el-calendar>
      </el-card>

      <!-- 待办事项列表 -->
      <el-card class="todo-card">
        <template #header>
          <div class="card-header">
            <span>待办事项</span>
            <el-tag type="info" size="small">{{ todos.length }} 个</el-tag>
          </div>
        </template>

        <div class="todo-list">
          <div
            v-for="todo in todos"
            :key="todo.id"
            class="todo-item"
            :class="{ completed: todo.completed }"
          >
            <el-checkbox v-model="todo.completed" @change="toggleTodo(todo)">
              <span class="todo-title">{{ todo.title }}</span>
            </el-checkbox>
            <div class="todo-meta">
              <el-tag :type="getPriorityType(todo.priority)" size="small">
                {{ todo.priority }}
              </el-tag>
              <span class="todo-due">{{ formatDate(todo.due_date) }}</span>
            </div>
          </div>
          <el-empty v-if="todos.length === 0" description="暂无待办事项" />
        </div>
      </el-card>

      <!-- 即将开庭 -->
      <el-card class="upcoming-card">
        <template #header>
          <div class="card-header">
            <span>即将开庭</span>
            <el-tag type="warning" size="small">{{ upcomingCourts.length }} 个</el-tag>
          </div>
        </template>

        <div class="upcoming-list">
          <div v-for="event in upcomingCourts" :key="event.id" class="upcoming-item">
            <div class="upcoming-time">
              <el-icon><Clock /></el-icon>
              {{ formatDateTime(event.start_time) }}
            </div>
            <div class="upcoming-title">{{ event.title }}</div>
            <div class="upcoming-location">
              <el-icon><Location /></el-icon>
              {{ event.location }}
            </div>
          </div>
          <el-empty v-if="upcomingCourts.length === 0" description="暂无开庭安排" />
        </div>
      </el-card>
    </div>

    <!-- 新建日程对话框 -->
    <el-dialog v-model="showEventDialog" title="新建日程" width="600px">
      <el-form :model="eventForm" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="eventForm.title" placeholder="请输入标题" />
        </el-form-item>

        <el-form-item label="类型">
          <el-select v-model="eventForm.event_type" placeholder="请选择类型" style="width: 100%">
            <el-option label="开庭" value="court" />
            <el-option label="调解" value="mediation" />
            <el-option label="执行" value="execution" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="开始时间">
          <el-date-picker
            v-model="eventForm.start_time"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="结束时间">
          <el-date-picker
            v-model="eventForm.end_time"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="地点">
          <el-input v-model="eventForm.location" placeholder="请输入地点" />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="eventForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>

        <el-form-item label="关联案件">
          <el-select v-model="eventForm.case_id" placeholder="选择关联案件" clearable style="width: 100%">
            <el-option v-for="item in cases" :key="item.id" :label="item.debtor_name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="提醒时间">
          <el-date-picker
            v-model="eventForm.reminder_time"
            type="datetime"
            placeholder="选择提醒时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEventDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEvent">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { formatDate, formatDateTime } from '@/utils/format'
import { getCalendarEvents, createCalendarEvent, getTodos, createTodo, updateTodo } from '@/api/calendar'
import { getCases } from '@/api/case'

const currentDate = ref(new Date())
const showEventDialog = ref(false)

// 数据
const events = ref([])
const todos = ref([])
const upcomingCourts = ref([])
const cases = ref([])

// 事件表单
const eventForm = ref({
  title: '',
  event_type: 'court',
  start_time: '',
  end_time: '',
  location: '',
  description: '',
  case_id: null,
  reminder_time: ''
})

// 获取指定日期的事件
function getEventsForDate(date) {
  return events.value.filter(event => {
    const eventDate = event.start_time.split(' ')[0]
    return eventDate === date
  })
}

// 获取优先级类型
function getPriorityType(priority) {
  const typeMap = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'info'
  }
  return typeMap[priority] || ''
}

// 切换待办状态
async function toggleTodo(todo) {
  try {
    await updateTodo(todo.id, { completed: todo.completed })
    ElMessage.success('待办状态已更新')
  } catch (error) {
    console.error('更新待办失败:', error)
    ElMessage.error('更新失败，请重试')
    // 恢复原状态
    todo.completed = !todo.completed
  }
}

// 保存事件
async function saveEvent() {
  if (!eventForm.value.title) {
    ElMessage.warning('请输入标题')
    return
  }
  if (!eventForm.value.start_time) {
    ElMessage.warning('请选择开始时间')
    return
  }

  try {
    const eventData = {
      title: eventForm.value.title,
      event_type: eventForm.value.event_type,
      start_time: eventForm.value.start_time,
      end_time: eventForm.value.end_time || eventForm.value.start_time,
      location: eventForm.value.location,
      description: eventForm.value.description,
      case_id: eventForm.value.case_id,
      reminder_time: eventForm.value.reminder_time
    }

    const response = await createCalendarEvent(eventData)

    // 添加新事件到本地数组
    events.value.push({
      id: response.id || Date.now(),
      ...eventData
    })

    // 更新即将开庭列表
    updateUpcomingCourts()

    ElMessage.success('保存成功')
    showEventDialog.value = false

    // 重置表单
    eventForm.value = {
      title: '',
      event_type: 'court',
      start_time: '',
      end_time: '',
      location: '',
      description: '',
      case_id: null,
      reminder_time: ''
    }
  } catch (error) {
    console.error('保存事件失败:', error)
    ElMessage.error('保存失败，请重试')
  }
}

// 更新即将开庭列表
function updateUpcomingCourts() {
  const now = new Date()
  upcomingCourts.value = events.value
    .filter(event => event.event_type === 'court' && new Date(event.start_time) >= now)
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    .slice(0, 5)
}

// 加载数据
async function loadData() {
  try {
    // 加载事件
    const eventsResponse = await getCalendarEvents()
    events.value = eventsResponse.events || []

    // 加载待办事项
    const todosResponse = await getTodos()
    todos.value = todosResponse.todos || []

    // 加载案件列表（用于关联）
    const casesResponse = await getCases()
    cases.value = casesResponse.cases || []

    // 更新即将开庭列表
    updateUpcomingCourts()
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败，请刷新页面重试')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.calendar-page {
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

.calendar-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.calendar-card {
  border: 1px solid var(--color-border-light);
}

.todo-card,
.upcoming-card {
  border: 1px solid var(--color-border-light);
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calendar-cell {
  height: 60px;
  padding: 4px;
  position: relative;
}

.date-number {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.event-dots {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  cursor: pointer;
}

.event-dot-court {
  background: var(--color-primary);
}

.event-dot-mediation {
  background: var(--color-success);
}

.event-dot-execution {
  background: var(--color-warning);
}

.event-dot-other {
  background: var(--color-info);
}

.todo-list,
.upcoming-list {
  max-height: 400px;
  overflow-y: auto;
}

.todo-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item.completed .todo-title {
  text-decoration: line-through;
  color: var(--color-text-secondary);
}

.todo-title {
  font-size: 14px;
  color: var(--color-text-primary);
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

.upcoming-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.upcoming-item:last-child {
  border-bottom: none;
}

.upcoming-time,
.upcoming-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.upcoming-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}
</style>
