<template>
  <teleport to="body">
    <transition name="dialog" appear>
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="handleBackdropClick"
      >
        <!-- 背景遮罩 -->
        <div class="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

        <!-- 对话框 -->
        <div
          class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all"
          @click.stop
        >
          <!-- 内容区域 -->
          <div class="p-6">
            <!-- 图标 -->
            <div
              v-if="type !== 'custom'"
              class="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full"
              :class="iconBgClasses[type]"
            >
              <component :is="iconComponents[type]" class="w-6 h-6 text-white" />
            </div>

            <!-- 标题 -->
            <h3
              v-if="title"
              class="text-lg font-semibold text-gray-900 text-center mb-2"
            >
              {{ title }}
            </h3>

            <!-- 消息内容 -->
            <div class="text-center text-gray-600 mb-6">
              <slot>
                <p>{{ message }}</p>
              </slot>
            </div>

            <!-- 操作按钮 -->
            <div class="flex flex-col gap-3">
              <!-- 主要操作 -->
              <button
                @click="handleConfirm"
                :disabled="loading"
                :class="[
                  'w-full py-3 px-4 rounded-xl font-medium transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  confirmButtonClasses[type],
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                ]"
              >
                <span v-if="loading" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  处理中...
                </span>
                <span v-else>{{ confirmText }}</span>
              </button>

              <!-- 取消操作 -->
              <button
                v-if="showCancel"
                @click="handleCancel"
                :disabled="loading"
                class="w-full py-3 px-4 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {{ cancelText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'

export interface DialogProps {
  visible?: boolean
  type?: 'success' | 'error' | 'warning' | 'info' | 'custom'
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  closeOnClickOutside?: boolean
}

const props = withDefaults(defineProps<DialogProps>(), {
  visible: false,
  type: 'info',
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true,
  closeOnClickOutside: true
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: []
  cancel: []
}>()

const loading = ref(false)

const iconComponents = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
  custom: null
}

const iconBgClasses = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-orange-500',
  info: 'bg-blue-500',
  custom: ''
}

const confirmButtonClasses = {
  success: 'bg-green-600 text-white focus:ring-green-500',
  error: 'bg-red-600 text-white focus:ring-red-500',
  warning: 'bg-orange-600 text-white focus:ring-orange-500',
  info: 'bg-blue-600 text-white focus:ring-blue-500',
  custom: 'bg-blue-600 text-white focus:ring-blue-500'
}

const handleConfirm = async () => {
  loading.value = true
  try {
    emit('confirm')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

const handleBackdropClick = () => {
  if (props.closeOnClickOutside && !loading.value) {
    handleCancel()
  }
}
</script>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s ease-out;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .relative,
.dialog-leave-to .relative {
  transform: scale(0.95) translateY(-20px);
}
</style>
