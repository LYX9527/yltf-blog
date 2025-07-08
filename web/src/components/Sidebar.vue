<script setup lang="ts">
import Calendar from './Calendar.vue'
import PopularPosts from './PopularPosts.vue'
import TagCloud from './TagCloud.vue'

interface Props {
  showCalendar?: boolean
  showPopularPosts?: boolean
  showTagCloud?: boolean
}

withDefaults(defineProps<Props>(), {
  showCalendar: true,
  showPopularPosts: true,
  showTagCloud: true
})
</script>

<template>
  <aside class="space-y-6">
    <!-- 日历 -->
    <Calendar v-if="showCalendar" />
    
    <!-- 热门文章 -->
    <PopularPosts v-if="showPopularPosts" />
    
    <!-- 标签云 -->
    <TagCloud v-if="showTagCloud" />
  </aside>
</template>