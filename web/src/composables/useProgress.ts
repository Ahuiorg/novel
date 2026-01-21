import { ref, computed, onMounted } from 'vue'
import { useProgressStore } from '@/stores/progress'
import { useRouter } from 'vue-router'

const HISTORY_STORAGE_KEY = 'xianni-reading-history'
const MAX_HISTORY_ITEMS = 20

/**
 * 阅读历史记录项
 */
export interface ReadingHistoryItem {
  eraId: string
  eraTitle: string
  timestamp: number
  scrollPosition?: number
}

// 全局阅读历史
const readingHistory = ref<ReadingHistoryItem[]>([])
const isHistoryLoaded = ref(false)

/**
 * 从 localStorage 加载阅读历史
 */
function loadReadingHistory(): ReadingHistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as ReadingHistoryItem[]
    }
  } catch (error) {
    console.error('Failed to load reading history:', error)
  }
  return []
}

/**
 * 保存阅读历史到 localStorage
 */
function saveReadingHistory(history: ReadingHistoryItem[]) {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save reading history:', error)
  }
}

/**
 * 初始化阅读历史
 */
function initHistory() {
  if (isHistoryLoaded.value) return
  readingHistory.value = loadReadingHistory()
  isHistoryLoaded.value = true
}

/**
 * 阅读进度 Composable
 */
export function useProgress() {
  const progressStore = useProgressStore()
  const router = useRouter()
  
  // 确保历史已加载
  initHistory()
  
  /**
   * 添加阅读历史记录
   */
  function addToHistory(eraId: string, eraTitle: string, scrollPosition?: number) {
    // 移除已存在的相同纪元记录
    const existingIndex = readingHistory.value.findIndex(item => item.eraId === eraId)
    if (existingIndex !== -1) {
      readingHistory.value.splice(existingIndex, 1)
    }
    
    // 添加到历史开头
    readingHistory.value.unshift({
      eraId,
      eraTitle,
      timestamp: Date.now(),
      scrollPosition,
    })
    
    // 限制历史数量
    if (readingHistory.value.length > MAX_HISTORY_ITEMS) {
      readingHistory.value = readingHistory.value.slice(0, MAX_HISTORY_ITEMS)
    }
    
    // 保存到 localStorage
    saveReadingHistory(readingHistory.value)
  }
  
  /**
   * 获取最近阅读的纪元
   */
  function getLastReadEra(): ReadingHistoryItem | null {
    return readingHistory.value[0] || null
  }
  
  /**
   * 继续阅读（跳转到最近阅读的纪元）
   */
  function continueReading() {
    const lastRead = getLastReadEra()
    if (lastRead) {
      router.push({ name: 'era-detail', params: { id: lastRead.eraId } })
      return true
    }
    return false
  }
  
  /**
   * 清除阅读历史
   */
  function clearHistory() {
    readingHistory.value = []
    saveReadingHistory([])
  }
  
  /**
   * 从历史中移除指定纪元
   */
  function removeFromHistory(eraId: string) {
    const index = readingHistory.value.findIndex(item => item.eraId === eraId)
    if (index !== -1) {
      readingHistory.value.splice(index, 1)
      saveReadingHistory(readingHistory.value)
    }
  }
  
  /**
   * 检查是否有阅读历史
   */
  const hasHistory = computed(() => readingHistory.value.length > 0)
  
  /**
   * 获取阅读历史列表（最近 N 项）
   */
  function getRecentHistory(limit = 5): ReadingHistoryItem[] {
    return readingHistory.value.slice(0, limit)
  }
  
  /**
   * 格式化时间戳
   */
  function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    // 小于1小时
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
    }
    
    // 小于24小时
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `${hours}小时前`
    }
    
    // 小于7天
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000)
      return `${days}天前`
    }
    
    // 其他情况显示日期
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
  
  return {
    // Store 代理
    currentEraIndex: computed(() => progressStore.currentEraIndex),
    scrollProgress: computed(() => progressStore.scrollProgress),
    progressPercent: computed(() => progressStore.progressPercent),
    setCurrentEra: progressStore.setCurrentEra,
    setScrollProgress: progressStore.setScrollProgress,
    saveProgress: progressStore.saveProgress,
    loadProgress: progressStore.loadProgress,
    
    // 阅读历史
    readingHistory: computed(() => readingHistory.value),
    hasHistory,
    addToHistory,
    getLastReadEra,
    continueReading,
    clearHistory,
    removeFromHistory,
    getRecentHistory,
    formatTimestamp,
  }
}

/**
 * 用于详情页的进度追踪
 */
export function useEraProgress(eraId: string, eraTitle: string) {
  const { addToHistory } = useProgress()
  
  // 进入纪元时记录
  onMounted(() => {
    addToHistory(eraId, eraTitle)
  })
  
  // 可以在组件中手动调用更新滚动位置
  function updateScrollPosition(position: number) {
    addToHistory(eraId, eraTitle, position)
  }
  
  return {
    updateScrollPosition,
  }
}
