import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@/api/modules/auth'
import { removeToken, setToken } from '@/utils/auth'

export interface UserInfo {
  id: number
  username: string
  realName: string
  roles: string[]
  permissions: string[]
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  function hasPermission(perm: string): boolean {
    return permissions.value.includes(perm)
  }

  async function login(username: string, password: string) {
    const res = await authApi.login({ username, password })
    const { accessToken, refreshToken, userInfo: info } = res.data.data
    setToken(accessToken, refreshToken)
    userInfo.value = info
    roles.value = info.roles
    permissions.value = info.permissions
    return info
  }

  async function fetchUserInfo() {
    const res = await authApi.me()
    const info = res.data.data
    userInfo.value = info
    roles.value = info.roles
    permissions.value = info.permissions
  }

  function logout() {
    removeToken()
    userInfo.value = null
    roles.value = []
    permissions.value = []
  }

  return { userInfo, roles, permissions, hasRole, hasPermission, login, fetchUserInfo, logout }
})
