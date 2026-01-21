<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { gsap } from 'gsap'
import collectionsData from '@/data/collections.json'
import CategoryFilter from '@/components/collection/CategoryFilter.vue'
import ItemCard from '@/components/collection/ItemCard.vue'
import ItemDetail from '@/components/collection/ItemDetail.vue'
import type { CollectibleItem } from '@/types'

const route = useRoute()
const router = useRouter()

type TabType = 'abilities' | 'treasures' | 'beasts'

const activeTab = ref<TabType>(
  (route.params.type as TabType) || 'abilities'
)

const searchQuery = ref('')
const sortBy = ref<'name' | 'era'>('era')
const selectedItem = ref<CollectibleItem | null>(null)
const showDetail = ref(false)
const isLoaded = ref(false)

const counts = computed(() => ({
  abilities: collectionsData.abilities.length,
  treasures: collectionsData.treasures.length,
  beasts: collectionsData.beasts.length
}))

// Era order for sorting
const eraOrder: Record<string, number> = {
  'era-02-entry': 2,
  'era-03-demon-sea': 3,
  'era-04-revenge': 4,
  'era-05-immortal-land': 5,
  'era-06-sky-fortune': 6,
  'era-07-luotian': 7,
  'era-08-thunder': 8,
  'era-09-hunt': 9,
  'era-10-war': 10,
  'era-11-immortal-mansion': 11,
  'era-12-cloud-sea': 12,
  'era-13-ancient-tomb': 13,
  'era-14-border-war': 14,
  'era-15-xiangang': 15,
  'era-16-finale': 16
}

const currentItems = computed(() => {
  let items = [...(collectionsData[activeTab.value] || [])] as CollectibleItem[]
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    )
  }
  
  // Sort items
  if (sortBy.value === 'name') {
    items.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  } else {
    items.sort((a, b) => 
      (eraOrder[a.obtainedEra] || 0) - (eraOrder[b.obtainedEra] || 0)
    )
  }
  
  return items
})

function setTab(tab: TabType) {
  activeTab.value = tab
  router.replace({ name: 'collection-type', params: { type: tab } })
  
  // Animate items
  nextTick(() => {
    gsap.set('.item-card', { y: 20, opacity: 0 })
    gsap.to('.item-card', {
      y: 0,
      opacity: 1,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power2.out'
    })
  })
}

function goBack() {
  router.push('/')
}

function handleItemClick(item: CollectibleItem) {
  selectedItem.value = item
  showDetail.value = true
}

function handleCloseDetail() {
  showDetail.value = false
  selectedItem.value = null
}

function handleNavigateToEra(eraId: string) {
  router.push({ name: 'era-detail', params: { id: eraId } })
}

onMounted(async () => {
  await nextTick()
  
  // Set initial states
  gsap.set('.page-header', { y: -50, opacity: 0 })
  gsap.set('.category-filter', { y: -30, opacity: 0 })
  gsap.set('.search-bar', { y: 20, opacity: 0 })
  gsap.set('.item-card', { y: 30, opacity: 0 })
  
  isLoaded.value = true
  
  // Entry animations
  gsap.to('.page-header', {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out'
  })
  
  gsap.to('.category-filter', {
    y: 0,
    opacity: 1,
    duration: 0.5,
    delay: 0.2,
    ease: 'power2.out'
  })
  
  gsap.to('.search-bar', {
    y: 0,
    opacity: 1,
    duration: 0.5,
    delay: 0.3,
    ease: 'power2.out'
  })
  
  gsap.to('.item-card', {
    y: 0,
    opacity: 1,
    duration: 0.4,
    stagger: 0.05,
    delay: 0.4,
    ease: 'power2.out'
  })
})
</script>

<template>
  <div class="collection" :class="{ loaded: isLoaded }">
    <header class="page-header glass">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">←</span>
        返回时间线
      </button>
      <h1 class="page-title">
        <span class="title-icon">📚</span>
        收藏图鉴
      </h1>
    </header>
    
    <nav class="filter-nav">
      <CategoryFilter
        :active-tab="activeTab"
        :counts="counts"
        @change="setTab"
      />
    </nav>
    
    <main class="page-content">
      <div class="search-bar">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索名称、描述..."
            class="search-input"
          />
          <button 
            v-if="searchQuery"
            class="clear-btn"
            @click="searchQuery = ''"
          >
            ✕
          </button>
        </div>
        
        <div class="sort-options">
          <span class="sort-label">排序</span>
          <button 
            class="sort-btn"
            :class="{ active: sortBy === 'era' }"
            @click="sortBy = 'era'"
          >
            按时间
          </button>
          <button 
            class="sort-btn"
            :class="{ active: sortBy === 'name' }"
            @click="sortBy = 'name'"
          >
            按名称
          </button>
        </div>
      </div>
      
      <div class="results-info">
        <span v-if="searchQuery">
          找到 <strong>{{ currentItems.length }}</strong> 个结果
        </span>
        <span v-else>
          共 <strong>{{ currentItems.length }}</strong> 项
        </span>
      </div>
      
      <div class="items-grid">
        <ItemCard
          v-for="item in currentItems"
          :key="item.id"
          :item="item"
          :type="activeTab"
          @click="handleItemClick"
        />
      </div>
      
      <div v-if="currentItems.length === 0" class="empty-state">
        <span class="empty-icon">🔮</span>
        <p>没有找到匹配的收集品</p>
        <button class="reset-btn" @click="searchQuery = ''">
          清除搜索
        </button>
      </div>
    </main>
    
    <ItemDetail
      :item="selectedItem"
      :type="activeTab"
      :visible="showDetail"
      @close="handleCloseDetail"
      @navigate="handleNavigateToEra"
    />
  </div>
</template>

<style scoped>
.collection {
  min-height: 100vh;
  padding-bottom: var(--spacing-3xl);
}


.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  padding: 0 var(--spacing-xl);
  z-index: var(--z-header);
}

.page-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  margin: 0;
  background: linear-gradient(135deg, var(--immortal-gold) 0%, var(--lightning-cyan) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-icon {
  font-size: var(--text-xl);
  -webkit-text-fill-color: initial;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-family: var(--font-body);
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.back-btn:hover {
  color: var(--immortal-gold);
}

.back-btn:hover .back-icon {
  transform: translateX(-4px);
}

.back-icon {
  transition: transform 0.2s ease;
}

.filter-nav {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--glass-border);
  z-index: var(--z-header);
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 180px var(--spacing-xl) var(--spacing-3xl);
  position: relative;
  z-index: var(--z-content);
}

/* Search Bar */
.search-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.search-input-wrapper {
  flex: 1;
  min-width: 280px;
  max-width: 400px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--spacing-md);
  font-size: var(--text-base);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) 44px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus {
  outline: none;
  border-color: var(--lightning-cyan);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
}

.clear-btn {
  position: absolute;
  right: var(--spacing-sm);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cosmos-dark);
  border: 1px solid var(--glass-border);
  border-radius: 50%;
  font-size: var(--text-xs);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  border-color: var(--text-secondary);
  color: var(--text-secondary);
}

.sort-options {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.sort-label {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.sort-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-btn:hover {
  border-color: var(--text-secondary);
  color: var(--text-primary);
}

.sort-btn.active {
  border-color: var(--lightning-cyan);
  color: var(--lightning-cyan);
  background: rgba(0, 212, 255, 0.1);
}

.results-info {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-bottom: var(--spacing-lg);
}

.results-info strong {
  color: var(--text-primary);
}

/* Items Grid */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--spacing-3xl);
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.reset-btn {
  padding: var(--spacing-sm) var(--spacing-xl);
  background: var(--glass-bg);
  border: 1px solid var(--lightning-cyan);
  border-radius: var(--radius-md);
  color: var(--lightning-cyan);
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: rgba(0, 212, 255, 0.1);
}

/* ===== 移动端响应式 (< 640px) ===== */
@media (max-width: 639px) {
  .collection {
    min-height: 100dvh;
    padding-bottom: var(--spacing-2xl);
  }

  .page-header {
    height: 56px;
    gap: var(--spacing-sm);
    padding: 0 var(--spacing-md);
  }

  .page-title {
    font-size: var(--text-lg);
  }

  .title-icon {
    font-size: var(--text-base);
  }

  .back-btn {
    font-size: var(--text-sm);
    min-height: 44px;
  }

  .filter-nav {
    top: 56px;
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .page-content {
    padding: 140px var(--spacing-md) var(--spacing-2xl);
  }

  .search-bar {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .search-input-wrapper {
    min-width: 100%;
    max-width: 100%;
  }

  .search-input {
    font-size: var(--text-sm);
    padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) 40px;
  }

  .sort-options {
    width: 100%;
    justify-content: flex-start;
  }

  .sort-label {
    font-size: var(--text-xs);
  }

  .sort-btn {
    font-size: var(--text-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .results-info {
    font-size: var(--text-xs);
    margin-bottom: var(--spacing-md);
  }

  .items-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .empty-state {
    padding: var(--spacing-2xl);
  }

  .empty-icon {
    font-size: 36px;
  }

  .reset-btn {
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--text-sm);
    min-height: 44px;
  }
}

/* ===== 中等屏幕 (640px - 767px) ===== */
@media (min-width: 640px) and (max-width: 767px) {
  .page-content {
    padding: 160px var(--spacing-lg) var(--spacing-2xl);
  }

  .items-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
