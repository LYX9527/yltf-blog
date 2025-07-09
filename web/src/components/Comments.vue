<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ChatBubbleLeftEllipsisIcon, TrashIcon, UserIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
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
  postAuthorId: string
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
const collapsedReplies = ref<Set<string>>(new Set())
const expandedComments = ref<Set<string>>(new Set())

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
    
    // 默认收起所有有回复的评论
    collapsedReplies.value.clear()
    comments.value.forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        collapsedReplies.value.add(comment.id)
      }
    })
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
    // 处理频率限制错误
    if (err.response?.status === 429) {
      error.value = err.response.data?.error || '评论过于频繁，请稍后再试'
    } else {
      error.value = err.response?.data?.error || '评论发布失败'
    }
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

const isPostAuthor = (comment: Comment) => {
  return comment.author && comment.author.id === props.postAuthorId
}

const toggleReplies = (commentId: string) => {
  if (collapsedReplies.value.has(commentId)) {
    collapsedReplies.value.delete(commentId)
  } else {
    collapsedReplies.value.add(commentId)
  }
}

const isRepliesCollapsed = (commentId: string) => {
  return collapsedReplies.value.has(commentId)
}

const isCommentExpanded = (commentId: string) => {
  return expandedComments.value.has(commentId)
}

const toggleCommentExpansion = (commentId: string) => {
  if (expandedComments.value.has(commentId)) {
    expandedComments.value.delete(commentId)
  } else {
    expandedComments.value.add(commentId)
  }
}

const shouldShowExpandButton = (content: string) => {
  if (!content) return false
  // 检查是否有换行符超过3行
  const lines = content.split('\n')
  if (lines.length > 3) return true
  
  // 检查是否有单行文本过长（超过120个字符）
  const hasLongLine = lines.some(line => line.length > 120)
  return hasLongLine
}

const getDisplayContent = (comment: Comment) => {
  return comment.content
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-8">
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
      <ChatBubbleLeftEllipsisIcon class="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
      评论 ({{ comments.length }})
    </h3>

    <!-- 错误和成功提示 -->
    <div v-if="error" class="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4">
      <p class="text-red-800 dark:text-red-200 text-sm">{{ error }}</p>
    </div>

    <div v-if="success" class="mb-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md p-4">
      <p class="text-green-800 dark:text-green-200 text-sm">{{ success }}</p>
    </div>

    <!-- 发表评论表单 -->
    <div class="mb-8">
      <div v-if="showGuestForm" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">姓名 *</label>
          <input
            v-model="guestForm.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            placeholder="请输入您的姓名"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">邮箱 *</label>
          <input
            v-model="guestForm.email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            placeholder="请输入您的邮箱"
          />
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {{ authStore.isLoggedIn ? '发表评论' : '评论内容' }} *
        </label>
        <textarea
          v-model="newComment"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
          placeholder="请输入您的评论..."
        ></textarea>
      </div>

      <div class="flex justify-between items-center">
        <div v-if="!authStore.isLoggedIn" class="text-sm text-gray-500 dark:text-gray-400">
          <div class="mb-1">
            <RouterLink to="/auth" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">登录</RouterLink>
            后可以更方便地管理评论
          </div>
          <div class="text-xs text-amber-600 dark:text-amber-400">
            未登录用户限制：10分钟内最多10条评论，1分钟内最多1条评论
          </div>
        </div>
        <button
          @click="submitComment(newComment)"
          :disabled="submitting"
          class="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? '发布中...' : '发布评论' }}
        </button>
      </div>
    </div>

    <!-- 评论列表 -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
    </div>

    <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      暂无评论，快来发表第一条评论吧！
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0"
      >
        <!-- 主评论 -->
        <div class="flex space-x-3">
          <div class="flex-shrink-0">
            <div v-if="comment.author?.avatar" class="h-10 w-10 rounded-full overflow-hidden">
              <img :src="comment.author.avatar" :alt="getDisplayName(comment)" class="w-full h-full object-cover" />
            </div>
            <div v-else class="h-10 w-10 bg-gray-400 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <UserIcon class="h-5 w-5 text-white" />
            </div>
          </div>

          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-2">
              <span class="font-medium text-gray-900 dark:text-white">{{ getDisplayName(comment) }}</span>
              <span v-if="!comment.author" class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">访客</span>
              <span v-if="isPostAuthor(comment)" class="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded font-medium">作者</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(comment.createdAt) }}</span>
            </div>

            <div class="text-gray-700 dark:text-gray-300 mb-3" :class="isCommentExpanded(comment.id) ? 'whitespace-pre-wrap' : 'comment-clamp whitespace-pre-wrap'">
              {{ getDisplayContent(comment) }}
            </div>

            <div v-if="shouldShowExpandButton(comment.content)" class="mb-3">
              <button
                @click="toggleCommentExpansion(comment.id)"
                class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
              >
                {{ isCommentExpanded(comment.id) ? '收起' : '展开' }}
              </button>
            </div>

            <div class="flex space-x-4 text-sm">
              <button
                @click="startReply(comment.id)"
                class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                回复
              </button>
              <button
                v-if="comment.replies && comment.replies.length > 0"
                @click="toggleReplies(comment.id)"
                class="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center"
              >
                <ChevronDownIcon v-if="isRepliesCollapsed(comment.id)" class="h-4 w-4 mr-1" />
                <ChevronUpIcon v-else class="h-4 w-4 mr-1" />
                {{ isRepliesCollapsed(comment.id) ? '展开' : '收起' }}回复 ({{ comment.replies.length }})
              </button>
              <button
                v-if="canDeleteComment(comment)"
                @click="deleteComment(comment.id)"
                class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center"
              >
                <TrashIcon class="h-4 w-4 mr-1" />
                删除
              </button>
            </div>

            <!-- 回复表单 -->
            <div v-if="replyingTo === comment.id" class="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
              <div v-if="showGuestForm" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <input
                    v-model="guestForm.name"
                    type="text"
                    placeholder="姓名"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-all duration-200"
                  />
                </div>
                <div>
                  <input
                    v-model="guestForm.email"
                    type="email"
                    placeholder="邮箱"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-all duration-200"
                  />
                </div>
              </div>

              <textarea
                v-model="replyContent"
                rows="3"
                placeholder="回复评论..."
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 mb-3 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-all duration-200"
              ></textarea>

              <div class="flex space-x-2">
                <button
                  @click="submitComment(replyContent, comment.id)"
                  :disabled="submitting"
                  class="px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 text-sm"
                >
                  {{ submitting ? '发布中...' : '发布回复' }}
                </button>
                <button
                  @click="cancelReply"
                  class="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 text-sm"
                >
                  取消
                </button>
              </div>
            </div>

            <!-- 回复列表 -->
            <div v-if="comment.replies && comment.replies.length > 0 && !isRepliesCollapsed(comment.id)" class="mt-4 space-y-4">
              <div
                v-for="reply in comment.replies"
                :key="reply.id"
                class="flex space-x-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-md"
              >
                <div class="flex-shrink-0">
                  <div v-if="reply.author?.avatar" class="h-8 w-8 rounded-full overflow-hidden">
                    <img :src="reply.author.avatar" :alt="getDisplayName(reply)" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="h-8 w-8 bg-gray-400 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <UserIcon class="h-4 w-4 text-white" />
                  </div>
                </div>

                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <span class="font-medium text-gray-900 dark:text-white text-sm">{{ getDisplayName(reply) }}</span>
                    <span v-if="!reply.author" class="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">访客</span>
                    <span v-if="isPostAuthor(reply)" class="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded font-medium">作者</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(reply.createdAt) }}</span>
                  </div>

                  <div class="text-gray-700 dark:text-gray-300 text-sm mb-2" :class="isCommentExpanded(reply.id) ? 'whitespace-pre-wrap' : 'comment-clamp whitespace-pre-wrap'">
                    {{ getDisplayContent(reply) }}
                  </div>

                  <div v-if="shouldShowExpandButton(reply.content)" class="mb-2">
                    <button
                      @click="toggleCommentExpansion(reply.id)"
                      class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium"
                    >
                      {{ isCommentExpanded(reply.id) ? '收起' : '展开' }}
                    </button>
                  </div>

                  <div v-if="canDeleteComment(reply)" class="text-xs">
                    <button
                      @click="deleteComment(reply.id)"
                      class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center"
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

<style scoped>
.comment-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-wrap: break-word;
  line-height: 1.5;
}
</style>