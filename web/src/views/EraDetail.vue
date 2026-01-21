<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Era, Highlight, Quote } from '@/types'
import HighlightCard from '@/components/highlight/HighlightCard.vue'
import QuoteDisplay from '@/components/highlight/QuoteDisplay.vue'
import CharacterHighlight from '@/components/common/CharacterHighlight.vue'
import FavoriteButton from '@/components/common/FavoriteButton.vue'
import ShareCard from '@/components/share/ShareCard.vue'
import { useFavorites } from '@/composables/useFavorites'
import { useProgress } from '@/composables/useProgress'

const route = useRoute()
const router = useRouter()
const { toggleFavorite } = useFavorites()
const { addToHistory } = useProgress()

const era = ref<Era | null>(null)
const loading = ref(true)

const eraId = computed(() => route.params.id as string)

async function loadEraData() {
  // 立即滚动到顶部
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  
  loading.value = true
  try {
    const module = await import(`@/data/eras/${eraId.value}.json`)
    era.value = module.default
    
    // 添加到阅读历史
    if (era.value) {
      addToHistory(era.value.id, era.value.title)
    }
  } catch (error) {
    console.error('Failed to load era data:', error)
    router.push('/')
  } finally {
    loading.value = false
    // 数据加载完成后，再次确保滚动到顶部
    await nextTick()
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }
}

// 监听路由变化，用于同一组件内的纪元切换
watch(eraId, () => {
  loadEraData()
})

function goBack() {
  router.push('/')
}

function goToEra(direction: 'prev' | 'next') {
  const parts = eraId.value.split('-')
  const eraNum = parseInt(parts[1] ?? '1')
  const newNum = direction === 'prev' ? eraNum - 1 : eraNum + 1
  
  if (newNum >= 1 && newNum <= 16) {
    const paddedNum = String(newNum).padStart(2, '0')
    // This is simplified - in production, get the actual era ID
    router.push({ name: 'era-detail', params: { id: `era-${paddedNum}-${parts.slice(2).join('-')}` } })
  }
}

// Share card state
type ShareContent =
  | { type: 'highlight'; highlight: Highlight; era: Era }
  | { type: 'quote'; quote: Quote; era: Era }
  | { type: 'era'; era: Era }

const showShareCard = ref(false)
const shareContent = ref<ShareContent | null>(null)

function handleShareHighlight(highlight: Highlight) {
  if (!era.value) return
  shareContent.value = { type: 'highlight', highlight, era: era.value }
  showShareCard.value = true
}

function handleShareQuote(quote: Quote) {
  if (!era.value) return
  shareContent.value = { type: 'quote', quote, era: era.value }
  showShareCard.value = true
}

function handleShareEra() {
  if (!era.value) return
  shareContent.value = { type: 'era', era: era.value }
  showShareCard.value = true
}

function closeShareCard() {
  showShareCard.value = false
  shareContent.value = null
}

// Favorite highlight handler
function handleFavoriteHighlight(highlight: Highlight) {
  toggleFavorite('highlight', highlight.id)
}

onMounted(() => {
  loadEraData()
})
</script>

<template>
  <div class="era-detail">
    <header class="detail-header glass">
      <button class="back-btn" @click="goBack">
        ← 返回时间线
      </button>
      
      <div v-if="era" class="header-info">
        <span class="era-year">仙逆年 {{ era.timeRange.start }} - {{ era.timeRange.end }}</span>
        <FavoriteButton type="era" :target-id="era.id" size="sm" />
      </div>
    </header>
    
    <main v-if="!loading && era" class="detail-content">
      <section class="hero-section">
        <h1 class="era-title">{{ era.title }}</h1>
        <p class="era-summary">{{ era.summary }}</p>
        
        <div class="level-progress">
          <div class="level-item">
            <span class="level-label">本体</span>
            <span class="level-value">{{ era.levelProgress.mainBody }}</span>
          </div>
          <div v-if="era.levelProgress.clone" class="level-item">
            <span class="level-label">分身</span>
            <span class="level-value">{{ era.levelProgress.clone }}</span>
          </div>
        </div>
        
        <!-- 分享纪元按钮 -->
        <button class="share-era-btn" @click="handleShareEra">
          <span class="icon">📤</span>
          <span class="label">分享纪元</span>
        </button>
      </section>
      
      <section class="story-section glass">
        <h2>故事详情</h2>
        <div class="story-content">
          <CharacterHighlight :text="era.fullContent" />
        </div>
      </section>
      
      <section class="locations-section">
        <h2>涉及地点</h2>
        <div class="tag-list">
          <span v-for="location in era.locations" :key="location" class="tag">
            {{ location }}
          </span>
        </div>
      </section>
      
      <section v-if="era.newAbilities.length" class="abilities-section">
        <h2>新增神通</h2>
        <div class="tag-list">
          <span v-for="ability in era.newAbilities" :key="ability" class="tag ability">
            {{ ability }}
          </span>
        </div>
      </section>
      
      <section v-if="era.newTreasures.length" class="treasures-section">
        <h2>新增法宝</h2>
        <div class="tag-list">
          <span v-for="treasure in era.newTreasures" :key="treasure" class="tag treasure">
            {{ treasure }}
          </span>
        </div>
      </section>
      
      <section v-if="era.newBeasts.length" class="beasts-section">
        <h2>新增灵兽</h2>
        <div class="tag-list">
          <span v-for="beast in era.newBeasts" :key="beast" class="tag beast">
            {{ beast }}
          </span>
        </div>
      </section>
      
      <!-- 名场面区域（使用新组件） -->
      <section v-if="era.highlights?.length" class="highlights-section">
        <h2>✨ 名场面</h2>
        <div class="highlights-grid">
          <HighlightCard
            v-for="highlight in era.highlights"
            :key="highlight.id"
            :highlight="highlight"
            @share="handleShareHighlight"
            @favorite="handleFavoriteHighlight"
          />
        </div>
      </section>
      
      <!-- 经典台词区域（使用新组件） -->
      <section v-if="era.quotes?.length" class="quotes-section">
        <h2>💬 经典台词</h2>
        <div class="quotes-list">
          <QuoteDisplay
            v-for="quote in era.quotes"
            :key="quote.id"
            :quote="quote"
            :variant="era.quotes.length === 1 ? 'featured' : 'default'"
            @share="handleShareQuote"
          />
        </div>
      </section>
    </main>
    
    <div v-else class="loading">
      加载中...
    </div>
    
    <nav class="era-nav">
      <button class="nav-btn prev" @click="goToEra('prev')">
        ← 上一纪元
      </button>
      <button class="nav-btn next" @click="goToEra('next')">
        下一纪元 →
      </button>
    </nav>

    <!-- Share Card Modal -->
    <ShareCard
      v-if="shareContent"
      :visible="showShareCard"
      :content="shareContent"
      @close="closeShareCard"
    />
  </div>
</template>

<style scoped>
.era-detail {
  min-height: 100vh;
  padding-bottom: 100px;
}

.detail-header {
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

.era-year {
  font-family: var(--font-accent);
  color: var(--lightning-cyan);
}

.detail-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 100px var(--spacing-xl) var(--spacing-3xl);
  position: relative;
  z-index: var(--z-content);
}

.hero-section {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.era-title {
  font-family: var(--font-display);
  font-size: var(--text-5xl);
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
  background: linear-gradient(135deg, var(--immortal-gold) 0%, var(--lightning-cyan) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.era-summary {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto var(--spacing-xl);
}

.level-progress {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
}

.level-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.level-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.level-value {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  color: var(--immortal-gold);
}

section {
  margin-bottom: var(--spacing-2xl);
}

section h2 {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.story-section {
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
}

.story-content {
  line-height: var(--leading-loose);
  color: var(--text-secondary);
  white-space: pre-line;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.tag {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.tag.ability {
  border-color: var(--lightning-cyan);
  color: var(--lightning-cyan);
}

.tag.treasure {
  border-color: var(--immortal-gold);
  color: var(--immortal-gold);
}

.tag.beast {
  border-color: var(--jade-green);
  color: var(--jade-green);
}

/* 名场面网格 */
.highlights-grid {
  display: grid;
  gap: var(--spacing-md);
}

/* 经典台词列表 */
.quotes-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* 分享纪元按钮 */
.share-era-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  transition: all 0.2s ease;
}

.share-era-btn:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: var(--immortal-gold-dim);
  color: var(--immortal-gold);
}

.share-era-btn .icon {
  font-size: var(--text-base);
}

/* 头部信息区域 */
.header-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-size: var(--text-xl);
  color: var(--text-secondary);
}

.era-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-xl);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border-top: 1px solid var(--glass-border);
  z-index: var(--z-nav);
}

.nav-btn {
  font-family: var(--font-body);
  color: var(--text-secondary);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.nav-btn:hover {
  color: var(--immortal-gold);
  background: rgba(255, 215, 0, 0.1);
}

/* ===== 移动端响应式 (< 640px) ===== */
@media (max-width: 639px) {
  .era-detail {
    min-height: 100dvh;
    padding-bottom: 80px;
  }

  .detail-header {
    height: 56px;
    padding: 0 var(--spacing-md);
  }

  .back-btn {
    font-size: var(--text-sm);
    min-height: 44px;
    display: flex;
    align-items: center;
  }

  .era-year {
    font-size: var(--text-xs);
  }

  .header-info {
    gap: var(--spacing-sm);
  }

  .detail-content {
    padding: 72px var(--spacing-md) var(--spacing-2xl);
  }

  .hero-section {
    margin-bottom: var(--spacing-2xl);
  }

  .era-title {
    font-size: var(--text-3xl);
    margin-bottom: var(--spacing-sm);
  }

  .era-summary {
    font-size: var(--text-base);
    margin-bottom: var(--spacing-md);
  }

  .level-progress {
    gap: var(--spacing-lg);
  }

  .level-value {
    font-size: var(--text-base);
  }

  section {
    margin-bottom: var(--spacing-xl);
  }

  section h2 {
    font-size: var(--text-xl);
    margin-bottom: var(--spacing-sm);
  }

  .story-section {
    padding: var(--spacing-md);
  }

  .story-content {
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
  }

  .tag-list {
    gap: var(--spacing-xs);
  }

  .tag {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--text-xs);
  }

  .share-era-btn {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--text-xs);
    min-height: 44px;
  }

  .era-nav {
    height: 60px;
    padding: 0 var(--spacing-md);
  }

  .nav-btn {
    font-size: var(--text-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    min-height: 44px;
  }

  .loading {
    min-height: 100dvh;
    font-size: var(--text-lg);
  }
}

/* ===== 中等屏幕 (640px - 767px) ===== */
@media (min-width: 640px) and (max-width: 767px) {
  .detail-content {
    padding: 88px var(--spacing-lg) var(--spacing-2xl);
  }

  .era-title {
    font-size: var(--text-4xl);
  }
}
</style>
