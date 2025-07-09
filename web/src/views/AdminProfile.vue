<template>
  <div
      class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
          class="absolute top-0 left-1/4 w-96 h-96 bg-red-100 dark:bg-red-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div
          class="absolute top-0 right-1/4 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div
          class="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-100 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 页面头部 -->
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-2">
          <div
              class="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
            <ShieldCheckIcon class="w-6 h-6 text-white"/>
          </div>
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              管理员中心
            </h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">管理您的个人信息和系统数据</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- 侧边栏 -->
        <div class="lg:col-span-1">
          <!-- 管理员信息卡片 -->
          <div
              class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 mb-6">
            <div class="text-center">
              <div class="relative inline-block mb-4">
                <div
                    class="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-red-100 to-pink-200 dark:from-red-900/50 dark:to-pink-900/50 border-4 border-white dark:border-gray-700 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                  <img
                      v-if="authStore.user?.avatar"
                      :src="authStore.user.avatar"
                      :alt="authStore.user.username"
                      class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-red-500 dark:text-red-400">
                    <ShieldCheckIcon class="w-8 h-8"/>
                  </div>
                </div>
                <div
                    class="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white dark:border-gray-700 shadow-sm flex items-center justify-center">
                  <!--                  <CrownIcon class="w-3 h-3 text-white" />-->
                </div>
              </div>

              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                {{ authStore.user?.name || authStore.user?.username }}
              </h2>
              <p class="text-gray-500 dark:text-gray-400 text-sm mb-3">{{ authStore.user?.email }}</p>

              <div
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700">
                <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                系统管理员
              </div>
            </div>

            <div class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div class="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>注册时间</p>
                <p class="font-medium text-gray-900 dark:text-white mt-1">{{
                    formatDate(authStore.user?.createdAt)
                  }}</p>
              </div>
            </div>
          </div>

          <!-- 导航菜单 -->
          <nav
              class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-4">
            <ul class="space-y-2">
              <li>
                <button
                    @click="currentTab = 'profile'"
                    :class="[
                    'w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3',
                    currentTab === 'profile'
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  ]"
                >
                  <UserIcon class="w-5 h-5"/>
                  <span>个人信息</span>
                </button>
              </li>
              <li>
                <button
                    @click="currentTab = 'posts'"
                    :class="[
                    'w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3',
                    currentTab === 'posts'
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  ]"
                >
                  <DocumentTextIcon class="w-5 h-5"/>
                  <span>文章管理</span>
                </button>
              </li>
              <li>
                <button
                    @click="currentTab = 'comments'"
                    :class="[
                    'w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3',
                    currentTab === 'comments'
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  ]"
                >
                  <ChatBubbleLeftIcon class="w-5 h-5"/>
                  <span>评论管理</span>
                </button>
              </li>
              <li>
                <button
                    @click="currentTab = 'categories'"
                    :class="[
                    'w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3',
                    currentTab === 'categories'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  ]"
                >
                  <FolderIcon class="w-5 h-5"/>
                  <span>分类管理</span>
                </button>
              </li>
              <li>
                <button
                    @click="currentTab = 'users'"
                    :class="[
                    'w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3',
                    currentTab === 'users'
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  ]"
                >
                  <UsersIcon class="w-5 h-5"/>
                  <span>用户管理</span>
                </button>
              </li>
              <li>
                <button
                    @click="currentTab = 'stats'"
                    :class="[
                    'w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3',
                    currentTab === 'stats'
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  ]"
                >
                  <ChartBarIcon class="w-5 h-5"/>
                  <span>数据统计</span>
                </button>
              </li>
              <li>
                <button
                    @click="currentTab = 'about'"
                    :class="[
                    'w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3',
                    currentTab === 'about'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  ]"
                >
                  <DocumentTextIcon class="w-5 h-5"/>
                  <span>关于我的</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <!-- 主内容区 -->
        <div class="lg:col-span-3">
          <!-- 个人信息 -->
          <div v-if="currentTab === 'profile'"
               class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
            <div class="flex items-center space-x-3 mb-8">
              <div
                  class="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                <UserIcon class="w-5 h-5 text-white"/>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">个人信息</h3>
                <p class="text-gray-500 dark:text-gray-400">管理您的个人资料和头像</p>
              </div>
            </div>

            <form @submit.prevent="updateProfile" class="space-y-8">
              <!-- 头像上传区域 -->
              <div
                  class="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-gray-100 dark:border-gray-600">
                <AvatarUpload
                    ref="avatarUploadRef"
                    :current-avatar="profileForm.avatar"
                    @update:avatar="updateAvatar"
                />
              </div>

              <!-- 基本信息 -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-900 dark:text-white">用户名</label>
                  <input
                      v-model="profileForm.username"
                      type="text"
                      class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      required
                  >
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-semibold text-gray-900 dark:text-white">邮箱地址</label>
                  <input
                      v-model="profileForm.email"
                      type="email"
                      class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      required
                  >
                </div>
                <div class="md:col-span-2 space-y-2">
                  <label class="block text-sm font-semibold text-gray-900 dark:text-white">昵称</label>
                  <input
                      v-model="profileForm.name"
                      type="text"
                      class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="设置一个好听的昵称"
                  >
                </div>
              </div>

              <!-- 个人简介 -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-900 dark:text-white">个人简介</label>
                <textarea
                    v-model="profileForm.bio"
                    rows="4"
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="介绍一下自己..."
                ></textarea>
              </div>

              <!-- 提交按钮 -->
              <div class="flex justify-end space-x-4">
                <button
                    type="button"
                    @click="showPasswordModal = true"
                    class="inline-flex items-center px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                >
                  <KeyIcon class="w-4 h-4 mr-2"/>
                  修改密码
                </button>
                <button
                    type="submit"
                    :disabled="loading"
                    class="inline-flex items-center px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="loading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                         fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    保存中...
                  </span>
                  <span v-else>保存修改</span>
                </button>
              </div>
            </form>
          </div>

          <!-- 文章管理 -->
          <div v-if="currentTab === 'posts'"
               class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center space-x-3">
                <div
                    class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <DocumentTextIcon class="w-5 h-5 text-white"/>
                </div>
                <div>
                  <h3 class="text-2xl font-bold text-gray-900 dark:text-white">文章管理</h3>
                  <p class="text-gray-500 dark:text-gray-400">管理所有博客文章</p>
                </div>
              </div>
              <router-link
                  to="/create"
                  class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                <PlusIcon class="w-4 h-4 mr-2"/>
                新建文章
              </router-link>
            </div>

            <div class="space-y-4">
              <div v-if="posts.length === 0" class="text-center py-12">
                <DocumentTextIcon class="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                <h4 class="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">暂无文章</h4>
                <p class="text-gray-500 dark:text-gray-400">开始创建您的第一篇文章吧！</p>
              </div>

              <div
                  v-for="post in posts"
                  :key="post.id"
                  class="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-gray-100 dark:border-gray-600 hover:shadow-lg transition-all duration-200"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                      <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h4 class="font-semibold text-gray-900 dark:text-white">{{ post.title }}</h4>
                      <span
                          :class="[
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          post.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        ]"
                      >
                        {{ post.published ? '已发布' : '草稿' }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(post.createdAt) }}</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <router-link
                        :to="`/edit/${post.slug}`"
                        class="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    >
                      <PencilIcon class="w-4 h-4 mr-1"/>
                      编辑
                    </router-link>
                    <button
                        @click="deletePost(post.id)"
                        class="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <TrashIcon class="w-4 h-4 mr-1"/>
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 评论管理 -->
          <div v-if="currentTab === 'comments'"
               class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
            <div class="flex items-center space-x-3 mb-8">
              <div
                  class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <ChatBubbleLeftIcon class="w-5 h-5 text-white"/>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">评论管理</h3>
                <p class="text-gray-500 dark:text-gray-400">管理所有用户评论</p>
              </div>
            </div>

            <div class="space-y-4">
              <div v-if="comments.length === 0" class="text-center py-12">
                <ChatBubbleLeftIcon class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"/>
                <h4 class="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">暂无评论</h4>
                <p class="text-gray-500 dark:text-gray-400">还没有用户发表评论</p>
              </div>

              <div
                  v-for="comment in comments"
                  :key="comment.id"
                  class="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-gray-100 dark:border-gray-600 hover:shadow-lg transition-all duration-200"
              >
                <div class="flex justify-between items-start mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ comment.author?.username || comment.guestName || '游客' }}
                    </span>
                    <span class="text-sm text-gray-400 dark:text-gray-500">•</span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(comment.createdAt) }}</span>
                  </div>
                  <button
                      @click="deleteComment(comment.id)"
                      class="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                  >
                    <TrashIcon class="w-4 h-4"/>
                  </button>
                </div>
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{{ comment.content }}</p>
                <div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <DocumentTextIcon class="w-4 h-4"/>
                  <span>{{ comment.post?.title }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 关于我页面编辑 -->
          <div v-if="currentTab === 'about'"
               class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
            <div class="flex items-center space-x-3 mb-8">
              <div
                  class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <DocumentTextIcon class="w-5 h-5 text-white"/>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">关于我页面</h3>
                <p class="text-gray-500 dark:text-gray-400">编辑在关于我页面显示的个人信息</p>
              </div>
            </div>

            <form @submit.prevent="updateAboutInfo" class="space-y-8">
              <!-- 姓名 -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-900 dark:text-white">姓名</label>
                <input
                    v-model="aboutForm.name"
                    type="text"
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="例如：Blog Author"
                    required
                >
              </div>

              <!-- 个人标题 -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-900 dark:text-white">个人标题</label>
                <input
                    v-model="aboutForm.title"
                    type="text"
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="例如：一个不甘心一直写业务代码的程序员！！"
                    required
                >
              </div>

              <!-- 详细描述 -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-900 dark:text-white">详细描述</label>
                <textarea
                    v-model="aboutForm.description"
                    rows="8"
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="详细介绍一下你自己，你的技术背景，兴趣爱好等..."
                ></textarea>
              </div>

              <!-- 技术技能 -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-900 dark:text-white">技术技能</label>
                <div class="space-y-3">
                  <div
                      v-for="(_skill, index) in aboutForm.skills"
                      :key="index"
                      class="flex items-center space-x-2"
                  >
                    <input
                        v-model="aboutForm.skills[index]"
                        type="text"
                        class="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="例如：JavaScript/TypeScript"
                    >
                    <button
                        type="button"
                        @click="removeSkill(index)"
                        class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <TrashIcon class="w-4 h-4"/>
                    </button>
                  </div>
                  <button
                      type="button"
                      @click="addSkill"
                      class="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    + 添加技能
                  </button>
                </div>
              </div>

              <!-- 兴趣爱好 -->
              <div class="space-y-2">
                <label class="block text-sm font-semibold text-gray-900 dark:text-white">兴趣爱好</label>
                <div class="space-y-3">
                  <div
                      v-for="(_interest, index) in aboutForm.interests"
                      :key="index"
                      class="flex items-center space-x-2"
                  >
                    <input
                        v-model="aboutForm.interests[index]"
                        type="text"
                        class="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="例如：开源项目贡献"
                    >
                    <button
                        type="button"
                        @click="removeInterest(index)"
                        class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <TrashIcon class="w-4 h-4"/>
                    </button>
                  </div>
                  <button
                      type="button"
                      @click="addInterest"
                      class="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    + 添加兴趣
                  </button>
                </div>
              </div>

              <!-- 联系信息 -->
              <div class="space-y-4">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white">联系信息</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-900 dark:text-white">邮箱</label>
                    <input
                        v-model="aboutForm.email"
                        type="email"
                        class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="例如：your@email.com"
                    >
                  </div>
                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-900 dark:text-white">GitHub</label>
                    <input
                        v-model="aboutForm.github"
                        type="url"
                        class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="例如：https://github.com/username"
                    >
                  </div>
                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-900 dark:text-white">LinkedIn</label>
                    <input
                        v-model="aboutForm.linkedin"
                        type="url"
                        class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="例如：https://linkedin.com/in/username"
                    >
                  </div>
                  <div class="space-y-2">
                    <label class="block text-sm font-semibold text-gray-900 dark:text-white">Twitter</label>
                    <input
                        v-model="aboutForm.twitter"
                        type="url"
                        class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="例如：https://twitter.com/username"
                    >
                  </div>
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
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                         fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    保存中...
                  </span>
                  <span v-else>保存修改</span>
                </button>
              </div>
            </form>
          </div>

          <!-- 用户管理 -->
          <div v-if="currentTab === 'users'"
               class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
            <div class="flex items-center space-x-3 mb-8">
              <div
                  class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <UsersIcon class="w-5 h-5 text-white"/>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">用户管理</h3>
                <p class="text-gray-500 dark:text-gray-400">管理所有注册用户</p>
              </div>
            </div>

            <div class="space-y-4">
              <div v-if="users.length === 0" class="text-center py-12">
                <UsersIcon class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"/>
                <h4 class="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">暂无用户</h4>
                <p class="text-gray-500 dark:text-gray-400">还没有用户注册</p>
              </div>

              <div
                  v-for="user in users"
                  :key="user.id"
                  class="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-gray-100 dark:border-gray-600 hover:shadow-lg transition-all duration-200"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div
                        class="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 border-2 border-white dark:border-gray-700 shadow-sm">
                      <img
                          v-if="user.avatar"
                          :src="user.avatar"
                          :alt="user.username"
                          class="w-full h-full object-cover"
                      />
                      <div v-else
                           class="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                        <UserIcon class="w-6 h-6"/>
                      </div>
                    </div>
                    <div>
                      <h4 class="font-semibold text-gray-900 dark:text-white">{{ user.username }}</h4>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-4">
                    <span
                        :class="[
                        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                        user.role === 'ADMIN'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      ]"
                    >
                      <div
                          :class="[
                          'w-2 h-2 rounded-full mr-2',
                          user.role === 'ADMIN' ? 'bg-red-500' : 'bg-green-500'
                        ]"
                      ></div>
                      {{ user.role === 'ADMIN' ? '管理员' : '普通用户' }}
                    </span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                      {{ formatDate(user.createdAt) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 分类管理 -->
          <div v-if="currentTab === 'categories'"
               class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center space-x-3">
                <div
                    class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <FolderIcon class="w-5 h-5 text-white"/>
                </div>
                <div>
                  <h3 class="text-2xl font-bold text-gray-900 dark:text-white">分类管理</h3>
                  <p class="text-gray-500 dark:text-gray-400">管理博客文章分类</p>
                </div>
              </div>
              <button
                  @click="openCategoryModal()"
                  class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
              >
                <PlusIcon class="w-4 h-4 mr-2"/>
                新建分类
              </button>
            </div>

            <div class="space-y-4">
              <div v-if="categories.length === 0" class="text-center py-12">
                <FolderIcon class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"/>
                <h4 class="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">暂无分类</h4>
                <p class="text-gray-500 dark:text-gray-400">开始创建您的第一个分类吧！</p>
              </div>

              <div
                  v-for="category in categories"
                  :key="category.id"
                  class="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 border border-gray-100 dark:border-gray-600 hover:shadow-lg transition-all duration-200"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                      <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h4 class="font-semibold text-gray-900 dark:text-white">{{ category.name }}</h4>
                      <span
                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        {{ category._count?.posts || 0 }} 篇文章
                      </span>
                    </div>
                    <p v-if="category.description" class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {{ category.description }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Slug: {{ category.slug }}</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button
                        @click="openCategoryModal(category)"
                        class="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                    >
                      <PencilIcon class="w-4 h-4 mr-1"/>
                      编辑
                    </button>
                    <button
                        @click="deleteCategory(category)"
                        :disabled="(category._count?.posts ? category._count.posts > 0 : false)"
                        class="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrashIcon class="w-4 h-4 mr-1"/>
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 数据统计 -->
          <div v-if="currentTab === 'stats'"
               class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-8">
            <div class="flex items-center space-x-3 mb-8">
              <div
                  class="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <ChartBarIcon class="w-5 h-5 text-white"/>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white">数据统计</h3>
                <p class="text-gray-500 dark:text-gray-400">查看系统运行数据</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                  class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">文章总数</p>
                    <p class="text-3xl font-bold text-blue-900 dark:text-blue-100">{{ stats.totalPosts }}</p>
                  </div>
                  <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <DocumentTextIcon class="w-6 h-6 text-white"/>
                  </div>
                </div>
              </div>

              <div
                  class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-100 dark:border-green-800">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-green-600 dark:text-green-400 mb-1">用户总数</p>
                    <p class="text-3xl font-bold text-green-900 dark:text-green-100">{{ stats.totalUsers }}</p>
                  </div>
                  <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <UsersIcon class="w-6 h-6 text-white"/>
                  </div>
                </div>
              </div>

              <div
                  class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">评论总数</p>
                    <p class="text-3xl font-bold text-purple-900 dark:text-purple-100">{{ stats.totalComments }}</p>
                  </div>
                  <div class="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                    <ChatBubbleLeftIcon class="w-6 h-6 text-white"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <transition name="modal" appear>
      <div v-if="showPasswordModal"
           class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
          <div class="p-6">
            <div
                class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full">
              <KeyIcon class="w-6 h-6 text-white"/>
            </div>

            <h3 class="text-xl font-semibold text-gray-900 dark:text-white text-center mb-6">修改密码</h3>

            <form @submit.prevent="updatePassword" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">当前密码</label>
                <input
                    v-model="passwordForm.currentPassword"
                    type="password"
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    required
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">新密码</label>
                <input
                    v-model="passwordForm.newPassword"
                    type="password"
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    required
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">确认新密码</label>
                <input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    required
                >
              </div>

              <div class="flex flex-col gap-3 mt-6">
                <button
                    type="submit"
                    :disabled="loading"
                    class="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
                >
                  <span v-if="loading" class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                         fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    更新中...
                  </span>
                  <span v-else>确认修改</span>
                </button>
                <button
                    type="button"
                    @click="showPasswordModal = false"
                    :disabled="loading"
                    class="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>

    <!-- 分类编辑弹窗 -->
    <transition name="modal" appear>
      <div v-if="showCategoryModal"
           class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
          <div class="p-6">
            <div
                class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full">
              <FolderIcon class="w-6 h-6 text-white"/>
            </div>

            <h3 class="text-xl font-semibold text-gray-900 dark:text-white text-center mb-6">
              {{ editingCategory ? '编辑分类' : '新建分类' }}
            </h3>

            <form @submit.prevent="saveCategory" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">分类名称 *</label>
                <input
                    v-model="categoryForm.name"
                    type="text"
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="请输入分类名称"
                    required
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">分类描述</label>
                <textarea
                    v-model="categoryForm.description"
                    rows="3"
                    class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="请输入分类描述（可选）"
                ></textarea>
              </div>

              <div class="flex flex-col gap-3 mt-6">
                <button
                    type="submit"
                    :disabled="loading"
                    class="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
                >
                  <span v-if="loading" class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                         fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ editingCategory ? '更新中...' : '创建中...' }}
                  </span>
                  <span v-else>{{ editingCategory ? '更新分类' : '创建分类' }}</span>
                </button>
                <button
                    type="button"
                    @click="closeCategoryModal"
                    :disabled="loading"
                    class="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {useAuthStore} from '../stores/auth'
import api, {type Post, aboutApi, type AboutInfo, categoriesApi, type Category} from '../api'
import {format} from 'date-fns'
import {
  UserIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  UsersIcon,
  ChartBarIcon,
  KeyIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon,
  FolderIcon
} from '@heroicons/vue/24/outline'
// import { CrownIcon } from '@heroicons/vue/20/solid'
import AvatarUpload from '../components/AvatarUpload.vue'
import {useToast} from '../composables/useToast'
import {useDialog} from '../composables/useDialog'

const authStore = useAuthStore()
const {toast} = useToast()
const {confirm} = useDialog()

const currentTab = ref('profile')
const loading = ref(false)
const avatarUploadRef = ref()
const showPasswordModal = ref(false)

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

const posts = ref<Array<Post>>([])
const comments = ref<Array<{
  id: string
  content: string
  createdAt: string
  author?: {
    id: string
    username: string
    avatar?: string
  }
  guestName?: string
  post?: {
    id: string
    title: string
  }
}>>([])
const users = ref<Array<{
  id: string
  username: string
  email: string
  avatar?: string
  role: 'USER' | 'ADMIN'
  createdAt: string
}>>([])
const stats = ref({
  totalPosts: 0,
  totalUsers: 0,
  totalComments: 0
})
const aboutForm = ref<AboutInfo>({
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

const categories = ref<Category[]>([])
const categoryForm = ref({
  name: '',
  description: ''
})
const editingCategory = ref<Category | null>(null)
const showCategoryModal = ref(false)

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

const loadPosts = async () => {
  try {
    const response = await api.get('/posts?all=true')
    posts.value = response.data.posts
  } catch (error) {
    console.error('Failed to load posts:', error)
  }
}

const loadComments = async () => {
  try {
    const response = await api.get('/comments')
    comments.value = response.data.comments
  } catch (error) {
    console.error('Failed to load comments:', error)
  }
}

const loadUsers = async () => {
  try {
    const response = await api.get('/users')
    users.value = response.data.users
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

const loadStats = async () => {
  try {
    const response = await api.get('/stats')
    stats.value = response.data
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const loadAboutInfo = async () => {
  try {
    const response = await aboutApi.get()
    aboutForm.value = response.data
  } catch (error) {
    console.error('Failed to load about info:', error)
  }
}

const loadCategories = async () => {
  try {
    const response = await categoriesApi.getAll()
    categories.value = response.data
  } catch (error) {
    console.error('Failed to load categories:', error)
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
    showPasswordModal.value = false
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

const deletePost = async (postId: string) => {
  const confirmed = await confirm(
      '确定要删除这篇文章吗？此操作无法恢复。',
      '删除文章'
  )

  if (!confirmed) return

  try {
    await api.delete(`/posts/${postId}`)
    posts.value = posts.value.filter(p => p.id !== postId)
    toast.success('文章删除成功')
  } catch (error: any) {
    toast.error(error.response?.data?.error || '删除失败')
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
    comments.value = comments.value.filter(c => c.id !== commentId)
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
      name: aboutForm.value.name.trim(),
      title: aboutForm.value.title.trim(),
      description: aboutForm.value.description.trim(),
      skills: filteredSkills,
      interests: filteredInterests,
      email: aboutForm.value.email?.trim(),
      github: aboutForm.value.github?.trim(),
      linkedin: aboutForm.value.linkedin?.trim(),
      twitter: aboutForm.value.twitter?.trim()
    }

    await aboutApi.update(aboutData)
    toast.success('关于我页面信息已更新')
  } catch (error: any) {
    toast.error(error.response?.data?.error || '更新失败，请重试')
  } finally {
    loading.value = false
  }
}

// 分类管理相关函数
const openCategoryModal = (category?: Category) => {
  if (category) {
    editingCategory.value = category
    categoryForm.value = {
      name: category.name,
      description: category.description || ''
    }
  } else {
    editingCategory.value = null
    categoryForm.value = {
      name: '',
      description: ''
    }
  }
  showCategoryModal.value = true
}

const closeCategoryModal = () => {
  showCategoryModal.value = false
  editingCategory.value = null
  categoryForm.value = {
    name: '',
    description: ''
  }
}

const saveCategory = async () => {
  try {
    loading.value = true

    if (editingCategory.value) {
      // 更新分类
      await categoriesApi.update(editingCategory.value.id, categoryForm.value)
      toast.success('分类更新成功')
    } else {
      // 创建分类
      await categoriesApi.create(categoryForm.value)
      toast.success('分类创建成功')
    }

    await loadCategories()
    closeCategoryModal()
  } catch (error: any) {
    toast.error(error.response?.data?.error || '操作失败')
  } finally {
    loading.value = false
  }
}

const deleteCategory = async (category: Category) => {
  const confirmed = await confirm(
      `确定要删除分类"${category.name}"吗？`,
      '删除分类'
  )

  if (!confirmed) return

  try {
    await categoriesApi.delete(category.id)
    categories.value = categories.value.filter(c => c.id !== category.id)
    toast.success('分类删除成功')
  } catch (error: any) {
    toast.error(error.response?.data?.error || '删除失败')
  }
}

onMounted(() => {
  loadProfile()
  loadPosts()
  loadComments()
  loadUsers()
  loadStats()
  loadAboutInfo()
  loadCategories()
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

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95) translateY(-20px);
}
</style>
