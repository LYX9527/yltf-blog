<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline'
import { categoriesApi, type Category } from '../api'
import { useAuthStore } from '../stores/auth'
import ThemeSwitcher from './ThemeSwitcher.vue'

const router = useRouter()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)
const categories = ref<Category[]>([])
const searchQuery = ref('')
const showUserMenu = ref(false)

// 加载分类数据
const loadCategories = async () => {
  try {
    const response = await categoriesApi.getAll()
    categories.value = response.data
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/posts',
      query: { search: searchQuery.value }
    })
    searchQuery.value = ''
    mobileMenuOpen.value = false
  }
}

const handleLogout = () => {
  authStore.logout()
  showUserMenu.value = false
  router.push('/')
}

// 点击外部区域关闭用户菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  const userMenu = document.querySelector('.user-menu-container')
  
  if (userMenu && !userMenu.contains(target)) {
    showUserMenu.value = false
  }
}

// 组件挂载时执行
onMounted(async () => {
  await loadCategories()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <nav class="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <RouterLink to="/" class="flex-shrink-0 flex items-center">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">倚栏听风的博客</h1>
          </RouterLink>

          <div class="hidden md:flex md:ml-10 md:space-x-8">
            <RouterLink
              to="/"
              class="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
              active-class="text-blue-600 dark:text-blue-400"
            >
              首页
            </RouterLink>
            <RouterLink
              to="/posts"
              class="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
              active-class="text-blue-600 dark:text-blue-400"
            >
              所有文章
            </RouterLink>
            <RouterLink
              to="/archive"
              class="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors"
              active-class="text-blue-600 dark:text-blue-400"
            >
              归档
            </RouterLink>

            <div class="relative group">
              <button class="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors">
                分类
              </button>
              <div class="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div class="py-1">
                  <RouterLink
                    v-for="category in categories"
                    :key="category.id"
                    :to="`/category/${category.slug}`"
                    class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    {{ category.name }}
                    <span class="text-gray-400 dark:text-gray-500 text-xs ml-1">({{ category._count?.posts || 0 }})</span>
                  </RouterLink>
                </div>
              </div>
            </div>

            <div v-if="authStore.isAdmin" class="relative group">
              <button class="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium transition-colors">
                管理
              </button>
              <div class="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div class="py-1">
                  <RouterLink
                    to="/create"
                    class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    创建文章
                  </RouterLink>
                  <RouterLink
                    to="/manage"
                    class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    管理文章
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="hidden md:flex md:items-center md:space-x-4">
          <div class="relative">
            <form @submit.prevent="handleSearch" class="flex">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索文章..."
                class="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
              />
              <MagnifyingGlassIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
            </form>
          </div>

          <!-- 主题切换器 -->
          <ThemeSwitcher />

          <!-- 用户菜单 -->
          <div v-if="authStore.isLoggedIn" class="relative user-menu-container">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <div class="h-8 w-8 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
                <img
                  v-if="authStore.user?.avatar"
                  :src="authStore.user.avatar"
                  :alt="authStore.user.username"
                  class="h-8 w-8 rounded-full object-cover"
                />
                <span v-else class="text-white text-sm font-bold">
                  {{ authStore.user?.name?.charAt(0) || authStore.user?.username?.charAt(0) }}
                </span>
              </div>
              <span class="text-gray-900 dark:text-gray-100">{{ authStore.user?.name || authStore.user?.username }}</span>
              <span v-if="authStore.isAdmin" class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs rounded-full">
                管理员
              </span>
            </button>

            <div v-show="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
              <div class="py-1">
                <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ authStore.user?.name || authStore.user?.username }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400 break-all truncate" :title="authStore.user?.email">{{ authStore.user?.email }}</p>
                </div>
                <RouterLink
                  v-if="authStore.isAdmin"
                  to="/admin"
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  @click="showUserMenu = false"
                >
                  管理员中心
                </RouterLink>
                <RouterLink
                  to="/profile"
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                  @click="showUserMenu = false"
                >
                  个人中心
                </RouterLink>
                <button
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 flex items-center"
                >
                  <ArrowRightOnRectangleIcon class="h-4 w-4 mr-2" />
                  退出登录
                </button>
              </div>
            </div>
          </div>

          <!-- 登录按钮 -->
          <div v-else>
            <RouterLink
              to="/auth"
              class="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <UserIcon class="h-5 w-5" />
              <span>登录</span>
            </RouterLink>
          </div>
        </div>

        <div class="md:hidden flex items-center">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:text-gray-700 dark:focus:text-gray-300"
          >
            <Bars3Icon v-if="!mobileMenuOpen" class="h-6 w-6" />
            <XMarkIcon v-else class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <div v-show="mobileMenuOpen" class="md:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <RouterLink
          to="/"
          class="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
          @click="mobileMenuOpen = false"
        >
          首页
        </RouterLink>
        <RouterLink
          to="/posts"
          class="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
          @click="mobileMenuOpen = false"
        >
          所有文章
        </RouterLink>
        <RouterLink
          to="/archive"
          class="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
          @click="mobileMenuOpen = false"
        >
          归档
        </RouterLink>
        <RouterLink
          to="/about"
          class="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
          @click="mobileMenuOpen = false"
        >
          关于我
        </RouterLink>
        <RouterLink
          to="/contact"
          class="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
          @click="mobileMenuOpen = false"
        >
          联系我
        </RouterLink>

        <div class="px-3 py-2">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">分类</p>
          <div class="space-y-1">
            <RouterLink
              v-for="category in categories"
              :key="category.id"
              :to="`/category/${category.slug}`"
              class="block px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              @click="mobileMenuOpen = false"
            >
              {{ category.name }}
            </RouterLink>
          </div>
        </div>

        <div class="px-3 py-2">
          <form @submit.prevent="handleSearch" class="flex">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索文章..."
              class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200"
            />
          </form>
        </div>

        <!-- 移动端用户菜单 -->
        <div class="px-3 py-2 border-t border-gray-200 dark:border-gray-600">
          <div v-if="authStore.isLoggedIn" class="space-y-2">
            <div class="flex items-center space-x-3 px-3 py-2">
              <div class="h-10 w-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
                <img
                  v-if="authStore.user?.avatar"
                  :src="authStore.user.avatar"
                  :alt="authStore.user.username"
                  class="h-10 w-10 rounded-full object-cover"
                />
                <span v-else class="text-white font-bold">
                  {{ authStore.user?.name?.charAt(0) || authStore.user?.username?.charAt(0) }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ authStore.user?.name || authStore.user?.username }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 break-all truncate" :title="authStore.user?.email">{{ authStore.user?.email }}</p>
                <span v-if="authStore.isAdmin" class="inline-block px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs rounded-full mt-1">
                  管理员
                </span>
              </div>
            </div>

            <div v-if="authStore.isAdmin" class="space-y-1">
              <RouterLink
                to="/admin"
                class="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                @click="mobileMenuOpen = false"
              >
                管理员中心
              </RouterLink>
              <RouterLink
                to="/create"
                class="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                @click="mobileMenuOpen = false"
              >
                创建文章
              </RouterLink>
              <RouterLink
                to="/manage"
                class="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                @click="mobileMenuOpen = false"
              >
                管理文章
              </RouterLink>
            </div>

            <RouterLink
              to="/profile"
              class="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
              @click="mobileMenuOpen = false"
            >
              个人中心
            </RouterLink>

            <button
              @click="handleLogout"
              class="w-full text-left px-3 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              退出登录
            </button>
          </div>

          <div v-else>
            <RouterLink
              to="/auth"
              class="block px-3 py-2 text-base font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              @click="mobileMenuOpen = false"
            >
              登录 / 注册
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
