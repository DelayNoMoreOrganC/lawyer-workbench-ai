import api from './index'

// 获取案件列表
export function getCases(params) {
  return api.get('/cases', { params })
}

// 获取案件详情
export function getCaseDetail(id) {
  return api.get(`/cases/${id}`)
}

// 创建案件
export function createCase(data) {
  return api.post('/cases', data)
}

// 更新案件
export function updateCase(id, data) {
  return api.put(`/cases/${id}`, data)
}

// 删除案件
export function deleteCase(id) {
  return api.delete(`/cases/${id}`)
}

// 导入案件Excel
export function importCases(file) {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/cases/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000
  })
}

// 导出案件Excel
export function exportCases(params) {
  return api.get('/cases/export', {
    params,
    responseType: 'blob'
  })
}

// 导入案件Excel
export function importCases(file) {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/cases/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取项目列表
export function getProjects() {
  return api.get('/projects')
}

// 创建项目
export function createProject(data) {
  return api.post('/projects', data)
}

// 搜索案件
export function searchCases(query) {
  return api.post('/cases/search', { query })
}
