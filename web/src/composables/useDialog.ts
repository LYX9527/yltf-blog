import { ref } from 'vue'
import type { Component } from 'vue'

export interface DialogOptions {
  type?: 'success' | 'error' | 'warning' | 'info' | 'custom'
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  closeOnClickOutside?: boolean
  component?: Component
  props?: Record<string, any>
}

interface DialogInstance {
  id: string
  options: DialogOptions
  resolve: (value: boolean) => void
}

const dialogs = ref<DialogInstance[]>([])

export const useDialog = () => {
  const showDialog = (options: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const id = Date.now().toString()
      const dialog: DialogInstance = {
        id,
        options: {
          showCancel: true,
          closeOnClickOutside: true,
          ...options
        },
        resolve
      }

      dialogs.value.push(dialog)
    })
  }

  const confirm = (
    message: string,
    title?: string,
    options?: Partial<DialogOptions>
  ): Promise<boolean> => {
    return showDialog({
      type: 'warning',
      title: title || '确认操作',
      message,
      confirmText: '确定',
      cancelText: '取消',
      ...options
    })
  }

  const alert = (
    message: string,
    title?: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ): Promise<boolean> => {
    return showDialog({
      type,
      title,
      message,
      showCancel: false,
      confirmText: '确定'
    })
  }

  const closeDialog = (id: string, result: boolean = false) => {
    const index = dialogs.value.findIndex(d => d.id === id)
    if (index > -1) {
      const dialog = dialogs.value[index]
      dialog.resolve(result)
      dialogs.value.splice(index, 1)
    }
  }

  const closeAll = () => {
    dialogs.value.forEach(dialog => dialog.resolve(false))
    dialogs.value = []
  }

  return {
    dialogs,
    showDialog,
    confirm,
    alert,
    closeDialog,
    closeAll
  }
}
