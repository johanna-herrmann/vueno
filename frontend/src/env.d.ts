/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare module '*.min.js' {
  class QrScanner {
    static WORKER_PATH: string
    static hasCamera(): Promise<boolean>
    constructor(video: HTMLVideoElement, onDecode: (result: string) => void, onError?: (error: Error) => void)
    start(): Promise<void>
    stop(): void
  }
  export default QrScanner
}
