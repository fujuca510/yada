<script setup lang="ts">
import { computed } from 'vue'
import { useQuizStore } from '../stores/quizStore'
import Timer from './Timer.vue'
import agentImg from '../assets/agentImg.png'

const store = useQuizStore()
const question = computed(() => store.currentQuestion)
const isRevealed = computed(() => store.gameState === 'revealed')


// Helper to determine status color of an option
const getOptionClass = (index: number) => {
    // If not revealed, just normal style
    if (!isRevealed.value) return 'bg-slate-100 border-slate-300 dark:bg-gray-800 dark:border-gray-700 text-slate-800 dark:text-white'
    
    // We don't change option style in the background much, because the modal covers it.
    // But we can keep it for consistency if the modal isn't fully opaque.
    if (index === question.value?.correctIndex) {
        return 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-500 scale-105 shadow-[0_0_30px_rgba(16,185,129,0.3)] text-slate-900 dark:text-white'
    }
    return 'bg-slate-200 border-slate-300 dark:bg-gray-900 dark:border-gray-800 opacity-30 blur-sm text-slate-800 dark:text-white'
}

// Get the correct option text for the modal
const correctOptionText = computed(() => {
    if (!question.value || question.value.correctIndex === undefined || !question.value.options) return ''
    return question.value.options[question.value.correctIndex]
})

const correctOptionLetter = computed(() => {
    if (!question.value || question.value.correctIndex === undefined) return ''
    return ['A', 'B', 'C', 'D'][question.value.correctIndex]
})
</script>

<template>
  <!-- Main Container: Full width/height, scrollable -->
  <div v-if="question" class="h-full w-full overflow-y-auto bg-slate-50 dark:bg-slate-900 custom-scrollbar transition-colors duration-300">
    <div class="flex flex-col min-h-full w-full p-12 justify-center">
    
        <!-- Question Text: Corrected size, allows wrapping -->
        <h2 
            :key="'title-' + store.currentIndex"
            class="text-8xl font-bold mb-8 leading-tight text-slate-900 dark:text-white text-center transition-colors duration-300"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0 }"
        >
            {{ store.currentIndex + 1 }}. {{ question.question }}
            <img 
                :src="agentImg" 
                alt="Asistente" 
                class="inline-block ml-6 h-32 w-32 object-contain align-middle drop-shadow-xl"
                v-motion
                :initial="{ opacity: 0, x: 100, scale: 0.5 }"
                :enter="{ opacity: 1, x: 0, scale: 1 }"
                :delay="300"
            />
        </h2>

        <!-- Timer -->
        <div class="mb-12 flex justify-center w-full">
            <Timer :time-limit="question.timeLimit || 30" />
        </div>

        <!-- Options Grid (Multiple/Boolean) -->
        <div 
            v-if="question.type !== 'open'" 
            class="grid grid-cols-1 md:grid-cols-2 gap-10 w-full mb-12"
            :key="'grid-' + store.currentIndex"
        >
            <div 
                v-for="(opt, idx) in question.options" 
                :key="'opt-' + store.currentIndex + '-' + idx"
                class="p-7 rounded-2xl border-2 text-6xl font-bold transition-all duration-500 flex items-center"
                :class="[
                    getOptionClass(idx),
                    question.options && question.options.length === 3 && idx === 2 ? 'md:col-span-2 md:w-[calc(50%-1.25rem)] md:justify-self-center' : ''
                ]"
                v-motion
                :initial="{ opacity: 0, x: -20 }"
                :enter="{ opacity: 1, x: 0 }"
                :delay="200 + (idx * 100)"
            >
                <span class="w-20 h-20 rounded-full border-4 border-current flex items-center justify-center mr-6 text-5xl opacity-50 shrink-0">
                    {{ ['A', 'B', 'C', 'D'][idx] }}
                </span>
                {{ opt }}
            </div>
        </div>

        <!-- Open Question Placeholder -->
        <div v-else :key="'open-' + store.currentIndex" class="flex flex-col items-center justify-center bg-slate-200/50 dark:bg-gray-900/50 rounded-3xl mb-12 border-4 border-dashed border-slate-300 dark:border-gray-700 py-20 transition-colors duration-300">
            <p class="text-5xl text-slate-500 dark:text-gray-500 italic">Respuesta abierta</p>
        </div>

        <!-- Footer Status -->
        <div class="fixed bottom-4 right-4 text-slate-400 dark:text-gray-600 font-mono text-sm z-0 pointer-events-none">
            State: {{ store.gameState }} | Space: Next | Enter: Reveal
        </div>

    </div>

    <!-- REVEAL MODAL -->
    <div 
        v-if="isRevealed" 
        class="fixed inset-0 z-50 bg-white/95 dark:bg-slate-950/95 flex flex-col items-center justify-center p-12 text-center backdrop-blur-md overflow-y-auto transition-colors duration-300"
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :enter="{ opacity: 1, scale: 1 }"
    >
        <div class="max-w-screen-2xl w-full flex flex-row gap-16 min-h-full items-center justify-center py-10">
            
            <!-- Asistente en la parte izquierda -->
            <div class="hidden lg:flex w-1/4 justify-center items-center">
                <img 
                    :src="agentImg" 
                    alt="Asistente" 
                    class="w-full max-w-md h-auto object-contain drop-shadow-2xl"
                    v-motion
                    :initial="{ opacity: 0, x: -100, scale: 0.5 }"
                    :enter="{ opacity: 1, x: 0, scale: 1 }"
                    :delay="300"
                />
            </div>

            <div class="w-full lg:w-3/4 flex flex-col gap-8">
                <!-- Answer Section (Bordered) -->
                <div class="flex flex-col items-center border-4 border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl p-12 transition-colors duration-300">
                    <div class="text-emerald-600 dark:text-emerald-500 text-4xl font-bold uppercase tracking-widest mb-4">Respuesta Correcta</div>
                    <div class="text-7xl font-black text-slate-900 dark:text-white leading-tight">
                        <span v-if="question.type !== 'open'" class="text-emerald-600 dark:text-emerald-500 mr-4">{{ correctOptionLetter }}.</span>
                        {{ question.type !== 'open' ? correctOptionText : 'Respuesta Sugerida' }}
                    </div>
                </div>

                <!-- Explanation Section (Bordered) -->
                <div class="flex flex-col gap-6 border-4 border-blue-500/30 bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-12 transition-colors duration-300">
                    <!-- <h3 class="text-blue-400 font-bold text-4xl uppercase">Explicación</h3> -->
                    <p class="text-6xl text-slate-700 dark:text-gray-200 leading-snug font-medium">
                        {{ question.explanation }}
                    </p>
                    
                    <!-- Reference Section -->
                    <div v-if="question.verseReference" class="mt-4 border-t border-slate-300 dark:border-gray-700 pt-6 transition-colors duration-300">
                        <p class="text-6xl text-blue-600 dark:text-blue-400 font-serif italic">
                            "{{ question.verseReference }}"
                        </p>
                    </div>
                </div>

                <div class="mt-8 text-slate-500 dark:text-gray-500 text-2xl animate-pulse">
                    Presiona ESPACIO para continuar
                </div>
            </div>
        </div>
    </div>

  </div>
</template>
