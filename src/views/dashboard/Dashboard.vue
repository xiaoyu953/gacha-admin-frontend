<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<template>
  <div class="dashboard">
    <el-card>
      <h2>欢迎回来，{{ userStore.userInfo?.realName || userStore.userInfo?.username }}</h2>
      <p style="color: #909399; margin-top: 10px;">
        当前角色：{{ userStore.roles.join(', ') || '暂无' }}
      </p>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="8">
        <el-card>
          <template #header>快捷入口</template>
          <p>商品管理、订单处理、活动配置等</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>系统通知</template>
          <p>暂无新通知</p>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>待办事项</template>
          <p>暂无待办</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
