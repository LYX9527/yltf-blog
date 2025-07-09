<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CalendarIcon, ClockIcon, EyeIcon, UserIcon } from '@heroicons/vue/24/outline'
import { categoriesApi, postsApi, type Category, type Post, getFullImageUrl } from '../api'

const route = useRoute()
const router = useRouter()

const category = ref<Category | null>(null)
const posts = ref<Post[]>([])
const pagination = ref({
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0
})
const loading = ref(true)
const postsLoading = ref(false)
const error = ref('')

const slug = computed(() => route.params.slug as string)
const currentPage = computed(() => Number(route.query.page) || 1)

onMounted(async () => {
  await fetchCategory()
  if (category.value) {
    await fetchPosts()
  }
  loading.value = false
})

watch(() => route.query.page, () => {
  fetchPosts()
})

// 监听路由参数变化，当切换到不同分类时重新加载
watch(() => route.params.slug, async (newSlug, oldSlug) => {
  if (newSlug !== oldSlug) {
    loading.value = true
    category.value = null
    posts.value = []
    error.value = ''
    
    // 重置分页状态
    pagination.value = {
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0
    }
    
    // 如果有页码查询参数，清除它们
    if (route.query.page) {
      await router.replace({ 
        path: route.path, 
        query: {} 
      })
    }
    
    await fetchCategory()
    if (category.value) {
      await fetchPosts()
    }
    loading.value = false
  }
})

const fetchCategory = async () => {
  try {
    const response = await categoriesApi.getBySlug(slug.value)
    category.value = response.data
    error.value = '' // 清除之前的错误
  } catch (err: any) {
    if (err.response?.status === 404) {
      error.value = '分类不存在'
    } else {
      error.value = '分类加载失败'
    }
    console.error('Failed to fetch category:', err)
  }
}

const fetchPosts = async () => {
  if (!category.value) return
  
  try {
    postsLoading.value = true
    const params = {
      page: currentPage.value,
      limit: pagination.value.limit,
      category: slug.value
    }
    
    const response = await postsApi.getAll(params)
    posts.value = response.data.posts
    pagination.value = response.data.pagination
  } catch (err) {
    console.error('Failed to fetch posts:', err)
    // 这里不设置error，因为分类存在，只是获取文章失败
  } finally {
    postsLoading.value = false
  }
}

const changePage = (page: number) => {
  const query = { ...route.query, page: page.toString() }
  router.push({ query })
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
  <div>
    <!-- 初始加载状态 -->
    <div v-if="loading" class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-300">加载中...</p>
      </div>
    </div>

    <!-- 分类不存在的错误页面 -->
    <div v-else-if="error && !category" class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div class="text-center">
        <div class="mb-8">
          <svg class="mx-auto h-24 w-24 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v1H8V5z" />
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">{{ error }}</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-8">抱歉，您访问的分类页面不存在</p>
        <div class="space-x-4">
          <RouterLink 
            to="/" 
            class="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            返回首页
          </RouterLink>
          <RouterLink 
            to="/posts" 
            class="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            浏览文章
          </RouterLink>
        </div>
      </div>
    </div>
    
    <!-- 正常的分类页面 -->
    <div v-else-if="category">
      <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {{ category.name }}
          </h1>
          <p v-if="category.description" class="text-lg text-gray-600 dark:text-gray-300 mb-4">
            {{ category.description }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ category._count?.posts || 0 }} 篇文章
          </p>
        </div>
      </div>
      
      <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div v-if="postsLoading" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
          
          <div v-else-if="posts.length === 0" class="text-center py-16">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">该分类下暂无文章</h2>
            <RouterLink
              to="/posts"
              class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              浏览所有文章
            </RouterLink>
          </div>
          
          <div v-else>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <article
                v-for="post in posts"
                :key="post.id"
                class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group border border-gray-200 dark:border-gray-700"
              >
                <RouterLink :to="`/posts/${post.slug}`" class="block">
                  <div class="aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img
                      v-if="post.coverImage"
                      :src="getFullImageUrl(post.coverImage)"
                      :alt="post.title"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div
                      v-else
                      class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                    >
                      <span class="text-white text-xl font-bold">{{ post.title.charAt(0) }}</span>
                    </div>
                  </div>
                  
                  <div class="p-6">
                    <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2 space-x-4">
                      <span class="flex items-center">
                        <CalendarIcon class="h-4 w-4 mr-1" />
                        {{ formatDate(post.publishedAt || post.createdAt) }}
                      </span>
                      <span v-if="post.readTime" class="flex items-center">
                        <ClockIcon class="h-4 w-4 mr-1" />
                        {{ post.readTime }}min
                      </span>
                      <span class="flex items-center">
                        <EyeIcon class="h-4 w-4 mr-1" />
                        {{ post.viewCount }}
                      </span>
                    </div>
                    
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {{ post.title }}
                    </h3>
                    
                    <p v-if="post.excerpt" class="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                      {{ post.excerpt }}
                    </p>
                    
                    <div class="flex items-center justify-between">
                      <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <UserIcon class="h-4 w-4 mr-1" />
                        {{ post.author.name || post.author.username }}
                      </div>
                      
                      <div v-if="post.tags.length > 0" class="flex flex-wrap gap-1">
                        <span
                          v-for="tag in post.tags.slice(0, 2)"
                          :key="tag.tag.id"
                          class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                        >
                          {{ tag.tag.name }}
                        </span>
                      </div>
                    </div>
                  </div>
                </RouterLink>
              </article>
            </div>
            
            <nav v-if="pagination.totalPages > 1" class="flex justify-center">
              <div class="flex items-center space-x-2">
                <button
                  @click="changePage(pagination.page - 1)"
                  :disabled="pagination.page <= 1"
                  class="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                
                <div class="flex space-x-1">
                  <button
                    v-for="page in Math.min(pagination.totalPages, 10)"
                    :key="page"
                    @click="changePage(page)"
                    :class="[
                      'px-3 py-2 text-sm font-medium rounded-md',
                      page === pagination.page
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600'
                        : 'text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    ]"
                  >
                    {{ page }}
                  </button>
                </div>
                
                <button
                  @click="changePage(pagination.page + 1)"
                  :disabled="pagination.page >= pagination.totalPages"
                  class="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>