<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { roleApi, type Permission, type PermissionCreateRequest } from '@/api/modules/role'

const loading = ref(false)
const list = ref<Permission[]>([])

const dialogVisible = ref(false)
const dialogLoading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<PermissionCreateRequest>({
  permName: '',
  permCode: '',
  permType: 'menu',
  parentId: undefined,
  path: '',
  icon: '',
  sortOrder: 0,
})

async function fetchData() {
  loading.value = true
  try {
    const res = await roleApi.permissions()
    list.value = res.data.data || []
  } finally {
    loading.value = false
  }
}

function handleCreate(parentId?: number) {
  form.permName = ''
  form.permCode = ''
  form.permType = 'menu'
  form.parentId = parentId
  form.path = ''
  form.icon = ''
  form.sortOrder = 0
  dialogVisible.value = true
}

async function handleDelete(row: Permission) {
  await ElMessageBox.confirm(`确定要删除权限「${row.permName}」吗？`, '提示', { type: 'warning' })
  await roleApi.deletePermission(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleSubmit() {
  await formRef.value?.validate()
  dialogLoading.value = true
  try {
    await roleApi.createPermission({ ...form })
    ElMessage.success('创建成功')
    dialogVisible.value = false
    fetchData()
  } finally {
    dialogLoading.value = false
  }
}

const permTypeMap: Record<string, string> = {
  menu: '菜单',
  button: '按钮',
  api: 'API',
}

function flattenTree(perms: Permission[], prefix = ''): { perm: Permission; level: number }[] {
  const result: { perm: Permission; level: number }[] = []
  for (const p of perms) {
    result.push({ perm: p, level: prefix.length })
    if ((p as any).children?.length) {
      result.push(...flattenTree((p as any).children, prefix + '  '))
    }
  }
  return result
}

onMounted(() => fetchData())
</script>

<template>
  <el-card>
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>权限管理</span>
        <el-button type="primary" @click="handleCreate()">新增权限</el-button>
      </div>
    </template>

    <el-table :data="flattenTree(list)" v-loading="loading" border row-key="id">
      <el-table-column label="权限名称" min-width="200">
        <template #default="{ row }">
          <span :style="{ paddingLeft: row.level * 24 + 'px' }">{{ row.perm.permName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="perm.permCode" label="权限编码" min-width="160" />
      <el-table-column label="类型" width="80">
        <template #default="{ row }">
          <el-tag size="small">{{ permTypeMap[row.perm.permType] || row.perm.permType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="perm.path" label="路由路径" min-width="140" />
      <el-table-column prop="perm.sortOrder" label="排序" width="70" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.perm.permType === 'menu'" type="primary" link @click="handleCreate(row.perm.id)">添加子级</el-button>
          <el-button type="danger" link @click="handleDelete(row.perm)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <el-dialog v-model="dialogVisible" title="新增权限" width="520px">
    <el-form ref="formRef" :model="form" label-width="80px">
      <el-form-item label="权限名称" prop="permName" :rules="[{ required: true, message: '请输入权限名称', trigger: 'blur' }]">
        <el-input v-model="form.permName" placeholder="如：用户管理" />
      </el-form-item>
      <el-form-item label="权限编码" prop="permCode" :rules="[{ required: true, message: '请输入权限编码', trigger: 'blur' }]">
        <el-input v-model="form.permCode" placeholder="如：system:user:list" />
      </el-form-item>
      <el-form-item label="类型" prop="permType">
        <el-select v-model="form.permType" style="width: 100%;">
          <el-option label="菜单" value="menu" />
          <el-option label="按钮" value="button" />
          <el-option label="API" value="api" />
        </el-select>
      </el-form-item>
      <el-form-item label="路由路径">
        <el-input v-model="form.path" placeholder="如：/system/users" />
      </el-form-item>
      <el-form-item label="图标">
        <el-input v-model="form.icon" placeholder="如：User" />
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="form.sortOrder" :min="0" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="dialogLoading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
