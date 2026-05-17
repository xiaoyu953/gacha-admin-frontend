<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { customerApi, type Customer, type CustomerRequest } from '@/api/modules/customer'
import type { PageResult } from '@/api/types'

const loading = ref(false)
const list = ref<Customer[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const filterBan = ref<number>()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogLoading = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const editId = ref<number>()

const form = reactive<CustomerRequest>({
  customerId: 0,
  nick: '',
  mobile: '',
  gold: 0,
  points: 0,
  exp: 0,
  level: 0,
  channel: 0,
  ban: 0,
})

const rules: FormRules = {
  customerId: [{ required: true, message: '请输入用户ID', trigger: 'blur' }],
}

async function fetchData() {
  loading.value = true
  try {
    const res = await customerApi.list({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
      ban: filterBan.value,
    })
    const data = res.data.data as PageResult<Customer>
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
  form.customerId = 0
  form.nick = ''
  form.mobile = ''
  form.gold = 0
  form.points = 0
  form.exp = 0
  form.level = 0
  form.channel = 0
  form.ban = 0
  dialogVisible.value = true
}

function handleEdit(row: Customer) {
  isEdit.value = true
  editId.value = row.customerId
  dialogTitle.value = '编辑用户'
  form.customerId = row.customerId
  form.nick = row.nick || ''
  form.mobile = row.mobile || ''
  form.gold = row.gold
  form.points = row.points
  form.exp = row.exp
  form.level = row.level
  form.channel = row.channel
  form.ban = row.ban
  dialogVisible.value = true
}

async function handleDelete(row: Customer) {
  await ElMessageBox.confirm(`确定要删除用户「${row.nick || row.customerId}」吗？`, '提示', { type: 'warning' })
  await customerApi.delete(row.customerId)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleSubmit() {
  await formRef.value?.validate()
  dialogLoading.value = true
  try {
    if (isEdit.value) {
      await customerApi.update(editId.value!, {
        nick: form.nick || undefined,
        mobile: form.mobile || undefined,
        gold: form.gold,
        points: form.points,
        exp: form.exp,
        level: form.level,
        channel: form.channel,
        ban: form.ban,
      })
      ElMessage.success('更新成功')
    } else {
      await customerApi.create({ ...form })
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
        <span>C端用户管理</span>
        <el-button type="primary" @click="handleCreate">新增用户</el-button>
      </div>
    </template>

    <el-row style="margin-bottom: 16px;">
      <el-input v-model="keyword" placeholder="搜索昵称/手机号/ID" style="width: 240px;" clearable @keyup.enter="fetchData" @clear="fetchData" />
      <el-select v-model="filterBan" placeholder="封禁状态" clearable style="width: 120px; margin-left: 12px;" @change="fetchData">
        <el-option label="正常" :value="0" />
        <el-option label="已封禁" :value="1" />
      </el-select>
      <el-button type="primary" style="margin-left: 12px;" @click="fetchData">搜索</el-button>
    </el-row>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="customerId" label="用户ID" width="90" />
      <el-table-column prop="nick" label="昵称" min-width="120" />
      <el-table-column prop="mobile" label="手机号" width="130" />
      <el-table-column prop="wechatName" label="微信昵称" min-width="120" />
      <el-table-column prop="gold" label="余额" width="100" />
      <el-table-column prop="exp" label="经验值" width="80" />
      <el-table-column prop="level" label="等级" width="70" />
      <el-table-column prop="channel" label="渠道" width="70" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.ban === 1 ? 'danger' : 'success'">
            {{ row.ban === 1 ? '已封禁' : '正常' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="注册时间" width="170" />
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

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="540px" @closed="formRef?.resetFields()">
    <el-form ref="formRef" :model="form" :rules="isEdit ? {} : rules" label-width="100px">
      <el-form-item label="用户ID" prop="customerId">
        <el-input-number v-model="form.customerId" :disabled="isEdit" :min="1" style="width: 100%;" placeholder="请输入用户ID" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="昵称">
            <el-input v-model="form.nick" placeholder="昵称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号">
            <el-input v-model="form.mobile" placeholder="手机号" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="余额">
            <el-input-number v-model="form.gold" :min="0" :precision="2" style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="积分">
            <el-input-number v-model="form.points" :min="0" style="width: 100%;" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="经验值">
            <el-input-number v-model="form.exp" :min="0" style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="等级">
            <el-input-number v-model="form.level" :min="0" style="width: 100%;" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="渠道">
            <el-input-number v-model="form.channel" :min="0" style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="封禁状态">
            <el-switch v-model="form.ban" :active-value="1" :inactive-value="0" active-text="封禁" inactive-text="正常" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="dialogLoading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
