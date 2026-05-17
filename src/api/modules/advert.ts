import request from '@/utils/request'

export interface Advert {
  id: number
  title: string
  type: string
  createdAt: string
  updatedAt: string
}

export interface AdvertRequest {
  title: string
  type: string
}

export const advertApi = {
  list(params: { page: number; pageSize: number; keyword?: string }) {
    return request.get('/admin/adverts', { params })
  },
  get(id: number) {
    return request.get(`/admin/adverts/${id}`)
  },
  create(data: AdvertRequest) {
    return request.post('/admin/adverts', data)
  },
  update(id: number, data: AdvertRequest) {
    return request.put(`/admin/adverts/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/admin/adverts/${id}`)
  },
}
