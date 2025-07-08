<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 left-1/4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div class="absolute top-0 right-1/4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div class="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
    </div>

    <div class="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 页面头部 -->
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-2">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <UserIcon class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              个人中心
            </h1>
            <p class="text-gray-500 mt-1">管理您的个人信息和设置</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- 侧边栏 -->
        <div class="lg:col-span-1">
          <!-- 用户信息卡片 -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
            <div class="text-center">
              <div class="relative inline-block mb-4">
                <div class="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-lg ring-1 ring-black/5">
                  <img
                    v-if="authStore.user?.avatar"
                    :src="authStore.user.avatar"
                    :alt="authStore.user.username"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                    <UserIcon class="w-8 h-8" />
                  </div>
                </div>
                <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>

              <h2 class="text-xl font-semibold text-gray-900 mb-1">
                {{ authStore.user?.name || authStore.user?.username }}
              </h2>
              <p class="text-gray-500 text-sm mb-3">{{ authStore.user?.email }}</p>

              <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                普通用户
              </div>
            </div>

            <div class="mt-6 pt-6 border-t border-gray-100">
              <div class="text-center text-sm text-gray-500">
                <p>注册时间</p>
                <p class="font-medium text-gray-900 mt-1">{{ formatDate(authStore.user?.createdAt) }}</p>
              </div>
            </div>
          </div>

          <!-- 导航菜单 -->
          <nav class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4">
            <ul class="space-y-2">
              <li>
                <button
                  @click="currentTab = 'profile'"
                  :class="[
                    'w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3',
                    currentTab === 'profile'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  ]"
                >
                  <UserIcon class="w-5 h-5" />
                  <span>个人信息</span>
                </button>
              </li>
              <li>
                <button
                  @click="currentTab = 'comments'"
                  :class="[
                    'w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3',
                    currentTab === 'comments'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  ]"
                >
                  <ChatBubbleLeftIcon class="w-5 h-5" />
                  <span>我的评论</span>
                </button>
              </li>
              <li>
                <button
                  @click="currentTab = 'about'"
                  :class="[
                    'w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3',
                    currentTab === 'about'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  ]"
                >
                  <DocumentTextIcon class="w-5 h-5" />
                  <span>关于我页面</span>
                </button>
              </li>
              <li>
                <button
                  @click="currentTab = 'settings'"
                  :class="[
                    'w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3',
                    currentTab === 'settings'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  ]"
                >
                  <Cog6ToothIcon class="w-5 h-5" />
                  <span>账户设置</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <!-- 主内容区 -->
        <div class="lg:col-span-3">
          <!-- 个人信息 -->
          <div v-if="currentTab === 'profile'" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div class="flex items-center space-x-3 mb-8">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <UserIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900">个人信息</h3>
                <p class="text-gray-500">管理您的个人资料和头像</p>
              </div>
            </div>

            <form @submit.prevent="updateProfile" class="space-y-8">
              <!-- 头像上传区域 -->
              <div class="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
                <AvatarUpload
                  ref="avatarUploadRef"
                  :current-avatar="profileForm.avatar"
                  @update:avatar="updateAvatar"
                />
              </div>

              <!-- 基本信息 -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-900">用户名</label>
                  <input
                    v-model="profileForm.username"
                    type="text"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-900">邮箱地址</label>
                  <input
                    v-model="profileForm.email"
                    type="email"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                </div>
                <div class="md:col-span-2 space-y-2">
                  <label class="block text-sm font-semibold text-gray-900">昵称</label>
                  <input
                    v-model="profileForm.name"
                    type="text"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="设置一个好听的昵称"
                  >
                </div>
              </div>

              <!-- 个人简介 -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-900">个人简介</label>
                <textarea
                  v-model="profileForm.bio"
                  rows="4"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="介绍一下自己..."
                ></textarea>
              </div>

              <!-- 提交按钮 -->
              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="loading"
                  class="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="loading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    保存中...
                  </span>
                  <span v-else>保存修改</span>
                </button>
              </div>
            </form>
          </div>

          <!-- 我的评论 -->
          <div v-if="currentTab === 'comments'" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div class="flex items-center space-x-3 mb-8">
              <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <ChatBubbleLeftIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900">我的评论</h3>
                <p class="text-gray-500">查看和管理您发表的评论</p>
              </div>
            </div>

            <div class="space-y-4">
              <div v-if="myComments.length === 0" class="text-center py-12">
                <ChatBubbleLeftIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 class="text-xl font-semibold text-gray-600 mb-2">还没有评论</h4>
                <p class="text-gray-500">您还没有发表过评论，快去文章下方留言吧！</p>
              </div>

              <div
                v-for="comment in myComments"
                :key="comment.id"
                class="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200"
              >
                <div class="flex justify-between items-start mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span class="text-sm font-medium text-gray-900">
                      {{ formatDate(comment.createdAt) }}
                    </span>
                    <span class="text-sm text-gray-400">•</span>
                    <router-link
                      :to="`/posts/${comment.post?.slug}`"
                      class="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      {{ comment.post?.title }}
                    </router-link>
                  </div>
                  <button
                    @click="deleteComment(comment.id)"
                    class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
                <p class="text-gray-700 leading-relaxed">{{ comment.content }}</p>
              </div>
            </div>
          </div>

          <!-- 关于我页面编辑 -->
          <div v-if="currentTab === 'about'" class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div class="flex items-center space-x-3 mb-8">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <DocumentTextIcon class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900">关于我页面</h3>
                <p class="text-gray-500">编辑在关于我页面显示的个人信息</p>
              </div>
            </div>

            <form @submit.prevent="updateAboutInfo" class="space-y-8">
              <!-- 个人标题 -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-900">个人标题</label>
                <input
                  v-model="aboutForm.title"
                  type="text"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="例如：一个不甘心一直写业务代码的程序员！！"
                >
              </div>

              <!-- 详细描述 -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-900">详细描述</label>
                <textarea
                  v-model="aboutForm.description"
                  rows="8"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="详细介绍一下你自己，你的技术背景，兴趣爱好等..."
                ></textarea>
              </div>

              <!-- 技术技能 -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-900">技术技能</label>
                <div class="space-y-3">
                  <div
                    v-for="(_skill, index) in aboutForm.skills"
                    :key="index"
                    class="flex items-center space-x-2"
                  >
                    <input
                      v-model="aboutForm.skills[index]"
                      type="text"
                      class="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="例如：JavaScript/TypeScript"
                    >
                    <button
                      type="button"
                      @click="removeSkill(index)"
                      class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    @click="addSkill"
                    class="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    + 添加技能
                  </button>
                </div>
              </div>

              <!-- 兴趣爱好 -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-900">兴趣爱好</label>
                <div class="space-y-3">
                  <div
                    v-for="(_interest, index) in aboutForm.interests"
                    :key="index"
                    class="flex items-center space-x-2"
                  >
                    <input
                      v-model="aboutForm.interests[index]"
                      type="text"
                      class="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="例如：开源项目贡献"
                    >
                    <button
                      type="button"
                      @click="removeInterest(index)"
                      class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    @click="addInterest"
                    class="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    + 添加兴趣
                  </button>
                </div>
              </div>

              <!-- 提交按钮 -->
              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="loading"
                  class="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="loading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    保存中...
                  </span>
                  <span v-else>保存修改</span>
                </button>
              </div>
            </form>
          </div>

          <!-- 账户设置 -->
          <div v-if="currentTab === 'settings'" class="space-y-8">
            <!-- 修改密码 -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div class="flex items-center space-x-3 mb-8">
                <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <KeyIcon class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-2xl font-bold text-gray-900">修改密码</h3>
                  <p class="text-gray-500">定期更换密码以保护账户安全</p>
                </div>
              </div>

              <form @submit.prevent="updatePassword" class="space-y-6">
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-900">当前密码</label>
                  <input
                    v-model="passwordForm.currentPassword"
                    type="password"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-900">新密码</label>
                    <input
                      v-model="passwordForm.newPassword"
                      type="password"
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                  </div>
                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-900">确认新密码</label>
                    <input
                      v-model="passwordForm.confirmPassword"
                      type="password"
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                  </div>
                </div>
                <div class="flex justify-end">
                  <button
                    type="submit"
                    :disabled="loading"
                    class="inline-flex items-center px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="loading" class="flex items-center">
                      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      更新中...
                    </span>
                    <span v-else>更新密码</span>
                  </button>
                </div>
              </form>
            </div>

            <!-- 账户统计 -->
            <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div class="flex items-center space-x-3 mb-8">
                <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <ChartBarIcon class="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-2xl font-bold text-gray-900">账户统计</h3>
                  <p class="text-gray-500">查看您的活跃数据</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-blue-600 mb-1">评论总数</p>
                      <p class="text-3xl font-bold text-blue-900">{{ myComments.length }}</p>
                    </div>
                    <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <ChatBubbleLeftIcon class="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-green-600 mb-1">注册天数</p>
                      <p class="text-3xl font-bold text-green-900">{{ accountAge }}</p>
                    </div>
                    <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <CalendarIcon class="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../api'
import { format, differenceInDays } from 'date-fns'
import {
  UserIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
  KeyIcon,
  ChartBarIcon,
  CalendarIcon,
  TrashIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'
import AvatarUpload from '../components/AvatarUpload.vue'
import { useToast } from '../composables/useToast'
import { useDialog } from '../composables/useDialog'

const authStore = useAuthStore()
const { toast } = useToast()
const { confirm } = useDialog()

const currentTab = ref('profile')
const loading = ref(false)
const avatarUploadRef = ref()

const profileForm = ref({
  username: '',
  email: '',
  name: '',
  avatar: '',
  bio: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const aboutForm = ref({
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

const myComments = ref<Array<{
  id: string
  content: string
  createdAt: string
  post?: {
    slug: string
    title: string
  }
}>>([])

const accountAge = computed(() => {
  if (!authStore.user?.createdAt) return 0
  return differenceInDays(new Date(), new Date(authStore.user.createdAt))
})

const formatDate = (dateString?: string) => {
  return format(new Date(dateString!!), 'yyyy年MM月dd日 HH:mm')
}

const loadProfile = () => {
  if (authStore.user) {
    profileForm.value = {
      username: authStore.user.username,
      email: authStore.user.email,
      name: authStore.user.name || '',
      avatar: authStore.user.avatar || '',
      bio: authStore.user.bio || ''
    }
  }
}

const updateAvatar = (avatarUrl: string) => {
  profileForm.value.avatar = avatarUrl
}

const loadMyComments = async () => {
  try {
    const response = await api.get('/users/comments')
    myComments.value = response.data.comments
  } catch (error) {
    console.error('Failed to load comments:', error)
  }
}

const updateProfile = async () => {
  try {
    loading.value = true

    // 如果有新头像需要上传
    const avatarBlob = avatarUploadRef.value?.getAvatarBlob()
    if (avatarBlob) {
      try {
        // 上传头像
        const formData = new FormData()
        formData.append('image', avatarBlob, 'avatar.png')

        const response = await api.post('/upload/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        // 更新表单中的头像URL
        profileForm.value.avatar = response.data.url

        // 重置avatarBlob
        avatarUploadRef.value?.resetAvatarBlob()
      } catch (error: any) {
        toast.error('头像上传失败：' + (error.response?.data?.error || '请重试'))
        loading.value = false
        return
      }
    }

    // 保存个人信息
    await api.put('/users/profile', profileForm.value)
    toast.success('个人信息更新成功')

    // 重新获取用户信息
    await authStore.verifyToken()
  } catch (error: any) {
    toast.error(error.response?.data?.error || '更新失败')
  } finally {
    loading.value = false
  }
}

const updatePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error('新密码和确认密码不匹配')
    return
  }

  try {
    loading.value = true
    await api.put('/users/password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    toast.success('密码修改成功')
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error: any) {
    toast.error(error.response?.data?.error || '密码修改失败')
  } finally {
    loading.value = false
  }
}

const deleteComment = async (commentId: string) => {
  const confirmed = await confirm(
    '确定要删除这条评论吗？此操作无法恢复。',
    '删除评论'
  )

  if (!confirmed) return

  try {
    await api.delete(`/comments/${commentId}`)
    myComments.value = myComments.value.filter(c => c.id !== commentId)
    toast.success('评论删除成功')
  } catch (error: any) {
    toast.error(error.response?.data?.error || '删除失败')
  }
}

// 关于我页面相关函数
const addSkill = () => {
  aboutForm.value.skills.push('')
}

const removeSkill = (index: number) => {
  aboutForm.value.skills.splice(index, 1)
}

const addInterest = () => {
  aboutForm.value.interests.push('')
}

const removeInterest = (index: number) => {
  aboutForm.value.interests.splice(index, 1)
}

const updateAboutInfo = async () => {
  try {
    loading.value = true

    // 过滤空值
    const filteredSkills = aboutForm.value.skills.filter(skill => skill.trim() !== '')
    const filteredInterests = aboutForm.value.interests.filter(interest => interest.trim() !== '')

    const aboutData = {
      title: aboutForm.value.title.trim(),
      description: aboutForm.value.description.trim(),
      skills: filteredSkills,
      interests: filteredInterests
    }

    // 这里可以保存到localStorage或发送到后端
    localStorage.setItem('aboutInfo', JSON.stringify(aboutData))

    toast.success('关于我页面信息已更新')
  } catch (error: any) {
    toast.error('更新失败，请重试')
  } finally {
    loading.value = false
  }
}

const loadAboutInfo = () => {
  try {
    const savedData = localStorage.getItem('aboutInfo')
    if (savedData) {
      const aboutData = JSON.parse(savedData)
      aboutForm.value = {
        ...aboutForm.value,
        ...aboutData
      }
    }
  } catch (error) {
    console.error('加载关于我信息失败:', error)
  }
}

onMounted(() => {
  loadProfile()
  loadMyComments()
  loadAboutInfo()
})
</script>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
