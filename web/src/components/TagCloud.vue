<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { tagsApi, type Tag } from '../api'

const tags = ref<Tag[]>([])
const loading = ref(true)

onMounted(async () => {
  await fetchTags()
})

const fetchTags = async () => {
  try {
    const response = await tagsApi.getAll()
    tags.value = response.data
      .filter(tag => (tag._count?.posts || 0) > 0)
      .sort((a, b) => (b._count?.posts || 0) - (a._count?.posts || 0))
  } catch (error) {
    console.error('Failed to fetch tags:', error)
  } finally {
    loading.value = false
  }
}

const getTagSize = (postCount: number) => {
  const maxCount = Math.max(...tags.value.map(tag => tag._count?.posts || 0))
  const minCount = Math.min(...tags.value.map(tag => tag._count?.posts || 0))

  if (maxCount === minCount) return 'text-sm'

  const ratio = (postCount - minCount) / (maxCount - minCount)

  if (ratio >= 0.8) return 'text-lg font-semibold'
  if (ratio >= 0.6) return 'text-base font-medium'
  if (ratio >= 0.4) return 'text-sm font-medium'
  return 'text-sm'
}

const getTagColor = (index: number) => {
  const colors = [
    'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300',
    'text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300',
    'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300',
    'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300',
    'text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300',
    'text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300',
    'text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300',
    'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300',
  ]
  return colors[index % colors.length]
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">标签云</h3>

    <div v-if="loading" class="flex flex-wrap gap-2">
      <div v-for="i in 8" :key="i" class="animate-pulse">
        <div class="h-6 bg-gray-200 dark:bg-gray-600 rounded px-3 py-1"></div>
      </div>
    </div>

    <div v-else-if="tags.length === 0" class="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
      暂无标签
    </div>

    <div v-else class="flex flex-wrap gap-2">
      <RouterLink
        v-for="(tag, index) in tags"
        :key="tag.id"
        :to="`/tag/${tag.slug}`"
        :class="[
          'inline-block px-3 py-1 rounded-full transition-colors',
          getTagSize(tag._count?.posts || 0),
          getTagColor(index),
          'hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
        :title="`${tag.name} (${tag._count?.posts || 0} 篇文章)`"
      >
        {{ tag.name }}
        <span class="text-xs opacity-75 ml-1">
          ({{ tag._count?.posts || 0 }})
        </span>
      </RouterLink>
    </div>

    <div class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
      <RouterLink
        to="/posts"
        class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
      >
        查看所有文章 →
      </RouterLink>
    </div>
  </div>
</template>
