<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon,
  ChevronDownIcon 
} from '@heroicons/vue/24/outline'
import { useThemeStore, type ThemeMode } from '../stores/theme'

const themeStore = useThemeStore()
const showDropdown = ref(false)

const themeOptions = [
  {
    value: 'light' as ThemeMode,
    label: '浅色模式',
    icon: SunIcon
  },
  {
    value: 'dark' as ThemeMode,
    label: '深色模式',
    icon: MoonIcon
  },
  {
    value: 'system' as ThemeMode,
    label: '跟随系统',
    icon: ComputerDesktopIcon
  }
]

const currentTheme = computed(() => {
  return themeOptions.find(option => option.value === themeStore.mode)
})

const handleThemeChange = (mode: ThemeMode) => {
  themeStore.setTheme(mode)
  showDropdown.value = false
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  const dropdown = document.querySelector('.theme-switcher-container')
  
  if (dropdown && !dropdown.contains(target)) {
    showDropdown.value = false
  }
}

// 挂载时添加点击外部监听
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative theme-switcher-container">
    <button
      @click="showDropdown = !showDropdown"
      class="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      :title="currentTheme?.label"
    >
      <component 
        :is="currentTheme?.icon" 
        class="h-5 w-5" 
      />
      <ChevronDownIcon 
        class="h-4 w-4 transition-transform duration-200"
        :class="{ 'rotate-180': showDropdown }"
      />
    </button>

    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-show="showDropdown"
        class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50"
      >
        <div class="py-1">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            @click="handleThemeChange(option.value)"
            class="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="{
              'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300': themeStore.mode === option.value
            }"
          >
            <component :is="option.icon" class="h-4 w-4" />
            <span>{{ option.label }}</span>
            <div 
              v-if="themeStore.mode === option.value"
              class="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
            ></div>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* 确保下拉菜单在最上层 */
.theme-switcher-container {
  z-index: 1000;
}
</style>