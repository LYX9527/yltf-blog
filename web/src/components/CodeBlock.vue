<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/vue/24/outline'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import 'highlight.js/styles/github-dark.css'
interface Props {
  code: string
  language?: string
  showLineNumbers?: boolean
  showHeader?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  language: '',
  showLineNumbers: false,
  showHeader: true
})

const codeRef = ref<HTMLElement>()
const isCopied = ref(false)
const isDarkMode = ref(false)

// 检测暗色模式
const checkDarkMode = () => {
  isDarkMode.value = document.documentElement.classList.contains('dark')
}

// 动态加载对应的 highlight.js 主题
const loadHighlightTheme = async (theme: 'light' | 'dark') => {
  // 移除之前的主题样式
  const existingTheme = document.querySelector('link[data-highlight-theme]')
  if (existingTheme) {
    existingTheme.remove()
  }

  // 创建新的主题样式链接
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.setAttribute('data-highlight-theme', theme)

  if (theme === 'dark') {
    link.href = 'https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/github-dark.min.css'
  } else {
    link.href = 'https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/github.min.css'
  }

  document.head.appendChild(link)
}

// 监听主题变化
let observer: MutationObserver | null = null

onMounted(() => {
  checkDarkMode()
  loadHighlightTheme(isDarkMode.value ? 'dark' : 'light')

  // 观察 html 元素的 class 变化
  observer = new MutationObserver(() => {
    const wasDark = isDarkMode.value
    checkDarkMode()

    if (wasDark !== isDarkMode.value) {
      loadHighlightTheme(isDarkMode.value ? 'dark' : 'light')
    }
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

// 语言检测
const detectLanguage = (code: string): string => {
  try {
    const result = hljs.highlightAuto(code)
    return result.language || 'plaintext'
  } catch (error) {
    return 'plaintext'
  }
}

// 实际使用的语言
const actualLanguage = computed(() => {
  if (props.language) {
    return props.language
  }
  return detectLanguage(props.code)
})

// 语言显示名称
const languageDisplayName = computed(() => {
  const languageMap: Record<string, string> = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'jsx': 'JSX',
    'tsx': 'TSX',
    'vue': 'Vue',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'sass': 'Sass',
    'less': 'Less',
    'json': 'JSON',
    'yaml': 'YAML',
    'yml': 'YAML',
    'toml': 'TOML',
    'xml': 'XML',
    'python': 'Python',
    'java': 'Java',
    'kotlin': 'Kotlin',
    'scala': 'Scala',
    'go': 'Go',
    'rust': 'Rust',
    'cpp': 'C++',
    'c': 'C',
    'csharp': 'C#',
    'php': 'PHP',
    'ruby': 'Ruby',
    'swift': 'Swift',
    'objc': 'Objective-C',
    'sql': 'SQL',
    'bash': 'Bash',
    'shell': 'Shell',
    'powershell': 'PowerShell',
    'dockerfile': 'Dockerfile',
    'nginx': 'Nginx',
    'apache': 'Apache',
    'markdown': 'Markdown',
    'latex': 'LaTeX',
    'r': 'R',
    'matlab': 'MATLAB',
    'perl': 'Perl',
    'lua': 'Lua',
    'haskell': 'Haskell',
    'clojure': 'Clojure',
    'elixir': 'Elixir',
    'erlang': 'Erlang',
    'elm': 'Elm',
    'dart': 'Dart',
    'plaintext': 'Plain Text',
    'text': 'Plain Text'
  }

  const lang = actualLanguage.value.toLowerCase()
  return languageMap[lang] || lang.toUpperCase()
})

// 高亮代码
const highlightedCode = computed(() => {
  try {
    const lang = actualLanguage.value

    if (lang && lang !== 'plaintext' && hljs.getLanguage(lang)) {
      const result = hljs.highlight(props.code, { language: lang })
      return result.value
    } else {
      // 如果没有语言或语言不支持，进行自动检测
      const result = hljs.highlightAuto(props.code)
      return result.value
    }
  } catch (error) {
    console.error('Code highlighting failed:', error)
    // 转义HTML以防止XSS
    return props.code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
})

// 复制代码 - 兼容性实现
const copyCode = async () => {
  const textToCopy = props.code

  try {
    // 首先尝试现代的 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy)
      isCopied.value = true
      setTimeout(() => {
        isCopied.value = false
      }, 2000)
      return
    }

    // 降级方案：使用 document.execCommand
    const textArea = document.createElement('textarea')
    textArea.value = textToCopy
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)

    if (successful) {
      isCopied.value = true
      setTimeout(() => {
        isCopied.value = false
      }, 2000)
    } else {
      throw new Error('execCommand failed')
    }
  } catch (error) {
    console.error('Failed to copy code:', error)

    // 最后的降级方案：提示用户手动复制
    const userAgent = navigator.userAgent.toLowerCase()
    const isMac = userAgent.indexOf('mac') !== -1
    const shortcut = isMac ? '⌘+C' : 'Ctrl+C'

    // 选中代码文本
    const codeElement = document.querySelector('.code-block-content code')
    if (codeElement) {
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(codeElement)
      selection?.removeAllRanges()
      selection?.addRange(range)

      // 显示提示
      alert(`复制失败，请手动选择代码并按 ${shortcut} 复制`)
    }
  }
}
</script>

<template>
  <div class="code-block-wrapper">
    <!-- 头部 -->
    <div v-if="showHeader" class="code-block-header">
      <!-- 左侧装饰点 -->
      <div class="code-block-dots">
        <div class="dot red"></div>
        <div class="dot yellow"></div>
        <div class="dot green"></div>
      </div>

      <!-- 居中的语言名称 -->
      <div class="code-block-info">
        <span class="language-name">{{ languageDisplayName }}</span>
      </div>

      <!-- 右侧复制按钮 -->
      <button
          class="copy-button"
          @click="copyCode"
          :title="isCopied ? '已复制' : '复制代码'"
      >
        <component :is="isCopied ? CheckIcon : ClipboardDocumentIcon" class="copy-icon" />
        <span class="copy-text">{{ isCopied ? '已复制' : '复制' }}</span>
      </button>
    </div>

    <!-- 代码内容 -->
    <div class="code-block-content">
      <pre><code
        ref="codeRef"
        :class="[
          'hljs',
          `language-${actualLanguage}`,
          { 'line-numbers': showLineNumbers }
        ]"
        v-html="highlightedCode"
      ></code></pre>
    </div>
  </div>
</template>

<style scoped>
.prose pre{
  color: #1f2937!important;
}
.code-block-wrapper {
  margin: 1.5rem 0;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.dark .code-block-wrapper {
  background: #1f2937;
  border-color: #374151;
}

.code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}

.dark .code-block-header {
  background: #374151;
  border-bottom-color: #4b5563;
}

.code-block-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex: 1;
}

.code-block-dots {
  display: flex;
  gap: 0.25rem;
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
}

.language-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.dark .language-name {
  color: #9ca3af;
}

.dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
}

.dot.red {
  background-color: #ef4444;
}

.dot.yellow {
  background-color: #f59e0b;
}

.dot.green {
  background-color: #10b981;
}

.copy-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #e5e7eb;
  border: none;
  border-radius: 0.25rem;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 10;
}

.copy-button:hover {
  background: #d1d5db;
  color: #374151;
}

.dark .copy-button {
  background: #4b5563;
  color: #9ca3af;
}

.dark .copy-button:hover {
  background: #6b7280;
  color: #f3f4f6;
}

.copy-icon {
  width: 1rem;
  height: 1rem;
}

.copy-text {
  transition: color 0.2s ease;
}

.code-block-content {
  background: #fff;
  color: #1f2937;
}

.dark .code-block-content {
  background: #1f2937;
}

.code-block-content pre {
  margin: 0;
  padding: 1rem;
  background: transparent;
  overflow-x: auto;
}

.code-block-content code {
  background: transparent;
  padding: 0;
}

/* 只保留基础的 highlight.js 容器设置 */
:deep(.hljs) {
  background: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* 更细的滚动条样式 */
.code-block-content pre::-webkit-scrollbar {
  height: 6px;
}

.code-block-content pre::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 3px;
}

.code-block-content pre::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.code-block-content pre::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.dark .code-block-content pre::-webkit-scrollbar-track {
  background: #1f2937;
}

.dark .code-block-content pre::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.dark .code-block-content pre::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
