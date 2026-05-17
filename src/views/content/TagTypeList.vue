<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { tagTypeApi, type TagType, type TagTypeRequest } from '@/api/modules/tagType'
import type { PageResult } from '@/api/types'

const loading = ref(false)
const list = ref<TagType[]>([])
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

const form = reactive<TagTypeRequest>({
  name: '',
  weight: 0,
  description: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入标签类型名称', trigger: 'blur' }],
  weight: [{ required: true, message: '请输入排序权重', trigger: 'blur' }],
}

async function fetchData() {
  loading.value = true
  try {
    const res = await tagTypeApi.list({ page: page.value, pageSize: pageSize.value, keyword: keyword.value || undefined })
    const data = res.data.data as PageResult<TagType>
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  isEdit.value = false
  editId.value = undefined
  dialogTitle.value = '新增标签类型'
  form.name = ''
  form.weight = 0
  form.description = ''
  dialogVisible.value = true
}

function handleEdit(row: TagType) {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑标签类型'
  form.name = row.name
  form.weight = row.weight
  form.description = row.description || ''
  dialogVisible.value = true
}

async function handleDelete(row: TagType) {
  await ElMessageBox.confirm(`确定要删除标签类型「${row.name}」吗？`, '提示', { type: 'warning' })
  await tagTypeApi.delete(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleSubmit() {
  await formRef.value?.validate()
  dialogLoading.value = true
  try {
    if (isEdit.value) {
      await tagTypeApi.update(editId.value!, { ...form })
      ElMessage.success('更新成功')
    } else {
      await tagTypeApi.create({ ...form })
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
        <span>标签类型管理</span>
        <el-button type="primary" @click="handleCreate">新增标签类型</el-button>
      </div>
    </template>

    <el-row style="margin-bottom: 16px;">
      <el-input v-model="keyword" placeholder="搜索标签类型名称" style="width: 240px;" clearable @keyup.enter="fetchData" @clear="fetchData" />
      <el-button type="primary" style="margin-left: 12px;" @click="fetchData">搜索</el-button>
    </el-row>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名称" min-width="150" />
      <el-table-column prop="weight" label="排序权重" width="100" />
      <el-table-column prop="description" label="描述" min-width="200" />
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
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入标签类型名称" />
      </el-form-item>
      <el-form-item label="排序权重" prop="weight">
        <el-input-number v-model="form.weight" :min="0" placeholder="请输入排序权重" />
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
</template>
