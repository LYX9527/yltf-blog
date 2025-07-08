<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { CalendarIcon, ClockIcon, EyeIcon, UserIcon } from '@heroicons/vue/24/outline'
import { postsApi, type Post, getFullImageUrl } from '../api'
import Sidebar from '../components/Sidebar.vue'

const featuredPosts = ref<Post[]>([])
const recentPosts = ref<Post[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [featuredResponse, recentResponse] = await Promise.all([
      postsApi.getFeatured(),
      postsApi.getAll({ limit: 6 })
    ])

    featuredPosts.value = featuredResponse.data
    recentPosts.value = recentResponse.data.posts
  } catch (error) {
    console.error('Failed to fetch posts:', error)
  } finally {
    loading.value = false
  }
})

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
    <section class="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <div class="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            欢迎来到倚栏听风的博客
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-blue-100">
            分享技术心得，记录学习历程
          </p>
          <RouterLink
            to="/posts"
            class="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            浏览所有文章
          </RouterLink>
        </div>
      </div>
    </section>

    <section v-if="featuredPosts.length > 0" class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">精选文章</h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <article
            v-for="post in featuredPosts.slice(0, 2)"
            :key="post.id"
            class="group cursor-pointer"
          >
            <RouterLink :to="`/posts/${post.slug}`" class="block">
              <div class="bg-gray-200 aspect-video rounded-lg mb-4 overflow-hidden">
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
                  <span class="text-white text-2xl font-bold">{{ post.title.charAt(0) }}</span>
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex items-center text-sm text-gray-500 space-x-4">
                  <span class="flex items-center">
                    <CalendarIcon class="h-4 w-4 mr-1" />
                    {{ formatDate(post.publishedAt || post.createdAt) }}
                  </span>
                  <span v-if="post.readTime" class="flex items-center">
                    <ClockIcon class="h-4 w-4 mr-1" />
                    {{ post.readTime }} 分钟阅读
                  </span>
                  <span class="flex items-center">
                    <EyeIcon class="h-4 w-4 mr-1" />
                    {{ post.viewCount }}
                  </span>
                </div>

                <h3 class="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {{ post.title }}
                </h3>

                <p v-if="post.excerpt" class="text-gray-600 line-clamp-2">
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
              </div>
            </RouterLink>
          </article>
        </div>
      </div>
    </section>

    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- 主要内容区域 -->
          <div class="lg:col-span-2">
            <div class="flex justify-between items-center mb-8">
              <h2 class="text-3xl font-bold text-gray-900">最新文章</h2>
              <RouterLink
                to="/posts"
                class="text-blue-600 hover:text-blue-800 font-medium"
              >
                查看更多 →
              </RouterLink>
            </div>

            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <article
                v-for="post in recentPosts"
                :key="post.id"
                class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <RouterLink :to="`/posts/${post.slug}`" class="block">
                  <div class="aspect-video bg-gray-200 overflow-hidden">
                    <img
                      v-if="post.coverImage"
                      :src="post.coverImage"
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
                    </div>

                    <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {{ post.title }}
                    </h3>

                    <p v-if="post.excerpt" class="text-gray-600 text-sm line-clamp-2 mb-3">
                      {{ post.excerpt }}
                    </p>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center text-sm text-gray-500">
                        <UserIcon class="h-4 w-4 mr-1" />
                        {{ post.author.name || post.author.username }}
                      </div>

                      <div class="flex space-x-1">
                        <span
                          v-for="tag in post.tags.slice(0, 2)"
                          :key="tag.tag.id"
                          class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {{ tag.tag.name }}
                        </span>
                      </div>
                    </div>
                  </div>
                </RouterLink>
              </article>
            </div>
          </div>

          <!-- 侧边栏 -->
          <div class="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
