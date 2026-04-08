import api from './index'

// 获取AI状态
export function getAIStatus() {
  return api.get('/ai/status')
}

// 切换AI后端
export function switchAIBackend(backend) {
  return api.put('/ai/backend', { backend })
}

// AI对话
export async function chatAI(messages) {
  return await api.post('/ai/chat', messages)
}

// 分析文档
export async function analyzeDocument(documentId) {
  return await api.post('/ai/analyze/document', { document_id: documentId })
}

// 预测待办事项
export async function predictTodos(caseId) {
  return await api.post('/ai/predict/todos', { case_id: caseId })
}

// 智能搜索
export function smartSearch(query, context = '') {
  return api.post('/ai/search', null, {
    params: { query, context }
  })
}

// OCR识别传票
export function ocrSummons(file) {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/ai/ocr/summons', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000
  })
}

// 分析文档
export function analyzeDocument(documentId) {
  return api.post('/ai/analyze/document', { document_id: documentId })
}

// 预测待办事项
export function predictTodos(caseId) {
  return api.post('/ai/predict/todos', { case_id: caseId })
}
