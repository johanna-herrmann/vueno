import { createApp } from 'vue'
import App from './App.vue'
import { isValidToken } from './utils/token'
import { legacyRootOptions, setLegacyApp, startVueno } from './legacy/runtime'
import { initializeQrScanner } from './legacy/qrScanner'
import './style.css'

declare global {
  interface Window {
    app?: any
    isValidToken?: typeof isValidToken
  }
}

window.isValidToken = isValidToken

const root = { ...App, ...legacyRootOptions }
const instance = createApp(root as any).mount('#app')
setLegacyApp(instance)
initializeQrScanner()
startVueno()
