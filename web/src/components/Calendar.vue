<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'
import { postsApi } from '../api'

const router = useRouter()

const currentDate = ref(new Date())
const postDates = ref<string[]>([])

onMounted(async () => {
  await fetchPostDates()
})

const fetchPostDates = async () => {
  try {
    const response = await postsApi.getAll({ published: true })
    postDates.value = response.data.posts.map(post =>
      post.publishedAt || post.createdAt
    ).map(date => date.split('T')[0])
  } catch (error) {
    console.error('Failed to fetch post dates:', error)
  }
}

const year = computed(() => currentDate.value.getFullYear())
const month = computed(() => currentDate.value.getMonth())

const monthNames = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
]

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const daysInMonth = computed(() => {
  return new Date(year.value, month.value + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  return new Date(year.value, month.value, 1).getDay()
})

const calendarDays = computed(() => {
  const days = []

  // 添加上个月的空白日期
  for (let i = 0; i < firstDayOfMonth.value; i++) {
    days.push({ day: '', isCurrentMonth: false, hasPost: false })
  }

  // 添加当月日期
  for (let day = 1; day <= daysInMonth.value; day++) {
    const dateString = `${year.value}-${String(month.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const hasPost = postDates.value.includes(dateString)
    days.push({
      day: day.toString(),
      isCurrentMonth: true,
      hasPost,
      dateString
    })
  }

  return days
})

const previousMonth = () => {
  if (month.value === 0) {
    currentDate.value = new Date(year.value - 1, 11, 1)
  } else {
    currentDate.value = new Date(year.value, month.value - 1, 1)
  }
}

const nextMonth = () => {
  if (month.value === 11) {
    currentDate.value = new Date(year.value + 1, 0, 1)
  } else {
    currentDate.value = new Date(year.value, month.value + 1, 1)
  }
}

const viewPostsForDate = (dateString?: string) => {
  router.push(`/posts?date=${dateString}`)
}

const goToToday = () => {
  currentDate.value = new Date()
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">文章日历</h3>
      <button
        @click="goToToday"
        class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
      >
        今天
      </button>
    </div>

    <!-- 月份导航 -->
    <div class="flex items-center justify-between mb-4">
      <button
        @click="previousMonth"
        class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
      >
        <ChevronLeftIcon class="h-5 w-5 text-gray-600 dark:text-gray-400" />
      </button>

      <h4 class="font-medium text-gray-900 dark:text-white">
        {{ year }}年{{ monthNames[month] }}
      </h4>

      <button
        @click="nextMonth"
        class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
      >
        <ChevronRightIcon class="h-5 w-5 text-gray-600 dark:text-gray-400" />
      </button>
    </div>

    <!-- 日历网格 -->
    <div class="grid grid-cols-7 gap-1 text-center">
      <!-- 星期标题 -->
      <div
        v-for="day in weekDays"
        :key="day"
        class="py-2 text-xs font-medium text-gray-500 dark:text-gray-400"
      >
        {{ day }}
      </div>

      <!-- 日期 -->
      <button
        v-for="(dayInfo, index) in calendarDays"
        :key="index"
        :disabled="!dayInfo.isCurrentMonth || !dayInfo.hasPost"
        :class="[
          'h-8 text-sm rounded transition-colors',
          dayInfo.isCurrentMonth
            ? 'text-gray-900 dark:text-gray-100'
            : 'text-gray-300 dark:text-gray-600',
          dayInfo.hasPost && dayInfo.isCurrentMonth
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50 cursor-pointer'
            : '',
          !dayInfo.hasPost && dayInfo.isCurrentMonth
            ? 'hover:bg-gray-100 dark:hover:bg-gray-700'
            : '',
          !dayInfo.isCurrentMonth
            ? 'cursor-not-allowed'
            : ''
        ]"
        @click="dayInfo.hasPost && dayInfo.isCurrentMonth ? viewPostsForDate(dayInfo.dateString) : null"
      >
        {{ dayInfo.day }}
      </button>
    </div>

    <div class="mt-4 text-xs text-gray-500 dark:text-gray-400">
      <div class="flex items-center space-x-4">
        <div class="flex items-center">
          <div class="w-3 h-3 bg-blue-100 dark:bg-blue-900/30 rounded mr-1"></div>
          <span>有文章</span>
        </div>
      </div>
    </div>
  </div>
</template>
