<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavorites } from '@/composables/useFavorites'
import type { FavoriteType, FavoriteItem } from '@/types/favorite'

const router = useRouter()
const { favorites, countByType, clearByType } = useFavorites()

// 当前选中的分类
type TabType = 'all' | FavoriteType
const activeTab = ref<TabType>('all')

// 标签页配置
const tabs: { key: TabType; label: string; icon: string }[] = [
  { key: 'all', label: '全部', icon: '📋' },
  { key: 'era', label: '纪元', icon: '📜' },
  { key: 'highlight', label: '名场面', icon: '🔥' },
  { key: 'ability', label: '神通', icon: '⚡' },
  { key: 'treasure', label: '法宝', icon: '💎' },
  { key: 'beast', label: '灵兽', icon: '🐉' },
]

// 筛选后的收藏列表
const filteredFavorites = computed(() => {
  if (activeTab.value === 'all') {
    return favorites.value
  }
  return favorites.value.filter((item: FavoriteItem) => item.type === activeTab.value)
})

// 获取收藏项的显示信息
interface DisplayInfo {
  title: string
  subtitle?: string
  icon: string
}

function getDisplayInfo(item: FavoriteItem): DisplayInfo {
  switch (item.type) {
    case 'era':
      return { title: item.targetId, subtitle: '纪元', icon: '📜' }
    case 'highlight':
      return { title: item.targetId, subtitle: '名场面', icon: '🔥' }
    case 'ability':
      return { title: item.targetId, subtitle: '神通', icon: '⚡' }
    case 'treasure':
      return { title: item.targetId, subtitle: '法宝', icon: '💎' }
    case 'beast':
      return { title: item.targetId, subtitle: '灵兽', icon: '🐉' }
    default:
      return { title: item.targetId, subtitle: '', icon: '📋' }
  }
}

// 格式化时间
function formatTime(timestamp: number): string {
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

// 点击收藏项
function handleItemClick(item: FavoriteItem) {
  if (item.type === 'era') {
    router.push({ name: 'era-detail', params: { id: item.targetId } })
  } else if (item.type === 'highlight') {
    // 名场面暂时跳转到首页
    // TODO: 跳转到对应纪元的名场面位置
    router.push('/')
  } else {
    // 神通/法宝/灵兽跳转到图鉴页
    router.push({ name: 'collection', query: { type: item.type, search: item.targetId } })
  }
}

// 返回首页
function goBack() {
  router.push('/')
}

// 清空当前分类
function handleClearCategory() {
  if (activeTab.value === 'all') return
  
  if (confirm(`确定要清空所有「${tabs.find(t => t.key === activeTab.value)?.label}」收藏吗？`)) {
    clearByType(activeTab.value as FavoriteType)
  }
}
</script>

<template>
  <div class="favorites-page">
    <!-- 头部 -->
    <header class="page-header glass">
      <button class="back-btn" @click="goBack">
        ← 返回
      </button>
      <h1 class="page-title">我的收藏</h1>
      <div class="header-actions">
        <span class="total-count">共 {{ favorites.length }} 项</span>
      </div>
    </header>
    
    <!-- 标签页 -->
    <div class="tabs-section">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
          <span v-if="tab.key !== 'all'" class="tab-count">
            {{ countByType[tab.key as FavoriteType] || 0 }}
          </span>
        </button>
      </div>
      
      <!-- 清空按钮 -->
      <button 
        v-if="activeTab !== 'all' && countByType[activeTab as FavoriteType] > 0"
        class="clear-btn"
        @click="handleClearCategory"
      >
        清空
      </button>
    </div>
    
    <!-- 收藏列表 -->
    <main class="favorites-content">
      <!-- 空状态 -->
      <div v-if="filteredFavorites.length === 0" class="empty-state">
        <div class="empty-icon">⭐</div>
        <p class="empty-text">暂无收藏内容</p>
        <p class="empty-hint">浏览时间线，收藏你喜欢的内容吧</p>
        <button class="explore-btn" @click="goBack">
          去探索
        </button>
      </div>
      
      <!-- 收藏网格 -->
      <div v-else class="favorites-grid">
        <div
          v-for="item in filteredFavorites"
          :key="item.id"
          class="favorite-card glass"
          @click="handleItemClick(item)"
        >
          <div class="card-icon">
            {{ getDisplayInfo(item).icon }}
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ getDisplayInfo(item).title }}</h3>
            <span class="card-type">{{ getDisplayInfo(item).subtitle }}</span>
          </div>
          <div class="card-meta">
            <span class="card-time">{{ formatTime(item.addedAt) }}</span>
          </div>
          <div v-if="item.note" class="card-note">
            {{ item.note }}
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.favorites-page {
  min-height: 100vh;
  padding-bottom: 100px;
}

/* 头部 */
.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-xl);
  z-index: var(--z-header);
}

.back-btn {
  font-family: var(--font-body);
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.back-btn:hover {
  color: var(--immortal-gold);
}

.page-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  color: var(--text-primary);
  margin: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.total-count {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

/* 标签页 */
.tabs-section {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--glass-border);
  z-index: var(--z-header);
}

.tabs {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
  scrollbar-width: none;
}

.tabs::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  white-space: nowrap;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.tab-btn.active {
  background: rgba(255, 215, 0, 0.15);
  color: var(--immortal-gold);
  border: 1px solid var(--immortal-gold-dim);
}

.tab-icon {
  font-size: var(--text-base);
}

.tab-count {
  font-size: var(--text-xs);
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
}

.tab-btn.active .tab-count {
  background: rgba(255, 215, 0, 0.2);
}

.clear-btn {
  font-size: var(--text-xs);
  color: var(--blood-crimson);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: rgba(220, 20, 60, 0.1);
}

/* 主要内容 */
.favorites-content {
  padding: 140px var(--spacing-xl) var(--spacing-2xl);
  max-width: 1200px;
  margin: 0 auto;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-text {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm);
}

.empty-hint {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0 0 var(--spacing-xl);
}

.explore-btn {
  padding: var(--spacing-sm) var(--spacing-xl);
  background: rgba(255, 215, 0, 0.15);
  color: var(--immortal-gold);
  border: 1px solid var(--immortal-gold-dim);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  transition: all 0.2s ease;
}

.explore-btn:hover {
  background: rgba(255, 215, 0, 0.25);
}

/* 收藏网格 */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
}

.favorite-card {
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.favorite-card:hover {
  border-color: var(--immortal-gold-dim);
  transform: translateY(-2px);
}

.card-icon {
  font-size: var(--text-2xl);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
}

.card-content {
  flex: 1;
  min-width: 120px;
}

.card-title {
  font-family: var(--font-display);
  font-size: var(--text-base);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs);
}

.card-type {
  font-size: var(--text-xs);
  color: var(--lightning-cyan);
}

.card-meta {
  display: flex;
  align-items: center;
}

.card-time {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.card-note {
  width: 100%;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--glass-border);
  font-style: italic;
}

/* ===== 移动端响应式 (< 640px) ===== */
@media (max-width: 639px) {
  .favorites-page {
    min-height: 100dvh;
    padding-bottom: 80px;
  }

  .page-header {
    height: 56px;
    padding: 0 var(--spacing-md);
  }

  .back-btn {
    font-size: var(--text-sm);
    min-height: 44px;
  }

  .page-title {
    font-size: var(--text-lg);
  }

  .total-count {
    font-size: var(--text-xs);
  }

  .tabs-section {
    top: 56px;
    padding: var(--spacing-sm) var(--spacing-md);
    gap: var(--spacing-sm);
  }

  .tabs {
    gap: var(--spacing-xs);
    flex: 1;
    padding-right: var(--spacing-sm);
  }

  .tab-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--text-xs);
  }

  .tab-icon {
    font-size: var(--text-sm);
  }

  .tab-label {
    display: none;
  }

  .tab-btn.active .tab-label {
    display: inline;
  }

  .tab-count {
    font-size: 10px;
    padding: 1px 4px;
  }

  .favorites-content {
    padding: 120px var(--spacing-md) var(--spacing-xl);
  }

  .empty-state {
    min-height: 300px;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: var(--spacing-md);
  }

  .empty-text {
    font-size: var(--text-base);
  }

  .empty-hint {
    font-size: var(--text-xs);
  }

  .explore-btn {
    min-height: 44px;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }

  .favorite-card {
    padding: var(--spacing-md);
    gap: var(--spacing-sm);
  }

  .card-icon {
    font-size: var(--text-xl);
    width: 40px;
    height: 40px;
  }

  .card-title {
    font-size: var(--text-sm);
  }

  .card-type {
    font-size: 10px;
  }

  .card-time {
    font-size: 10px;
  }

  .clear-btn {
    min-height: 44px;
    padding: var(--spacing-xs) var(--spacing-md);
  }
}

/* ===== 中等屏幕 (640px - 767px) ===== */
@media (min-width: 640px) and (max-width: 767px) {
  .favorites-content {
    padding: 140px var(--spacing-lg) var(--spacing-2xl);
  }

  .favorites-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
