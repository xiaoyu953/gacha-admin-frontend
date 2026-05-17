<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { bannerApi, TARGET_TYPES, PLATFORM_OPTIONS, type Banner, type BannerRequest } from '@/api/modules/banner'
import type { PageResult } from '@/api/types'

const loading = ref(false)
const list = ref<Banner[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const filterStatus = ref<number>()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogLoading = ref(false)
const formRef = ref<FormInstance>()
const isEdit = ref(false)
const editId = ref<number>()

const form = reactive<BannerRequest>({
  title: '',
  imageUrl: '',
  targetType: null,
  targetData: '',
  platform: '',
  blockId: null,
  weight: 0,
  status: 1,
  effectiveTime: null,
  expireTime: null,
})

const selectedPlatforms = ref<string[]>([])

const rules: FormRules = {
  title: [{ required: true, message: '请输入Banner标题', trigger: 'blur' }],
  imageUrl: [{ required: true, message: '请输入图片URL', trigger: 'blur' }],
}

function getPlatformLabel(platform: string) {
  if (platform === 'all') return '全部'
  return platform.split('|').map(p => PLATFORM_OPTIONS.find(o => o.value === p)?.label || p).join('、')
}

function getTargetTypeLabel(type: number | null) {
  if (type == null) return '-'
  return TARGET_TYPES[type] || `未知(${type})`
}

async function fetchData() {
  loading.value = true
  try {
    const res = await bannerApi.list({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
      status: filterStatus.value,
    })
    const data = res.data.data as PageResult<Banner>
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  isEdit.value = false
  editId.value = undefined
  dialogTitle.value = '新增Banner'
  form.title = ''
  form.imageUrl = ''
  form.targetType = null
  form.targetData = ''
  form.blockId = null
  form.weight = 0
  form.status = 1
  form.effectiveTime = null
  form.expireTime = null
  selectedPlatforms.value = ['all']
  dialogVisible.value = true
}

function handleEdit(row: Banner) {
  isEdit.value = true
  editId.value = row.id
  dialogTitle.value = '编辑Banner'
  form.title = row.title
  form.imageUrl = row.imageUrl
  form.targetType = row.targetType
  form.targetData = row.targetData || ''
  form.blockId = row.blockId
  form.weight = row.weight
  form.status = row.status
  form.effectiveTime = row.effectiveTime
  form.expireTime = row.expireTime
  selectedPlatforms.value = row.platform === 'all' ? ['all'] : row.platform.split('|').filter(Boolean)
  dialogVisible.value = true
}

function onPlatformChange(values: string[]) {
  if (values.includes('all') && !selectedPlatforms.value.includes('all')) {
    selectedPlatforms.value = ['all']
  } else if (values.length > 1 && values.includes('all')) {
    selectedPlatforms.value = values.filter(v => v !== 'all')
  }
}

async function handleDelete(row: Banner) {
  await ElMessageBox.confirm(`确定要删除Banner「${row.title}」吗？`, '提示', { type: 'warning' })
  await bannerApi.delete(row.id)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleSubmit() {
  await formRef.value?.validate()
  dialogLoading.value = true
  try {
    form.platform = selectedPlatforms.value.join('|')
    if (isEdit.value) {
      await bannerApi.update(editId.value!, { ...form })
      ElMessage.success('更新成功')
    } else {
      await bannerApi.create({ ...form })
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
        <span>Banner管理</span>
        <el-button type="primary" @click="handleCreate">新增Banner</el-button>
      </div>
    </template>

    <el-row style="margin-bottom: 16px;">
      <el-input v-model="keyword" placeholder="搜索标题" style="width: 200px;" clearable @keyup.enter="fetchData" @clear="fetchData" />
      <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 120px; margin-left: 12px;" @change="fetchData">
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-button type="primary" style="margin-left: 12px;" @click="fetchData">搜索</el-button>
    </el-row>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" min-width="160" />
      <el-table-column label="图片" width="80">
        <template #default="{ row }">
          <el-image v-if="row.imageUrl" :src="row.imageUrl" style="width: 40px; height: 40px;" fit="cover" />
        </template>
      </el-table-column>
      <el-table-column label="跳转类型" width="100">
        <template #default="{ row }">{{ getTargetTypeLabel(row.targetType) }}</template>
      </el-table-column>
      <el-table-column label="平台" width="100">
        <template #default="{ row }">{{ getPlatformLabel(row.platform) }}</template>
      </el-table-column>
      <el-table-column prop="blockId" label="位置" width="70" />
      <el-table-column prop="weight" label="权重" width="70" />
      <el-table-column label="状态" width="70">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="effectiveTime" label="生效时间" width="170" />
      <el-table-column prop="expireTime" label="过期时间" width="170" />
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

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="640px" @closed="formRef?.resetFields()">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入Banner标题" />
      </el-form-item>
      <el-form-item label="图片URL" prop="imageUrl">
        <el-input v-model="form.imageUrl" placeholder="请输入图片URL" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="跳转类型">
            <el-select v-model="form.targetType" placeholder="请选择" clearable style="width: 100%;">
              <el-option v-for="(label, value) in TARGET_TYPES" :key="value" :label="`${label} (${value})`" :value="Number(value)" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="跳转数据">
            <el-input v-model="form.targetData" placeholder="跳转参数" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="平台">
            <el-checkbox-group v-model="selectedPlatforms" @change="onPlatformChange">
              <el-checkbox v-for="p in PLATFORM_OPTIONS" :key="p.value" :value="p.value" :label="p.value">
                {{ p.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="展示位置">
            <el-input-number v-model="form.blockId" :min="0" placeholder="位置ID" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="排序权重">
            <el-input-number v-model="form.weight" :min="0" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="生效时间">
            <el-date-picker v-model="form.effectiveTime" type="datetime" placeholder="选择生效时间" style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="过期时间">
            <el-date-picker v-model="form.expireTime" type="datetime" placeholder="选择过期时间" style="width: 100%;" />
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
