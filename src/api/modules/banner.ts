import request from '@/utils/request'

export interface Banner {
  id: number
  title: string
  imageUrl: string
  targetType: number | null
  targetData: string
  platform: string
  blockId: number | null
  weight: number
  status: number
  effectiveTime: string | null
  expireTime: string | null
  createdAt: string
  updatedAt: string
}

export interface BannerRequest {
  title: string
  imageUrl: string
  targetType?: number | null
  targetData?: string
  platform?: string
  blockId?: number | null
  weight?: number
  status?: number
  effectiveTime?: string | null
  expireTime?: string | null
}

// Router target types (matching PHP Router constants)
export const TARGET_TYPES: Record<number, string> = {
  1: '充值',
  3: '兑换商城',
  4: '抽签',
  5: '签到',
  7: '一番赏',
  8: '鱼塘',
  9: '体验卡',
  10: '刮刮乐',
  11: '抽赏',
  14: '每日任务',
  15: 'VIP中心',
  16: '成长任务',
  17: '欧气值抽奖',
  18: '钻石商店',
  22: '活动H5',
  23: '客服中心',
  24: '通用H5',
  26: '邀请返欧气值',
  27: '分销',
  28: '许愿活动',
  29: '订单回收',
  30: '欧气看',
  31: '一番赏列表',
  33: '一番赏列表(带二级)',
}

export const PLATFORM_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: 'iOS', value: 'ios' },
  { label: 'Android', value: 'android' },
]

export const bannerApi = {
  list(params: { page: number; pageSize: number; keyword?: string; status?: number }) {
    return request.get('/admin/banners', { params })
  },
  get(id: number) {
    return request.get(`/admin/banners/${id}`)
  },
  create(data: BannerRequest) {
    return request.post('/admin/banners', data)
  },
  update(id: number, data: BannerRequest) {
    return request.put(`/admin/banners/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/admin/banners/${id}`)
  },
}
