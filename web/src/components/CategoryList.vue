<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FolderIcon } from '@heroicons/vue/24/outline'
import { categoriesApi, type Category } from '../api'

const categories = ref<Category[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await categoriesApi.getAll()
    categories.value = response.data.filter(cat => cat._count && cat._count.posts > 0)
  } catch (error) {
    console.error('Failed to load categories:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
      <FolderIcon class="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
      文章分类
    </h3>
    
    <div v-if="loading" class="space-y-2">
      <div class="animate-pulse bg-gray-200 dark:bg-gray-600 h-4 rounded"></div>
      <div class="animate-pulse bg-gray-200 dark:bg-gray-600 h-4 rounded w-3/4"></div>
      <div class="animate-pulse bg-gray-200 dark:bg-gray-600 h-4 rounded w-1/2"></div>
    </div>
    
    <div v-else-if="categories.length === 0" class="text-gray-500 dark:text-gray-400 text-sm">
      暂无分类
    </div>
    
    <ul v-else class="space-y-2">
      <li v-for="category in categories" :key="category.id">
        <RouterLink
          :to="`/category/${category.slug}`"
          class="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
        >
          <span class="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {{ category.name }}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
            {{ category._count?.posts || 0 }}
          </span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>