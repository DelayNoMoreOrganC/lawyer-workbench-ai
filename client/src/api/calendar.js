import api from './index'

// 获取日历事件
export function getCalendarEvents(params) {
  return api.get('/calendar/events', { params })
}

// 创建日历事件
export function createCalendarEvent(data) {
  return api.post('/calendar/events', data)
}

// 更新日历事件
export function updateCalendarEvent(id, data) {
  return api.put(`/calendar/events/${id}`, data)
}

// 删除日历事件
export function deleteCalendarEvent(id) {
  return api.delete(`/calendar/events/${id}`)
}

// 获取待办事项
export function getTodos(params) {
  return api.get('/calendar/todos', { params })
}

// 创建待办事项
export function createTodo(data) {
  return api.post('/calendar/todos', data)
}

// 更新待办事项
export function updateTodo(id, data) {
  return api.put(`/calendar/todos/${id}`, data)
}

// 删除待办事项
export function deleteTodo(id) {
  return api.delete(`/calendar/todos/${id}`)
}
