/// <reference types="vite/client" />

export {}

declare global {
  interface Window {
    collat?: {
      platform: string
    }
  }
}
