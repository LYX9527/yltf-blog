<script setup lang="ts">
import { ref } from 'vue'
import { PhotoIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import api, { getFullImageUrl } from '../api'

interface UploadImageComponentProps {
  modelValue?: string
  placeholder?: string
  acceptPaste?: boolean
}

interface UploadImageComponentEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'uploaded', url: string): void
}

const props = withDefaults(defineProps<UploadImageComponentProps>(), {
  placeholder: '点击上传或粘贴图片',
  acceptPaste: true
})

const emit = defineEmits<UploadImageComponentEmits>()

const uploading = ref(false)
const dragOver = ref(false)
const fileInput = ref<HTMLInputElement>()
const error = ref('')

// 上传文件
const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('image', file)

  const response = await api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data.url
}

// 上传 Base64 图片
const uploadBase64 = async (base64Data: string, filename?: string): Promise<string> => {
  const response = await api.post('/upload/image-base64', {
    imageData: base64Data,
    filename
  })

  return response.data.url
}

// 处理文件选择
const handleFileSelect = async (files: FileList | null) => {
  if (!files || files.length === 0) return

  const file = files[0]
  if (!file.type.startsWith('image/')) {
    error.value = '只能上传图片文件'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    error.value = '图片大小不能超过 5MB'
    return
  }

  try {
    uploading.value = true
    error.value = ''

    const url = await uploadFile(file)
    emit('update:modelValue', url)
    emit('uploaded', url)
  } catch (err: any) {
    error.value = err.response?.data?.error || '上传失败'
  } finally {
    uploading.value = false
  }
}

// 处理拖拽上传
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  dragOver.value = false

  const files = e.dataTransfer?.files
  handleFileSelect(files!!)
}

// 处理粘贴上传
const handlePaste = async (e: ClipboardEvent) => {
  if (!props.acceptPaste) return

  const items = e.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()

      const file = item.getAsFile()
      if (file) {
        try {
          uploading.value = true
          error.value = ''

          // 将文件转换为 Base64
          const reader = new FileReader()
          reader.onload = async (event) => {
            try {
              const base64Data = event.target?.result as string

              // 获取文件扩展名
              const mimeToExt: { [key: string]: string } = {
                'image/jpeg': 'jpg',
                'image/jpg': 'jpg',
                'image/png': 'png',
                'image/gif': 'gif',
                'image/webp': 'webp',
                'image/svg+xml': 'svg'
              }
              const imageType = mimeToExt[item.type] || 'png'
              const filename = `paste-${Date.now()}.${imageType}`

              const url = await uploadBase64(base64Data, filename)
              emit('update:modelValue', url)
              emit('uploaded', url)
            } catch (err: any) {
              error.value = err.response?.data?.error || '上传失败'
            } finally {
              uploading.value = false
            }
          }
          reader.readAsDataURL(file)
        } catch (err: any) {
          error.value = '处理图片失败'
          uploading.value = false
        }
        break
      }
    }
  }
}

// 点击上传
const clickUpload = () => {
  fileInput.value?.click()
}

// 移除图片
const removeImage = () => {
  emit('update:modelValue', '')
  error.value = ''
}

// 拖拽事件处理
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  dragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  dragOver.value = false
}
</script>

<template>
  <div
    class="relative"
    @paste="handlePaste"
    tabindex="0"
  >
    <!-- 文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileSelect(($event.target as HTMLInputElement).files)"
    />

    <!-- 上传区域 -->
    <div
      v-if="!props.modelValue"
      class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-gray-400"
      :class="{
        'border-blue-400 bg-blue-50': dragOver,
        'border-gray-400 bg-gray-50': uploading
      }"
      @click="clickUpload"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <PhotoIcon class="mx-auto h-12 w-12 text-gray-400" />
      <p class="mt-2 text-sm text-gray-600">
        {{ uploading ? '上传中...' : props.placeholder }}
      </p>
      <p v-if="props.acceptPaste" class="mt-1 text-xs text-gray-500">
        支持拖拽、点击上传或 Ctrl+V 粘贴
      </p>
    </div>

    <!-- 图片预览 -->
    <div v-else class="relative">
      <img
        :src="getFullImageUrl(props.modelValue)"
        alt="上传的图片"
        class="w-full h-48 object-cover rounded-lg border"
      />
      <button
        @click="removeImage"
        class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        title="删除图片"
      >
        <XMarkIcon class="h-4 w-4" />
      </button>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="mt-2 text-sm text-red-600">
      {{ error }}
    </div>

    <!-- 上传进度 -->
    <div v-if="uploading" class="mt-2">
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div class="bg-blue-600 h-2 rounded-full animate-pulse" style="width: 60%"></div>
      </div>
    </div>
  </div>
</template>
