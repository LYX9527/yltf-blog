<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PlusIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import MarkdownEditor from '../components/MarkdownEditor.vue'
import ImageUpload from '../components/ImageUpload.vue'
import { postsApi, categoriesApi, tagsApi, type Post, type Category, type Tag } from '../api'

const route = useRoute()
const router = useRouter()

const slug = computed(() => route.params.slug as string)

const form = ref({
  title: '',
  content: '',
  excerpt: '',
  categoryId: '',
  tagIds: [] as string[],
  published: false,
  featured: false,
  coverImage: ''
})

const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const selectedTags = ref<Tag[]>([])
const newTagName = ref('')
const loading = ref(false)
const fetchLoading = ref(true)
const error = ref('')
const originalPost = ref<Post | null>(null)

onMounted(async () => {
  await Promise.all([fetchPost(), fetchData()])
})

const fetchPost = async () => {
  try {
    const response = await postsApi.getBySlug(slug.value)
    originalPost.value = response.data
    const post = response.data

    form.value = {
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      categoryId: post.category?.id || '',
      tagIds: post.tags.map(t => t.tag.id),
      published: post.published,
      featured: post.featured,
      coverImage: post.coverImage || ''
    }

    selectedTags.value = post.tags.map(t => t.tag)
  } catch (err) {
    error.value = '文章不存在或加载失败'
    console.error('Failed to fetch post:', err)
  } finally {
    fetchLoading.value = false
  }
}

const fetchData = async () => {
  try {
    const [categoriesResponse, tagsResponse] = await Promise.all([
      categoriesApi.getAll(),
      tagsApi.getAll()
    ])
    categories.value = categoriesResponse.data
    tags.value = tagsResponse.data
  } catch (err) {
    console.error('Failed to fetch data:', err)
  }
}

const addTag = (tag: Tag) => {
  if (!selectedTags.value.find(t => t.id === tag.id)) {
    selectedTags.value.push(tag)
    form.value.tagIds.push(tag.id)
  }
}

const removeTag = (tagId: string) => {
  selectedTags.value = selectedTags.value.filter(t => t.id !== tagId)
  form.value.tagIds = form.value.tagIds.filter(id => id !== tagId)
}

const createNewTag = async () => {
  if (!newTagName.value.trim()) return

  try {
    const response = await tagsApi.create({ name: newTagName.value.trim() })
    const newTag = response.data
    tags.value.push(newTag)
    addTag(newTag)
    newTagName.value = ''
  } catch (err) {
    console.error('Failed to create tag:', err)
  }
}

const generateExcerpt = () => {
  if (form.value.content) {
    const plainText = form.value.content
      .replace(/[#*`>]/g, '')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    form.value.excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '')
  }
}

const saveDraft = async () => {
  await savePost(false)
}

const publishPost = async () => {
  await savePost(true)
}

const savePost = async (published: boolean) => {
  if (!form.value.title.trim() || !form.value.content.trim()) {
    error.value = '标题和内容不能为空'
    return
  }

  try {
    loading.value = true
    error.value = ''

    const data = {
      ...form.value,
      published,
      tagIds: form.value.tagIds
    }

    const response = await postsApi.update(slug.value, data)

    // 如果 slug 改变了，需要重定向
    if (response.data.slug !== slug.value) {
      router.push(`/edit/${response.data.slug}`)
    } else {
      router.push(published ? '/posts' : '/manage')
    }
  } catch (err) {
    error.value = '保存失败，请重试'
    console.error('Failed to save post:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div v-if="fetchLoading" class="bg-white rounded-lg shadow-sm p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-gray-500 mt-2">加载中...</p>
      </div>

      <div v-else-if="error && !originalPost" class="bg-white rounded-lg shadow-sm p-8 text-center">
        <p class="text-red-600 mb-4">{{ error }}</p>
        <RouterLink
          to="/manage"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          返回管理页面
        </RouterLink>
      </div>

      <div v-else class="bg-white rounded-lg shadow-sm">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">编辑文章</h1>
              <p class="text-gray-600 mt-1">{{ originalPost?.title }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <span :class="[
                'px-2 py-1 text-xs font-semibold rounded-full',
                originalPost?.published
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              ]">
                {{ originalPost?.published ? '已发布' : '草稿' }}
              </span>
              <RouterLink
                :to="`/posts/${originalPost?.slug}`"
                class="text-blue-600 hover:text-blue-800 text-sm"
              >
                查看文章
              </RouterLink>
            </div>
          </div>
        </div>

        <form @submit.prevent="publishPost" class="p-6 space-y-6">
          <!-- 错误提示 -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
            <p class="text-red-800">{{ error }}</p>
          </div>

          <!-- 标题 -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
              文章标题 *
            </label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入文章标题..."
            />
          </div>

          <!-- 摘要 -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label for="excerpt" class="block text-sm font-medium text-gray-700">
                文章摘要
              </label>
              <button
                type="button"
                @click="generateExcerpt"
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                从内容生成
              </button>
            </div>
            <textarea
              id="excerpt"
              v-model="form.excerpt"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入文章摘要（可选）..."
            ></textarea>
          </div>

          <!-- 分类和标签 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 分类 -->
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
                分类
              </label>
              <select
                id="category"
                v-model="form.categoryId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">选择分类</option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>

            <!-- 标签 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                标签
              </label>

              <!-- 已选标签 -->
              <div v-if="selectedTags.length > 0" class="flex flex-wrap gap-2 mb-2">
                <span
                  v-for="tag in selectedTags"
                  :key="tag.id"
                  class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {{ tag.name }}
                  <button
                    type="button"
                    @click="removeTag(tag.id)"
                    class="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <XMarkIcon class="h-3 w-3" />
                  </button>
                </span>
              </div>

              <!-- 标签选择 -->
              <div class="flex flex-wrap gap-1 mb-2">
                <button
                  v-for="tag in tags.filter(t => !selectedTags.find(st => st.id === t.id))"
                  :key="tag.id"
                  type="button"
                  @click="addTag(tag)"
                  class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  {{ tag.name }}
                </button>
              </div>

              <!-- 新建标签 -->
              <div class="flex gap-2">
                <input
                  v-model="newTagName"
                  type="text"
                  placeholder="新标签名称"
                  class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  @keyup.enter="createNewTag"
                />
                <button
                  type="button"
                  @click="createNewTag"
                  :disabled="!newTagName.trim()"
                  class="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PlusIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- 封面图片 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              封面图片
            </label>
            <ImageUpload
              v-model="form.coverImage"
              placeholder="点击上传、拖拽或粘贴封面图片"
              :accept-paste="true"
            />
          </div>

          <!-- Markdown 编辑器 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              文章内容 * (支持 Markdown)
            </label>
            <MarkdownEditor
              v-model="form.content"
              height="500px"
              placeholder="请输入文章内容，支持 Markdown 语法..."
            />
          </div>

          <!-- 发布设置 -->
          <div class="space-y-4 pt-4 border-t border-gray-200">
            <div class="flex items-center space-x-6">
              <label class="flex items-center">
                <input
                  v-model="form.featured"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700">设为精选文章</span>
              </label>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center justify-between pt-6 border-t border-gray-200">
            <RouterLink
              to="/manage"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              取消
            </RouterLink>

            <div class="flex space-x-3">
              <button
                type="button"
                @click="saveDraft"
                :disabled="loading"
                class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ loading ? '保存中...' : '保存草稿' }}
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ loading ? (form.published ? '更新中...' : '发布中...') : (form.published ? '更新文章' : '发布文章') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
