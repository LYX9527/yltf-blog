<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, CalendarIcon, ClockIcon } from '@heroicons/vue/24/outline'
import { postsApi, type Post, getFullImageUrl } from '../api'
import { useToast } from '../composables/useToast'
import { useDialog } from '../composables/useDialog'

const { toast } = useToast()
const { confirm } = useDialog()

const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref('')
const deleteLoading = ref<string | null>(null)
const toggleLoading = ref<string | null>(null)

onMounted(async () => {
  await fetchPosts()
})

const fetchPosts = async () => {
  try {
    loading.value = true
    // 获取所有文章（包括草稿和已发布的）- 传递 'all' 避免默认的 'true' 过滤
    const response = await postsApi.getAll({ limit: 1000, published: 'all' })
    posts.value = response.data.posts
  } catch (err) {
    error.value = '获取文章列表失败'
    console.error('Failed to fetch posts:', err)
  } finally {
    loading.value = false
  }
}

const deletePost = async (post: Post) => {
  const confirmed = await confirm(
    `确定要删除文章"${post.title}"吗？此操作不可恢复。`,
    '删除文章'
  )
  
  if (!confirmed) return

  try {
    deleteLoading.value = post.id
    await postsApi.delete(post.slug)
    posts.value = posts.value.filter(p => p.id !== post.id)
    toast.success('文章删除成功')
  } catch (err) {
    console.error('Failed to delete post:', err)
    toast.error('删除失败，请重试')
  } finally {
    deleteLoading.value = null
  }
}

const togglePublished = async (post: Post) => {
  const action = post.published ? '隐藏' : '发布'
  const confirmed = await confirm(
    `确定要${action}文章"${post.title}"吗？`,
    `${action}文章`
  )
  
  if (!confirmed) return

  try {
    toggleLoading.value = post.id
    
    // 更新文章状态
    const updatedPost = await postsApi.update(post.slug, {
      ...post,
      published: !post.published
    })
    
    // 更新本地状态
    const index = posts.value.findIndex(p => p.id === post.id)
    if (index !== -1) {
      posts.value[index] = updatedPost.data
    }
    
    toast.success(`文章已${action}`)
  } catch (err) {
    console.error('Failed to toggle post status:', err)
    toast.error(`${action}失败，请重试`)
  } finally {
    toggleLoading.value = null
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (post: Post) => {
  if (post.published) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
  return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
}

const getStatusText = (post: Post) => {
  if (post.published) return '已发布'
  return '草稿'
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">文章管理</h1>
              <p class="text-gray-600 dark:text-gray-300 mt-1">管理你的所有文章</p>
            </div>
            <RouterLink
              to="/create"
              class="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              创建新文章
            </RouterLink>
          </div>
        </div>
        
        <div v-if="loading" class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p class="text-gray-500 dark:text-gray-400 mt-2">加载中...</p>
        </div>
        
        <div v-else-if="error" class="p-8 text-center">
          <p class="text-red-600 dark:text-red-400 mb-4">{{ error }}</p>
          <button
            @click="fetchPosts"
            class="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            重试
          </button>
        </div>
        
        <div v-else-if="posts.length === 0" class="p-8 text-center">
          <p class="text-gray-500 dark:text-gray-400 mb-4">还没有任何文章</p>
          <RouterLink
            to="/create"
            class="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            创建第一篇文章
          </RouterLink>
        </div>
        
        <div v-else class="overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  文章信息
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  状态
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  分类
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  创建时间
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="post in posts" :key="post.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4">
                  <div class="flex items-start space-x-3">
                    <div v-if="post.coverImage" class="flex-shrink-0">
                      <img
                        :src="getFullImageUrl(post.coverImage)"
                        :alt="post.title"
                        class="h-12 w-12 rounded-lg object-cover"
                      />
                    </div>
                    <div v-else class="flex-shrink-0">
                      <div class="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold">{{ post.title.charAt(0) }}</span>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {{ post.title }}
                      </p>
                      <p v-if="post.excerpt" class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {{ post.excerpt }}
                      </p>
                      <div class="flex items-center mt-1 text-xs text-gray-400 dark:text-gray-500 space-x-4">
                        <span v-if="post.readTime" class="flex items-center">
                          <ClockIcon class="h-3 w-3 mr-1" />
                          {{ post.readTime }}分钟
                        </span>
                        <span class="flex items-center">
                          <EyeIcon class="h-3 w-3 mr-1" />
                          {{ post.viewCount }}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    getStatusColor(post)
                  ]">
                    {{ getStatusText(post) }}
                  </span>
                  <div v-if="post.featured" class="mt-1">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                      精选
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <span v-if="post.category" class="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full text-xs">
                    {{ post.category.name }}
                  </span>
                  <span v-else class="text-gray-400 dark:text-gray-500">无分类</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div class="flex items-center">
                    <CalendarIcon class="h-4 w-4 mr-1" />
                    {{ formatDate(post.createdAt) }}
                  </div>
                  <div v-if="post.publishedAt" class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    发布: {{ formatDate(post.publishedAt) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <RouterLink
                      :to="`/posts/${post.slug}`"
                      class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="查看文章"
                    >
                      <EyeIcon class="h-4 w-4" />
                    </RouterLink>
                    <RouterLink
                      :to="`/edit/${post.slug}`"
                      class="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                      title="编辑文章"
                    >
                      <PencilIcon class="h-4 w-4" />
                    </RouterLink>
                    <button
                      type="button"
                      @click="togglePublished(post)"
                      :disabled="toggleLoading === post.id"
                      :class="[
                        'p-1 rounded transition-colors disabled:opacity-50',
                        post.published 
                          ? 'text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20' 
                          : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                      ]"
                      :title="post.published ? '隐藏文章' : '发布文章'"
                    >
                      <EyeSlashIcon v-if="post.published" class="h-4 w-4" />
                      <EyeIcon v-else class="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      @click="deletePost(post)"
                      :disabled="deleteLoading === post.id"
                      class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                      title="删除文章"
                    >
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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