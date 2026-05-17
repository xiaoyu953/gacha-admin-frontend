<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { userApi, type User, type UserCreateRequest, type UserUpdateRequest } from '@/api/modules/user'
import type { PageResult } from '@/api/types'

const loading = ref(false)
const list = ref<User[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const keyword = ref('')

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogLoading = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const editId = ref<number>()

const form = reactive<UserCreateRequest & UserUpdateRequest>({
  username: '',
  password: '',
  realName: '',
  email: '',
  roleIds: [],
  status: 1,
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function fetchData() {
  loading.value = true
  try {
    const res = await userApi.list({ page: page.value, pageSize: pageSize.value, keyword: keyword.value || undefined })
    const data = res.data.data as PageResult<User>
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  isEdit.value = false
  editId.value = undefined
  dialogTitle.value = '新增用户'
  form.username = ''
  form.password = ''
  form.realName = ''
  form.email = ''
  form.roleIds = []
  form.status = 1
  dialogVisible.value = true
}

function handleEdit(row: User) {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑用户'
  form.username = row.username
  form.password = ''
  form.realName = row.realName || ''
  form.email = row.email || ''
  form.status = row.status
  form.roleIds = []
  dialogVisible.value = true
}

async function handleDelete(row: User) {
  await ElMessageBox.confirm(`确定要删除用户「${row.username}」吗？`, '提示', { type: 'warning' })
  await userApi.delete(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleSubmit() {
  await formRef.value?.validate()
  dialogLoading.value = true
  try {
    if (isEdit.value) {
      await userApi.update(editId.value!, {
        realName: form.realName || undefined,
        email: form.email || undefined,
        status: form.status,
      })
      ElMessage.success('更新成功')
    } else {
      await userApi.create({
        username: form.username,
        password: form.password,
        realName: form.realName || undefined,
        email: form.email || undefined,
      } as UserCreateRequest)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } finally {
    dialogLoading.value = false
  }
}

onMounted(() => fetchData())
</script>

<template>
  <el-card>
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>用户管理</span>
        <el-button type="primary" @click="handleCreate">新增用户</el-button>
      </div>
    </template>

    <el-row style="margin-bottom: 16px;">
      <el-input v-model="keyword" placeholder="搜索用户名/姓名" style="width: 240px;" clearable @keyup.enter="fetchData" @clear="fetchData" />
      <el-button type="primary" style="margin-left: 12px;" @click="fetchData">搜索</el-button>
    </el-row>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column prop="realName" label="姓名" min-width="100" />
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="page"
      v-model:page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next, sizes"
      style="margin-top: 20px;"
      @change="fetchData"
    />
  </el-card>

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" @closed="formRef?.resetFields()">
    <el-form ref="formRef" :model="form" :rules="isEdit ? {} : rules" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" :disabled="isEdit" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item v-if="!isEdit" label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="form.realName" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item v-if="isEdit" label="状态">
        <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="dialogLoading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
