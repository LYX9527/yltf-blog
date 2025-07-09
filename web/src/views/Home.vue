<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { CalendarIcon, ClockIcon, EyeIcon, UserIcon } from '@heroicons/vue/24/outline'
import { postsApi, type Post, getFullImageUrl } from '../api'
import Sidebar from '../components/Sidebar.vue'

const featuredPosts = ref<Post[]>([])
const recentPosts = ref<Post[]>([])
const loading = ref(true)
const scrollY = ref(0)
const heroContentTransform = ref('')
const ticking = ref(false)

// 节流优化的滚动处理
const updateParallax = () => {
  const heroSection = document.querySelector('.hero-section') as HTMLElement
  if (!heroSection) return

  const heroHeight = heroSection.offsetHeight
  const windowHeight = window.innerHeight

  // 计算最大滚动距离（当hero section完全离开视窗时）
  const maxScroll = heroHeight + windowHeight * 0.2 // 减少缓冲区到20%

  // 使用easing函数让移动更平滑
  const progress = Math.min(scrollY.value / maxScroll, 1)
  const easedProgress = easeOutCubic(progress)

  // 计算最大移动距离（向下移动hero高度的50%）
  const maxTranslate = heroHeight * 0.5
  const translateY = easedProgress * maxTranslate

  heroContentTransform.value = `translateY(${translateY}px)`
  ticking.value = false
}

// 滚动处理函数
const handleScroll = () => {
  scrollY.value = window.scrollY

  if (!ticking.value) {
    requestAnimationFrame(updateParallax)
    ticking.value = true
  }
}

// 缓动函数 - 三次方缓出
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3)
}

onMounted(async () => {
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll, { passive: true })

  try {
    const [featuredResponse, recentResponse] = await Promise.all([
      postsApi.getFeatured(),
      postsApi.getAll({ limit: 6 })
    ])

    featuredPosts.value = featuredResponse.data
    recentPosts.value = recentResponse.data.posts
  } catch (error) {
    console.error('Failed to fetch posts:', error)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div>
    <section class="hero-section relative overflow-hidden text-white">
      <!-- 流动渐变背景 -->
      <div class="gradient-bg"></div>

      <!-- 内容层 -->
      <div
        class="hero-content relative z-10 max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8"
        :style="{ transform: heroContentTransform }"
      >
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            欢迎来到倚栏听风的博客
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-blue-100">
            分享技术心得，记录学习历程
          </p>
          <RouterLink
            to="/posts"
            class="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            浏览所有文章
          </RouterLink>
        </div>
      </div>
    </section>

    <section v-if="featuredPosts.length > 0" class="py-16 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">精选文章</h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <article
            v-for="post in featuredPosts.slice(0, 2)"
            :key="post.id"
            class="group cursor-pointer"
          >
            <RouterLink :to="`/posts/${post.slug}`" class="block">
              <div class="bg-gray-200 aspect-video rounded-lg mb-4 overflow-hidden">
                <img
                  v-if="post.coverImage"
                  :src="getFullImageUrl(post.coverImage)"
                  :alt="post.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div
                  v-else
                  class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                >
                  <span class="text-white text-2xl font-bold">{{ post.title.charAt(0) }}</span>
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex items-center text-sm text-gray-500 space-x-4">
                  <span class="flex items-center">
                    <CalendarIcon class="h-4 w-4 mr-1" />
                    {{ formatDate(post.publishedAt || post.createdAt) }}
                  </span>
                  <span v-if="post.readTime" class="flex items-center">
                    <ClockIcon class="h-4 w-4 mr-1" />
                    {{ post.readTime }} 分钟阅读
                  </span>
                  <span class="flex items-center">
                    <EyeIcon class="h-4 w-4 mr-1" />
                    {{ post.viewCount }}
                  </span>
                </div>

                <h3 class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {{ post.title }}
                </h3>

                <p v-if="post.excerpt" class="text-gray-600 dark:text-gray-300 line-clamp-2">
                  {{ post.excerpt }}
                </p>

                <div class="flex items-center justify-between">
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <UserIcon class="h-4 w-4 mr-1" />
                    {{ post.author.name || post.author.username }}
                  </div>

                  <div v-if="post.category" class="flex space-x-2">
                    <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                      {{ post.category.name }}
                    </span>
                  </div>
                </div>
              </div>
            </RouterLink>
          </article>
        </div>
      </div>
    </section>

    <section class="py-16 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- 主要内容区域 -->
          <div class="lg:col-span-2">
            <div class="flex justify-between items-center mb-8">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white">最新文章</h2>
              <RouterLink
                to="/posts"
                class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                查看更多 →
              </RouterLink>
            </div>

            <div v-if="loading" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <article
                v-for="post in recentPosts"
                :key="post.id"
                class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <RouterLink :to="`/posts/${post.slug}`" class="block">
                  <div class="aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img
                      v-if="post.coverImage"
                      :src="post.coverImage"
                      :alt="post.title"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div
                      v-else
                      class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                    >
                      <span class="text-white text-xl font-bold">{{ post.title.charAt(0) }}</span>
                    </div>
                  </div>

                  <div class="p-6">
                    <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2 space-x-4">
                      <span class="flex items-center">
                        <CalendarIcon class="h-4 w-4 mr-1" />
                        {{ formatDate(post.publishedAt || post.createdAt) }}
                      </span>
                      <span v-if="post.readTime" class="flex items-center">
                        <ClockIcon class="h-4 w-4 mr-1" />
                        {{ post.readTime }}min
                      </span>
                    </div>

                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {{ post.title }}
                    </h3>

                    <p v-if="post.excerpt" class="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                      {{ post.excerpt }}
                    </p>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <UserIcon class="h-4 w-4 mr-1" />
                        {{ post.author.name || post.author.username }}
                      </div>

                      <div class="flex space-x-1">
                        <span
                          v-for="tag in post.tags.slice(0, 2)"
                          :key="tag.tag.id"
                          class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                        >
                          {{ tag.tag.name }}
                        </span>
                      </div>
                    </div>
                  </div>
                </RouterLink>
              </article>
            </div>
          </div>

          <!-- 侧边栏 -->
          <div class="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-content {
  transition: transform 0.05s ease-out;
  will-change: transform;
  backface-visibility: hidden;
  perspective: 1000px;
}

.hero-section {
  min-height: 60vh;
  position: relative;
}

.gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #f5576c 75%,
    #4facfe 100%
  );
  background-size: 400% 400%;
  animation: gradientFlow 8s ease infinite;
}

@keyframes gradientFlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 添加一些额外的动态效果 */
.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at 20% 80%,
    rgba(120, 119, 198, 0.3) 0%,
    transparent 50%
  ),
  radial-gradient(
    circle at 80% 20%,
    rgba(255, 119, 198, 0.3) 0%,
    transparent 50%
  ),
  radial-gradient(
    circle at 40% 40%,
    rgba(120, 219, 255, 0.3) 0%,
    transparent 50%
  );
  animation: floatingBubbles 10s ease-in-out infinite;
  z-index: 1;
}

@keyframes floatingBubbles {
  0%, 100% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* 文字动画效果 */
.hero-section h1 {
  animation: fadeInUp 1s ease-out 0.5s both;
}

.hero-section p {
  animation: fadeInUp 1s ease-out 0.7s both;
}

.hero-section a {
  animation: fadeInUp 1s ease-out 0.9s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
