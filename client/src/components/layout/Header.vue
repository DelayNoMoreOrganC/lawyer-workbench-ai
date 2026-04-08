<template>
  <header class="header">
    <div class="header-left">
      <h1 class="logo">律师工作台</h1>
    </div>
    <nav class="header-nav">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
      >
        <el-icon>
          <component :is="item.icon" />
        </el-icon>
        <span>{{ item.title }}</span>
      </router-link>
    </nav>
    <div class="header-right">
      <el-button circle @click="toggleAIConfig">
        <el-icon><Setting /></el-icon>
      </el-button>
      <el-dropdown>
        <div class="user-info">
          <el-avatar :size="32" :src="userInfo?.avatar">
            {{ userInfo?.name?.charAt(0) }}
          </el-avatar>
          <span class="user-name">{{ userInfo?.name || '律师' }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="goToSettings">系统设置</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore, useAIStore } from '@/stores'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const aiStore = useAIStore()

const userInfo = computed(() => userStore.userInfo)

const menuItems = [
  { path: '/home', title: '首页', icon: 'House' },
  { path: '/calendar', title: '日历待办', icon: 'Calendar' },
  { path: '/cases', title: '案件管理', icon: 'Document' },
  { path: '/court', title: '开庭管理', icon: 'Location' },
  { path: '/documents', title: '文档管理', icon: 'Folder' },
  { path: '/ai', title: 'AI助手', icon: 'MagicStick' }
]

function isActive(path) {
  return route.path.startsWith(path)
}

function toggleAIConfig() {
  router.push('/ai/config')
}

function goToSettings() {
  router.push('/settings')
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    userStore.logout()
    router.push('/login')
  } catch (error) {
    // 用户取消
  }
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  padding: 0 24px;
  z-index: 1000;
}

.header-left {
  flex-shrink: 0;
}

.logo {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-primary);
  margin: 0;
}

.header-nav {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.nav-item.active {
  background: var(--color-primary);
  color: white;
}

.header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.user-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}
</style>
