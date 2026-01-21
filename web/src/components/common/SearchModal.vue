<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Era } from '@/types'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()

// 搜索状态
const searchQuery = ref('')
const searchType = ref<'all' | 'year' | 'location' | 'keyword'>('all')
const isLoading = ref(false)

// 搜索结果
interface SearchResult {
  type: 'era' | 'location' | 'ability' | 'treasure' | 'beast'
  id: string
  title: string
  subtitle?: string
  highlight?: string
  eraId: string
  eraTitle: string
  year?: number
}

const searchResults = ref<SearchResult[]>([])
const allEras = ref<Era[]>([])

// 搜索类型选项
const searchTypes = [
  { key: 'all', label: '全部', icon: '🔍' },
  { key: 'year', label: '年份', icon: '📅' },
  { key: 'location', label: '地点', icon: '📍' },
  { key: 'keyword', label: '关键词', icon: '📝' },
] as const

// 加载所有纪元数据
async function loadAllEras() {
  if (allEras.value.length > 0) return
  
  isLoading.value = true
  const eras: Era[] = []
  
  const eraIds = [
    'era-01-birth', 'era-02-entry', 'era-03-demon-sea', 'era-04-revenge',
    'era-05-immortal-land', 'era-06-sky-fortune', 'era-07-luotian', 'era-08-thunder',
    'era-09-hunt', 'era-10-war', 'era-11-immortal-mansion', 'era-12-cloud-sea',
    'era-13-ancient-tomb', 'era-14-border-war', 'era-15-xiangang', 'era-16-finale'
  ]
  
  for (const eraId of eraIds) {
    try {
      const module = await import(`@/data/eras/${eraId}.json`)
      eras.push(module.default)
    } catch (error) {
      console.error(`Failed to load era ${eraId}:`, error)
    }
  }
  
  allEras.value = eras
  isLoading.value = false
}

// 执行搜索
function performSearch() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  
  const query = searchQuery.value.trim().toLowerCase()
  const results: SearchResult[] = []
  
  for (const era of allEras.value) {
    // 按年份搜索
    if (searchType.value === 'all' || searchType.value === 'year') {
      const yearNum = parseInt(query)
      if (!isNaN(yearNum)) {
        if (yearNum >= era.timeRange.start && yearNum <= era.timeRange.end) {
          results.push({
            type: 'era',
            id: era.id,
            title: era.title,
            subtitle: `仙逆年 ${era.timeRange.start} - ${era.timeRange.end}`,
            eraId: era.id,
            eraTitle: era.title,
            year: yearNum,
          })
        }
      }
    }
    
    // 按地点搜索
    if (searchType.value === 'all' || searchType.value === 'location') {
      for (const location of era.locations) {
        if (location.toLowerCase().includes(query)) {
          results.push({
            type: 'location',
            id: `${era.id}-loc-${location}`,
            title: location,
            subtitle: '地点',
            eraId: era.id,
            eraTitle: era.title,
          })
        }
      }
    }
    
    // 按关键词搜索（全文搜索）
    if (searchType.value === 'all' || searchType.value === 'keyword') {
      // 搜索标题
      if (era.title.toLowerCase().includes(query)) {
        if (!results.find(r => r.type === 'era' && r.id === era.id)) {
          results.push({
            type: 'era',
            id: era.id,
            title: era.title,
            subtitle: `仙逆年 ${era.timeRange.start} - ${era.timeRange.end}`,
            eraId: era.id,
            eraTitle: era.title,
          })
        }
      }
      
      // 搜索内容
      if (era.fullContent.toLowerCase().includes(query)) {
        const contentIndex = era.fullContent.toLowerCase().indexOf(query)
        const start = Math.max(0, contentIndex - 20)
        const end = Math.min(era.fullContent.length, contentIndex + query.length + 20)
        const highlight = '...' + era.fullContent.slice(start, end) + '...'
        
        if (!results.find(r => r.type === 'era' && r.id === era.id)) {
          results.push({
            type: 'era',
            id: era.id,
            title: era.title,
            subtitle: `仙逆年 ${era.timeRange.start} - ${era.timeRange.end}`,
            highlight,
            eraId: era.id,
            eraTitle: era.title,
          })
        }
      }
      
      // 搜索神通
      for (const ability of era.newAbilities) {
        if (ability.toLowerCase().includes(query)) {
          results.push({
            type: 'ability',
            id: `${era.id}-ability-${ability}`,
            title: ability,
            subtitle: '神通',
            eraId: era.id,
            eraTitle: era.title,
          })
        }
      }
      
      // 搜索法宝
      for (const treasure of era.newTreasures) {
        if (treasure.toLowerCase().includes(query)) {
          results.push({
            type: 'treasure',
            id: `${era.id}-treasure-${treasure}`,
            title: treasure,
            subtitle: '法宝',
            eraId: era.id,
            eraTitle: era.title,
          })
        }
      }
      
      // 搜索灵兽
      for (const beast of era.newBeasts) {
        if (beast.toLowerCase().includes(query)) {
          results.push({
            type: 'beast',
            id: `${era.id}-beast-${beast}`,
            title: beast,
            subtitle: '灵兽',
            eraId: era.id,
            eraTitle: era.title,
          })
        }
      }
    }
  }
  
  // 去重并限制结果数量
  const uniqueResults = results.filter((result, index, self) =>
    index === self.findIndex(r => r.id === result.id)
  )
  
  searchResults.value = uniqueResults.slice(0, 20)
}

// 获取结果图标
function getResultIcon(type: SearchResult['type']): string {
  const icons = {
    era: '📜',
    location: '📍',
    ability: '⚡',
    treasure: '💎',
    beast: '🐉',
  }
  return icons[type]
}

// 点击结果
function handleResultClick(result: SearchResult) {
  router.push({ name: 'era-detail', params: { id: result.eraId } })
  emit('close')
}

// 关闭弹窗
function handleClose() {
  emit('close')
}

// 点击背景关闭
function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    handleClose()
  }
}

// 键盘事件
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    handleClose()
  }
}

// 监听搜索输入
watch(searchQuery, () => {
  performSearch()
})

watch(searchType, () => {
  performSearch()
})

// 监听可见性，加载数据
watch(() => props.visible, (visible) => {
  if (visible) {
    loadAllEras()
    // 聚焦输入框
    setTimeout(() => {
      const input = document.querySelector('.search-input') as HTMLInputElement
      input?.focus()
    }, 100)
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="visible" 
        class="search-overlay"
        @click="handleBackdropClick"
      >
        <div class="search-modal">
          <!-- 搜索输入区 -->
          <div class="search-header">
            <div class="search-input-wrapper">
              <span class="search-icon">🔍</span>
              <input
                v-model="searchQuery"
                class="search-input"
                type="text"
                placeholder="搜索纪元、地点、神通、法宝..."
                autofocus
              />
              <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
                ✕
              </button>
            </div>
            
            <button class="close-btn" @click="handleClose">
              ESC
            </button>
          </div>
          
          <!-- 搜索类型筛选 -->
          <div class="search-types">
            <button
              v-for="type in searchTypes"
              :key="type.key"
              class="type-btn"
              :class="{ active: searchType === type.key }"
              @click="searchType = type.key"
            >
              <span class="type-icon">{{ type.icon }}</span>
              <span class="type-label">{{ type.label }}</span>
            </button>
          </div>
          
          <!-- 搜索结果 -->
          <div class="search-results">
            <div v-if="isLoading" class="loading-state">
              <div class="loading-spinner" />
              <span>加载中...</span>
            </div>
            
            <div v-else-if="searchQuery && searchResults.length === 0" class="empty-state">
              <span class="empty-icon">🔍</span>
              <span class="empty-text">未找到相关结果</span>
            </div>
            
            <div v-else-if="!searchQuery" class="hint-state">
              <div class="hint-item">
                <span class="hint-icon">📅</span>
                <span>输入年份跳转到对应纪元，如 "530"</span>
              </div>
              <div class="hint-item">
                <span class="hint-icon">📍</span>
                <span>搜索地点，如 "赵国"、"仙界"</span>
              </div>
              <div class="hint-item">
                <span class="hint-icon">📝</span>
                <span>搜索神通/法宝/灵兽，如 "天逆珠"</span>
              </div>
            </div>
            
            <template v-else>
              <div class="results-count">
                找到 {{ searchResults.length }} 条结果
              </div>
              
              <div
                v-for="result in searchResults"
                :key="result.id"
                class="result-item"
                @click="handleResultClick(result)"
              >
                <span class="result-icon">{{ getResultIcon(result.type) }}</span>
                <div class="result-content">
                  <div class="result-title">{{ result.title }}</div>
                  <div class="result-meta">
                    <span v-if="result.subtitle" class="result-subtitle">{{ result.subtitle }}</span>
                    <span class="result-era">{{ result.eraTitle }}</span>
                  </div>
                  <div v-if="result.highlight" class="result-highlight">
                    {{ result.highlight }}
                  </div>
                </div>
                <span class="result-arrow">→</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 遮罩层 */
.search-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  background: rgba(5, 5, 16, 0.9);
  backdrop-filter: blur(8px);
  z-index: var(--z-modal);
}

/* 弹窗 */
.search-modal {
  width: 100%;
  max-width: 640px;
  max-height: 70vh;
  background: var(--cosmos-dark);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 搜索头部 */
.search-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--glass-border);
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  transition: border-color 0.2s ease;
}

.search-input-wrapper:focus-within {
  border-color: var(--immortal-gold-dim);
}

.search-icon {
  font-size: var(--text-lg);
  opacity: 0.5;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: var(--text-base);
  color: var(--text-primary);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.clear-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
  font-size: var(--text-xs);
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
}

.close-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: var(--text-xs);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

/* 搜索类型 */
.search-types {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--glass-border);
}

.type-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  background: transparent;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  transition: all 0.2s ease;
}

.type-btn:hover {
  border-color: var(--immortal-gold-dim);
  color: var(--text-primary);
}

.type-btn.active {
  background: rgba(255, 215, 0, 0.1);
  border-color: var(--immortal-gold);
  color: var(--immortal-gold);
}

/* 搜索结果 */
.search-results {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  gap: var(--spacing-md);
  color: var(--text-muted);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--glass-border);
  border-top-color: var(--immortal-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

/* 提示状态 */
.hint-state {
  padding: var(--spacing-lg);
}

.hint-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) 0;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.hint-icon {
  font-size: var(--text-lg);
  opacity: 0.6;
}

/* 结果计数 */
.results-count {
  font-size: var(--text-xs);
  color: var(--text-muted);
  padding: var(--spacing-sm) var(--spacing-sm);
}

/* 结果项 */
.result-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.result-icon {
  font-size: var(--text-xl);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: var(--text-base);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-xs);
  margin-top: 2px;
}

.result-subtitle {
  color: var(--lightning-cyan);
}

.result-era {
  color: var(--text-muted);
}

.result-era::before {
  content: '·';
  margin-right: var(--spacing-sm);
}

.result-highlight {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-arrow {
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.result-item:hover .result-arrow {
  transform: translateX(4px);
  color: var(--immortal-gold);
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .search-modal,
.modal-leave-to .search-modal {
  transform: translateY(-20px);
  opacity: 0;
}

/* ===== 移动端响应式 (< 640px) ===== */
@media (max-width: 639px) {
  .search-overlay {
    padding-top: 5vh;
    align-items: flex-start;
  }

  .search-modal {
    max-width: calc(100vw - 24px);
    max-height: 85vh;
    margin: 0 12px;
    border-radius: var(--radius-lg);
  }

  .search-header {
    padding: var(--spacing-md);
    gap: var(--spacing-sm);
  }

  .search-input-wrapper {
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .search-icon {
    font-size: var(--text-base);
  }

  .search-input {
    font-size: var(--text-sm);
  }

  .search-input::placeholder {
    font-size: var(--text-xs);
  }

  .close-btn {
    font-size: 10px;
    padding: var(--spacing-xs);
  }

  .search-types {
    padding: var(--spacing-sm) var(--spacing-md);
    gap: var(--spacing-xs);
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .search-types::-webkit-scrollbar {
    display: none;
  }

  .type-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--text-xs);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .type-icon {
    font-size: var(--text-sm);
  }

  .type-label {
    display: none;
  }

  .type-btn.active .type-label {
    display: inline;
  }

  .search-results {
    padding: var(--spacing-sm);
  }

  .hint-state {
    padding: var(--spacing-md);
  }

  .hint-item {
    font-size: var(--text-xs);
    gap: var(--spacing-sm);
  }

  .hint-icon {
    font-size: var(--text-base);
  }

  .result-item {
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }

  .result-icon {
    width: 36px;
    height: 36px;
    font-size: var(--text-lg);
  }

  .result-title {
    font-size: var(--text-sm);
  }

  .result-meta {
    font-size: 10px;
  }

  .empty-icon {
    font-size: 36px;
  }

  .loading-state,
  .empty-state {
    padding: var(--spacing-xl);
  }
}
</style>
