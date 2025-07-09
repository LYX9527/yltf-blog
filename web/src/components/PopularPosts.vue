<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { EyeIcon, ClockIcon } from '@heroicons/vue/24/outline'
import { postsApi, type Post } from '../api'

const popularPosts = ref<Post[]>([])
const loading = ref(true)

onMounted(async () => {
  await fetchPopularPosts()
})

const fetchPopularPosts = async () => {
  try {
    const response = await postsApi.getAll({ published: true, limit: 50 })
    // 按浏览量排序取前5篇
    popularPosts.value = response.data.posts
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5)
  } catch (error) {
    console.error('Failed to fetch popular posts:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">热门文章</h3>
    
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="animate-pulse">
        <div class="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
      </div>
    </div>
    
    <div v-else-if="popularPosts.length === 0" class="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
      暂无热门文章
    </div>
    
    <div v-else class="space-y-4">
      <article
        v-for="(post, index) in popularPosts"
        :key="post.id"
        class="group"
      >
        <RouterLink
          :to="`/posts/${post.slug}`"
          class="block hover:bg-gray-50 dark:hover:bg-gray-700 -m-2 p-2 rounded transition-colors"
        >
          <div class="flex items-start space-x-3">
            <!-- 排名 -->
            <div class="flex-shrink-0 mt-1">
              <span :class="[
                'inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full',
                index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                index === 1 ? 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300' :
                index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
              ]">
                {{ index + 1 }}
              </span>
            </div>
            
            <!-- 文章信息 -->
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-5">
                {{ post.title }}
              </h4>
              
              <div class="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400 space-x-3">
                <span class="flex items-center">
                  <EyeIcon class="h-3 w-3 mr-1" />
                  {{ post.viewCount }}
                </span>
                <span v-if="post.readTime" class="flex items-center">
                  <ClockIcon class="h-3 w-3 mr-1" />
                  {{ post.readTime }}分钟
                </span>
                <span>
                  {{ formatDate(post.publishedAt || post.createdAt) }}
                </span>
              </div>
            </div>
          </div>
        </RouterLink>
      </article>
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