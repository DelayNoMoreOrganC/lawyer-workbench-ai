import dayjs from 'dayjs'

// 日期格式化
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return ''
  return dayjs(date).format(format)
}

// 日期时间格式化
export function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  return dayjs(date).format(format)
}

// 相对时间
export function formatRelativeTime(date) {
  if (!date) return ''
  return dayjs(date).fromNow()
}

// 金额格式化
export function formatMoney(amount, decimals = 2) {
  if (amount === null || amount === undefined) return '0.00'
  return Number(amount).toFixed(decimals)
}

// 案件状态格式化
export function formatCaseStage(stage) {
  const stageMap = {
    'litigation': '诉讼中',
    'executing': '执行中',
    'terminated': '终本中',
    'closed': '结案',
    'mediation': '调解跟进'
  }
  return stageMap[stage] || stage
}

// 案件状态颜色
export function getCaseStageColor(stage) {
  const colorMap = {
    'litigation': '#1677FF',
    'executing': '#52C41A',
    'terminated': '#FAAD14',
    'closed': '#86909C',
    'mediation': '#722ED1'
  }
  return colorMap[stage] || '#1677FF'
}

// 文件大小格式化
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 截断文本
export function truncateText(text, maxLength = 50) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
