<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import {  ClockIcon, EyeIcon, UserIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { postsApi, type Post, getFullImageUrl } from '../api'
import Sidebar from '../components/Sidebar.vue'

interface PostsByYear {
  year: number
  months: {
    month: number
    monthName: string
    posts: Post[]
  }[]
}

const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref('')
const expandedYears = ref<Set<number>>(new Set())

onMounted(async () => {
  await fetchPosts()
})

const fetchPosts = async () => {
  try {
    const response = await postsApi.getAll({ published: true, limit: 1000 })
    posts.value = response.data.posts.sort((a, b) =>
      new Date(b.publishedAt || b.createdAt).getTime() -
      new Date(a.publishedAt || a.createdAt).getTime()
    )
  } catch (err) {
    error.value = '获取文章归档失败'
    console.error('Failed to fetch posts:', err)
  } finally {
    loading.value = false
  }
}

const postsByYear = computed(() => {
  const grouped: { [year: number]: { [month: number]: Post[] } } = {}

  posts.value.forEach(post => {
    const date = new Date(post.publishedAt || post.createdAt)
    const year = date.getFullYear()
    const month = date.getMonth() + 1

    if (!grouped[year]) {
      grouped[year] = {}
    }
    if (!grouped[year][month]) {
      grouped[year][month] = []
    }
    grouped[year][month].push(post)
  })

  const result: PostsByYear[] = []

  Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a)
    .forEach(year => {
      const months = Object.keys(grouped[year])
        .map(Number)
        .sort((a, b) => b - a)
        .map(month => ({
          month,
          monthName: getMonthName(month),
          posts: grouped[year][month]
        }))

      result.push({ year, months })
    })

  return result
})

const getMonthName = (month: number) => {
  const names = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]
  return names[month - 1]
}

const toggleYear = (year: number) => {
  if (expandedYears.value.has(year)) {
    expandedYears.value.delete(year)
  } else {
    expandedYears.value.add(year)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

const getTotalPostsInYear = (yearData: PostsByYear) => {
  return yearData.months.reduce((total, month) => total + month.posts.length, 0)
}

// 默认展开最近的年份
onMounted(() => {
  if (postsByYear.value.length > 0) {
    expandedYears.value.add(postsByYear.value[0].year)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 主要内容区域 -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm">
            <div class="p-6 border-b border-gray-200">
              <h1 class="text-2xl font-bold text-gray-900">文章归档</h1>
              <p class="text-gray-600 mt-1">
                按时间浏览所有文章 (共 {{ posts.length }} 篇)
              </p>
            </div>

            <div v-if="loading" class="p-8 text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p class="text-gray-500 mt-2">加载中...</p>
            </div>

            <div v-else-if="error" class="p-8 text-center">
              <p class="text-red-600 mb-4">{{ error }}</p>
              <button
                @click="fetchPosts"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                重试
              </button>
            </div>

            <div v-else-if="posts.length === 0" class="p-8 text-center">
              <p class="text-gray-500 mb-4">还没有发布任何文章</p>
              <RouterLink
                to="/"
                class="text-blue-600 hover:text-blue-800"
              >
                返回首页
              </RouterLink>
            </div>

            <div v-else class="divide-y divide-gray-200">
              <div
                v-for="yearData in postsByYear"
                :key="yearData.year"
                class="p-6"
              >
                <!-- 年份标题 -->
                <button
                  @click="toggleYear(yearData.year)"
                  class="flex items-center justify-between w-full text-left mb-4 group"
                >
                  <div class="flex items-center">
                    <component
                      :is="expandedYears.has(yearData.year) ? ChevronDownIcon : ChevronRightIcon"
                      class="h-5 w-5 text-gray-500 mr-2 transition-transform"
                    />
                    <h2 class="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {{ yearData.year }} 年
                    </h2>
                  </div>
                  <span class="text-sm text-gray-500">
                    {{ getTotalPostsInYear(yearData) }} 篇文章
                  </span>
                </button>

                <!-- 月份和文章列表 -->
                <div v-show="expandedYears.has(yearData.year)" class="ml-7 space-y-6">
                  <div
                    v-for="monthData in yearData.months"
                    :key="monthData.month"
                  >
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">
                      {{ monthData.monthName }}
                      <span class="text-sm text-gray-500 font-normal">
                        ({{ monthData.posts.length }} 篇)
                      </span>
                    </h3>

                    <div class="space-y-3">
                      <article
                        v-for="post in monthData.posts"
                        :key="post.id"
                        class="group"
                      >
                        <RouterLink
                          :to="`/posts/${post.slug}`"
                          class="block p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <div class="flex items-start space-x-4">
                            <!-- 文章缩略图 -->
                            <div class="flex-shrink-0">
                              <div v-if="post.coverImage" class="w-16 h-16 rounded-lg overflow-hidden">
                                <img
                                  :src="getFullImageUrl(post.coverImage)"
                                  :alt="post.title"
                                  class="w-full h-full object-cover"
                                />
                              </div>
                              <div
                                v-else
                                class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
                              >
                                <span class="text-white font-bold text-lg">{{ post.title.charAt(0) }}</span>
                              </div>
                            </div>

                            <!-- 文章信息 -->
                            <div class="flex-1 min-w-0">
                              <div class="flex items-center justify-between mb-1">
                                <h4 class="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                  {{ post.title }}
                                </h4>
                                <time class="text-sm text-gray-500 flex-shrink-0 ml-2">
                                  {{ formatDate(post.publishedAt || post.createdAt) }}
                                </time>
                              </div>

                              <p v-if="post.excerpt" class="text-gray-600 text-sm line-clamp-2 mb-2">
                                {{ post.excerpt }}
                              </p>

                              <div class="flex items-center justify-between">
                                <div class="flex items-center text-xs text-gray-500 space-x-4">
                                  <span class="flex items-center">
                                    <UserIcon class="h-3 w-3 mr-1" />
                                    {{ post.author.name || post.author.username }}
                                  </span>
                                  <span v-if="post.readTime" class="flex items-center">
                                    <ClockIcon class="h-3 w-3 mr-1" />
                                    {{ post.readTime }}分钟
                                  </span>
                                  <span class="flex items-center">
                                    <EyeIcon class="h-3 w-3 mr-1" />
                                    {{ post.viewCount }}
                                  </span>
                                </div>

                                <div class="flex space-x-1">
                                  <span
                                    v-for="tag in post.tags.slice(0, 2)"
                                    :key="tag.tag.id"
                                    class="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
                                  >
                                    {{ tag.tag.name }}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </RouterLink>
                      </article>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 侧边栏 -->
        <div class="lg:col-span-1">
          <Sidebar />
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
</style>
