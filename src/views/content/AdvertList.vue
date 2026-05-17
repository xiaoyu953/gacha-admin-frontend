<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { advertApi, type Advert, type AdvertRequest } from '@/api/modules/advert'
import type { PageResult } from '@/api/types'

const loading = ref(false)
const list = ref<Advert[]>([])
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

const form = reactive<AdvertRequest>({
  title: '',
  type: '',
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入广告标题', trigger: 'blur' }],
  type: [{ required: true, message: '请输入广告类型', trigger: 'blur' }],
}

async function fetchData() {
  loading.value = true
  try {
    const res = await advertApi.list({ page: page.value, pageSize: pageSize.value, keyword: keyword.value || undefined })
    const data = res.data.data as PageResult<Advert>
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  isEdit.value = false
  editId.value = undefined
  dialogTitle.value = '新增广告'
  form.title = ''
  form.type = ''
  dialogVisible.value = true
}

function handleEdit(row: Advert) {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑广告'
  form.title = row.title
  form.type = row.type
  dialogVisible.value = true
}

async function handleDelete(row: Advert) {
  await ElMessageBox.confirm(`确定要删除广告「${row.title}」吗？`, '提示', { type: 'warning' })
  await advertApi.delete(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleSubmit() {
  await formRef.value?.validate()
  dialogLoading.value = true
  try {
    if (isEdit.value) {
      await advertApi.update(editId.value!, { ...form })
      ElMessage.success('更新成功')
    } else {
      await advertApi.create({ ...form })
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
        <span>广告管理</span>
        <el-button type="primary" @click="handleCreate">新增广告</el-button>
      </div>
    </template>

    <el-row style="margin-bottom: 16px;">
      <el-input v-model="keyword" placeholder="搜索广告标题" style="width: 240px;" clearable @keyup.enter="fetchData" @clear="fetchData" />
      <el-button type="primary" style="margin-left: 12px;" @click="fetchData">搜索</el-button>
    </el-row>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column prop="type" label="类型" width="120" />
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
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入广告标题" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-input v-model="form.type" placeholder="请输入广告类型" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="dialogLoading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
