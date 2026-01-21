import { ref, computed, watch } from 'vue'
import type { FavoriteItem, FavoriteType } from '@/types/favorite'

const STORAGE_KEY = 'xianni-favorites'

// 全局状态（单例模式）
const favorites = ref<FavoriteItem[]>([])
const isInitialized = ref(false)

/**
 * 从 localStorage 加载收藏数据
 */
function loadFromStorage(): FavoriteItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      return data.items || []
    }
  } catch (error) {
    console.error('Failed to load favorites from storage:', error)
  }
  return []
}

/**
 * 保存收藏数据到 localStorage
 */
function saveToStorage(items: FavoriteItem[]) {
  try {
    const data = {
      items,
      lastUpdated: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save favorites to storage:', error)
  }
}

/**
 * 初始化收藏数据
 */
function initFavorites() {
  if (isInitialized.value) return
  
  favorites.value = loadFromStorage()
  isInitialized.value = true
  
  // 监听变化自动保存
  watch(favorites, (newValue) => {
    saveToStorage(newValue)
  }, { deep: true })
}

/**
 * 收藏功能 Composable
 */
export function useFavorites() {
  // 确保初始化
  initFavorites()
  
  /**
   * 添加收藏
   */
  function addFavorite(type: FavoriteType, targetId: string, note?: string): FavoriteItem {
    const existingIndex = favorites.value.findIndex(
      (item) => item.type === type && item.targetId === targetId
    )
    
    // 如果已存在，更新备注
    if (existingIndex !== -1) {
      const existing = favorites.value[existingIndex]
      if (existing && note !== undefined) {
        existing.note = note
      }
      return existing!
    }
    
    // 创建新收藏
    const newItem: FavoriteItem = {
      id: `fav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      targetId,
      addedAt: Date.now(),
      note
    }
    
    favorites.value.push(newItem)
    return newItem
  }
  
  /**
   * 移除收藏
   */
  function removeFavorite(type: FavoriteType, targetId: string): boolean {
    const index = favorites.value.findIndex(
      (item) => item.type === type && item.targetId === targetId
    )
    
    if (index !== -1) {
      favorites.value.splice(index, 1)
      return true
    }
    return false
  }
  
  /**
   * 切换收藏状态
   */
  function toggleFavorite(type: FavoriteType, targetId: string, note?: string): boolean {
    const isFav = isFavorite(type, targetId)
    
    if (isFav) {
      removeFavorite(type, targetId)
      return false
    } else {
      addFavorite(type, targetId, note)
      return true
    }
  }
  
  /**
   * 检查是否已收藏
   */
  function isFavorite(type: FavoriteType, targetId: string): boolean {
    return favorites.value.some(
      (item) => item.type === type && item.targetId === targetId
    )
  }
  
  /**
   * 获取指定类型的所有收藏
   */
  function getFavoritesByType(type: FavoriteType): FavoriteItem[] {
    return favorites.value.filter((item) => item.type === type)
  }
  
  /**
   * 更新收藏备注
   */
  function updateNote(type: FavoriteType, targetId: string, note: string): boolean {
    const item = favorites.value.find(
      (item) => item.type === type && item.targetId === targetId
    )
    
    if (item) {
      item.note = note
      return true
    }
    return false
  }
  
  /**
   * 清空所有收藏
   */
  function clearAll() {
    favorites.value = []
  }
  
  /**
   * 清空指定类型的收藏
   */
  function clearByType(type: FavoriteType) {
    favorites.value = favorites.value.filter((item) => item.type !== type)
  }
  
  // 计算属性
  const totalCount = computed(() => favorites.value.length)
  
  const countByType = computed(() => ({
    era: favorites.value.filter((item) => item.type === 'era').length,
    highlight: favorites.value.filter((item) => item.type === 'highlight').length,
    ability: favorites.value.filter((item) => item.type === 'ability').length,
    treasure: favorites.value.filter((item) => item.type === 'treasure').length,
    beast: favorites.value.filter((item) => item.type === 'beast').length,
  }))
  
  const recentFavorites = computed(() => {
    return [...favorites.value]
      .sort((a, b) => b.addedAt - a.addedAt)
      .slice(0, 10)
  })
  
  return {
    // 状态
    favorites: computed(() => favorites.value),
    totalCount,
    countByType,
    recentFavorites,
    
    // 方法
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoritesByType,
    updateNote,
    clearAll,
    clearByType,
  }
}

/**
 * 创建响应式的收藏状态（用于组件内）
 */
export function useFavoriteState(type: FavoriteType, targetId: string) {
  const { isFavorite, toggleFavorite } = useFavorites()
  
  const isFav = computed(() => isFavorite(type, targetId))
  
  function toggle() {
    return toggleFavorite(type, targetId)
  }
  
  return {
    isFavorite: isFav,
    toggle
  }
}
