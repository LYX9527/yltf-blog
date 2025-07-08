<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CalendarIcon, ClockIcon, EyeIcon, UserIcon } from '@heroicons/vue/24/outline'
import { postsApi, type Post, getFullImageUrl } from '../api'

const route = useRoute()
const router = useRouter()

const posts = ref<Post[]>([])
const pagination = ref({
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0
})
const loading = ref(true)
const error = ref('')

const currentPage = computed(() => Number(route.query.page) || 1)
const searchQuery = computed(() => route.query.search as string || '')
const categorySlug = computed(() => route.query.category as string || '')
const tagSlug = computed(() => route.query.tag as string || '')
const dateQuery = computed(() => route.query.date as string || '')

onMounted(() => {
  fetchPosts()
})

watch(() => route.query, () => {
  fetchPosts()
})

const fetchPosts = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      limit: pagination.value.limit,
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(categorySlug.value && { category: categorySlug.value }),
      ...(tagSlug.value && { tag: tagSlug.value }),
      ...(dateQuery.value && { date: dateQuery.value })
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

const pageTitle = computed(() => {
  if (searchQuery.value) return `搜索: ${searchQuery.value}`
  if (categorySlug.value) return `分类: ${categorySlug.value}`
  if (tagSlug.value) return `标签: ${tagSlug.value}`
  if (dateQuery.value) return `日期: ${formatDate(dateQuery.value)}`
  return '所有文章'
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {{ pageTitle }}
        </h1>
        <p v-if="!loading" class="text-gray-600">
          共找到 {{ pagination.total }} 篇文章
        </p>
      </header>

      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="error" class="text-center py-16">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">{{ error }}</h2>
        <button
          @click="fetchPosts"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          重试
        </button>
      </div>

      <div v-else-if="posts.length === 0" class="text-center py-16">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">没有找到文章</h2>
        <RouterLink
          to="/"
          class="text-blue-600 hover:text-blue-800"
        >
          返回首页
        </RouterLink>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <article
            v-for="post in posts"
            :key="post.id"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
          >
            <RouterLink :to="`/posts/${post.slug}`" class="block">
              <div class="aspect-video bg-gray-200 overflow-hidden">
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
                <div class="flex items-center text-sm text-gray-500 mb-2 space-x-4">
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

                <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {{ post.title }}
                </h3>

                <p v-if="post.excerpt" class="text-gray-600 text-sm line-clamp-3 mb-4">
                  {{ post.excerpt }}
                </p>

                <div class="flex items-center justify-between">
                  <div class="flex items-center text-sm text-gray-500">
                    <UserIcon class="h-4 w-4 mr-1" />
                    {{ post.author.name || post.author.username }}
                  </div>

                  <div v-if="post.category" class="flex space-x-2">
                    <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {{ post.category.name }}
                    </span>
                  </div>
                </div>

                <div v-if="post.tags.length > 0" class="flex flex-wrap gap-1 mt-3">
                  <span
                    v-for="tag in post.tags.slice(0, 3)"
                    :key="tag.tag.id"
                    class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {{ tag.tag.name }}
                  </span>
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
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    ? 'text-blue-600 bg-blue-50 border border-blue-300'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
            </div>

            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.totalPages"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </nav>
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
