import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const pageTitle = ref('')

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setPageTitle(title: string) {
    pageTitle.value = title
    document.title = title ? `${title} - 52toys` : '52toys 管理后台'
  }

  return { sidebarCollapsed, pageTitle, toggleSidebar, setPageTitle }
})
