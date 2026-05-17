<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { tagApi, type Tag, type TagRequest } from '@/api/modules/tag'
import { tagTypeApi, type TagType } from '@/api/modules/tagType'
import type { PageResult } from '@/api/types'

const loading = ref(false)
const list = ref<Tag[]>([])
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

const tagTypes = ref<TagType[]>([])

const form = reactive<TagRequest>({
  title: '',
  description: '',
  typeId: null,
  weight: 0,
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
}

async function fetchData() {
  loading.value = true
  try {
    const res = await tagApi.list({ page: page.value, pageSize: pageSize.value, keyword: keyword.value || undefined })
    const data = res.data.data as PageResult<Tag>
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

async function loadTagTypes() {
  const res = await tagTypeApi.all()
  tagTypes.value = res.data.data as TagType[]
}

function handleCreate() {
  isEdit.value = false
  editId.value = undefined
  dialogTitle.value = '新增标签'
  form.title = ''
  form.description = ''
  form.typeId = null
  form.weight = 0
  dialogVisible.value = true
}

function handleEdit(row: Tag) {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑标签'
  form.title = row.title
  form.description = row.description || ''
  form.typeId = row.typeId
  form.weight = row.weight
  dialogVisible.value = true
}

async function handleDelete(row: Tag) {
  await ElMessageBox.confirm(`确定要删除标签「${row.title}」吗？`, '提示', { type: 'warning' })
  await tagApi.delete(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleSubmit() {
  await formRef.value?.validate()
  dialogLoading.value = true
  try {
    if (isEdit.value) {
      await tagApi.update(editId.value!, { ...form })
      ElMessage.success('更新成功')
    } else {
      await tagApi.create({ ...form })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } finally {
    dialogLoading.value = false
  }
}

onMounted(() => {
  fetchData()
  loadTagTypes()
})
</script>

<template>
  <el-card>
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>标签管理</span>
        <el-button type="primary" @click="handleCreate">新增标签</el-button>
      </div>
    </template>

    <el-row style="margin-bottom: 16px;">
      <el-input v-model="keyword" placeholder="搜索标签名称" style="width: 240px;" clearable @keyup.enter="fetchData" @clear="fetchData" />
      <el-button type="primary" style="margin-left: 12px;" @click="fetchData">搜索</el-button>
    </el-row>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标签名称" min-width="150" />
      <el-table-column prop="typeName" label="标签类型" width="120" />
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
      <el-form-item label="标签名称" prop="title">
        <el-input v-model="form.title" placeholder="请输入标签名称" />
      </el-form-item>
      <el-form-item label="标签类型">
        <el-select v-model="form.typeId" placeholder="请选择标签类型" clearable style="width: 100%;">
          <el-option v-for="t in tagTypes" :key="t.id" :label="t.name" :value="t.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序权重">
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
