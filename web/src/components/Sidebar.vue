<script setup lang="ts">
import Calendar from './Calendar.vue'
import PopularPosts from './PopularPosts.vue'
import TagCloud from './TagCloud.vue'
import CategoryList from './CategoryList.vue'

interface Props {
  showCalendar?: boolean
  showPopularPosts?: boolean
  showTagCloud?: boolean
  showCategories?: boolean
}

withDefaults(defineProps<Props>(), {
  showCalendar: true,
  showPopularPosts: true,
  showTagCloud: true,
  showCategories: true
})
</script>

<template>
  <aside class="space-y-6">
    <!-- 分类列表 -->
    <CategoryList v-if="showCategories" />
    
    <!-- 日历 -->
    <Calendar v-if="showCalendar" />
    
    <!-- 热门文章 -->
    <PopularPosts v-if="showPopularPosts" />
    
    <!-- 标签云 -->
    <TagCloud v-if="showTagCloud" />
  </aside>
</template>