<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

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
const tocContent = ref<HTMLElement>()
const isExpanded = ref(false)
const isAnimating = ref(false)

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
    paddingLeft: `${(level - 1) * 0.75}rem`
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

    // 在小屏幕上，点击标题后自动收缩目录
    if (window.innerWidth < 1280) {
      toggleExpand()
    }
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

// 切换展开/收缩状态
const toggleExpand = () => {
  if (isAnimating.value) return

  isAnimating.value = true

  const container = tocContainer.value
  const content = tocContent.value
  if (!container) return

  const tl = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false
    }
  })

  if (!isExpanded.value) {
    // 展开动画：先展开宽度，再显示内容
    isExpanded.value = true // 先显示内容DOM

    // 设置内容初始状态
    gsap.set(content!, { opacity: 0, x: -20 })

    tl.to(container, {
      width: "280px",
      zIndex: 50,
      duration: 0.3,
      ease: "power2.out"
    })
    .to(container, {
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      duration: 0.2,
      ease: "power2.out"
    }, "<")
    .to(content!, {
      opacity: 1,
      x: 0,
      duration: 0.25,
      ease: "power2.out"
    }, "-=0.1")
  } else {
    // 收缩动画：先隐藏内容，再收缩宽度
    tl.to(content!, {
      opacity: 0,
      x: -20,
      duration: 0.2,
      ease: "power2.in"
    })
    .to(container, {
      width: "48px",
      duration: 0.3,
      ease: "power2.inOut"
    }, "+=0.1")
    .to(container, {
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      zIndex: 10,
      duration: 0.2,
      ease: "power2.out"
    }, "<")
    .call(() => {
      isExpanded.value = false // 动画完成后隐藏内容DOM
    })
  }
}

onMounted(() => {
  // 解析标题
  headings.value = parseHeadings(props.content)

  // 等待DOM渲染完成后设置初始状态和偏移量
  setTimeout(() => {
    // 设置初始状态 - 收缩状态
    if (tocContainer.value) {
      gsap.set(tocContainer.value, {
        width: "48px",
        zIndex: 10,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      })
    }
    // 不需要设置tocContent的初始状态，因为v-show会处理显示隐藏

    updateHeadingOffsets()
    handleScroll()
  }, 100)

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
    class="table-of-contents fixed bg-white dark:bg-gray-800 rounded-r-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200 hidden lg:block"
    :class="{ 'hover:shadow-xl': !isExpanded }"
    style="height: calc(100vh - 12rem); top: 6rem; left: 0;"
  >
    <!-- 收缩状态的侧边按钮 -->
    <div
      v-show="!isExpanded"
      class="h-full flex flex-col items-center justify-start pt-4"
    >
      <!-- 目录按钮 -->
      <button
        @click="toggleExpand"
        :disabled="isAnimating"
        class="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 group"
        title="展开目录"
      >
        <svg
          class="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
        </svg>
      </button>

      <!-- 垂直的"目录"文字 -->
      <div class="mt-4 writing-mode-vertical text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wider">
        目录
      </div>

      <!-- 当前激活标题的指示器 -->
      <div v-if="activeHeading" class="mt-4 w-1 h-8 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
    </div>

    <!-- 展开状态的完整内容 -->
    <div
      ref="tocContent"
      v-show="isExpanded"
      class="absolute inset-0 flex flex-col h-full"
    >
      <!-- 标题栏 -->
      <div class="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
            </svg>
            目录
          </h3>

          <!-- 收缩按钮 -->
          <button
            @click="toggleExpand"
            :disabled="isAnimating"
            class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
            title="收缩目录"
          >
            <svg
              class="w-4 h-4 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- 可滚动的内容部分 -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-4">
          <nav v-if="visibleHeadings.length > 0" class="space-y-1">
            <a
              v-for="heading in visibleHeadings"
              :key="heading.id"
              :href="`#${heading.id}`"
              :style="getIndentStyle(heading.level)"
              :class="[
                'block py-2 px-3 text-sm rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 transform hover:translate-x-1',
                activeHeading === heading.id
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-l-2 border-blue-500 dark:border-blue-400 translate-x-1'
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
    </div>
  </div>
</template>

<style scoped>
.table-of-contents {
  min-height: 200px;
}

.writing-mode-vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
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

/* 添加链接的微动画 */
.table-of-contents a {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.table-of-contents a:hover {
  transform: translateX(4px);
}

.table-of-contents a.active {
  transform: translateX(4px);
}
</style>
