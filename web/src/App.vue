<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import Toast from './components/Toast.vue'
import Dialog from './components/Dialog.vue'
import { useDialog } from './composables/useDialog'
import { useThemeStore } from './stores/theme'

// 初始化全局Toast和Dialog
const { dialogs, closeDialog } = useDialog()

// 初始化主题系统
const themeStore = useThemeStore()
let cleanupTheme: (() => void) | undefined

onMounted(() => {
  cleanupTheme = themeStore.initTheme()
})

onUnmounted(() => {
  if (cleanupTheme) {
    cleanupTheme()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
    <Navbar />
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />

    <!-- 全局Toast组件 -->
    <Toast />

    <!-- 全局Dialog组件 -->
    <Dialog
      v-for="dialog in dialogs"
      :key="dialog.id"
      :visible="true"
      :type="dialog.options.type"
      :title="dialog.options.title"
      :message="dialog.options.message"
      :confirm-text="dialog.options.confirmText"
      :cancel-text="dialog.options.cancelText"
      :show-cancel="dialog.options.showCancel"
      :close-on-click-outside="dialog.options.closeOnClickOutside"
      @confirm="closeDialog(dialog.id, true)"
      @cancel="closeDialog(dialog.id, false)"
    />
  </div>
</template>
