import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(MotionPlugin)

app.mount('#app').$nextTick(() => {
  // Use contextBridge
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
  })
})
