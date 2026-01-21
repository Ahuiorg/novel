<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProgressStore } from '@/stores/progress'
import { useGlobalAudio } from '@/composables/useAudio'
import { useProgress } from '@/composables/useProgress'
import EraCard from '@/components/timeline/EraCard.vue'
import TimelineRail from '@/components/timeline/TimelineRail.vue'
import BreakthroughOverlay from '@/components/effects/BreakthroughOverlay.vue'
import RandomHighlight from '@/components/highlight/RandomHighlight.vue'
import ShareCard from '@/components/share/ShareCard.vue'
import SearchModal from '@/components/common/SearchModal.vue'
import SettingsModal from '@/components/common/SettingsModal.vue'
import timelineIndex from '@/data/timeline-index.json'
import type { Highlight, Era } from '@/types'

const router = useRouter()
const progressStore = useProgressStore()
const audio = useGlobalAudio()
const { hasHistory, continueReading } = useProgress()

const timelineRef = ref<HTMLDivElement>()
const currentIndex = ref(0)
const isScrolling = ref(false)
const isInitialized = ref(false) // Flag to prevent breakthrough on initial load

// Breakthrough overlay state
const showBreakthrough = ref(false)
const breakthroughLevel = ref('')
const breakthroughFrom = ref('')
const breakthroughTo = ref('')
const triggeredBreakthroughs = ref(new Set<number>())

const eras = computed(() => timelineIndex.eras)
const currentEra = computed(() => {
  const era = eras.value[currentIndex.value]
  if (era) return era
  return eras.value[0]!
})

// Major breakthrough eras (indices where significant level changes occur)
const majorBreakthroughEras = computed(() => {
  const breakthroughs: { index: number; from: string; to: string }[] = []

  eras.value.forEach((era, index) => {
    if (index === 0) return

    const prev = eras.value[index - 1]
    if (!prev) return

    // Detect major step changes (like 练气 -> 筑基, 结丹 -> 元婴, etc.)
    const majorSteps = [
      '筑基',
      '结丹',
      '元婴',
      '化神',
      '婴变',
      '问鼎',
      '窥涅',
      '涅槃',
      '步虚',
      '渡劫',
      '大乘',
    ]

    for (const step of majorSteps) {
      if (era.levelEnd.includes(step) && !prev.levelEnd.includes(step)) {
        breakthroughs.push({
          index,
          from: prev.levelEnd,
          to: era.levelEnd,
        })
        break
      }
    }
  })

  return breakthroughs
})

// Trigger breakthrough when entering a major breakthrough era
watch(currentIndex, (newIndex, oldIndex) => {
  // Skip triggering breakthrough on initial load
  if (!isInitialized.value) return

  // Only trigger when moving forward
  if (newIndex <= oldIndex) return

  const breakthrough = majorBreakthroughEras.value.find((b) => b.index === newIndex)

  if (breakthrough && !triggeredBreakthroughs.value.has(newIndex)) {
    triggeredBreakthroughs.value.add(newIndex)
    triggerBreakthrough(breakthrough.from, breakthrough.to)
  }
})

function triggerBreakthrough(from: string, to: string) {
  breakthroughFrom.value = from
  breakthroughTo.value = to
  breakthroughLevel.value = to
  showBreakthrough.value = true
  audio.playBreakthroughSequence()
}

function handleBreakthroughComplete() {
  showBreakthrough.value = false
}

function handleBreakthroughClose() {
  showBreakthrough.value = false
}

// Random highlight modal state
const showRandomHighlight = ref(false)

function openRandomHighlight() {
  showRandomHighlight.value = true
}

function closeRandomHighlight() {
  showRandomHighlight.value = false
}

// Share card state
const showShareCard = ref(false)
const shareContent = ref<{ type: 'highlight'; highlight: Highlight; era: Era } | null>(null)

function handleShareHighlight(highlight: Highlight, era: Era) {
  shareContent.value = { type: 'highlight', highlight, era }
  showShareCard.value = true
  closeRandomHighlight()
}

function closeShareCard() {
  showShareCard.value = false
  shareContent.value = null
}

// Search modal state
const showSearch = ref(false)

function openSearch() {
  showSearch.value = true
}

function closeSearch() {
  showSearch.value = false
}

// Settings modal state
const showSettings = ref(false)

function openSettings() {
  showSettings.value = true
}

function closeSettings() {
  showSettings.value = false
}

// Continue reading
function handleContinueReading() {
  continueReading()
}

const markers = computed(() =>
  eras.value.map((era, index) => ({
    id: era.id,
    title: era.title,
    levelEnd: era.levelEnd,
    position: (index / (eras.value.length - 1)) * 100,
  }))
)

const scrollProgress = computed(() => {
  return (currentIndex.value / (eras.value.length - 1)) * 100
})

function getCardDimensions() {
  // 动态获取卡片宽度和间距，适配不同屏幕尺寸
  const isMobile = window.innerWidth < 640
  const isTablet = window.innerWidth >= 640 && window.innerWidth < 768
  
  if (isMobile) {
    return { cardWidth: Math.min(280, window.innerWidth - 48), gap: 16 }
  } else if (isTablet) {
    return { cardWidth: 300, gap: 24 }
  }
  return { cardWidth: 320, gap: 32 }
}

function scrollToEra(index: number) {
  if (!timelineRef.value || isScrolling.value) return
  
  isScrolling.value = true
  currentIndex.value = index
  
  const { cardWidth, gap } = getCardDimensions()
  const containerWidth = timelineRef.value.offsetWidth
  
  // Get the actual padding width from the DOM
  const paddingElement = timelineRef.value.querySelector('.timeline-padding') as HTMLElement
  const paddingWidth = paddingElement?.offsetWidth || (containerWidth / 2 - cardWidth / 2)
  
  // Calculate scroll position: padding + card position - center offset
  const cardPosition = index * (cardWidth + gap)
  const centerOffset = (containerWidth - cardWidth) / 2
  const scrollPosition = paddingWidth + cardPosition - centerOffset
  
  timelineRef.value.scrollTo({
    left: Math.max(0, scrollPosition),
    behavior: 'smooth',
  })
  
  progressStore.setCurrentEra(index)
  progressStore.saveProgress()
  
  setTimeout(() => {
    isScrolling.value = false
  }, 500)
}

function handleScroll() {
  if (!timelineRef.value || isScrolling.value) return
  
  const { cardWidth, gap } = getCardDimensions()
  const scrollLeft = timelineRef.value.scrollLeft
  const containerWidth = timelineRef.value.offsetWidth
  
  // Get the actual padding width from the DOM
  const paddingElement = timelineRef.value.querySelector('.timeline-padding') as HTMLElement
  const paddingWidth = paddingElement?.offsetWidth || (containerWidth / 2 - cardWidth / 2)
  
  // Calculate which card is centered
  // scrollLeft + centerOffset = paddingWidth + index * (cardWidth + gap)
  // index = (scrollLeft + centerOffset - paddingWidth) / (cardWidth + gap)
  const centerOffset = (containerWidth - cardWidth) / 2
  const newIndex = Math.round((scrollLeft + centerOffset - paddingWidth) / (cardWidth + gap))
  
  if (newIndex !== currentIndex.value && newIndex >= 0 && newIndex < eras.value.length) {
    currentIndex.value = newIndex
    progressStore.setCurrentEra(newIndex)
  }
}

function handleWheel(e: WheelEvent) {
  if (!timelineRef.value) return
  
  // 将垂直滚动转换为水平滚动（不阻止默认行为以避免性能警告）
  const delta = e.deltaY
  if (delta !== 0 && Math.abs(e.deltaX) < Math.abs(delta)) {
    // 直接设置水平滚动位置
    timelineRef.value.scrollLeft += delta
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault()
    scrollToEra(Math.min(currentIndex.value + 1, eras.value.length - 1))
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    scrollToEra(Math.max(currentIndex.value - 1, 0))
  }
}

function handleEraClick(era: typeof eras.value[0]) {
  router.push({ name: 'era-detail', params: { id: era.id } })
}

function handleMarkerClick(index: number) {
  scrollToEra(index)
}

onMounted(() => {
  progressStore.setTotalEras(eras.value.length)
  
  // Restore saved progress
  if (progressStore.currentEraIndex > 0) {
    currentIndex.value = progressStore.currentEraIndex
    setTimeout(() => scrollToEra(currentIndex.value), 100)
  }
  
  // Mark as initialized after initial setup to prevent breakthrough trigger
  setTimeout(() => {
    isInitialized.value = true
  }, 500)
  
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="home-page">
    <!-- Top Bar -->
    <header class="top-bar glass">
      <div class="logo">
        <h1 class="logo-text">仙逆</h1>
        <span class="logo-subtitle">编年史</span>
      </div>
      
      <div class="top-actions">
        <button v-if="hasHistory" class="continue-btn" @click="handleContinueReading" title="继续阅读">
          <span class="icon">📖</span>
          <span class="label">继续阅读</span>
        </button>
        <button class="action-btn" title="搜索" @click="openSearch">
          <span class="icon">🔍</span>
        </button>
        <button class="action-btn" title="设置" @click="openSettings">
          <span class="icon">⚙️</span>
        </button>
      </div>
    </header>
    
    <!-- Progress Rail -->
    <div class="progress-section">
      <TimelineRail
        :markers="markers"
        :current-index="currentIndex"
        :progress="scrollProgress"
        @marker-click="handleMarkerClick"
      />
    </div>
    
    <!-- Timeline Scroll Area -->
    <div
      ref="timelineRef"
      class="timeline-scroll"
      @scroll="handleScroll"
      @wheel.passive="handleWheel"
    >
      <div class="timeline-content">
        <div class="timeline-padding" />
        
        <EraCard
          v-for="(era, index) in eras"
          :key="era.id"
          :era="era"
          :index="index"
          :is-active="index === currentIndex"
          @click="handleEraClick"
        />
        
        <div class="timeline-padding" />
      </div>
    </div>
    
    <!-- Current Era Info -->
    <div class="current-info glass">
      <div class="info-year">
        仙逆年 {{ currentEra.timeRange.start }} - {{ currentEra.timeRange.end }}
      </div>
      <div class="info-hint">← → 滚动浏览 · 点击卡片查看详情</div>
    </div>
    
    <!-- Bottom Navigation -->
    <nav class="bottom-nav glass">
      <RouterLink to="/levels" class="nav-item">
        <span class="nav-icon">📊</span>
        <span class="nav-label">等级体系</span>
      </RouterLink>
      <button class="nav-item highlight-btn" @click="openRandomHighlight">
        <span class="nav-icon">🎲</span>
        <span class="nav-label">随机名场面</span>
      </button>
      <RouterLink to="/collection" class="nav-item">
        <span class="nav-icon">📚</span>
        <span class="nav-label">收藏图鉴</span>
      </RouterLink>
      <RouterLink to="/favorites" class="nav-item">
        <span class="nav-icon">⭐</span>
        <span class="nav-label">我的收藏</span>
      </RouterLink>
    </nav>

    <!-- Breakthrough Overlay -->
    <BreakthroughOverlay
      :visible="showBreakthrough"
      :level-name="breakthroughLevel"
      :from-level="breakthroughFrom"
      :to-level="breakthroughTo"
      @complete="handleBreakthroughComplete"
      @close="handleBreakthroughClose"
    />

    <!-- Random Highlight Modal -->
    <RandomHighlight
      :visible="showRandomHighlight"
      @close="closeRandomHighlight"
      @share="handleShareHighlight"
    />

    <!-- Share Card Modal -->
    <ShareCard
      v-if="shareContent"
      :visible="showShareCard"
      :content="shareContent"
      @close="closeShareCard"
    />

    <!-- Search Modal -->
    <SearchModal
      :visible="showSearch"
      @close="closeSearch"
    />

    <!-- Settings Modal -->
    <SettingsModal
      :visible="showSettings"
      @close="closeSettings"
    />
  </div>
</template>

<style scoped>
.home-page {
  position: relative;
  width: 100vw;
  height: 100dvh; /* 使用动态视口单位 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Top Bar */
.top-bar {
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

.logo {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
}

.logo-text {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  margin: 0;
  background: linear-gradient(135deg, var(--immortal-gold) 0%, var(--lightning-cyan) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-subtitle {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.top-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.action-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: background 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 继续阅读按钮 */
.continue-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid var(--immortal-gold-dim);
  color: var(--immortal-gold);
  font-size: var(--text-sm);
  transition: all 0.2s ease;
  min-height: 44px;
}

.continue-btn:hover {
  background: rgba(255, 215, 0, 0.2);
}

.continue-btn .icon {
  font-size: var(--text-base);
}

.continue-btn .label {
  font-size: var(--text-xs);
}

.icon {
  font-size: var(--text-lg);
}

/* Progress Section */
.progress-section {
  position: fixed;
  top: 72px;
  left: 0;
  right: 0;
  z-index: var(--z-header);
  padding: 0 var(--spacing-xl);
}

/* Timeline */
.timeline-scroll {
  flex: 1;
  margin-top: 140px;
  margin-bottom: 100px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch; /* 平滑触摸滚动 */
  scroll-snap-type: x mandatory; /* 启用水平滚动吸附 */
  scroll-behavior: smooth; /* 平滑滚动动画 */
}

.timeline-scroll::-webkit-scrollbar {
  display: none;
}

.timeline-content {
  display: flex;
  align-items: center;
  gap: 32px; /* 固定值，与 JS 计算一致 */
  height: 100%;
  padding: var(--spacing-xl) 0;
}

.timeline-padding {
  min-width: calc(50vw - 160px);
}

/* Current Info */
.current-info {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-lg);
  text-align: center;
  z-index: var(--z-content);
  max-width: calc(100vw - 32px);
}

.info-year {
  font-family: var(--font-accent);
  font-size: var(--text-lg);
  color: var(--lightning-cyan);
  margin-bottom: var(--spacing-xs);
}

.info-hint {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* Bottom Navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3xl);
  z-index: var(--z-nav);
  padding: 0 var(--spacing-md);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  min-width: 44px;
  min-height: 44px;
}

.nav-item:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.nav-icon {
  font-size: var(--text-xl);
}

.nav-label {
  font-size: var(--text-xs);
}

/* 随机名场面按钮样式 */
.nav-item.highlight-btn {
  border: none;
  background: transparent;
}

.nav-item.highlight-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* ===== 移动端响应式 (< 640px) ===== */
@media (max-width: 639px) {
  .top-bar {
    height: 56px;
    padding: 0 var(--spacing-md);
  }

  .logo-text {
    font-size: var(--text-2xl);
  }

  .logo-subtitle {
    display: none;
  }

  .continue-btn .label {
    display: none;
  }

  .continue-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .progress-section {
    top: 60px;
    padding: 0 var(--spacing-sm);
  }

  .timeline-scroll {
    margin-top: 110px;
    margin-bottom: 80px;
  }

  .timeline-content {
    gap: 16px; /* 固定值，与 JS 计算一致 */
    padding: var(--spacing-md) 0;
  }

  .timeline-padding {
    /* 卡片宽度 280px，居中需要 (100vw - 280px) / 2 = 50vw - 140px */
    min-width: calc(50vw - 140px);
    flex-shrink: 0;
  }

  .current-info {
    bottom: 72px;
    padding: var(--spacing-xs) var(--spacing-md);
  }

  .info-year {
    font-size: var(--text-base);
  }

  .info-hint {
    font-size: 10px;
  }

  .bottom-nav {
    height: 60px;
    gap: var(--spacing-xs);
    padding: 0 var(--spacing-xs);
  }

  .nav-item {
    padding: var(--spacing-xs) var(--spacing-sm);
    gap: 2px;
  }

  .nav-icon {
    font-size: var(--text-lg);
  }

  .nav-label {
    font-size: 9px;
    white-space: nowrap;
  }

}

/* ===== 平板响应式 (640px - 767px) ===== */
@media (min-width: 640px) and (max-width: 767px) {
  .timeline-content {
    gap: 24px; /* 固定值，与 JS 计算一致 */
  }

  .timeline-padding {
    /* 卡片宽度 300px，居中需要 50vw - 150px */
    min-width: calc(50vw - 150px);
    flex-shrink: 0;
  }

  .bottom-nav {
    gap: var(--spacing-xl);
  }

  .nav-item {
    padding: var(--spacing-sm) var(--spacing-md);
  }
}
</style>
