import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('token') || '')

  function setUserInfo(info) {
    userInfo.value = info
  }

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function logout() {
    userInfo.value = null
    token.value = ''
    localStorage.removeItem('token')
  }

  return {
    userInfo,
    token,
    setUserInfo,
    setToken,
    logout
  }
})

export const useCaseStore = defineStore('case', () => {
  const cases = ref([])
  const currentCase = ref(null)
  const projects = ref([])

  function setCases(caseList) {
    cases.value = caseList
  }

  function setCurrentCase(caseInfo) {
    currentCase.value = caseInfo
  }

  function setProjects(projectList) {
    projects.value = projectList
  }

  return {
    cases,
    currentCase,
    projects,
    setCases,
    setCurrentCase,
    setProjects
  }
})

export const useAIStore = defineStore('ai', () => {
  const config = ref({
    mode: localStorage.getItem('ai_mode') || 'deepseek', // deepseek or ollama
    deepseekApiKey: '',
    deepseekApiUrl: 'https://api.deepseek.com/v1',
    ollamaBaseUrl: 'http://localhost:11434',
    ollamaModel: 'qwen2.5:7b'
  })

  function setConfig(newConfig) {
    config.value = { ...config.value, ...newConfig }
    localStorage.setItem('ai_mode', config.value.mode)
  }

  function switchMode(mode) {
    config.value.mode = mode
    localStorage.setItem('ai_mode', mode)
  }

  return {
    config,
    setConfig,
    switchMode
  }
})

export const useCollaborationStore = defineStore('collaboration', () => {
  const onlineUsers = ref([])
  const editingUsers = ref({})

  function setOnlineUsers(users) {
    onlineUsers.value = users
  }

  function addOnlineUser(user) {
    if (!onlineUsers.value.find(u => u.id === user.id)) {
      onlineUsers.value.push(user)
    }
  }

  function removeOnlineUser(userId) {
    onlineUsers.value = onlineUsers.value.filter(u => u.id !== userId)
  }

  function setEditingField(userId, field) {
    editingUsers.value[userId] = field
  }

  function removeEditingField(userId) {
    delete editingUsers.value[userId]
  }

  return {
    onlineUsers,
    editingUsers,
    setOnlineUsers,
    addOnlineUser,
    removeOnlineUser,
    setEditingField,
    removeEditingField
  }
})
