import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFavorites } from '../useFavorites'

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

describe('useFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should initialize with empty favorites', () => {
    const { favorites, totalCount } = useFavorites()
    
    expect(totalCount.value).toBe(0)
    expect(favorites.value).toHaveLength(0)
  })

  it('should add a favorite', () => {
    const { addFavorite, favorites, totalCount } = useFavorites()
    
    addFavorite('era', 'era-01-birth')
    
    expect(totalCount.value).toBe(1)
    expect(favorites.value[0]).toMatchObject({
      type: 'era',
      targetId: 'era-01-birth',
    })
  })

  it('should not duplicate favorites', () => {
    const { addFavorite, totalCount } = useFavorites()
    
    addFavorite('era', 'era-01-birth')
    addFavorite('era', 'era-01-birth')
    
    expect(totalCount.value).toBe(1)
  })

  it('should remove a favorite', () => {
    const { addFavorite, removeFavorite, totalCount, isFavorite } = useFavorites()
    
    addFavorite('era', 'era-01-birth')
    expect(totalCount.value).toBe(1)
    
    removeFavorite('era', 'era-01-birth')
    expect(totalCount.value).toBe(0)
    expect(isFavorite('era', 'era-01-birth')).toBe(false)
  })

  it('should toggle favorite state', () => {
    const { toggleFavorite, isFavorite } = useFavorites()
    
    // First toggle - add
    const added = toggleFavorite('highlight', 'h-01-01')
    expect(added).toBe(true)
    expect(isFavorite('highlight', 'h-01-01')).toBe(true)
    
    // Second toggle - remove
    const removed = toggleFavorite('highlight', 'h-01-01')
    expect(removed).toBe(false)
    expect(isFavorite('highlight', 'h-01-01')).toBe(false)
  })

  it('should check if item is favorited', () => {
    const { addFavorite, isFavorite } = useFavorites()
    
    expect(isFavorite('ability', 'test-ability')).toBe(false)
    
    addFavorite('ability', 'test-ability')
    
    expect(isFavorite('ability', 'test-ability')).toBe(true)
  })

  it('should get favorites by type', () => {
    const { addFavorite, getFavoritesByType } = useFavorites()
    
    addFavorite('era', 'era-01')
    addFavorite('era', 'era-02')
    addFavorite('ability', 'ability-01')
    
    const eras = getFavoritesByType('era')
    expect(eras).toHaveLength(2)
    
    const abilities = getFavoritesByType('ability')
    expect(abilities).toHaveLength(1)
  })

  it('should count favorites by type', () => {
    const { addFavorite, countByType } = useFavorites()
    
    addFavorite('era', 'era-01')
    addFavorite('era', 'era-02')
    addFavorite('highlight', 'h-01')
    addFavorite('treasure', 't-01')
    
    expect(countByType.value.era).toBe(2)
    expect(countByType.value.highlight).toBe(1)
    expect(countByType.value.treasure).toBe(1)
    expect(countByType.value.ability).toBe(0)
    expect(countByType.value.beast).toBe(0)
  })

  it('should clear all favorites', () => {
    const { addFavorite, clearAll, totalCount } = useFavorites()
    
    addFavorite('era', 'era-01')
    addFavorite('ability', 'ability-01')
    expect(totalCount.value).toBe(2)
    
    clearAll()
    expect(totalCount.value).toBe(0)
  })

  it('should clear favorites by type', () => {
    const { addFavorite, clearByType, countByType } = useFavorites()
    
    addFavorite('era', 'era-01')
    addFavorite('era', 'era-02')
    addFavorite('ability', 'ability-01')
    
    clearByType('era')
    
    expect(countByType.value.era).toBe(0)
    expect(countByType.value.ability).toBe(1)
  })
})
