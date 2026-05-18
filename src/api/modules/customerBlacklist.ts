import request from '@/utils/request'

export interface CustomerBlacklist {
  id: number
  customerId: number
  type: number
  adminId: number
  createdAt: string
  customerNick?: string
}

export const BLACKLIST_TYPES: Record<number, string> = {
  1: '转发抽奖白金用户',
  2: 'First赏白金用户',
  3: 'Last赏白金用户',
  4: 'W赏白金用户',
}

export const customerBlacklistApi = {
  list(params: { page: number; pageSize: number; customerId?: number; type?: number }) {
    return request.get('/admin/customer-blacklist', { params })
  },
  create(data: { customerId: number; type: number }) {
    return request.post('/admin/customer-blacklist', data)
  },
  batchCreate(data: { ids: number[]; type: number }) {
    return request.post('/admin/customer-blacklist/batch', data)
  },
  delete(id: number) {
    return request.delete(`/admin/customer-blacklist/${id}`)
  },
  batchDelete(ids: number[]) {
    return request.delete('/admin/customer-blacklist/batch', { data: { ids } })
  },
}
