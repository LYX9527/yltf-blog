<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="col-span-1 md:col-span-2">
          <h3 class="text-lg font-semibold mb-4">倚栏听风的博客</h3>
          <p class="text-gray-300 mb-4">
            分享技术心得，记录学习历程。专注于前端、后端和全栈开发技术分享。
          </p>
          <div class="flex space-x-4">
            <a href="https://github.com/LYX9527" class="text-gray-300 hover:text-white transition-colors">
              <span class="sr-only">GitHub</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="#" class="text-gray-300 hover:text-white transition-colors">
              <span class="sr-only">Twitter</span>
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">快速链接</h3>
          <ul class="space-y-2">
            <li>
              <RouterLink to="/" class="text-gray-300 hover:text-white transition-colors">首页</RouterLink>
            </li>
            <li>
              <RouterLink to="/posts" class="text-gray-300 hover:text-white transition-colors">所有文章</RouterLink>
            </li>
            <li>
              <RouterLink to="/about" class="text-gray-300 hover:text-white transition-colors">关于我</RouterLink>
            </li>
            <li>
              <RouterLink to="/contact" class="text-gray-300 hover:text-white transition-colors">联系我</RouterLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">技术栈</h3>
          <ul class="space-y-2 text-gray-300">
            <li>Vue.js</li>
            <li>TypeScript</li>
            <li>Node.js</li>
            <li>Prisma</li>
            <li>Tailwind CSS</li>
          </ul>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-gray-700 text-center">
        <p class="text-gray-300">
          © {{ currentYear }} 倚栏听风的博客. 保留所有权利 · Powered By Claude Code.
        </p>
      </div>
    </div>
  </footer>
</template>
