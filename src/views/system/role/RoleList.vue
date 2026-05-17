<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { roleApi, type Role, type Permission } from '@/api/modules/role'

const loading = ref(false)
const list = ref<Role[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogLoading = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const editId = ref<number>()

const form = reactive({
  roleName: '',
  roleCode: '',
  description: '',
})

const permDialogVisible = ref(false)
const permRoleId = ref<number>()
const permRoleName = ref('')
const allPermissions = ref<Permission[]>([])
const checkedPermIds = ref<number[]>([])
const permLoading = ref(false)

async function fetchData() {
  loading.value = true
  try {
    const res = await roleApi.list()
    list.value = res.data.data.list || []
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  isEdit.value = false
  editId.value = undefined
  dialogTitle.value = '新增角色'
  form.roleName = ''
  form.roleCode = ''
  form.description = ''
  dialogVisible.value = true
}

function handleEdit(row: Role) {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑角色'
  form.roleName = row.roleName
  form.roleCode = row.roleCode
  form.description = row.description || ''
  dialogVisible.value = true
}

async function handleDelete(row: Role) {
  await ElMessageBox.confirm(`确定要删除角色「${row.roleName}」吗？`, '提示', { type: 'warning' })
  await roleApi.delete(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleSubmit() {
  await formRef.value?.validate()
  dialogLoading.value = true
  try {
    if (isEdit.value) {
      await roleApi.update(editId.value!, {
        roleName: form.roleName,
        description: form.description || undefined,
      })
      ElMessage.success('更新成功')
    } else {
      await roleApi.create({
        roleName: form.roleName,
        roleCode: form.roleCode,
        description: form.description || undefined,
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } finally {
    dialogLoading.value = false
  }
}

async function handleAssignPerm(row: Role) {
  permRoleId.value = row.id
  permRoleName.value = row.roleName
  checkedPermIds.value = []
  permLoading.value = true
  permDialogVisible.value = true
  try {
    const [permRes, roleDetail] = await Promise.all([
      roleApi.permissions(),
      roleApi.get(row.id),
    ])
    allPermissions.value = permRes.data.data || []
    checkedPermIds.value = roleDetail.data.data?.permissionIds || []
  } finally {
    permLoading.value = false
  }
}

async function handleSavePerms() {
  if (permRoleId.value == null) return
  permLoading.value = true
  try {
    await roleApi.assignPermissions(permRoleId.value, checkedPermIds.value)
    ElMessage.success('权限分配成功')
    permDialogVisible.value = false
  } finally {
    permLoading.value = false
  }
}

onMounted(() => fetchData())
</script>

<template>
  <el-card>
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>角色管理</span>
        <el-button type="primary" @click="handleCreate">新增角色</el-button>
      </div>
    </template>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="roleName" label="角色名称" min-width="120" />
      <el-table-column prop="roleCode" label="角色编码" min-width="120" />
      <el-table-column prop="description" label="描述" min-width="180" />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="primary" link @click="handleAssignPerm(row)">分配权限</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <!-- 角色新增/编辑弹窗 -->
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="480px">
    <el-form ref="formRef" :model="form" label-width="80px">
      <el-form-item label="角色名称" prop="roleName" :rules="[{ required: true, message: '请输入角色名称', trigger: 'blur' }]">
        <el-input v-model="form.roleName" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="角色编码" prop="roleCode" :rules="isEdit ? [] : [{ required: true, message: '请输入角色编码', trigger: 'blur' }]">
        <el-input v-model="form.roleCode" :disabled="isEdit" placeholder="请输入角色编码" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="dialogLoading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>

  <!-- 分配权限弹窗 -->
  <el-dialog v-model="permDialogVisible" :title="`分配权限 — ${permRoleName}`" width="500px">
    <el-tree
      v-loading="permLoading"
      :data="allPermissions"
      show-checkbox
      node-key="id"
      :default-checked-keys="checkedPermIds"
      :props="{ label: 'permName', children: 'children' }"
      default-expand-all
      @check="(_, { checkedKeys }) => checkedPermIds = checkedKeys as number[]"
    />
    <template #footer>
      <el-button @click="permDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSavePerms">保存</el-button>
    </template>
  </el-dialog>
</template>
