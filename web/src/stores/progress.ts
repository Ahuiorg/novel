import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProgressStore = defineStore('progress', () => {
  const currentEraIndex = ref(0)
  const scrollProgress = ref(0)
  const totalEras = ref(16)

  const progressPercent = computed(() => {
    return (currentEraIndex.value / (totalEras.value - 1)) * 100
  })

  function setCurrentEra(index: number) {
    currentEraIndex.value = Math.max(0, Math.min(index, totalEras.value - 1))
  }

  function setScrollProgress(progress: number) {
    scrollProgress.value = Math.max(0, Math.min(progress, 100))
  }

  function setTotalEras(count: number) {
    totalEras.value = count
  }

  // Load from localStorage
  function loadProgress() {
    const saved = localStorage.getItem('xianni-progress')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        currentEraIndex.value = data.currentEraIndex || 0
        scrollProgress.value = data.scrollProgress || 0
      } catch {
        // Ignore parse errors
      }
    }
  }

  // Save to localStorage
  function saveProgress() {
    localStorage.setItem(
      'xianni-progress',
      JSON.stringify({
        currentEraIndex: currentEraIndex.value,
        scrollProgress: scrollProgress.value,
      })
    )
  }

  return {
    currentEraIndex,
    scrollProgress,
    totalEras,
    progressPercent,
    setCurrentEra,
    setScrollProgress,
    setTotalEras,
    loadProgress,
    saveProgress,
  }
})
