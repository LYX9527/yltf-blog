<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { CalendarIcon, ClockIcon, EyeIcon, UserIcon, TagIcon } from '@heroicons/vue/24/outline'
import { marked } from 'marked'
import 'highlight.js/styles/github.css'
import { postsApi, type Post, getFullImageUrl } from '../api'
import Sidebar from '../components/Sidebar.vue'
import Comments from '../components/Comments.vue'

const route = useRoute()
const post = ref<Post | null>(null)
const loading = ref(true)
const error = ref('')

const slug = computed(() => route.params.slug as string)

onMounted(async () => {
  await fetchPost()
})

// 配置 marked
marked.setOptions({
  breaks: true
})

const fetchPost = async () => {
  try {
    loading.value = true
    const response = await postsApi.getBySlug(slug.value)
    post.value = response.data
  } catch (err) {
    error.value = '文章不存在或加载失败'
    console.error('Failed to fetch post:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatContent = (content: string) => {
  try {
    return marked(content || '')
  } catch (error) {
    return '<p>内容解析错误</p>'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 主要内容区域 -->
        <div class="lg:col-span-2">
          <div v-if="loading" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>

          <div v-else-if="error" class="text-center py-16">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ error }}</h2>
            <RouterLink to="/" class="text-blue-600 hover:text-blue-800">返回首页</RouterLink>
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
                    class="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {{ post.category.name }}
                  </RouterLink>
                </div>

                <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {{ post.title }}
                </h1>

                <div class="flex flex-wrap items-center text-sm text-gray-500 space-x-6 mb-4">
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
                </div>

                <div v-if="post.tags.length > 0" class="flex flex-wrap gap-2 mb-6">
                  <RouterLink
                    v-for="tag in post.tags"
                    :key="tag.tag.id"
                    :to="`/tag/${tag.tag.slug}`"
                    class="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <TagIcon class="h-3 w-3 mr-1" />
                    {{ tag.tag.name }}
                  </RouterLink>
                </div>
              </div>
            </header>

            <div class="bg-white rounded-lg shadow-sm p-8">
              <div
                class="prose prose-lg max-w-none"
                v-html="formatContent(post.content)"
              ></div>
            </div>

            <footer v-if="post.author.bio" class="mt-12 bg-white rounded-lg shadow-sm p-8">
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
                  <h3 class="text-lg font-semibold text-gray-900 mb-1">
                    {{ post.author.name || post.author.username }}
                  </h3>
                  <p class="text-gray-600">{{ post.author.bio }}</p>
                </div>
              </div>
            </footer>

            <nav class="mt-8 flex justify-between">
              <RouterLink
                to="/posts"
                class="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ← 返回文章列表
              </RouterLink>
            </nav>

            <!-- 评论区域 -->
            <Comments :post-id="post.id" />
          </article>
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

.prose code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.prose pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.prose pre code {
  background-color: transparent;
  padding: 0;
}
</style>
