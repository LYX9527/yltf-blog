import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>('system')
  const isDark = ref(false)

  // 检测系统主题
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // 应用主题
  const applyTheme = (dark: boolean) => {
    isDark.value = dark
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 更新主题
  const updateTheme = () => {
    switch (mode.value) {
      case 'light':
        applyTheme(false)
        break
      case 'dark':
        applyTheme(true)
        break
      case 'system':
        applyTheme(getSystemTheme())
        break
    }
  }

  // 设置主题模式
  const setTheme = (newMode: ThemeMode) => {
    mode.value = newMode
    localStorage.setItem('theme-mode', newMode)
    updateTheme()
  }

  // 初始化主题
  const initTheme = () => {
    // 从localStorage读取保存的主题设置
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode
    if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
      mode.value = savedMode
    }
    
    updateTheme()

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      if (mode.value === 'system') {
        updateTheme()
      }
    }
    
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    
    // 返回清理函数
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }

  // 监听模式变化
  watch(mode, updateTheme)

  return {
    mode,
    isDark,
    setTheme,
    initTheme,
    updateTheme
  }
})