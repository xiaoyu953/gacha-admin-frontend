<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { customerBlacklistApi, type CustomerBlacklist, BLACKLIST_TYPES } from '@/api/modules/customerBlacklist'
import type { PageResult } from '@/api/types'

const loading = ref(false)
const list = ref<CustomerBlacklist[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const filterCustomerId = ref<number>()
const filterType = ref<number>()

const dialogVisible = ref(false)
const dialogLoading = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({ customerId: 0, type: 1 })

const batchDialogVisible = ref(false)
const batchDialogLoading = ref(false)
const batchType = ref(1)
const batchIds = ref('')

const typeOptions = Object.entries(BLACKLIST_TYPES).map(([value, label]) => ({
  value: Number(value),
  label,
}))

async function fetchData() {
  loading.value = true
  try {
    const res = await customerBlacklistApi.list({
      page: page.value,
      pageSize: pageSize.value,
      customerId: filterCustomerId.value || undefined,
      type: filterType.value || undefined,
    })
    const data = res.data.data as PageResult<CustomerBlacklist>
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  form.customerId = 0
  form.type = 1
  dialogVisible.value = true
}

async function handleDelete(row: CustomerBlacklist) {
  await ElMessageBox.confirm(`确定要移除用户「${row.customerNick || row.customerId}」的黑名单吗？`, '提示', { type: 'warning' })
  await customerBlacklistApi.delete(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleSubmit() {
  dialogLoading.value = true
  try {
    await customerBlacklistApi.create({ ...form })
    ElMessage.success('添加成功')
    dialogVisible.value = false
    fetchData()
  } finally {
    dialogLoading.value = false
  }
}

function handleBatch() {
  batchType.value = 1
  batchIds.value = ''
  batchDialogVisible.value = true
}

async function handleBatchSubmit() {
  const ids = batchIds.value.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean).map(Number).filter(n => !isNaN(n))
  if (ids.length === 0) {
    ElMessage.error('请输入用户ID')
    return
  }
  batchDialogLoading.value = true
  try {
    const res = await customerBlacklistApi.batchCreate({ ids, type: batchType.value })
    const data = res.data.data as CustomerBlacklist[]
    ElMessage.success(`成功添加 ${data.length} 条，失败 ${ids.length - data.length} 条`)
    batchDialogVisible.value = false
    fetchData()
  } finally {
    batchDialogLoading.value = false
  }
}

onMounted(() => fetchData())
</script>

<template>
  <el-card>
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>C端用户黑名单</span>
        <div>
          <el-button @click="handleBatch">批量添加</el-button>
          <el-button type="primary" @click="handleCreate">添加黑名单</el-button>
        </div>
      </div>
    </template>

    <el-row style="margin-bottom: 16px;">
      <el-input v-model="filterCustomerId" placeholder="用户ID" style="width: 160px;" clearable @keyup.enter="fetchData" @clear="fetchData" />
      <el-select v-model="filterType" placeholder="类型" clearable style="width: 180px; margin-left: 12px;" @change="fetchData">
        <el-option v-for="opt in typeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
      <el-button type="primary" style="margin-left: 12px;" @click="fetchData">搜索</el-button>
    </el-row>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="customerId" label="用户ID" width="100" />
      <el-table-column prop="customerNick" label="用户昵称" min-width="120" />
      <el-table-column label="类型" width="180">
        <template #default="{ row }">
          {{ BLACKLIST_TYPES[row.type] || row.type }}
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="170" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button type="danger" link @click="handleDelete(row)">移除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="page"
      v-model:page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      style="margin-top: 20px;"
      @change="fetchData"
    />
  </el-card>

  <!-- single add -->
  <el-dialog v-model="dialogVisible" title="添加黑名单" width="440px">
    <el-form ref="formRef" :model="form" label-width="100px">
      <el-form-item label="用户ID" required>
        <el-input-number v-model="form.customerId" :min="1" style="width: 100%;" placeholder="请输入用户ID" />
      </el-form-item>
      <el-form-item label="黑名单类型" required>
        <el-select v-model="form.type" style="width: 100%;">
          <el-option v-for="opt in typeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="dialogLoading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>

  <!-- batch add -->
  <el-dialog v-model="batchDialogVisible" title="批量添加黑名单" width="500px">
    <el-form label-width="100px">
      <el-form-item label="黑名单类型">
        <el-select v-model="batchType" style="width: 100%;">
          <el-option v-for="opt in typeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="用户ID列表">
        <el-input v-model="batchIds" type="textarea" :rows="6" placeholder="每行一个用户ID，或用逗号、分号分隔" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="batchDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="batchDialogLoading" @click="handleBatchSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
