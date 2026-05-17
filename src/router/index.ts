import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/stores/user'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: DefaultLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '首页', icon: 'HomeFilled' },
      },
      {
        path: 'system/users',
        name: 'SystemUsers',
        component: () => import('@/views/system/user/UserList.vue'),
        meta: { title: '用户管理', icon: 'User', roles: ['SUPER_ADMIN'] },
      },
      {
        path: 'system/roles',
        name: 'SystemRoles',
        component: () => import('@/views/system/role/RoleList.vue'),
        meta: { title: '角色管理', icon: 'Avatar', roles: ['SUPER_ADMIN'] },
      },
      {
        path: 'system/permissions',
        name: 'SystemPermissions',
        component: () => import('@/views/system/permission/PermissionList.vue'),
        meta: { title: '权限管理', icon: 'Lock', roles: ['SUPER_ADMIN'] },
      },
      {
        path: 'content/tag-types',
        name: 'ContentTagTypes',
        component: () => import('@/views/content/TagTypeList.vue'),
        meta: { title: '标签类型', icon: 'Collection' },
      },
      {
        path: 'content/tags',
        name: 'ContentTags',
        component: () => import('@/views/content/TagList.vue'),
        meta: { title: '标签管理', icon: 'PriceTag' },
      },
      {
        path: 'content/adverts',
        name: 'ContentAdverts',
        component: () => import('@/views/content/AdvertList.vue'),
        meta: { title: '广告管理', icon: 'Notification' },
      },
      {
        path: 'content/banners',
        name: 'ContentBanners',
        component: () => import('@/views/content/BannerList.vue'),
        meta: { title: 'Banner管理', icon: 'PictureFilled' },
      },
      {
        path: 'product/list',
        name: 'ProductList',
        component: () => import('@/views/product/ProductList.vue'),
        meta: { title: '商品列表', icon: 'Goods' },
      },
      {
        path: 'order/list',
        name: 'OrderList',
        component: () => import('@/views/order/OrderList.vue'),
        meta: { title: '订单列表', icon: 'List' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  if (to.meta.requiresAuth === false) {
    next()
    return
  }

  const token = getToken()
  if (!token) {
    next('/login')
    return
  }

  const userStore = useUserStore()

  // fetch user info if not loaded
  if (!userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
    } catch {
      userStore.logout()
      next('/login')
      return
    }
  }

  // check role
  const requiredRoles = to.meta.roles as string[] | undefined
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = requiredRoles.some(r => userStore.hasRole(r))
    if (!hasRole) {
      next('/dashboard')
      return
    }
  }

  next()
})

export default router
