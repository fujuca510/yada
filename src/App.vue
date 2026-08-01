<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useQuizStore } from './stores/quizStore'
import StartScreen from './components/StartScreen.vue'
import QuestionDisplay from './components/QuestionDisplay.vue'

const store = useQuizStore()

const isDark = ref(true)

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const handleKey = (e: KeyboardEvent) => {
  if (e.code === 'Space') {
    e.preventDefault() // Prevent scrolling
    store.triggerNextPhase()
  } else if (e.code === 'Enter') {
    store.revealAnswer()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKey)
  // Set initial theme
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey)
})
</script>

<template>
  <div class="w-full h-full bg-white dark:bg-black text-slate-900 dark:text-white overflow-hidden relative selection:bg-emerald-500 selection:text-white transition-colors duration-300">
    <!-- Background Effect -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200 via-white to-white dark:from-slate-900 dark:via-black dark:to-black opacity-80 pointer-events-none transition-colors duration-300"></div>
    
    <StartScreen v-if="store.gameState === 'start' || store.gameState === 'finished'" />
    
    <QuestionDisplay v-else />

    <!-- Theme Toggle Button -->
    <button 
      @click="toggleTheme"
      class="absolute bottom-8 left-8 p-3 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white bg-slate-200/50 hover:bg-slate-300 dark:bg-gray-800/50 dark:hover:bg-gray-700 rounded-full transition-colors z-50 shadow-lg"
      title="Cambiar Tema"
    >
      <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
    </button>
  </div>
</template>
