<template>
  <teleport to="body">
    <transition-group
      name="toast"
      tag="div"
      class="fixed top-4 right-4 z-50 space-y-2"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'flex items-center p-4 rounded-xl shadow-lg backdrop-blur-sm border border-white/20',
          'transform transition-all duration-300 ease-out max-w-sm',
          toastClasses[toast.type]
        ]"
        @click="removeToast(toast.id)"
      >
        <div class="flex-shrink-0 mr-3">
          <div
            :class="[
              'w-6 h-6 rounded-full flex items-center justify-center',
              iconBgClasses[toast.type]
            ]"
          >
            <component :is="iconComponents[toast.type]" class="w-4 h-4 text-white" />
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <p v-if="toast.title" class="text-sm font-semibold text-gray-900 mb-1">
            {{ toast.title }}
          </p>
          <p class="text-sm text-gray-700">
            {{ toast.message }}
          </p>
        </div>

        <button
          @click.stop="removeToast(toast.id)"
          class="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </transition-group>
  </teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/solid'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
}

const toasts = ref<Toast[]>()

const iconComponents = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon
}

const toastClasses = {
  success: 'bg-white/95 border-green-200',
  error: 'bg-white/95 border-red-200',
  warning: 'bg-white/95 border-orange-200',
  info: 'bg-white/95 border-blue-200'
}

const iconBgClasses = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-orange-500',
  info: 'bg-blue-500'
}

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = Date.now().toString()
  const newToast: Toast = {
    id,
    duration: 4000,
    ...toast
  }

  toasts.value!!.push(newToast)

  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }
}

const removeToast = (id: string) => {
  const index = toasts.value!!.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value!!.splice(index, 1)
  }
}

const clearAll = () => {
  toasts.value = []
}

// 暴露方法给外部使用
defineExpose({
  addToast,
  removeToast,
  clearAll
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease-out;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-move {
  transition: transform 0.3s ease-out;
}
</style>
