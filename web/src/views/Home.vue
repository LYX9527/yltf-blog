<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { CalendarIcon, ClockIcon, EyeIcon, UserIcon } from '@heroicons/vue/24/outline'
import { postsApi, type Post, getFullImageUrl } from '../api'
import Sidebar from '../components/Sidebar.vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'

// 注册 GSAP 插件
gsap.registerPlugin(ScrollTrigger, TextPlugin)

const featuredPosts = ref<Post[]>([])
const recentPosts = ref<Post[]>([])
const loading = ref(true)

// 动画控制
let masterTimeline: gsap.core.Timeline
let scrollTriggers: ScrollTrigger[] = []

// 打字机文本
const typewriterTexts = [
  "技术分享",
  "学习笔记",
  "开发经验",
  "代码艺术"
]
let currentTextIndex = 0

onMounted(async () => {
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

  // 等待 DOM 更新后初始化动画
  await new Promise(resolve => setTimeout(resolve, 100))
  initAnimations()
})

onUnmounted(() => {
  // 清理所有动画
  if (masterTimeline) masterTimeline.kill()
  scrollTriggers.forEach(trigger => trigger.kill())
  ScrollTrigger.getAll().forEach(trigger => trigger.kill())
})

const initAnimations = () => {
  // 创建主时间线
  masterTimeline = gsap.timeline()

  // 设置初始状态
  gsap.set(['.hero-title', '.hero-subtitle', '.hero-cta', '.scroll-indicator'], {
    opacity: 0,
    y: 100
  })

  gsap.set('.typewriter-cursor', {
    opacity: 1
  })

  gsap.set('.geometric-shape', {
    scale: 0,
    rotation: 45,
    opacity: 0
  })

  gsap.set('.floating-dot', {
    scale: 0,
    opacity: 0
  })

  // 页面加载动画序列
  masterTimeline
    // 几何图形入场
    .to('.geometric-shape', {
      scale: 1,
      rotation: 0,
      opacity: 0.1,
      duration: 1.5,
      stagger: 0.2,
      ease: 'back.out(1.7)'
    })
    // 标题入场
    .to('.hero-title', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out'
    }, '-=1')
    // 副标题入场
    .to('.hero-subtitle', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.5')
    // CTA 按钮入场
    .to('.hero-cta', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'back.out(1.7)'
    }, '-=0.3')
    // 滚动指示器
    .to('.scroll-indicator', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.2')
    // 浮动点入场
    .to('.floating-dot', {
      scale: 1,
      opacity: 0.6,
      duration: 1,
      stagger: 0.1,
      ease: 'elastic.out(1, 0.3)'
    }, '-=0.8')

  // 开始打字机效果
  startTypewriterEffect()

  // 设置滚动动画
  setupScrollAnimations()

  // 设置持续动画
  setupContinuousAnimations()
}

const startTypewriterEffect = () => {
  const typewriterElement = document.querySelector('.typewriter-text')
  if (!typewriterElement) return

  const typeText = () => {
    const text = typewriterTexts[currentTextIndex]

    // 打字效果
    gsap.to(typewriterElement, {
      duration: text.length * 0.1,
      text: text,
      ease: 'none',
      onComplete: () => {
        // 等待一段时间后删除
        gsap.delayedCall(2, () => {
          gsap.to(typewriterElement, {
            duration: text.length * 0.05,
            text: '',
            ease: 'none',
            onComplete: () => {
              currentTextIndex = (currentTextIndex + 1) % typewriterTexts.length
              gsap.delayedCall(0.5, typeText)
            }
          })
        })
      }
    })
  }

  typeText()
}

const setupScrollAnimations = () => {
  // Hero 区域滚动视差
  const heroTrigger = ScrollTrigger.create({
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress

      // 内容向上移动并缩放
      gsap.to('.hero-content', {
        y: -progress * 150,
        scale: 1 - progress * 0.1,
        opacity: 1 - progress * 0.8,
        duration: 0.3,
        ease: 'none'
      })

      // 几何图形旋转和移动
      gsap.to('.geometric-shape', {
        rotation: progress * 360,
        y: -progress * 200,
        scale: 1 + progress * 0.5,
        duration: 0.3,
        ease: 'none'
      })

      // 背景移动
      gsap.to('.hero-bg', {
        y: progress * 100,
        scale: 1 + progress * 0.2,
        duration: 0.3,
        ease: 'none'
      })
    }
  })

  scrollTriggers.push(heroTrigger)
}

const setupContinuousAnimations = () => {
  // 几何图形持续旋转
  gsap.to('.geometric-shape-1', {
    rotation: 360,
    duration: 20,
    repeat: -1,
    ease: 'none'
  })

  gsap.to('.geometric-shape-2', {
    rotation: -360,
    duration: 25,
    repeat: -1,
    ease: 'none'
  })

  gsap.to('.geometric-shape-3', {
    rotation: 360,
    duration: 30,
    repeat: -1,
    ease: 'none'
  })

  // 浮动点动画
  gsap.to('.floating-dot', {
    y: -20,
    duration: 3,
    repeat: -1,
    yoyo: true,
    stagger: 0.5,
    ease: 'sine.inOut'
  })

  // 光标闪烁
  gsap.to('.typewriter-cursor', {
    opacity: 0,
    duration: 0.5,
    repeat: -1,
    yoyo: true,
    ease: 'power2.inOut'
  })

  // 滚动指示器动画
  gsap.to('.scroll-indicator', {
    y: 10,
    duration: 1.5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  })
}

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
    <!-- Hero Section -->
    <section class="hero-section relative min-h-screen flex items-center justify-center overflow-hidden">
      <!-- 动态背景 -->
      <div class="hero-bg absolute inset-0">
        <div class="gradient-mesh"></div>
        <div class="grain-overlay"></div>
      </div>

             <!-- 几何装饰 -->
       <div class="geometric-decorations absolute inset-0 pointer-events-none">
         <div class="geometric-shape geometric-shape-1 absolute top-20 left-20 w-32 h-32 border border-gray-300 dark:border-white/10 rounded-full"></div>
         <div class="geometric-shape geometric-shape-2 absolute top-1/3 right-20 w-24 h-24 border border-gray-300 dark:border-white/10"></div>
         <div class="geometric-shape geometric-shape-3 absolute bottom-1/4 left-1/3 w-16 h-16 border border-gray-300 dark:border-white/10" style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%)"></div>
       </div>

             <!-- 浮动点装饰 -->
       <div class="floating-dots absolute inset-0 pointer-events-none">
         <div class="floating-dot absolute top-1/4 left-1/4 w-2 h-2 bg-gray-400/40 dark:bg-white/40 rounded-full"></div>
         <div class="floating-dot absolute top-1/2 right-1/3 w-3 h-3 bg-blue-500/40 dark:bg-blue-400/40 rounded-full"></div>
         <div class="floating-dot absolute bottom-1/3 left-1/2 w-1 h-1 bg-purple-500/40 dark:bg-purple-400/40 rounded-full"></div>
         <div class="floating-dot absolute top-3/4 right-1/4 w-2 h-2 bg-pink-500/40 dark:bg-pink-400/40 rounded-full"></div>
       </div>

      <!-- 主要内容 -->
      <div class="hero-content relative z-10 text-center text-gray-900 dark:text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div class="space-y-8">
          <!-- 主标题 -->
          <h1 class="hero-title text-6xl md:text-8xl font-bold leading-tight">
            <span class="block text-gradient">倚栏听风</span>
            <span class="block text-4xl md:text-5xl mt-4 font-light">
              探索
              <span class="typewriter-text inline-block min-w-[120px] text-left"></span>
              <span class="typewriter-cursor">|</span>
            </span>
          </h1>

                     <!-- 副标题 -->
           <p class="hero-subtitle text-xl md:text-2xl text-gray-700 dark:text-white/80 max-w-2xl mx-auto leading-relaxed">
             在这里记录技术思考，分享开发心得，<br>
             探索代码背后的哲学与美学
           </p>

          <!-- CTA 按钮 -->
          <div class="hero-cta space-y-4">
            <RouterLink
              to="/posts"
                             class="cta-primary inline-flex items-center px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              开始阅读
              <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </RouterLink>

                         <div class="text-sm text-gray-600 dark:text-white/60">
               或者向下滚动探索更多内容
             </div>
          </div>
        </div>
      </div>

             <!-- 滚动指示器 -->
       <div class="scroll-indicator absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-600 dark:text-white/60">
         <div class="flex flex-col items-center space-y-2">
           <div class="w-6 h-10 border-2 border-gray-400 dark:border-white/30 rounded-full flex justify-center">
             <div class="w-1 h-3 bg-gray-500 dark:bg-white/50 rounded-full mt-2 animate-bounce"></div>
           </div>
           <span class="text-xs">向下滚动</span>
         </div>
       </div>
    </section>

    <!-- Featured Posts Section -->
    <section v-if="featuredPosts.length > 0" class="py-20 bg-white dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">精选文章</h2>
          <p class="text-xl text-gray-600 dark:text-gray-400">发现最受欢迎的技术分享</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <article
            v-for="post in featuredPosts.slice(0, 2)"
            :key="post.id"
            class="group cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <RouterLink :to="`/posts/${post.slug}`" class="block">
              <div class="relative overflow-hidden rounded-2xl mb-6 aspect-video bg-gradient-to-br from-blue-500 to-purple-600">
                <img
                  v-if="post.coverImage"
                  :src="getFullImageUrl(post.coverImage)"
                  :alt="post.title"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div v-else class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span class="text-white text-3xl font-bold">{{ post.title.charAt(0) }}</span>
                </div>
                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
              </div>

              <div class="space-y-4">
                <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-6">
                  <span class="flex items-center">
                    <CalendarIcon class="h-4 w-4 mr-2" />
                    {{ formatDate(post.publishedAt || post.createdAt) }}
                  </span>
                  <span v-if="post.readTime" class="flex items-center">
                    <ClockIcon class="h-4 w-4 mr-2" />
                    {{ post.readTime }} 分钟
                  </span>
                  <span class="flex items-center">
                    <EyeIcon class="h-4 w-4 mr-2" />
                    {{ post.viewCount }}
                  </span>
                </div>

                <h3 class="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {{ post.title }}
                </h3>

                <p v-if="post.excerpt" class="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {{ post.excerpt }}
                </p>

                <div class="flex items-center justify-between">
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <UserIcon class="h-4 w-4 mr-2" />
                    {{ post.author.name || post.author.username }}
                  </div>

                  <div v-if="post.category" class="flex space-x-2">
                    <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full">
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

    <!-- Recent Posts Section -->
    <section class="py-20 bg-gray-50 dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <!-- 主要内容区域 -->
          <div class="lg:col-span-2">
            <div class="flex justify-between items-center mb-12">
              <div>
                <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">最新文章</h2>
                <p class="text-lg text-gray-600 dark:text-gray-400">跟上最新的技术动态</p>
              </div>
              <RouterLink
                to="/posts"
                class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-lg flex items-center group"
              >
                查看全部
                <svg class="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </RouterLink>
            </div>

            <div v-if="loading" class="flex justify-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <article
                v-for="post in recentPosts"
                :key="post.id"
                class="bg-white dark:bg-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <RouterLink :to="`/posts/${post.slug}`" class="block">
                  <div class="aspect-video bg-gray-200 dark:bg-gray-600 overflow-hidden">
                    <img
                      v-if="post.coverImage"
                      :src="post.coverImage"
                      :alt="post.title"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div v-else class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span class="text-white text-2xl font-bold">{{ post.title.charAt(0) }}</span>
                    </div>
                  </div>

                  <div class="p-6">
                    <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3 space-x-4">
                      <span class="flex items-center">
                        <CalendarIcon class="h-4 w-4 mr-1" />
                        {{ formatDate(post.publishedAt || post.createdAt) }}
                      </span>
                      <span v-if="post.readTime" class="flex items-center">
                        <ClockIcon class="h-4 w-4 mr-1" />
                        {{ post.readTime }}min
                      </span>
                    </div>

                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {{ post.title }}
                    </h3>

                    <p v-if="post.excerpt" class="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                      {{ post.excerpt }}
                    </p>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <UserIcon class="h-4 w-4 mr-1" />
                        {{ post.author.name || post.author.username }}
                      </div>

                      <div class="flex space-x-2">
                        <span
                          v-for="tag in post.tags.slice(0, 2)"
                          :key="tag.tag.id"
                          class="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full"
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
/* Hero Section Styles */
.hero-section {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  position: relative;
}

/* Dark mode background */
.dark .hero-section {
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
}

.gradient-mesh {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
  animation: meshMove 8s ease-in-out infinite;
}

/* Dark mode gradient mesh */
.dark .gradient-mesh {
  background:
    radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
}

@keyframes meshMove {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-10px, -10px) scale(1.02); }
  66% { transform: translate(10px, 10px) scale(0.98); }
}

.grain-overlay {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.03;
  animation: grainMove 20s linear infinite;
}

/* Dark mode grain overlay */
.dark .grain-overlay {
  background-image:
    radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
}

@keyframes grainMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-50px, -50px); }
}

/* Typography */
.text-gradient {
  background: linear-gradient(135deg, #1f2937 0%, #4f46e5 50%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Dark mode text gradient */
.dark .text-gradient {
  background: linear-gradient(135deg, #ffffff 0%, #a8edea 50%, #fed6e3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.typewriter-text {
  color: #3b82f6;
  font-weight: 600;
}

.typewriter-cursor {
  color: #3b82f6;
  font-weight: 300;
}

/* Dark mode typewriter */
.dark .typewriter-text {
  color: #60a5fa;
}

.dark .typewriter-cursor {
  color: #60a5fa;
}

/* CTA Button */
.cta-primary {
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.cta-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.cta-primary:hover::before {
  left: 100%;
}

/* Geometric Shapes */
.geometric-shape {
  backdrop-filter: blur(10px);
  will-change: transform;
}

/* Light mode geometric shapes with subtle background */
.geometric-shape {
  background: rgba(255, 255, 255, 0.05);
}

/* Dark mode geometric shapes */
.dark .geometric-shape {
  background: rgba(255, 255, 255, 0.02);
}

/* Floating Dots */
.floating-dot {
  will-change: transform;
  filter: blur(0.5px);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section {
    min-height: 100vh;
  }

  .geometric-decorations {
    display: none;
  }

  .floating-dots .floating-dot:nth-child(n+3) {
    display: none;
  }

  .hero-title {
    font-size: 3rem;
  }

  .hero-title span:last-child {
    font-size: 2rem;
  }
}

/* Performance optimizations */
.hero-bg,
.geometric-shape,
.floating-dot {
  transform: translateZ(0);
  will-change: transform;
}

/* Utility classes */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
