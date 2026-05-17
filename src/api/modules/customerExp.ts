import request from '@/utils/request'

export interface CustomerExp {
  level: number
  exp: number
  prizeId: number
  createdAt: string
  updatedAt: string
}

export const customerExpApi = {
  list(params: { page: number; pageSize: number }) {
    return request.get('/admin/customer-exps', { params })
  },
  create(data: CustomerExp) {
    return request.post('/admin/customer-exps', data)
  },
  update(level: number, data: Partial<CustomerExp>) {
    return request.put(`/admin/customer-exps/${level}`, data)
  },
  delete(level: number) {
    return request.delete(`/admin/customer-exps/${level}`)
  },
}
