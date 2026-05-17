import request from '@/utils/request'

export const authApi = {
  login(data: { username: string; password: string }) {
    return request.post('/auth/login', data)
  },
  refresh(refreshToken: string) {
    return request.post('/auth/refresh', null, { params: { refreshToken } })
  },
  logout() {
    return request.post('/auth/logout')
  },
  me() {
    return request.get('/auth/me')
  },
}
