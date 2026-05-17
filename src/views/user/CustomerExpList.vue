<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { customerExpApi, type CustomerExp } from '@/api/modules/customerExp'
import type { PageResult } from '@/api/types'

const loading = ref(false)
const list = ref<CustomerExp[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogLoading = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const editLevel = ref<number>()

const form = reactive<CustomerExp>({
  level: 0,
  exp: 0,
  prizeId: 0,
  createdAt: '',
  updatedAt: '',
})

async function fetchData() {
  loading.value = true
  try {
    const res = await customerExpApi.list({ page: page.value, pageSize: pageSize.value })
    const data = res.data.data as PageResult<CustomerExp>
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  isEdit.value = false
  editLevel.value = undefined
  dialogTitle.value = '新增等级配置'
  form.level = 0
  form.exp = 0
  form.prizeId = 0
  dialogVisible.value = true
}

function handleEdit(row: CustomerExp) {
  isEdit.value = true
  editLevel.value = row.level
  dialogTitle.value = '编辑等级配置'
  form.level = row.level
  form.exp = row.exp
  form.prizeId = row.prizeId
  dialogVisible.value = true
}

async function handleDelete(row: CustomerExp) {
  await ElMessageBox.confirm(`确定要删除等级 ${row.level} 的配置吗？`, '提示', { type: 'warning' })
  await customerExpApi.delete(row.level)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleSubmit() {
  dialogLoading.value = true
  try {
    if (isEdit.value) {
      await customerExpApi.update(editLevel.value!, { exp: form.exp, prizeId: form.prizeId })
      ElMessage.success('更新成功')
    } else {
      await customerExpApi.create({ ...form })
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
        <span>经验值等级管理</span>
        <el-button type="primary" @click="handleCreate">新增等级</el-button>
      </div>
    </template>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="level" label="等级" width="100" />
      <el-table-column prop="exp" label="所需经验值" min-width="140" />
      <el-table-column prop="prizeId" label="奖励道具ID" min-width="140" />
      <el-table-column prop="createdAt" label="创建时间" width="170" />
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
      layout="total, prev, pager, next"
      style="margin-top: 20px;"
      @change="fetchData"
    />
  </el-card>

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="480px">
    <el-form ref="formRef" :model="form" label-width="120px">
      <el-form-item label="等级" required>
        <el-input-number v-model="form.level" :disabled="isEdit" :min="0" style="width: 100%;" placeholder="请输入等级" />
      </el-form-item>
      <el-form-item label="所需经验值" required>
        <el-input-number v-model="form.exp" :min="0" style="width: 100%;" placeholder="请输入升级所需经验值" />
      </el-form-item>
      <el-form-item label="奖励道具ID">
        <el-input-number v-model="form.prizeId" :min="0" style="width: 100%;" placeholder="可选，升级奖励道具ID" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="dialogLoading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
