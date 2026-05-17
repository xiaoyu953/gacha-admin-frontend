<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const isCollapse = computed(() => appStore.sidebarCollapsed)

const menuItems = [
  { path: '/dashboard', title: '首页', icon: 'HomeFilled' },
  {
    title: '系统管理', icon: 'Setting', children: [
      { path: '/system/users', title: '用户管理' },
      { path: '/system/roles', title: '角色管理' },
      { path: '/system/permissions', title: '权限管理' },
    ],
  },
  {
    title: '内容管理', icon: 'Document', children: [
      { path: '/content/tag-types', title: '标签类型' },
      { path: '/content/tags', title: '标签管理' },
      { path: '/content/adverts', title: '广告管理' },
    ],
  },
  {
    title: '商品管理', icon: 'Goods', children: [
      { path: '/product/list', title: '商品列表' },
    ],
  },
  {
    title: '订单管理', icon: 'List', children: [
      { path: '/order/list', title: '订单列表' },
    ],
  },
]

function handleSelect(path: string) {
  router.push(path)
}

async function handleLogout() {
  await ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' })
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <div class="logo">
        <span v-if="!isCollapse">52toys 管理后台</span>
        <span v-else>52</span>
      </div>

      <el-menu
        :default-active="route.path"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        @select="handleSelect"
      >
        <template v-for="item in menuItems" :key="item.path || item.title">
          <el-sub-menu v-if="item.children" :index="item.title">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="child.path"
            >
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item v-else :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="appStore.toggleSidebar()">
            <Fold v-if="!isCollapse" /><Expand v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleLogout">
            <span class="user-name">
              {{ userStore.userInfo?.realName || userStore.userInfo?.username || '管理员' }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container { height: 100vh; }
.layout-aside { background-color: #304156; overflow-y: auto; }
.logo { height: 60px; line-height: 60px; text-align: center; color: #fff; font-size: 18px; font-weight: bold; white-space: nowrap; }
.layout-header { background: #fff; border-bottom: 1px solid #e6e6e6; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; }
.collapse-btn { font-size: 20px; cursor: pointer; }
.user-name { cursor: pointer; display: flex; align-items: center; gap: 4px; }
.layout-main { background: #f0f2f5; overflow-y: auto; }
</style>
