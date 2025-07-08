import { ref } from 'vue'
import type { Toast } from '../components/Toast.vue'

// 全局Toast实例
const toastInstance = ref<{
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAll: () => void
} | null>(null)

export const useToast = () => {
  const setToastInstance = (instance: any) => {
    toastInstance.value = instance
  }

  const toast = {
    success: (message: string, title?: string, duration?: number) => {
      toastInstance.value?.addToast({
        type: 'success',
        message,
        title,
        duration
      })
    },
    
    error: (message: string, title?: string, duration?: number) => {
      toastInstance.value?.addToast({
        type: 'error',
        message,
        title,
        duration
      })
    },
    
    warning: (message: string, title?: string, duration?: number) => {
      toastInstance.value?.addToast({
        type: 'warning',
        message,
        title,
        duration
      })
    },
    
    info: (message: string, title?: string, duration?: number) => {
      toastInstance.value?.addToast({
        type: 'info',
        message,
        title,
        duration
      })
    }
  }

  return {
    toast,
    setToastInstance
  }
}