import { defineStore } from 'pinia'
import questionsData from '../assets/questions.json'

export type QuestionType = 'multiple' | 'boolean' | 'open'

export interface Question {
    id: string
    type: QuestionType
    question: string
    options?: string[]
    correctIndex?: number
    explanation?: string
    verseReference?: string
    timeLimit?: number
}

// State Machine Stages
export type GameState = 'start' | 'question_ready' | 'timer_running' | 'waiting_reveal' | 'revealed' | 'finished'

export const useQuizStore = defineStore('quiz', {
    state: () => ({
        questions: [] as Question[],
        currentIndex: 0,
        gameState: 'start' as GameState,
        currentTime: 0,
        config: {
            title: '',
            image: ''
        }
    }),
    getters: {
        currentQuestion: (state): Question | undefined => state.questions[state.currentIndex],
        isLastQuestion: (state): boolean => state.currentIndex === state.questions.length - 1
    },
    actions: {
        loadQuestions(customData?: { questions: Question[], config: { title: string, image: string } }) {
            if (customData) {
                this.questions = customData.questions
                this.config = customData.config
            } else {
                // @ts-ignore
                this.questions = questionsData.questions as Question[]
                // @ts-ignore
                this.config = questionsData.config
            }
            this.currentIndex = 0
            this.gameState = 'start'
        },

        async loadDailyQuestions() {
            try {
                const now = new Date()
                const year = now.getFullYear()
                const month = String(now.getMonth() + 1).padStart(2, '0')
                const day = String(now.getDate()).padStart(2, '0')
                const dateStr = `${year}${month}${day}`

                console.log(`Solicitando preguntas para la fecha del cliente: ${dateStr}`)
                const data = await window.ipcRenderer.invoke('get-daily-questions', dateStr)
                if (data && data.questions) {
                    this.loadQuestions(data)
                } else {
                    console.log('No se pudieron cargar las preguntas del día. Cargando valores por defecto.')
                    this.loadQuestions()
                }
            } catch (error) {
                console.error('Error al cargar preguntas dinámicas:', error)
                this.loadQuestions()
            }
        },

        startGame() {
            if (this.questions.length === 0) {
                this.loadQuestions()
            }
            this.currentIndex = 0
            if (this.questions.length > 0) {
                this.gameState = 'question_ready'
            } else {
                this.gameState = 'finished'
            }
        },

        startTimer() {
            if (this.gameState === 'question_ready') {
                this.currentTime = this.currentQuestion?.timeLimit || 30
                this.gameState = 'timer_running'
                // Timer tick logic handles elsewhere or here? 
                // Better to handle timer tick in component or separate interaction to keep store pure-ish, 
                // but store can hold 'playing' state.
            }
        },

        timerEnded() {
            this.gameState = 'waiting_reveal'
        },

        revealAnswer() {
            if (this.gameState === 'waiting_reveal') {
                this.gameState = 'revealed'
            }
        },

        nextQuestion() {
            if (this.isLastQuestion) {
                this.gameState = 'finished'
            } else {
                this.currentIndex++
                this.gameState = 'question_ready'
            }
        },

        // Combined Action for SPACE key
        triggerNextPhase() {
            switch (this.gameState) {
                case 'start':
                    this.startGame()
                    break
                case 'question_ready':
                    this.startTimer()
                    break
                case 'revealed':
                    this.nextQuestion()
                    break
                case 'finished':
                    this.gameState = 'start' // Reset
                    break
                default:
                    // Ignore space in other states (e.g. running timer, waiting for reveal requires Enter)
                    break
            }
        }
    }
})
