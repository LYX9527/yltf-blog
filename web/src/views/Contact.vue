<script setup lang="ts">
import { ref } from 'vue'
import { EnvelopeIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon } from '@heroicons/vue/24/outline'
import { useToast } from '../composables/useToast'

const { toast } = useToast()

const contactForm = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const isSubmitting = ref(false)

const contactInfo = {
  email: 'fp4u5h7k@gmail.com',
  responseTime: '24-48小时内回复'
}

const submitForm = async () => {
  // 验证表单
  if (!contactForm.value.name.trim()) {
    toast.error('请输入您的姓名')
    return
  }
  
  if (!contactForm.value.email.trim()) {
    toast.error('请输入您的邮箱')
    return
  }
  
  if (!contactForm.value.message.trim()) {
    toast.error('请输入留言内容')
    return
  }

  try {
    isSubmitting.value = true
    
    // 构建邮件内容
    const subject = contactForm.value.subject || '来自博客的留言'
    const body = `姓名: ${contactForm.value.name}
邮箱: ${contactForm.value.email}
主题: ${subject}

留言内容:
${contactForm.value.message}`

    // 打开邮件客户端
    const mailtoLink = `mailto:${contactInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoLink
    
    toast.success('已为您打开邮件客户端，请发送邮件')
    
    // 清空表单
    contactForm.value = {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  } catch (error) {
    toast.error('操作失败，请直接发送邮件到 ' + contactInfo.email)
  } finally {
    isSubmitting.value = false
  }
}

const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(contactInfo.email)
    toast.success('邮箱地址已复制到剪贴板')
  } catch (error) {
    toast.error('复制失败，请手动复制邮箱地址')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <!-- 页面标题 -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">联系我</h1>
        <p class="text-xl text-gray-600">有任何问题或想法，欢迎与我交流</p>
      </div>

      <div class="grid lg:grid-cols-2 gap-12">
        <!-- 联系信息 -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <ChatBubbleLeftRightIcon class="h-7 w-7 mr-3 text-blue-500" />
            联系方式
          </h2>
          
          <div class="space-y-6">
            <!-- 邮箱 -->
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <div class="p-3 bg-blue-100 rounded-lg">
                  <EnvelopeIcon class="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div class="ml-4 flex-1">
                <h3 class="text-lg font-medium text-gray-900">邮箱</h3>
                <div class="flex items-center mt-1">
                  <p class="text-gray-600">{{ contactInfo.email }}</p>
                  <button
                    @click="copyEmail"
                    class="ml-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    复制
                  </button>
                </div>
                <p class="text-sm text-gray-500 mt-1">{{ contactInfo.responseTime }}</p>
              </div>
            </div>

            <!-- 沟通方式说明 -->
            <div class="bg-blue-50 rounded-lg p-4">
              <h4 class="font-medium text-blue-900 mb-2">我很乐意与您讨论：</h4>
              <ul class="text-sm text-blue-800 space-y-1">
                <li>• 技术问题和解决方案</li>
                <li>• 项目合作机会</li>
                <li>• 博客内容建议</li>
                <li>• 职业发展交流</li>
                <li>• 开源项目协作</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 联系表单 -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <PaperAirplaneIcon class="h-7 w-7 mr-3 text-green-500" />
            发送留言
          </h2>
          
          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- 姓名 -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                姓名 <span class="text-red-500">*</span>
              </label>
              <input
                id="name"
                v-model="contactForm.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入您的姓名"
              />
            </div>

            <!-- 邮箱 -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                邮箱 <span class="text-red-500">*</span>
              </label>
              <input
                id="email"
                v-model="contactForm.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入您的邮箱地址"
              />
            </div>

            <!-- 主题 -->
            <div>
              <label for="subject" class="block text-sm font-medium text-gray-700 mb-1">
                主题
              </label>
              <input
                id="subject"
                v-model="contactForm.subject"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入留言主题（可选）"
              />
            </div>

            <!-- 留言内容 -->
            <div>
              <label for="message" class="block text-sm font-medium text-gray-700 mb-1">
                留言内容 <span class="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                v-model="contactForm.message"
                rows="6"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入您的留言内容..."
              ></textarea>
            </div>

            <!-- 提交按钮 -->
            <div>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon class="h-5 w-5 mr-2" />
                {{ isSubmitting ? '处理中...' : '发送留言' }}
              </button>
            </div>
          </form>

          <!-- 提示信息 -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600">
              点击"发送留言"将会打开您的邮件客户端，您可以直接发送邮件给我。
              如果无法正常打开，请直接发送邮件到 
              <span class="font-medium text-blue-600">{{ contactInfo.email }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- 底部说明 -->
      <div class="mt-12 text-center">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-2">感谢您的关注</h3>
          <p class="text-gray-600">
            无论是技术交流、项目合作还是简单的问候，我都非常期待收到您的来信。
            让我们一起在技术的道路上互相学习、共同成长！
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
input:focus, textarea:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>