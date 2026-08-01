<script setup lang="ts">
import { ref } from 'vue'
import { useQuizStore } from '../stores/quizStore'

const store = useQuizStore()
// Load default initially
store.loadQuestions()

const showConfig = ref(false)
const tempJson = ref<any>(null)
const tempImage = ref<string | null>(null)

const handleJsonUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        tempJson.value = JSON.parse(e.target?.result as string)
      } catch (err) {
        alert('Invalid JSON file')
      }
    }
    reader.readAsText(file)
  }
}

const handleImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    tempImage.value = URL.createObjectURL(file)
  }
}

const applyConfig = () => {
  if (tempJson.value || tempImage.value) {
    // Construct new data merging with existing defaults or structure
    const newData = {
      questions: tempJson.value?.questions || store.questions,
      config: {
        title: tempJson.value?.config?.title || store.config.title,
        image: tempImage.value || tempJson.value?.config?.image || store.config.image
      }
    }
    store.loadQuestions(newData as any)
  }
  showConfig.value = false
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white p-8 relative transition-colors duration-300">
    <!-- Config Button -->
    <button 
      @click="showConfig = true"
      class="absolute top-8 right-8 p-3 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white bg-slate-200/50 hover:bg-slate-300 dark:bg-gray-800/50 dark:hover:bg-gray-700 rounded-full transition-colors z-20"
      title="Configuración"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    </button>

    <!-- Config Modal -->
    <div v-if="showConfig" class="absolute inset-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 transition-colors duration-300">
      <div class="bg-white dark:bg-slate-800 p-8 rounded-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 shadow-2xl transition-colors duration-300">
        <h2 class="text-3xl font-bold mb-6 text-emerald-600 dark:text-emerald-400">Configuración</h2>
        
        <div class="mb-6">
          <label class="block text-slate-600 dark:text-gray-400 mb-2">Cargar Preguntas (JSON)</label>
          <input type="file" accept=".json" @change="handleJsonUpload" class="block w-full text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600"/>
        </div>

        <div class="mb-8">
          <label class="block text-slate-600 dark:text-gray-400 mb-2">Imagen Principal</label>
          <input type="file" accept="image/*" @change="handleImageUpload" class="block w-full text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"/>
        </div>

        <div class="flex justify-end gap-4">
          <button @click="showConfig = false" class="px-6 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-900 dark:text-white transition-colors">Cancelar</button>
          <button @click="applyConfig" class="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold">Aplicar</button>
        </div>
      </div>
    </div>

    <h1 
      class="text-8xl font-black mb-8 tracking-tighter bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 text-transparent bg-clip-text text-center transition-colors duration-300"
      v-motion
      :initial="{ opacity: 0, y: 100 }"
      :enter="{ opacity: 1, y: 0, scale: 1 }"
      :delay="200"
    >
      {{ store.config.title }}
    </h1>

    <!-- Dynamic Image from JSON -->
    <div 
      class="mb-12"
      v-motion
      :initial="{ opacity: 0, scale: 0.5 }"
      :enter="{ opacity: 1, scale: 1 }"
      :delay="350"
    >
      <img :src="store.config.image" alt="Quiz Logo" class="h-48 w-auto object-contain drop-shadow-2xl" />
    </div>

    <h2 class="text-3xl text-slate-600 dark:text-gray-400 font-light mb-16 transition-colors duration-300"
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1 }"
      :delay="500"
    >Escuela Sabática - Preguntas y Respuestas</h2>

    <button 
      @click="store.startGame()"
      class="px-12 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-full text-2xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
      v-motion
      :initial="{ opacity: 0, scale: 0.8 }"
      :enter="{ opacity: 1, scale: 1 }"
      :delay="800"
    >
      Iniciar
    </button>
  </div>
</template>
