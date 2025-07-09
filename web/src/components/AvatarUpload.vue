<template>
  <div class="avatar-upload">
    <!-- 头像显示和上传区域 -->
    <div class="flex items-center space-x-6">
      <!-- 头像预览 -->
      <div class="relative group">
        <div class="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 border-4 border-white dark:border-gray-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
          <img
            v-if="currentAvatar"
            :src="currentAvatar"
            alt="头像"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            <UserIcon class="w-8 h-8" />
          </div>
        </div>

        <!-- 悬停遮罩 -->
        <div class="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <CameraIcon class="w-6 h-6 text-white" />
        </div>
      </div>

      <!-- 操作按钮区域 -->
      <div class="flex-1">
        <div class="space-y-3">
          <div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white">个人头像</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">选择一张图片作为您的头像</p>
          </div>

          <div class="flex space-x-3">
            <button
              @click="openFileDialog"
              class="inline-flex items-center px-4 py-2.5 bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
            >
              <PhotoIcon class="w-4 h-4 mr-2" />
              选择图片
            </button>

            <button
              v-if="currentAvatar"
              @click="removeAvatar"
              class="inline-flex items-center px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              <TrashIcon class="w-4 h-4 mr-2" />
              移除
            </button>
          </div>

          <p class="text-xs text-gray-400 dark:text-gray-500">
            支持 JPG、PNG 格式，最大 5MB，建议尺寸 400×400 或更大
          </p>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/jpg,image/png"
      @change="handleFileSelect"
      class="hidden"
    />

    <!-- 裁剪弹窗 -->
    <transition name="modal" appear>
      <div v-if="showCropper" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <!-- 头部 -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">编辑头像</h3>
            <button
              @click="closeCropper"
              class="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- 裁剪区域 -->
          <div class="p-6">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
              <div class="w-full h-80 bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 relative">
                <canvas
                  ref="canvas"
                  class="max-w-full max-h-full cursor-move"
                  @mousedown="startDrag"
                  @mousemove="drag"
                  @mouseup="endDrag"
                  @wheel="handleWheel"
                ></canvas>
              </div>
            </div>

            <!-- 预览区域 -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">预览效果</h4>
              <div class="flex items-center space-x-4">
                <div class="text-center">
                  <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 mb-2">
                    <canvas ref="previewLarge" width="64" height="64" class="w-full h-full"></canvas>
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-400">大头像</span>
                </div>
                <div class="text-center">
                  <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 mb-2">
                    <canvas ref="previewSmall" width="48" height="48" class="w-full h-full"></canvas>
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-400">小头像</span>
                </div>
              </div>
            </div>

            <!-- 工具栏 -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex space-x-2">
                <button
                  @click="rotateLeft"
                  class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="向左旋转"
                >
                  <ArrowPathIcon class="w-5 h-5 transform rotate-180" />
                </button>
                <button
                  @click="rotateRight"
                  class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="向右旋转"
                >
                  <ArrowPathIcon class="w-5 h-5" />
                </button>
                <button
                  @click="resetCropper"
                  class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="重置"
                >
                  <ArrowUturnLeftIcon class="w-5 h-5" />
                </button>
              </div>

              <!-- 缩放滑块 -->
              <div class="flex items-center space-x-3">
                <span class="text-sm text-gray-500 dark:text-gray-400">缩放</span>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.05"
                  v-model="scaleValue"
                  @input="handleScale"
                  class="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          <!-- 底部操作 -->
          <div class="flex justify-end space-x-3 p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <button
              @click="closeCropper"
              :disabled="uploading"
              class="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
            >
              取消
            </button>
            <button
              @click="cropAndUpload"
              :disabled="uploading"
              class="px-6 py-2.5 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 min-w-[100px]"
            >
              <span v-if="uploading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                处理中
              </span>
              <span v-else>确定</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import {
  UserIcon,
  CameraIcon,
  PhotoIcon,
  TrashIcon,
  XMarkIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon
} from '@heroicons/vue/24/outline'
import { useToast } from '../composables/useToast'
import { useDialog } from '../composables/useDialog'

interface Props {
  currentAvatar?: string
}

interface Emits {
  (e: 'update:avatar', url: string): void
}

withDefaults(defineProps<Props>(), {
  currentAvatar: ''
})

const emit = defineEmits<Emits>()
const { toast } = useToast()
const { confirm } = useDialog()

const fileInput = ref<HTMLInputElement>()
const canvas = ref<HTMLCanvasElement>()
const previewLarge = ref<HTMLCanvasElement>()
const previewSmall = ref<HTMLCanvasElement>()
const showCropper = ref(false)
const uploading = ref(false)
const scaleValue = ref(1)
const avatarBlob = ref<Blob | null>(null)

// 图片和裁剪相关状态
const imageObj = ref<HTMLImageElement>()
const imageScale = ref(1)
const imageRotation = ref(0)
const imageX = ref(0)
const imageY = ref(0)
const isDragging = ref(false)
const lastMouseX = ref(0)
const lastMouseY = ref(0)

const openFileDialog = () => {
  fileInput.value?.click()
}

const removeAvatar = async () => {
  const confirmed = await confirm(
    '确定要移除当前头像吗？',
    '移除头像'
  )

  if (confirmed) {
    emit('update:avatar', '')
    // 重置头像blob
    avatarBlob.value = null
    toast.success('头像已移除，请点击保存修改按钮完成更新')
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 验证文件类型
  if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
    toast.error('请选择 JPG 或 PNG 格式的图片')
    return
  }

  // 验证文件大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.error('图片大小不能超过 5MB')
    return
  }

  // 读取文件并显示裁剪器
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      imageObj.value = img
      showCropper.value = true
      resetCropper()

      nextTick(() => {
        drawCanvas()
      })
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const drawCanvas = () => {
  if (!canvas.value || !imageObj.value) return

  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  const canvasWidth = 400
  const canvasHeight = 300
  canvas.value.width = canvasWidth
  canvas.value.height = canvasHeight

  // 清空画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // 保存当前状态
  ctx.save()

  // 移动到图片中心点
  const centerX = canvasWidth / 2 + imageX.value
  const centerY = canvasHeight / 2 + imageY.value
  ctx.translate(centerX, centerY)

  // 旋转
  ctx.rotate((imageRotation.value * Math.PI) / 180)

  // 缩放
  ctx.scale(imageScale.value, imageScale.value)

  // 绘制图片（以中心为原点）
  const imgWidth = imageObj.value.width
  const imgHeight = imageObj.value.height
  ctx.drawImage(imageObj.value, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight)

  // 恢复状态
  ctx.restore()

  // 绘制裁剪框
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  const cropSize = 200
  const cropX = (canvasWidth - cropSize) / 2
  const cropY = (canvasHeight - cropSize) / 2
  ctx.strokeRect(cropX, cropY, cropSize, cropSize)

  // 更新预览
  updatePreviews()
}

const updatePreviews = () => {
  if (!canvas.value || !previewLarge.value || !previewSmall.value) return

  const sourceCanvas = canvas.value
  const cropSize = 200
  const cropX = (sourceCanvas.width - cropSize) / 2
  const cropY = (sourceCanvas.height - cropSize) / 2

  // 大预览
  const largeCropCanvas = document.createElement('canvas')
  largeCropCanvas.width = cropSize
  largeCropCanvas.height = cropSize
  const largeCtx = largeCropCanvas.getContext('2d')
  if (largeCtx) {
    largeCtx.drawImage(sourceCanvas, cropX, cropY, cropSize, cropSize, 0, 0, cropSize, cropSize)

    const previewLargeCtx = previewLarge.value.getContext('2d')
    if (previewLargeCtx) {
      previewLargeCtx.clearRect(0, 0, 64, 64)
      previewLargeCtx.drawImage(largeCropCanvas, 0, 0, 64, 64)
    }
  }

  // 小预览
  const previewSmallCtx = previewSmall.value.getContext('2d')
  if (previewSmallCtx) {
    previewSmallCtx.clearRect(0, 0, 48, 48)
    previewSmallCtx.drawImage(largeCropCanvas, 0, 0, 48, 48)
  }
}

const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  lastMouseX.value = e.clientX
  lastMouseY.value = e.clientY
}

const drag = (e: MouseEvent) => {
  if (!isDragging.value) return

  const deltaX = e.clientX - lastMouseX.value
  const deltaY = e.clientY - lastMouseY.value

  imageX.value += deltaX
  imageY.value += deltaY

  lastMouseX.value = e.clientX
  lastMouseY.value = e.clientY

  drawCanvas()
}

const endDrag = () => {
  isDragging.value = false
}

const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  imageScale.value = Math.max(0.1, Math.min(3, imageScale.value + delta))
  scaleValue.value = imageScale.value
  drawCanvas()
}

const handleScale = () => {
  imageScale.value = parseFloat(scaleValue.value.toString())
  drawCanvas()
}

const rotateLeft = () => {
  imageRotation.value -= 90
  drawCanvas()
}

const rotateRight = () => {
  imageRotation.value += 90
  drawCanvas()
}

const resetCropper = () => {
  // 计算图片的适合缩放比例
  if (imageObj.value) {
    const canvasWidth = 400
    const canvasHeight = 300
    const imgWidth = imageObj.value.width
    const imgHeight = imageObj.value.height
    
    // 计算适合画布的缩放比例，确保图片能完全显示在画布中
    const scaleX = canvasWidth / imgWidth
    const scaleY = canvasHeight / imgHeight
    const fitScale = Math.min(scaleX, scaleY) * 0.8 // 乘以0.8留出一些边距
    
    imageScale.value = fitScale
    scaleValue.value = fitScale
  } else {
    imageScale.value = 1
    scaleValue.value = 1
  }
  
  imageRotation.value = 0
  imageX.value = 0
  imageY.value = 0
  
  nextTick(() => {
    drawCanvas()
  })
}

const closeCropper = () => {
  showCropper.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const cropAndUpload = async () => {
  if (!canvas.value) return

  try {
    uploading.value = true

    // 创建裁剪后的图片
    const cropCanvas = document.createElement('canvas')
    cropCanvas.width = 400
    cropCanvas.height = 400
    const cropCtx = cropCanvas.getContext('2d')

    if (cropCtx) {
      const sourceCanvas = canvas.value
      const cropSize = 200
      const cropX = (sourceCanvas.width - cropSize) / 2
      const cropY = (sourceCanvas.height - cropSize) / 2

      cropCtx.drawImage(sourceCanvas, cropX, cropY, cropSize, cropSize, 0, 0, 400, 400)

      // 转换为blob
      cropCanvas.toBlob((blob) => {
        if (blob) {
          // 创建本地预览URL
          const localUrl = URL.createObjectURL(blob)

          // 保存blob到组件状态供后续上传使用
          avatarBlob.value = blob

          // 更新预览
          emit('update:avatar', localUrl)

          // 关闭裁剪器
          closeCropper()

          toast.success('头像预览已更新，请点击保存修改按钮完成上传')
        }
        uploading.value = false
      }, 'image/png', 0.9)
    }
  } catch (error) {
    console.error('裁剪图片失败:', error)
    toast.error('裁剪图片失败，请重试')
    uploading.value = false
  }
}

// 新增：获取头像blob的方法
const getAvatarBlob = () => {
  return avatarBlob.value
}

// 新增：重置头像blob
const resetAvatarBlob = () => {
  avatarBlob.value = null
}

// 导出方法供父组件使用
defineExpose({
  getAvatarBlob,
  resetAvatarBlob
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white,
.modal-enter-from .dark\\:bg-gray-800,
.modal-leave-to .dark\\:bg-gray-800 {
  transform: scale(0.95) translateY(-20px);
}

/* 自定义滑块样式 */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Dark mode slider styles */
.dark input[type="range"]::-webkit-slider-thumb {
  border: 2px solid #374151;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.dark input[type="range"]::-moz-range-thumb {
  border: 2px solid #374151;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>
