import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

export interface User {
  id: string
  username: string
  email: string
  name?: string
  role: 'ADMIN' | 'USER'
  avatar?: string
  bio?: string
  createdAt: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  // 设置认证头
  const setAuthHeader = (authToken: string | null) => {
    if (authToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
      localStorage.setItem('token', authToken)
    } else {
      delete api.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
    }
  }

  // 登录
  const login = async (email: string, password: string) => {
    try {
      loading.value = true
      const response = await api.post('/auth/login', { email, password })
      
      const { user: userData, token: authToken } = response.data
      
      user.value = userData
      token.value = authToken
      setAuthHeader(authToken)
      
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.error || '登录失败'
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (userData: {
    username: string
    email: string
    password: string
    name?: string
  }) => {
    try {
      loading.value = true
      const response = await api.post('/auth/register', userData)
      
      const { user: newUser, token: authToken } = response.data
      
      user.value = newUser
      token.value = authToken
      setAuthHeader(authToken)
      
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.error || '注册失败'
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  // 验证 token
  const verifyToken = async () => {
    if (!token.value) return false

    try {
      setAuthHeader(token.value)
      const response = await api.get('/auth/verify')
      user.value = response.data.user
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  // 登出
  const logout = () => {
    user.value = null
    token.value = null
    setAuthHeader(null)
  }

  // 初始化时验证 token
  if (token.value) {
    verifyToken()
  }

  return {
    user: computed(() => user.value),
    token: computed(() => token.value),
    loading: computed(() => loading.value),
    isLoggedIn,
    isAdmin,
    login,
    register,
    logout,
    verifyToken
  }
})