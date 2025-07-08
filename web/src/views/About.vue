<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { EnvelopeIcon, CodeBracketIcon, HeartIcon } from '@heroicons/vue/24/outline'

// 关于我的信息
const aboutInfo = ref({
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
  ]
})

const contactInfo = ref({
  email: 'fp4u5h7k@gmail.com',
  github: '',
  linkedin: '',
  twitter: ''
})

// 从localStorage加载关于我的信息
const loadAboutInfo = () => {
  try {
    const savedData = localStorage.getItem('aboutInfo')
    if (savedData) {
      const data = JSON.parse(savedData)
      aboutInfo.value = {
        ...aboutInfo.value,
        ...data
      }
    }
  } catch (error) {
    console.error('加载关于我信息失败:', error)
  }
}

onMounted(() => {
  loadAboutInfo()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <!-- 页面标题 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">关于我</h1>
        <p class="text-xl text-gray-600">了解更多关于我的信息</p>
      </div>

      <!-- 主要内容 -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <!-- 个人介绍卡片 -->
        <div class="p-8">
          <div class="flex items-center mb-6">
            <div class="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <CodeBracketIcon class="h-10 w-10 text-white" />
            </div>
            <div class="ml-6">
              <h2 class="text-2xl font-bold text-gray-900">{{ aboutInfo.name }}</h2>
              <p class="text-lg text-blue-600 font-medium">{{ aboutInfo.title }}</p>
            </div>
          </div>

          <!-- 详细描述 -->
          <div class="prose prose-lg max-w-none">
            <div class="text-gray-700 leading-relaxed whitespace-pre-line">
              {{ aboutInfo.description }}
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200"></div>

        <!-- 技能和兴趣 -->
        <div class="grid md:grid-cols-2 gap-8 p-8">
          <!-- 技术技能 -->
          <div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CodeBracketIcon class="h-6 w-6 mr-2 text-blue-500" />
              技术技能
            </h3>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="skill in aboutInfo.skills" 
                :key="skill"
                class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {{ skill }}
              </span>
            </div>
          </div>

          <!-- 兴趣爱好 -->
          <div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <HeartIcon class="h-6 w-6 mr-2 text-red-500" />
              兴趣爱好
            </h3>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="interest in aboutInfo.interests" 
                :key="interest"
                class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
              >
                {{ interest }}
              </span>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200"></div>

        <!-- 联系方式 -->
        <div class="p-8">
          <h3 class="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <EnvelopeIcon class="h-6 w-6 mr-2 text-green-500" />
            联系我
          </h3>
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center">
              <EnvelopeIcon class="h-5 w-5 text-gray-400 mr-3" />
              <span class="text-gray-600 mr-2">邮箱:</span>
              <a 
                :href="`mailto:${contactInfo.email}`"
                class="text-blue-600 hover:text-blue-800 font-medium"
              >
                {{ contactInfo.email }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- 博客说明 -->
      <div class="mt-12 bg-white rounded-lg shadow-sm p-8">
        <h3 class="text-2xl font-bold text-gray-900 mb-4">关于这个博客</h3>
        <div class="prose prose-lg max-w-none text-gray-700">
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
</style>