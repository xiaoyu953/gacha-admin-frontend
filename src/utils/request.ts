import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { getToken, removeToken, setToken, getRefreshToken } from './auth'
import { ElMessage } from 'element-plus'

const instance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

instance.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.success === false) {
      ElMessage.error(res.msg || '请求失败')
    }
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = getRefreshToken()
      if (refreshToken && error.config && !error.config._retry) {
        error.config._retry = true
        try {
          const res = await axios.post('/api/auth/refresh', null, {
            params: { refreshToken },
          })
          const { accessToken, refreshToken: newRefreshToken } = res.data.data
          setToken(accessToken, newRefreshToken)
          error.config.headers.Authorization = `Bearer ${accessToken}`
          return instance(error.config)
        } catch {
          removeToken()
          window.location.href = '/login'
        }
      } else {
        removeToken()
        window.location.href = '/login'
      }
    }
    ElMessage.error(error.response?.data?.msg || error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default instance
