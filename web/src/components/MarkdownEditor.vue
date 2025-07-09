<script setup lang="ts">
import {ref, computed, watch} from 'vue'
import {marked} from 'marked'
import 'highlight.js/styles/github.css'
import api from '../api'
import {useToast} from '../composables/useToast'

const {toast} = useToast()

interface Props {
  modelValue: string
  placeholder?: string
  height?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入 Markdown 内容...',
  height: '400px'
})

const emit = defineEmits<Emits>()

const content = ref(props.modelValue)
const showPreview = ref(false)
const uploading = ref(false)

watch(() => props.modelValue, (newValue) => {
  content.value = newValue
})

watch(content, (newValue) => {
  emit('update:modelValue', newValue)
})

marked.setOptions({
  breaks: true
})

const renderedContent = computed(() => {
  try {
    return marked(content.value || '')
  } catch (error) {
    return '<p>Markdown 解析错误</p>'
  }
})

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const insertText = (before: string, after: string = '', placeholder: string = '') => {
  const textarea = document.querySelector('.markdown-editor textarea') as HTMLTextAreaElement
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  const textToInsert = selectedText || placeholder

  const newText = content.value.substring(0, start) +
      before + textToInsert + after +
      content.value.substring(end)

  content.value = newText

  // 重新聚焦并设置光标位置
  setTimeout(() => {
    textarea.focus()
    const newPos = start + before.length + textToInsert.length
    textarea.setSelectionRange(newPos, newPos)
  }, 0)
}

// 上传 Base64 图片
const uploadBase64Image = async (base64Data: string, filename?: string): Promise<string> => {
  const response = await api.post('/upload/image-base64', {
    imageData: base64Data,
    filename
  })

  return response.data.url
}

// 处理粘贴事件
const handlePaste = async (e: ClipboardEvent) => {
  const items = e.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()

      const file = item.getAsFile()
      if (file) {
        try {
          uploading.value = true

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

              const imageUrl = await uploadBase64Image(base64Data, filename)

              // 在光标位置插入图片 Markdown
              const textarea = e.target as HTMLTextAreaElement
              const start = textarea.selectionStart
              const end = textarea.selectionEnd

              const imageMarkdown = `![图片](${imageUrl})`
              const newText = content.value.substring(0, start) +
                  imageMarkdown +
                  content.value.substring(end)

              content.value = newText

              // 设置光标位置到图片后面
              setTimeout(() => {
                textarea.focus()
                const newPos = start + imageMarkdown.length
                textarea.setSelectionRange(newPos, newPos)
              }, 0)
            } catch (err: any) {
              console.error('图片上传失败:', err)
              toast.error('图片上传失败: ' + (err.response?.data?.error || '未知错误'))
            } finally {
              uploading.value = false
            }
          }
          reader.readAsDataURL(file)
        } catch (err: any) {
          console.error('处理图片失败:', err)
          toast.error('处理图片失败')
          uploading.value = false
        }
        break
      }
    }
  }
}

const insertBold = () => insertText('**', '**', '粗体文本')
const insertItalic = () => insertText('*', '*', '斜体文本')
const insertCode = () => insertText('`', '`', '代码')
const insertCodeBlock = () => insertText('\n```\n', '\n```\n', '代码块')
const insertLink = () => insertText('[', '](url)', '链接文本')
const insertImage = () => insertText('![', '](image-url)', '图片描述')
const insertHeading = (level: number) => insertText('#'.repeat(level) + ' ', '', '标题')
const insertList = () => insertText('\n- ', '', '列表项')
const insertOrderedList = () => insertText('\n1. ', '', '列表项')
const insertQuote = () => insertText('\n> ', '', '引用文本')
</script>

<template>
  <div class="markdown-editor border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
    <!-- 工具栏 -->
    <div class="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-2 flex flex-wrap items-center gap-1">
      <button
          type="button"
          @click="insertHeading(1)"
          class="px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-900 dark:text-white transition-colors"
          title="标题 1"
      >
        H1
      </button>
      <button
          type="button"
          @click="insertHeading(2)"
          class="px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-900 dark:text-white transition-colors"
          title="标题 2"
      >
        H2
      </button>
      <button
          type="button"
          @click="insertHeading(3)"
          class="px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-900 dark:text-white transition-colors"
          title="标题 3"
      >
        H3
      </button>

      <div class="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>

      <button
          type="button"
          @click="insertBold"
          class="px-2 py-1 text-sm font-bold bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-900 dark:text-white transition-colors"
          title="粗体"
      >
        B
      </button>
      <button
          type="button"
          @click="insertItalic"
          class="px-2 py-1 text-sm italic bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-900 dark:text-white transition-colors"
          title="斜体"
      >
        I
      </button>
      <button
          type="button"
          @click="insertCode"
          class="px-2 py-1 text-sm font-mono bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-900 dark:text-white transition-colors"
          title="行内代码"
      >
        &lt;/&gt;
      </button>

      <div class="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>

      <button
          type="button"
          @click="insertLink"
          class="px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-900 dark:text-white transition-colors"
          title="链接"
      >
        🔗
      </button>
      <button
          type="button"
          @click="insertImage"
          class="px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-900 dark:text-white transition-colors"
          title="图片"
      >
        🖼️
      </button>

      <div class="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>

      <button
          type="button"
          @click="insertList"
          class="px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-900 dark:text-white transition-colors"
          title="无序列表"
      >
        • List
      </button>
      <button
          type="button"
          @click="insertOrderedList"
          class="px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-900 dark:text-white transition-colors"
          title="有序列表"
      >
        1. List
      </button>
      <button
          type="button"
          @click="insertQuote"
          class="px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-900 dark:text-white transition-colors"
          title="引用"
      >
        " Quote
      </button>
      <button
          type="button"
          @click="insertCodeBlock"
          class="px-2 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-900 dark:text-white transition-colors"
          title="代码块"
      >
        { } Code
      </button>

      <div class="flex-1"></div>

      <button
          type="button"
          @click="togglePreview"
          :class="[
          'px-3 py-1 text-sm rounded transition-colors',
          showPreview
            ? 'bg-blue-500 dark:bg-blue-600 text-white'
            : 'bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-900 dark:text-white'
        ]"
          title="预览"
      >
        {{ showPreview ? '编辑' : '预览' }}
      </button>
    </div>

    <!-- 编辑区域 -->
    <div class="flex" :style="{ height }">
      <!-- 编辑器 -->
      <div v-show="!showPreview" class="flex-1 relative">
        <textarea
            v-model="content"
            :placeholder="placeholder"
            class="w-full h-full p-4 border-0 resize-none focus:outline-none font-mono text-sm leading-relaxed bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            @paste="handlePaste"
        ></textarea>

        <!-- 上传提示 -->
        <div v-if="uploading" class="absolute top-2 right-2 bg-blue-500 dark:bg-blue-600 text-white px-3 py-1 rounded text-sm">
          上传中...
        </div>
      </div>

      <!-- 预览 -->
      <div v-show="showPreview" class="flex-1 overflow-auto bg-white dark:bg-gray-800">
        <div
            class="p-4 prose prose-sm max-w-none dark:prose-invert"
            v-html="renderedContent"
        ></div>
      </div>
    </div>
  </div>
</template>

<style>
/* Markdown 预览样式 */
.prose {
  color: #374151;
  line-height: 1.7;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  color: #111827;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.prose h1 {
  font-size: 1.875rem;
}

.prose h2 {
  font-size: 1.5rem;
}

.prose h3 {
  font-size: 1.25rem;
}

.prose h4 {
  font-size: 1.125rem;
}

.prose p {
  margin-bottom: 1rem;
}

.prose ul, .prose ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.prose li {
  margin-bottom: 0.25rem;
}

.prose blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: #6b7280;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
}

.prose pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.prose pre code {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

.prose a {
  color: #2563eb;
  text-decoration: underline;
}

.prose a:hover {
  color: #1d4ed8;
}

.prose img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.prose th, .prose td {
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
  text-align: left;
}

.prose th {
  background-color: #f9fafb;
  font-weight: 600;
}

/* Dark mode styles for prose */
.dark .prose {
  color: #d1d5db;
}

.dark .prose h1, .dark .prose h2, .dark .prose h3, .dark .prose h4, .dark .prose h5, .dark .prose h6 {
  color: #f9fafb;
}

.dark .prose blockquote {
  border-left-color: #4b5563;
  color: #9ca3af;
}

.dark .prose code {
  background-color: #374151;
  color: #f9fafb;
}

.dark .prose pre {
  background-color: #1f2937;
  color: #f9fafb;
}

.dark .prose a {
  color: #60a5fa;
}

.dark .prose a:hover {
  color: #3b82f6;
}

.dark .prose th, .dark .prose td {
  border-color: #4b5563;
}

.dark .prose th {
  background-color: #374151;
  color: #f9fafb;
}
</style>
