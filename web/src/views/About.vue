<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { EnvelopeIcon, CodeBracketIcon, HeartIcon } from '@heroicons/vue/24/outline'
import { aboutApi, type AboutInfo } from '../api'

// 关于我的信息
const aboutInfo = ref<AboutInfo>({
  name: 'Blog Author',
  title: '一个不甘心一直写业务代码的程序员！！',
  description: `作为一名程序员，我不满足于日复一日的业务逻辑编写。我渴望探索技术的深度，追求代码的艺术性，致力于创造有意义的产品。

我相信技术不仅仅是工具，更是改变世界的力量。通过这个博客，我分享我在技术探索路上的心得体会、遇到的挑战以及解决方案。

我热爱学习新技术，喜欢思考技术背后的原理，更喜欢将复杂的概念用简单的方式表达出来。希望我的分享能够帮助到更多的开发者朋友。`,
  skills: [
    'JavaScript/TypeScript',
    'Vue.js/React',
    'Node.js',
    'Python',
    'Database Design',
    'System Architecture'
  ],
  interests: [
    '开源项目贡献',
    '技术架构设计',
    '产品思维',
    '用户体验',
    '技术写作',
    '团队协作'
  ],
  email: 'fp4u5h7k@gmail.com'
})

const loading = ref(true)
const error = ref('')

// 从API加载关于我的信息
const loadAboutInfo = async () => {
  try {
    loading.value = true
    const response = await aboutApi.get()
    aboutInfo.value = response.data
  } catch (err) {
    console.error('加载关于我信息失败:', err)
    error.value = '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAboutInfo()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <!-- 页面标题 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">关于我</h1>
        <p class="text-xl text-gray-600 dark:text-gray-300">了解更多关于我的信息</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="text-center py-16">
        <p class="text-red-600 dark:text-red-400 mb-4">{{ error }}</p>
        <button
          @click="loadAboutInfo"
          class="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          重试
        </button>
      </div>

      <!-- 主要内容 -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <!-- 个人介绍卡片 -->
        <div class="p-8">
          <div class="flex items-center mb-6">
            <div class="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <CodeBracketIcon class="h-10 w-10 text-white" />
            </div>
            <div class="ml-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ aboutInfo.name }}</h2>
              <p class="text-lg text-blue-600 dark:text-blue-400 font-medium">{{ aboutInfo.title }}</p>
            </div>
          </div>

          <!-- 详细描述 -->
          <div class="prose prose-lg max-w-none">
            <div class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {{ aboutInfo.description }}
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700"></div>

        <!-- 技能和兴趣 -->
        <div class="grid md:grid-cols-2 gap-8 p-8">
          <!-- 技术技能 -->
          <div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CodeBracketIcon class="h-6 w-6 mr-2 text-blue-500 dark:text-blue-400" />
              技术技能
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="skill in aboutInfo.skills"
                :key="skill"
                class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
              >
                {{ skill }}
              </span>
            </div>
          </div>

          <!-- 兴趣爱好 -->
          <div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <HeartIcon class="h-6 w-6 mr-2 text-red-500 dark:text-red-400" />
              兴趣爱好
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="interest in aboutInfo.interests"
                :key="interest"
                class="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm font-medium"
              >
                {{ interest }}
              </span>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700"></div>

        <!-- 联系方式 -->
        <div class="p-8">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <EnvelopeIcon class="h-6 w-6 mr-2 text-green-500 dark:text-green-400" />
            联系我
          </h3>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div v-if="aboutInfo.email" class="flex items-center mb-3">
              <EnvelopeIcon class="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
              <span class="text-gray-600 dark:text-gray-300 mr-2">邮箱:</span>
              <a
                :href="`mailto:${aboutInfo.email}`"
                class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                {{ aboutInfo.email }}
              </a>
            </div>
            <div v-if="aboutInfo.github" class="flex items-center mb-3">
              <span class="text-gray-600 dark:text-gray-300 mr-2">GitHub:</span>
              <a
                :href="aboutInfo.github"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                {{ aboutInfo.github }}
              </a>
            </div>
            <div v-if="aboutInfo.linkedin" class="flex items-center mb-3">
              <span class="text-gray-600 dark:text-gray-300 mr-2">LinkedIn:</span>
              <a
                :href="aboutInfo.linkedin"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                {{ aboutInfo.linkedin }}
              </a>
            </div>
            <div v-if="aboutInfo.twitter" class="flex items-center">
              <span class="text-gray-600 dark:text-gray-300 mr-2">Twitter:</span>
              <a
                :href="aboutInfo.twitter"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                {{ aboutInfo.twitter }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- 博客说明 -->
      <div class="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">关于这个博客</h3>
        <div class="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
          <p>
            这个博客是我技术学习和思考的记录地。在这里，我会分享：
          </p>
          <ul class="list-disc list-inside mt-4 space-y-2">
            <li>技术学习笔记和心得体会</li>
            <li>项目开发过程中遇到的问题和解决方案</li>
            <li>对新技术和新工具的探索和评测</li>
            <li>编程思维和软件工程的思考</li>
            <li>职业发展和个人成长的感悟</li>
          </ul>
          <p class="mt-4">
            希望我的分享能够帮助到更多的开发者朋友，也欢迎大家与我交流讨论！
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.prose {
  color: #374151;
  line-height: 1.7;
}

.prose p {
  margin-bottom: 1rem;
}

.prose ul {
  margin-bottom: 1rem;
}

.prose li {
  margin-bottom: 0.25rem;
}

/* Dark mode styles */
.dark .prose {
  color: #d1d5db;
}
</style>
