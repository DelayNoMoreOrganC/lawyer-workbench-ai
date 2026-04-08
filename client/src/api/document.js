import api from './index'

// 上传文档
export function uploadDocument(formData) {
  return api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000
  })
}

// 获取文档列表
export function getDocuments(params) {
  return api.get('/documents', { params })
}

// 获取文档详情
export function getDocument(id) {
  return api.get(`/documents/${id}`)
}

// 删除文档
export function deleteDocument(id) {
  return api.delete(`/documents/${id}`)
}

// 分析文档
export function analyzeDocument(documentId) {
  return api.post('/ai/analyze/document', { document_id: documentId })
}

// 归档文档
export function archiveDocuments(caseId, data) {
  return api.post(`/documents/archive`, {
    case_id: caseId,
    ...data
  })
}
