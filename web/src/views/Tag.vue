<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CalendarIcon, ClockIcon, EyeIcon, UserIcon } from '@heroicons/vue/24/outline'
import { tagsApi, postsApi, type Tag, type Post, getFullImageUrl } from '../api'

const route = useRoute()
const router = useRouter()

const tag = ref<Tag | null>(null)
const posts = ref<Post[]>([])
const pagination = ref({
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0
})
const loading = ref(true)
const error = ref('')

const slug = computed(() => route.params.slug as string)
const currentPage = computed(() => Number(route.query.page) || 1)

onMounted(async () => {
  await Promise.all([fetchTag(), fetchPosts()])
})

watch(() => route.query.page, () => {
  fetchPosts()
})

const fetchTag = async () => {
  try {
    const response = await tagsApi.getBySlug(slug.value)
    tag.value = response.data
  } catch (err) {
    error.value = '标签不存在或加载失败'
    console.error('Failed to fetch tag:', err)
  }
}

const fetchPosts = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      limit: pagination.value.limit,
      tag: slug.value
    }
    
    const response = await postsApi.getAll(params)
    posts.value = response.data.posts
    pagination.value = response.data.pagination
  } catch (err) {
    error.value = '获取文章列表失败'
    console.error('Failed to fetch posts:', err)
  } finally {
    loading.value = false
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
    <div v-if="error && !tag" class="text-center py-8">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">{{ error }}</h2>
      <RouterLink to="/" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">返回首页</RouterLink>
    </div>
    
    <div v-else-if="tag">
      <div class="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            标签: {{ tag.name }}
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ tag._count?.posts || 0 }} 篇文章
          </p>
        </div>
      </div>
      
      <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div v-if="loading" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
          
          <div v-else-if="posts.length === 0" class="text-center py-16">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">该标签下暂无文章</h2>
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
                class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
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
                      
                      <div v-if="post.category" class="flex space-x-2">
                        <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                          {{ post.category.name }}
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