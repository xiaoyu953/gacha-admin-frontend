import request from '@/utils/request'

export interface Customer {
  customerId: number
  nick: string
  mobile: string
  wechatName: string
  image: string
  gold: number
  points: number
  exp: number
  level: number
  signIn: number
  luck: number
  onceCny: number
  cny: number
  sex: number
  channel: number
  advert: number
  subscription: number
  ban: number
  createdAt: string
  updatedAt: string
}

export interface CustomerRequest {
  customerId: number
  nick?: string
  mobile?: string
  wechatName?: string
  image?: string
  gold?: number
  points?: number
  exp?: number
  level?: number
  sex?: number
  channel?: number
  ban?: number
}

export const customerApi = {
  list(params: { page: number; pageSize: number; keyword?: string; ban?: number }) {
    return request.get('/admin/customers', { params })
  },
  get(id: number) {
    return request.get(`/admin/customers/${id}`)
  },
  create(data: CustomerRequest) {
    return request.post('/admin/customers', data)
  },
  update(id: number, data: Partial<CustomerRequest>) {
    return request.put(`/admin/customers/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/admin/customers/${id}`)
  },
}
