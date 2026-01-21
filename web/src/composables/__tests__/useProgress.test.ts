import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock progress store
vi.mock('@/stores/progress', () => ({
  useProgressStore: () => ({
    currentEraIndex: 0,
    scrollProgress: 0,
    progressPercent: 0,
    setCurrentEra: vi.fn(),
    setScrollProgress: vi.fn(),
    saveProgress: vi.fn(),
    loadProgress: vi.fn(),
  }),
}))

import { useProgress } from '../useProgress'

describe('useProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should initialize with no history', () => {
    const { hasHistory } = useProgress()
    expect(hasHistory.value).toBe(false)
  })

  it('should add to reading history', () => {
    const { addToHistory, hasHistory, readingHistory } = useProgress()
    
    addToHistory('era-01-birth', '凡人之躯')
    
    expect(hasHistory.value).toBe(true)
    expect(readingHistory.value[0]).toMatchObject({
      eraId: 'era-01-birth',
      eraTitle: '凡人之躯',
    })
  })

  it('should move existing era to top of history', () => {
    const { addToHistory, readingHistory } = useProgress()
    
    addToHistory('era-01-birth', '凡人之躯')
    addToHistory('era-02-entry', '入门之路')
    addToHistory('era-01-birth', '凡人之躯') // Re-read
    
    expect(readingHistory.value[0].eraId).toBe('era-01-birth')
    expect(readingHistory.value[1].eraId).toBe('era-02-entry')
    expect(readingHistory.value).toHaveLength(2)
  })

  it('should get last read era', () => {
    const { addToHistory, getLastReadEra } = useProgress()
    
    addToHistory('era-01-birth', '凡人之躯')
    addToHistory('era-02-entry', '入门之路')
    
    const lastRead = getLastReadEra()
    expect(lastRead?.eraId).toBe('era-02-entry')
  })

  it('should return null when no history', () => {
    const { getLastReadEra } = useProgress()
    expect(getLastReadEra()).toBeNull()
  })

  it('should get recent history with limit', () => {
    const { addToHistory, getRecentHistory } = useProgress()
    
    for (let i = 1; i <= 10; i++) {
      addToHistory(`era-${i}`, `Era ${i}`)
    }
    
    const recent5 = getRecentHistory(5)
    expect(recent5).toHaveLength(5)
    expect(recent5[0].eraId).toBe('era-10')
  })

  it('should clear history', () => {
    const { addToHistory, clearHistory, hasHistory } = useProgress()
    
    addToHistory('era-01-birth', '凡人之躯')
    expect(hasHistory.value).toBe(true)
    
    clearHistory()
    expect(hasHistory.value).toBe(false)
  })

  it('should remove specific era from history', () => {
    const { addToHistory, removeFromHistory, readingHistory } = useProgress()
    
    addToHistory('era-01-birth', '凡人之躯')
    addToHistory('era-02-entry', '入门之路')
    
    removeFromHistory('era-01-birth')
    
    expect(readingHistory.value).toHaveLength(1)
    expect(readingHistory.value[0].eraId).toBe('era-02-entry')
  })

  it('should format timestamp correctly', () => {
    const { formatTimestamp } = useProgress()
    
    // Just now
    expect(formatTimestamp(Date.now())).toBe('刚刚')
    
    // 30 minutes ago
    expect(formatTimestamp(Date.now() - 30 * 60 * 1000)).toBe('30分钟前')
    
    // 2 hours ago
    expect(formatTimestamp(Date.now() - 2 * 60 * 60 * 1000)).toBe('2小时前')
    
    // 3 days ago
    expect(formatTimestamp(Date.now() - 3 * 24 * 60 * 60 * 1000)).toBe('3天前')
  })
})
