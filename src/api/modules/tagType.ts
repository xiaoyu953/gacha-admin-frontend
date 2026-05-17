import request from '@/utils/request'

export interface TagType {
  id: number
  name: string
  weight: number
  description: string
  createdAt: string
  updatedAt: string
}

export interface TagTypeRequest {
  name: string
  weight: number
  description?: string
}

export const tagTypeApi = {
  list(params: { page: number; pageSize: number; keyword?: string }) {
    return request.get('/admin/tag-types', { params })
  },
  all() {
    return request.get('/admin/tag-types/all')
  },
  get(id: number) {
    return request.get(`/admin/tag-types/${id}`)
  },
  create(data: TagTypeRequest) {
    return request.post('/admin/tag-types', data)
  },
  update(id: number, data: TagTypeRequest) {
    return request.put(`/admin/tag-types/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/admin/tag-types/${id}`)
  },
}
