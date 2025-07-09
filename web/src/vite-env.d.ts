/// <reference types="vite/client" />

declare global {
  interface Window {
    copyCodeBlock?: (code: string, button: HTMLButtonElement) => Promise<void>
  }
}

export {}
