export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface Result<T> {
  success: boolean
  code: number
  msg: string
  data: T
}
