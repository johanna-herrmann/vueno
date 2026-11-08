import { createApp } from 'vue'
import App from './App.vue'
import { isValidToken } from './utils/token'
import './style.css'

interface LegacyResponse { data?: { message?: string }; status?: number; url?: string }
interface LegacyRootOptions {
  data?: () => Record<string, unknown>
  methods?: Record<string, (...args: any[]) => unknown>
  computed?: Record<string, (...args: any[]) => unknown>
}

declare global {
  interface Window {
    VuenoRootOptions?: LegacyRootOptions
    app?: any
    startVueno?: () => void
    isValidToken?: typeof isValidToken
  }
}

window.isValidToken = isValidToken
window.app = null

function loadClassicScript(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = path
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Could not load ${path}`))
    document.head.appendChild(script)
  })
}

async function bootstrap(): Promise<void> {
  const beforeVue = [
    '/legacy/js/theme.js',
    '/legacy/js/config.js',
    '/legacy/js/toaster.js',
    '/legacy/js/toast.js',
    '/legacy/js/qr/qr-generator.js',
    '/legacy/js/countdown.js',
    '/legacy/js/sockjs.min.js',
    '/legacy/js/stomp.min.js',
    '/legacy/js/app.js',
  ]
  for (const path of beforeVue) await loadClassicScript(path)

  if (!window.VuenoRootOptions) throw new Error('Legacy game state adapter was not initialized')
  const root = { ...App, ...window.VuenoRootOptions }
  const instance = createApp(root as any).mount('#app')
  window.app = instance

  const afterVue = [
    '/legacy/js/qr/qr.js',
    '/legacy/js/app-processing.js',
    '/legacy/js/app-requests.js',
    '/legacy/js/app-game.js',
    '/legacy/js/app-switch.js',
    '/legacy/js/app-chat.js',
    '/legacy/js/app-player.js',
    '/legacy/js/app-turn.js',
    '/legacy/js/app-transitions.js',
    '/legacy/js/push.js',
  ]
  for (const path of afterVue) await loadClassicScript(path)
  const qrScannerModulePath: string = '/legacy/js/qr/qr-scan.js'
  await import(/* @vite-ignore */ qrScannerModulePath)
  window.startVueno?.()
}

bootstrap().catch((error: unknown) => {
  console.error('vueno frontend failed to start', error)
  const mount = document.querySelector('#app')
  if (mount) mount.textContent = 'Die Oberfläche konnte nicht geladen werden.'
})
