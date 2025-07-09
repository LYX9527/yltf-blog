<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface HeadingItem {
  id: string
  text: string
  level: number
  offsetTop: number
}

interface Props {
  content: string
}

const props = defineProps<Props>()

const headings = ref<HeadingItem[]>([])
const activeHeading = ref<string>('')
const tocContainer = ref<HTMLElement>()

// 解析Markdown内容提取标题
const parseHeadings = (content: string): HeadingItem[] => {
  const results: HeadingItem[] = []
  
  // 移除代码块中的内容，避免误识别代码注释中的 #
  const removeCodeBlocks = (text: string): string => {
    // 移除行内代码 `code`
    let cleaned = text.replace(/`[^`]*`/g, '')
    
    // 移除代码块 ```code```
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '')
    
    // 移除缩进代码块（4个空格或1个tab开头的行）
    cleaned = cleaned.replace(/^(    |\t).*$/gm, '')
    
    return cleaned
  }
  
  // 清理后的内容
  const cleanedContent = removeCodeBlocks(content)
  
  // 按行处理，确保标题必须在行首
  const lines = cleanedContent.split('\n')
  
  for (const line of lines) {
    // 匹配行首的标题格式：# 标题
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    
    if (headingMatch) {
      const level = headingMatch[1].length
      const text = headingMatch[2].trim()
      const id = generateId(text)

      results.push({
        id,
        text,
        level,
        offsetTop: 0
      })
    }
  }

  return results
}

// 生成锚点ID
const generateId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5-]/g, '') // 保留中文字符，移除其他特殊字符
    .replace(/[\s_-]+/g, '-') // 替换空格和下划线为连字符
    .replace(/^-+|-+$/g, '') // 移除首尾连字符
    .replace(/--+/g, '-') // 多个连字符合并为一个
    || 'heading'
}

// 计算缩进样式
const getIndentStyle = (level: number) => {
  return {
    paddingLeft: `${(level - 1)}rem`
  }
}

// 获取标题元素的offsetTop
const updateHeadingOffsets = () => {
  headings.value.forEach(heading => {
    const element = document.getElementById(heading.id)
    if (element) {
      heading.offsetTop = element.offsetTop
    }
  })
}

// 滚动到指定标题
const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    const offset = 100 // 顶部偏移量
    const elementTop = element.offsetTop - offset

    window.scrollTo({
      top: elementTop,
      behavior: 'smooth'
    })
  }
}

// 监听滚动事件，高亮当前标题
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop

  let currentHeading = ''
  let closestDistance = Infinity

  // 找到距离当前滚动位置最近的标题
  for (const heading of headings.value) {
    const element = document.getElementById(heading.id)
    if (element) {
      const elementTop = element.offsetTop
      const distance = Math.abs(elementTop - scrollTop - 150) // 150px 为偏移量

      if (elementTop <= scrollTop + 200 && distance < closestDistance) {
        closestDistance = distance
        currentHeading = heading.id
      }
    }
  }

  // 如果没有找到合适的标题，使用第一个可见的标题
  if (!currentHeading) {
    for (const heading of headings.value) {
      const element = document.getElementById(heading.id)
      if (element && element.offsetTop <= scrollTop + 200) {
        currentHeading = heading.id
      }
    }
  }

  activeHeading.value = currentHeading
}

// 计算可见的标题列表
const visibleHeadings = computed(() => {
  return headings.value.filter(h => h.level <= 4) // 只显示1-4级标题
})

onMounted(() => {
  // 解析标题
  headings.value = parseHeadings(props.content)

  // 等待DOM渲染完成后更新偏移量
  setTimeout(() => {
    updateHeadingOffsets()
    handleScroll()
  }, 500)

  // 监听滚动事件
  window.addEventListener('scroll', handleScroll, { passive: true })

  // 监听窗口大小变化
  window.addEventListener('resize', updateHeadingOffsets)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', updateHeadingOffsets)
})
</script>

<template>
  <div
    ref="tocContainer"
    class="table-of-contents bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-[calc(100vh-8rem)] flex flex-col"
  >
    <!-- 固定标题部分 -->
    <div class="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
        </svg>
        目录
      </h3>
    </div>

    <!-- 可滚动的内容部分 -->
    <div class="flex-1 overflow-y-auto p-4">
      <nav v-if="visibleHeadings.length > 0" class="space-y-1">
        <a
          v-for="heading in visibleHeadings"
          :key="heading.id"
          :href="`#${heading.id}`"
          :style="getIndentStyle(heading.level)"
          :class="[
            'block py-2 px-3 text-sm rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700',
            activeHeading === heading.id
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-l-2 border-blue-500 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          ]"
          @click.prevent="scrollToHeading(heading.id)"
        >
          <span class="line-clamp-2">{{ heading.text }}</span>
        </a>
      </nav>

      <div v-else class="text-center py-8">
        <p class="text-gray-500 dark:text-gray-400 text-sm">暂无标题</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-of-contents {
  max-width: 250px;
  min-width: 200px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

/* 更细的滚动条样式 */
.table-of-contents .overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.table-of-contents .overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.table-of-contents .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
  transition: background-color 0.2s ease;
}

.table-of-contents .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.dark .table-of-contents .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.dark .table-of-contents .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
