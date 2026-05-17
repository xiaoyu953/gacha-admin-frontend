import request from '@/utils/request'

export interface Role {
  id: number
  roleName: string
  roleCode: string
  description: string
  permissionIds: number[]
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: number
  permName: string
  permCode: string
  permType: string
  parentId: number | null
  path: string
  icon: string
  sortOrder: number
}

export interface RoleCreateRequest {
  roleName: string
  roleCode: string
  description?: string
}

export interface RoleUpdateRequest {
  roleName?: string
  description?: string
}

export interface PermissionCreateRequest {
  permName: string
  permCode: string
  permType: string
  parentId?: number
  path?: string
  icon?: string
  sortOrder?: number
}

export const roleApi = {
  list() {
    return request.get('/admin/roles')
  },
  get(id: number) {
    return request.get(`/admin/roles/${id}`)
  },
  create(data: RoleCreateRequest) {
    return request.post('/admin/roles', data)
  },
  update(id: number, data: RoleUpdateRequest) {
    return request.put(`/admin/roles/${id}`, data)
  },
  delete(id: number) {
    return request.delete(`/admin/roles/${id}`)
  },
  assignPermissions(id: number, permissionIds: number[]) {
    return request.put(`/admin/roles/${id}/permissions`, permissionIds)
  },
  permissions() {
    return request.get('/admin/permissions')
  },
  createPermission(data: PermissionCreateRequest) {
    return request.post('/admin/permissions', data)
  },
  deletePermission(id: number) {
    return request.delete(`/admin/permissions/${id}`)
  },
}
