<script setup lang="ts">
import { computed, h, type VNode } from 'vue'
import { marked } from 'marked'
import CodeBlock from './CodeBlock.vue'

interface Props {
  content: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: 'prose prose-lg max-w-none dark:prose-invert'
})

// 解析代码块的正则表达式 - 更准确的匹配
const codeBlockRegex = /^```(\w+)?\n([\s\S]*?)^```$/gm

// 生成锚点ID的函数
const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5-]/g, '') // 保留中文字符，移除其他特殊字符
    .replace(/[\s_-]+/g, '-') // 替换空格和下划线为连字符
    .replace(/^-+|-+$/g, '') // 移除首尾连字符
    .replace(/--+/g, '-') // 多个连字符合并为一个
    || 'heading'
}

// 配置 marked 的自定义 renderer
const setupRenderer = () => {
  const renderer = new marked.Renderer()
  
  // 为标题添加锚点ID
  renderer.heading = ({ tokens, depth }: { tokens: any[], depth: number }) => {
    // 提取纯文本内容
    const text = tokens.map(token => {
      if (typeof token === 'string') return token
      if (token.type === 'text') return token.text
      if (token.raw) return token.raw
      if (token.text) return token.text
      return ''
    }).join('').trim()
    
    const id = generateId(text)
    return `<h${depth} id="${id}">${text}</h${depth}>`
  }
  
  return renderer
}

// 配置 marked 选项
const markedOptions = {
  breaks: true,
  gfm: true,
  renderer: setupRenderer()
}

// 解析并渲染内容
const renderContent = () => {
  const content = props.content
  const parts: VNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  // 重置正则表达式的lastIndex
  codeBlockRegex.lastIndex = 0

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const [fullMatch, language, code] = match
    const startIndex = match.index!

    // 添加代码块之前的内容
    if (startIndex > lastIndex) {
      const beforeContent = content.substring(lastIndex, startIndex)
      if (beforeContent.trim()) {
        parts.push(h('div', {
          innerHTML: marked(beforeContent, markedOptions),
          class: 'markdown-content'
        }))
      }
    }

    // 添加代码块
    parts.push(h(CodeBlock, {
      key: `code-${startIndex}`,
      code: code.trim(),
      language: language || '',
      showHeader: true,
      showLineNumbers: false
    }))

    lastIndex = startIndex + fullMatch.length
  }

  // 添加剩余的内容
  if (lastIndex < content.length) {
    const remainingContent = content.substring(lastIndex)
    if (remainingContent.trim()) {
      parts.push(h('div', {
        innerHTML: marked(remainingContent, markedOptions),
        class: 'markdown-content'
      }))
    }
  }

  // 如果没有找到代码块，直接渲染整个内容
  if (parts.length === 0) {
    parts.push(h('div', {
      innerHTML: marked(content, markedOptions),
      class: 'markdown-content'
    }))
  }

  return parts
}

const renderedContent = computed(() => {
  return renderContent()
})
</script>

<template>
  <div :class="props.class">
    <component 
      v-for="(part, index) in renderedContent" 
      :key="index"
      :is="part"
    />
  </div>
</template>

<style scoped>
/* 基础 prose 样式 */
:deep(.markdown-content) {
  color: #374151;
  line-height: 1.7;
}

:deep(.markdown-content h1),
:deep(.markdown-content h2),
:deep(.markdown-content h3),
:deep(.markdown-content h4),
:deep(.markdown-content h5),
:deep(.markdown-content h6) {
  color: #111827;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  scroll-margin-top: 6rem; /* 为锚点跳转添加顶部偏移 */
}

:deep(.markdown-content h1) {
  font-size: 1.875rem;
  margin-top: 0;
}

:deep(.markdown-content h2) {
  font-size: 1.5rem;
}

:deep(.markdown-content h3) {
  font-size: 1.25rem;
}

:deep(.markdown-content h4) {
  font-size: 1.125rem;
}

:deep(.markdown-content p) {
  margin-bottom: 1rem;
}

:deep(.markdown-content ul),
:deep(.markdown-content ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

:deep(.markdown-content li) {
  margin-bottom: 0.25rem;
}

:deep(.markdown-content blockquote) {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: #6b7280;
}

:deep(.markdown-content code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: 'JetBrains Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: #dc2626;
}

:deep(.markdown-content a) {
  color: #2563eb;
  text-decoration: underline;
}

:deep(.markdown-content a:hover) {
  color: #1d4ed8;
}

:deep(.markdown-content img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

:deep(.markdown-content table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

:deep(.markdown-content th),
:deep(.markdown-content td) {
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
  text-align: left;
}

:deep(.markdown-content th) {
  background-color: #f9fafb;
  font-weight: 600;
}

:deep(.markdown-content hr) {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 2rem 0;
}

/* 暗黑模式样式 */
:deep(.dark .markdown-content) {
  color: #d1d5db;
}

:deep(.dark .markdown-content h1),
:deep(.dark .markdown-content h2),
:deep(.dark .markdown-content h3),
:deep(.dark .markdown-content h4),
:deep(.dark .markdown-content h5),
:deep(.dark .markdown-content h6) {
  color: #f9fafb;
  scroll-margin-top: 6rem; /* 为锚点跳转添加顶部偏移 */
}

:deep(.dark .markdown-content blockquote) {
  border-left-color: #4b5563;
  color: #9ca3af;
}

:deep(.dark .markdown-content code) {
  background-color: #374151;
  color: #fbbf24;
}

:deep(.dark .markdown-content a) {
  color: #60a5fa;
}

:deep(.dark .markdown-content a:hover) {
  color: #3b82f6;
}

:deep(.dark .markdown-content th),
:deep(.dark .markdown-content td) {
  border-color: #4b5563;
}

:deep(.dark .markdown-content th) {
  background-color: #374151;
  color: #f9fafb;
}

:deep(.dark .markdown-content hr) {
  border-top-color: #4b5563;
}
</style>