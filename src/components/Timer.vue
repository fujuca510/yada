<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue'
import { useQuizStore } from '../stores/quizStore'

const props = defineProps<{
  timeLimit: number
}>()

const store = useQuizStore()
const timeLeft = ref(props.timeLimit)
let animationFrameId: number | null = null
let startTime: number = 0

const progress = computed(() => {
  return (timeLeft.value / props.timeLimit) * 100
})

const updateTimer = () => {
    if (!startTime) return
    
    const elapsed = (Date.now() - startTime) / 1000
    const remaining = Math.max(0, props.timeLimit - elapsed)
    
    timeLeft.value = remaining
    
    if (remaining <= 0) {
        store.timerEnded()
        stopTimer()
    } else {
        animationFrameId = requestAnimationFrame(updateTimer)
    }
}

const startCountdown = () => {
    startTime = Date.now()
    timeLeft.value = props.timeLimit
    updateTimer()
}

const stopTimer = () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
    }
}

// Watch for game state changes to start/stop timer
watch(() => store.gameState, (newState) => {
    if (newState === 'timer_running') {
        startCountdown()
    } else if (newState !== 'waiting_reveal') {
        stopTimer()
        timeLeft.value = props.timeLimit
    }
}, { immediate: true })

onUnmounted(() => {
    stopTimer()
})
</script>

<template>
  <div class="relative w-full h-4 bg-slate-300 dark:bg-gray-700 rounded-full overflow-hidden mt-8 transition-colors duration-300">
      <div 
        class="h-full transition-all duration-100 ease-linear"
        :class="[
            progress > 50 ? 'bg-emerald-500' : progress > 20 ? 'bg-yellow-500' : 'bg-red-500'
        ]"
        :style="{ width: `${progress}%` }"
      ></div>
  </div>
  <!-- Fixed width container for text to prevent jumping -->
  <div class="flex justify-end mt-2">
      <div class="font-mono text-6xl text-slate-600 dark:text-gray-400 w-40 text-right tabular-nums transition-colors duration-300">
          {{ Math.ceil(timeLeft) }}s
      </div>
  </div>
</template>
