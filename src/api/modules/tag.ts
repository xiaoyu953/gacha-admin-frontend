import request from '@/utils/request'

export interface Tag {
  id: number
  title: string
  description: string
  typeId: number | null
  weight: number
  typeName: string
  createdAt: string
  updatedAt: string
}

export interface TagRequest {
  title: string
  description?: string
  typeId?: number | null
  weight?: number
}

export const tagApi = {
  list(params: { page: number; pageSize: number; keyword?: string }) {
    return request.get('/admin/tags', { params })
  },
  get(id: number) {
    return request.get(`/admin/tags/${id}`)
  },
  create(data: TagRequest) {
    return request.post('/admin/tags', data)
  },
  update(id: number, data: TagRequest) {
    return request.put(`/admin/tags/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/admin/tags/${id}`)
  },
}
