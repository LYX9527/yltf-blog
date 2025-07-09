<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { CalendarIcon, ClockIcon, EyeIcon, UserIcon, TagIcon, HeartIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/vue/24/solid'
import { postsApi, likesApi, type Post, getFullImageUrl } from '../api'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import Sidebar from '../components/Sidebar.vue'
import Comments from '../components/Comments.vue'
import MarkdownRenderer from '../components/MarkdownRenderer.vue'
import TableOfContents from '../components/TableOfContents.vue'

const route = useRoute()
const authStore = useAuthStore()
const { toast } = useToast()
const post = ref<Post | null>(null)
const loading = ref(true)
const error = ref('')
const isLiked = ref(false)
const likeCount = ref(0)
const likePending = ref(false)
const tocPosition = ref({
  left: '390px',
  top: '6rem',
})

const slug = computed(() => route.params.slug as string)

// 计算目录位置
const calculateTocPosition = () => {
  const container = document.querySelector('.max-w-7xl')
  if (container) {
    const containerRect = container.getBoundingClientRect()
    const containerLeft = containerRect.left
    const tocLeft = Math.max(16, containerLeft - 250) // 288px = 18rem, 16px = 1rem 最小距离
    tocPosition.value = {
      left: `${tocLeft}px`,
      top: '6rem',
    }
  }
}

const fetchPost = async () => {
  try {
    loading.value = true
    error.value = ''
    post.value = null
    isLiked.value = false
    likeCount.value = 0
    
    const response = await postsApi.getBySlug(slug.value)
    post.value = response.data

    // 设置点赞数
    likeCount.value = post.value.likeCount || post.value._count?.likes || 0

    // 如果用户已登录，获取点赞状态
    if (authStore.isLoggedIn && post.value) {
      try {
        const likeResponse = await likesApi.getStatus(post.value.id)
        isLiked.value = likeResponse.data.isLiked
      } catch (err) {
        console.error('Failed to fetch like status:', err)
      }
    }
  } catch (err) {
    error.value = '文章不存在或加载失败'
    console.error('Failed to fetch post:', err)
  } finally {
    loading.value = false
  }
}

// 监听路由参数变化
watch(
  () => route.params.slug,
  async (newSlug) => {
    if (newSlug) {
      await fetchPost()
      // 重新计算目录位置
      setTimeout(() => {
        calculateTocPosition()
      }, 100)
    }
  },
  { immediate: true }
)

onMounted(() => {
  // 监听窗口大小变化
  window.addEventListener('resize', calculateTocPosition)
})

// 清理事件监听
onUnmounted(() => {
  window.removeEventListener('resize', calculateTocPosition)
})

const handleLike = async () => {
  if (!authStore.isLoggedIn) {
    toast.error('请先登录才能点赞')
    return
  }

  if (!post.value || likePending.value) return

  try {
    likePending.value = true
    const response = await likesApi.toggle(post.value.id)

    isLiked.value = response.data.isLiked
    likeCount.value = response.data.likeCount

    toast.success(response.data.isLiked ? '点赞成功' : '取消点赞')
  } catch (err) {
    console.error('Failed to toggle like:', err)
    toast.error('操作失败，请重试')
  } finally {
    likePending.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 主要内容区域 -->
        <div class="lg:col-span-2 relative">
          <!-- 目录 - 固定定位在左侧，动态计算位置 -->
          <div v-if="post && post.content" class="hidden xl:block fixed z-10 w-64"
               :style="{ left: tocPosition.left, top: tocPosition.top }">
            <TableOfContents :content="post.content" />
          </div>

          <div v-if="loading" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>

          <div v-else-if="error" class="text-center py-16">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">{{ error }}</h2>
            <RouterLink to="/" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">返回首页</RouterLink>
          </div>

          <article v-else-if="post">
            <header class="mb-8">
              <div v-if="post.coverImage" class="aspect-video mb-8 rounded-lg overflow-hidden">
                <img
                  :src="getFullImageUrl(post.coverImage)"
                  :alt="post.title"
                  class="w-full h-full object-cover"
                />
              </div>

              <div class="mb-4">
                <div v-if="post.category" class="mb-4">
                  <RouterLink
                    :to="`/category/${post.category.slug}`"
                    class="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                  >
                    {{ post.category.name }}
                  </RouterLink>
                </div>

                <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {{ post.title }}
                </h1>

                <div class="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 space-x-6 mb-4">
                  <div class="flex items-center">
                    <UserIcon class="h-4 w-4 mr-1" />
                    <span>{{ post.author.name || post.author.username }}</span>
                  </div>

                  <div class="flex items-center">
                    <CalendarIcon class="h-4 w-4 mr-1" />
                    <span>{{ formatDate(post.publishedAt || post.createdAt) }}</span>
                  </div>

                  <div v-if="post.readTime" class="flex items-center">
                    <ClockIcon class="h-4 w-4 mr-1" />
                    <span>{{ post.readTime }} 分钟阅读</span>
                  </div>

                  <div class="flex items-center">
                    <EyeIcon class="h-4 w-4 mr-1" />
                    <span>{{ post.viewCount }} 次阅读</span>
                  </div>

                  <!-- 点赞按钮 -->
                  <div class="flex items-center">
                    <button
                      @click="handleLike"
                      :disabled="likePending"
                      :class="[
                        'flex items-center space-x-1 px-3 py-1 rounded-full transition-all duration-200 disabled:opacity-50',
                        isLiked
                          ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/50'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400'
                      ]"
                    >
                      <component
                        :is="isLiked ? HeartIconSolid : HeartIcon"
                        class="h-4 w-4"
                      />
                      <span>{{ likeCount }}</span>
                    </button>
                  </div>
                </div>

                <div v-if="post.tags.length > 0" class="flex flex-wrap gap-2 mb-6">
                  <RouterLink
                    v-for="tag in post.tags"
                    :key="tag.tag.id"
                    :to="`/tag/${tag.tag.slug}`"
                    class="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <TagIcon class="h-3 w-3 mr-1" />
                    {{ tag.tag.name }}
                  </RouterLink>
                </div>
              </div>
            </header>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <MarkdownRenderer
                :content="post.content"
                class="prose prose-lg max-w-none dark:prose-invert"
              />
            </div>

            <footer v-if="post.author.bio" class="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <div class="flex items-start space-x-4">
                <div v-if="post.author.avatar" class="flex-shrink-0">
                  <img
                    :src="post.author.avatar"
                    :alt="post.author.name || post.author.username"
                    class="h-12 w-12 rounded-full object-cover"
                  />
                </div>
                <div v-else class="flex-shrink-0">
                  <div class="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span class="text-white font-bold">
                      {{ (post.author.name || post.author.username).charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {{ post.author.name || post.author.username }}
                  </h3>
                  <p class="text-gray-600 dark:text-gray-300">{{ post.author.bio }}</p>
                </div>
              </div>
            </footer>

            <nav class="mt-8 flex justify-between">
              <RouterLink
                to="/posts"
                class="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                ← 返回文章列表
              </RouterLink>
            </nav>

            <!-- 评论区域 -->
            <Comments :post-id="post.id" :post-author-id="post.author.id" />
          </article>
        </div>

        <!-- 右侧侧边栏 -->
        <div class="lg:col-span-1">
          <Sidebar />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.prose {
  line-height: 1.8;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.dark .prose h1,
.dark .prose h2,
.dark .prose h3,
.dark .prose h4,
.dark .prose h5,
.dark .prose h6 {
  color: #f9fafb;
}

.dark .prose p {
  color: #e5e7eb;
}

.prose h1 {
  font-size: 2rem;
}

.prose h2 {
  font-size: 1.5rem;
}

.prose h3 {
  font-size: 1.25rem;
}

.prose p {
  margin-bottom: 1.5rem;
}

.prose ul,
.prose ol {
  margin-bottom: 1.5rem;
  padding-left: 2rem;
}

.dark .prose ul,
.dark .prose ol {
  color: #e5e7eb;
}

.prose li {
  margin-bottom: 0.5rem;
}

.prose blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: #6b7280;
}

.dark .prose blockquote {
  border-left: 4px solid #4b5563;
  color: #9ca3af;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.dark .prose code {
  background-color: #374151;
  color: #f9fafb;
}

.prose pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.dark .prose pre {
  background-color: #111827;
}

.prose pre code {
  background-color: transparent;
  padding: 0;
}
</style>
