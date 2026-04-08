import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/layout/Layout.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home/index.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: () => import('@/views/Calendar/index.vue'),
        meta: { title: '日历待办' }
      },
      {
        path: 'cases',
        name: 'Cases',
        component: () => import('@/views/Cases/index.vue'),
        meta: { title: '案件管理' }
      },
      {
        path: 'cases/:id',
        name: 'CaseDetail',
        component: () => import('@/views/Cases/CaseDetail.vue'),
        meta: { title: '案件详情' }
      },
      {
        path: 'cases/create',
        name: 'CaseCreate',
        component: () => import('@/views/Cases/CaseEdit.vue'),
        meta: { title: '创建案件' }
      },
      {
        path: 'court',
        name: 'Court',
        component: () => import('@/views/Court/index.vue'),
        meta: { title: '开庭管理' }
      },
      {
        path: 'documents',
        name: 'Documents',
        component: () => import('@/views/Documents/index.vue'),
        meta: { title: '文档管理' }
      },
      {
        path: 'documents/archive',
        name: 'Archive',
        component: () => import('@/views/Documents/Archive.vue'),
        meta: { title: '归档功能' }
      },
      {
        path: 'ai',
        name: 'AI',
        component: () => import('@/views/AI/index.vue'),
        meta: { title: 'AI助手' }
      },
      {
        path: 'ai/config',
        name: 'AIConfig',
        component: () => import('@/views/AI/Config.vue'),
        meta: { title: 'AI配置' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings/index.vue'),
        meta: { title: '系统设置' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 律师工作台` : '律师工作台'
  next()
})

export default router
