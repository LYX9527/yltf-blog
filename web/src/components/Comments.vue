<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ChatBubbleLeftEllipsisIcon, TrashIcon, UserIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth'
import { commentsApi } from '../api'

interface Comment {
  id: string
  content: string
  createdAt: string
  author?: {
    id: string
    name?: string
    username: string
    avatar?: string
  }
  guestName?: string
  guestEmail?: string
  parentId?: string
  replies?: Comment[]
}

const props = defineProps<{
  postId: string
}>()

const authStore = useAuthStore()
const comments = ref<Comment[]>([])
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const success = ref('')

const newComment = ref('')
const replyingTo = ref<string | null>(null)
const replyContent = ref('')

const guestForm = ref({
  name: '',
  email: ''
})

const showGuestForm = computed(() => !authStore.isLoggedIn)

onMounted(async () => {
  await fetchComments()
})

const fetchComments = async () => {
  try {
    loading.value = true
    const response = await commentsApi.getByPostId(props.postId)
    comments.value = response.data
  } catch (err) {
    error.value = '评论加载失败'
    console.error('Failed to fetch comments:', err)
  } finally {
    loading.value = false
  }
}

const submitComment = async (content: string, parentId?: string) => {
  if (!content.trim()) {
    error.value = '评论内容不能为空'
    return
  }

  if (showGuestForm.value && (!guestForm.value.name.trim() || !guestForm.value.email.trim())) {
    error.value = '请填写姓名和邮箱'
    return
  }

  try {
    submitting.value = true
    error.value = ''
    
    const payload: any = {
      content: content.trim(),
      parentId: parentId || null
    }

    if (showGuestForm.value) {
      payload.guestName = guestForm.value.name.trim()
      payload.guestEmail = guestForm.value.email.trim()
    }

    await commentsApi.create(props.postId, payload)
    
    success.value = '评论发布成功'
    newComment.value = ''
    replyContent.value = ''
    replyingTo.value = null
    
    if (showGuestForm.value) {
      guestForm.value = { name: '', email: '' }
    }
    
    await fetchComments()
    
    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (err: any) {
    error.value = err.response?.data?.error || '评论发布失败'
  } finally {
    submitting.value = false
  }
}

const deleteComment = async (commentId: string) => {
  if (!confirm('确定要删除这条评论吗？')) return

  try {
    await commentsApi.delete(commentId)
    success.value = '评论删除成功'
    await fetchComments()
    
    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (err: any) {
    error.value = err.response?.data?.error || '删除失败'
  }
}

const startReply = (commentId: string) => {
  replyingTo.value = commentId
  replyContent.value = ''
}

const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getDisplayName = (comment: Comment) => {
  if (comment.author) {
    return comment.author.name || comment.author.username
  }
  return comment.guestName || '匿名用户'
}

const canDeleteComment = (comment: Comment) => {
  if (authStore.isAdmin) return true
  if (comment.author && authStore.user?.id === comment.author.id) return true
  return false
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm p-6 mt-8">
    <h3 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
      <ChatBubbleLeftEllipsisIcon class="h-5 w-5 mr-2" />
      评论 ({{ comments.length }})
    </h3>

    <!-- 错误和成功提示 -->
    <div v-if="error" class="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
      <p class="text-red-800 text-sm">{{ error }}</p>
    </div>

    <div v-if="success" class="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
      <p class="text-green-800 text-sm">{{ success }}</p>
    </div>

    <!-- 发表评论表单 -->
    <div class="mb-8">
      <div v-if="showGuestForm" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
          <input
            v-model="guestForm.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入您的姓名"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">邮箱 *</label>
          <input
            v-model="guestForm.email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入您的邮箱"
          />
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">
          {{ authStore.isLoggedIn ? '发表评论' : '评论内容' }} *
        </label>
        <textarea
          v-model="newComment"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="请输入您的评论..."
        ></textarea>
      </div>

      <div class="flex justify-between items-center">
        <div v-if="!authStore.isLoggedIn" class="text-sm text-gray-500">
          <RouterLink to="/auth" class="text-blue-600 hover:text-blue-800">登录</RouterLink>
          后可以更方便地管理评论
        </div>
        <button
          @click="submitComment(newComment)"
          :disabled="submitting"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? '发布中...' : '发布评论' }}
        </button>
      </div>
    </div>

    <!-- 评论列表 -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500">
      暂无评论，快来发表第一条评论吧！
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="border-b border-gray-200 pb-6 last:border-b-0"
      >
        <!-- 主评论 -->
        <div class="flex space-x-3">
          <div class="flex-shrink-0">
            <div v-if="comment.author?.avatar" class="h-10 w-10 rounded-full overflow-hidden">
              <img :src="comment.author.avatar" :alt="getDisplayName(comment)" class="w-full h-full object-cover" />
            </div>
            <div v-else class="h-10 w-10 bg-gray-400 rounded-full flex items-center justify-center">
              <UserIcon class="h-5 w-5 text-white" />
            </div>
          </div>

          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-2">
              <span class="font-medium text-gray-900">{{ getDisplayName(comment) }}</span>
              <span v-if="!comment.author" class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">访客</span>
              <span class="text-sm text-gray-500">{{ formatDate(comment.createdAt) }}</span>
            </div>

            <div class="text-gray-700 whitespace-pre-wrap mb-3">{{ comment.content }}</div>

            <div class="flex space-x-4 text-sm">
              <button
                @click="startReply(comment.id)"
                class="text-blue-600 hover:text-blue-800"
              >
                回复
              </button>
              <button
                v-if="canDeleteComment(comment)"
                @click="deleteComment(comment.id)"
                class="text-red-600 hover:text-red-800 flex items-center"
              >
                <TrashIcon class="h-4 w-4 mr-1" />
                删除
              </button>
            </div>

            <!-- 回复表单 -->
            <div v-if="replyingTo === comment.id" class="mt-4 bg-gray-50 p-4 rounded-md">
              <div v-if="showGuestForm" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <input
                    v-model="guestForm.name"
                    type="text"
                    placeholder="姓名"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    v-model="guestForm.email"
                    type="email"
                    placeholder="邮箱"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <textarea
                v-model="replyContent"
                rows="3"
                placeholder="回复评论..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
              ></textarea>

              <div class="flex space-x-2">
                <button
                  @click="submitComment(replyContent, comment.id)"
                  :disabled="submitting"
                  class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {{ submitting ? '发布中...' : '发布回复' }}
                </button>
                <button
                  @click="cancelReply"
                  class="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                >
                  取消
                </button>
              </div>
            </div>

            <!-- 回复列表 -->
            <div v-if="comment.replies && comment.replies.length > 0" class="mt-4 space-y-4">
              <div
                v-for="reply in comment.replies"
                :key="reply.id"
                class="flex space-x-3 bg-gray-50 p-4 rounded-md"
              >
                <div class="flex-shrink-0">
                  <div v-if="reply.author?.avatar" class="h-8 w-8 rounded-full overflow-hidden">
                    <img :src="reply.author.avatar" :alt="getDisplayName(reply)" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="h-8 w-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <UserIcon class="h-4 w-4 text-white" />
                  </div>
                </div>

                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="font-medium text-gray-900 text-sm">{{ getDisplayName(reply) }}</span>
                    <span v-if="!reply.author" class="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">访客</span>
                    <span class="text-xs text-gray-500">{{ formatDate(reply.createdAt) }}</span>
                  </div>

                  <div class="text-gray-700 text-sm whitespace-pre-wrap mb-2">{{ reply.content }}</div>

                  <div v-if="canDeleteComment(reply)" class="text-xs">
                    <button
                      @click="deleteComment(reply.id)"
                      class="text-red-600 hover:text-red-800 flex items-center"
                    >
                      <TrashIcon class="h-3 w-3 mr-1" />
                      删除
                    </button>
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