import request from '@/utils/request'

export interface User {
  id: number
  username: string
  realName: string
  email: string
  status: number
  customerId: number | null
  createdAt: string
  updatedAt: string
}

export interface UserCreateRequest {
  username: string
  password: string
  realName?: string
  email?: string
  roleIds?: number[]
}

export interface UserUpdateRequest {
  realName?: string
  email?: string
  status?: number
  roleIds?: number[]
}

export const userApi = {
  list(params: { page: number; pageSize: number; keyword?: string }) {
    return request.get('/admin/users', { params })
  },
  get(id: number) {
    return request.get(`/admin/users/${id}`)
  },
  create(data: UserCreateRequest) {
    return request.post('/admin/users', data)
  },
  update(id: number, data: UserUpdateRequest) {
    return request.put(`/admin/users/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/admin/users/${id}`)
  },
}
