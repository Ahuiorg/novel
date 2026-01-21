<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Highlight, Era } from '@/types'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  share: [highlight: Highlight, era: Era]
}>()

const router = useRouter()

// 所有名场面数据（包含纪元信息）
interface HighlightWithEra {
  highlight: Highlight
  era: Era
}

const allHighlights = ref<HighlightWithEra[]>([])
const currentHighlight = ref<HighlightWithEra | null>(null)
const isLoading = ref(true)
const isAnimating = ref(false)

// 加载所有纪元数据
async function loadAllHighlights() {
  isLoading.value = true
  const highlights: HighlightWithEra[] = []
  
  // 加载所有 16 个纪元
  const eraIds = [
    'era-01-birth', 'era-02-entry', 'era-03-demon-sea', 'era-04-revenge',
    'era-05-immortal-land', 'era-06-sky-fortune', 'era-07-luotian', 'era-08-thunder',
    'era-09-hunt', 'era-10-war', 'era-11-immortal-mansion', 'era-12-cloud-sea',
    'era-13-ancient-tomb', 'era-14-border-war', 'era-15-xiangang', 'era-16-finale'
  ]
  
  for (const eraId of eraIds) {
    try {
      const module = await import(`@/data/eras/${eraId}.json`)
      const era: Era = module.default
      
      if (era.highlights && era.highlights.length > 0) {
        for (const highlight of era.highlights) {
          highlights.push({ highlight, era })
        }
      }
    } catch (error) {
      console.error(`Failed to load era ${eraId}:`, error)
    }
  }
  
  allHighlights.value = highlights
  isLoading.value = false
  
  // 初始随机选择一个
  if (highlights.length > 0) {
    pickRandom()
  }
}

// 随机选择一个名场面
function pickRandom() {
  if (allHighlights.value.length === 0) return
  
  isAnimating.value = true
  
  // 添加动画效果
  setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * allHighlights.value.length)
    currentHighlight.value = allHighlights.value[randomIndex] ?? null
    isAnimating.value = false
  }, 300)
}

// 跳转到对应纪元
function goToEra() {
  if (!currentHighlight.value) return
  
  router.push({
    name: 'era-detail',
    params: { id: currentHighlight.value.era.id }
  })
  emit('close')
}

// 分享当前名场面
function handleShare() {
  if (!currentHighlight.value) return
  emit('share', currentHighlight.value.highlight, currentHighlight.value.era)
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

// 类型标签显示
const typeLabel = computed(() => {
  if (!currentHighlight.value) return ''
  const labels = {
    epic: '燃',
    emotional: '泪',
    cool: '爽',
  }
  return labels[currentHighlight.value.highlight.type]
})

// 监听 visible 变化，首次显示时加载数据
watch(() => props.visible, (visible) => {
  if (visible && allHighlights.value.length === 0) {
    loadAllHighlights()
  }
})

onMounted(() => {
  if (props.visible) {
    loadAllHighlights()
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="visible" 
        class="random-highlight-overlay" 
        @click="handleBackdropClick"
        @keydown.esc="handleClose"
      >
        <div class="random-highlight-modal" :class="{ animating: isAnimating }">
          <!-- 关闭按钮 -->
          <button class="close-btn" @click="handleClose" aria-label="关闭">
            ✕
          </button>
          
          <!-- 标题 -->
          <div class="modal-header">
            <h2 class="modal-title">
              <span class="sparkle">✨</span>
              随机名场面
              <span class="sparkle">✨</span>
            </h2>
            <p class="modal-subtitle">发现仙逆中的精彩瞬间</p>
          </div>
          
          <!-- 内容区域 -->
          <div class="modal-content">
            <div v-if="isLoading" class="loading-state">
              <div class="loading-spinner" />
              <span>探索中...</span>
            </div>
            
            <template v-else-if="currentHighlight">
              <!-- 纪元信息 -->
              <div class="era-badge">
                <span class="era-time">
                  仙逆年 {{ currentHighlight.era.timeRange.start }} - {{ currentHighlight.era.timeRange.end }}
                </span>
                <span class="era-name">{{ currentHighlight.era.title }}</span>
              </div>
              
              <!-- 名场面展示 -->
              <div class="highlight-showcase" :class="currentHighlight.highlight.type">
                <div class="type-indicator">
                  <span class="type-badge">{{ typeLabel }}</span>
                </div>
                
                <h3 class="highlight-title">{{ currentHighlight.highlight.title }}</h3>
                
                <p class="highlight-desc">{{ currentHighlight.highlight.description }}</p>
                
                <blockquote v-if="currentHighlight.highlight.quote" class="highlight-quote">
                  「{{ currentHighlight.highlight.quote }}」
                </blockquote>
              </div>
            </template>
            
            <div v-else class="empty-state">
              暂无名场面数据
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="modal-actions">
            <button class="action-btn refresh" @click="pickRandom" :disabled="isLoading">
              <span class="icon">🎲</span>
              <span class="label">换一个</span>
            </button>
            <button class="action-btn share" @click="handleShare" :disabled="!currentHighlight">
              <span class="icon">📤</span>
              <span class="label">分享</span>
            </button>
            <button class="action-btn goto" @click="goToEra" :disabled="!currentHighlight">
              <span class="icon">📖</span>
              <span class="label">查看详情</span>
            </button>
          </div>
          
          <!-- 装饰粒子 -->
          <div class="decoration-particles">
            <div class="particle" v-for="i in 8" :key="i" :style="{ '--delay': `${i * 0.2}s` }" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 遮罩层 */
.random-highlight-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 5, 16, 0.9);
  backdrop-filter: blur(8px);
  z-index: var(--z-modal);
  padding: var(--spacing-xl);
}

/* 弹窗 */
.random-highlight-modal {
  position: relative;
  width: 100%;
  max-width: 560px;
  background: var(--cosmos-dark);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  overflow: hidden;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.random-highlight-modal.animating {
  transform: scale(0.98);
  opacity: 0.7;
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;
  color: var(--text-muted);
  font-size: var(--text-lg);
  transition: all 0.2s ease;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

/* 标题区域 */
.modal-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.modal-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm);
}

.sparkle {
  display: inline-block;
  animation: sparkle 2s ease-in-out infinite;
}

.sparkle:last-child {
  animation-delay: 0.3s;
}

@keyframes sparkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.9); }
}

.modal-subtitle {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0;
}

/* 内容区域 */
.modal-content {
  min-height: 200px;
  margin-bottom: var(--spacing-xl);
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: var(--spacing-md);
  color: var(--text-muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--glass-border);
  border-top-color: var(--immortal-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 纪元标签 */
.era-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  font-size: var(--text-sm);
}

.era-time {
  color: var(--lightning-cyan);
  font-family: var(--font-accent);
}

.era-name {
  color: var(--text-secondary);
}

.era-name::before {
  content: '·';
  margin-right: var(--spacing-sm);
  color: var(--text-muted);
}

/* 名场面展示 */
.highlight-showcase {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  position: relative;
}

.highlight-showcase.epic {
  border-left: 4px solid #ff6464;
}

.highlight-showcase.emotional {
  border-left: 4px solid #6496ff;
}

.highlight-showcase.cool {
  border-left: 4px solid #64ff96;
}

/* 类型指示器 */
.type-indicator {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
}

.type-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: var(--text-base);
  font-weight: 700;
}

.highlight-showcase.epic .type-badge {
  background: rgba(255, 100, 100, 0.2);
  color: #ff6464;
}

.highlight-showcase.emotional .type-badge {
  background: rgba(100, 150, 255, 0.2);
  color: #6496ff;
}

.highlight-showcase.cool .type-badge {
  background: rgba(100, 255, 150, 0.2);
  color: #64ff96;
}

.highlight-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md);
  padding-right: 48px;
}

.highlight-desc {
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0 0 var(--spacing-md);
}

.highlight-quote {
  font-family: var(--font-display);
  font-style: italic;
  color: var(--immortal-gold);
  border-left: 2px solid var(--immortal-gold-dim);
  padding-left: var(--spacing-md);
  margin: 0;
  line-height: var(--leading-relaxed);
}

/* 操作按钮 */
.modal-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  transition: all 0.2s ease;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn .icon {
  font-size: var(--text-base);
}

.action-btn.refresh {
  background: rgba(255, 215, 0, 0.15);
  color: var(--immortal-gold);
  border: 1px solid var(--immortal-gold-dim);
}

.action-btn.refresh:hover:not(:disabled) {
  background: rgba(255, 215, 0, 0.25);
}

.action-btn.share {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border: 1px solid var(--glass-border);
}

.action-btn.share:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.action-btn.goto {
  background: rgba(0, 212, 255, 0.15);
  color: var(--lightning-cyan);
  border: 1px solid var(--lightning-cyan-dim);
}

.action-btn.goto:hover:not(:disabled) {
  background: rgba(0, 212, 255, 0.25);
}

/* 装饰粒子 */
.decoration-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--immortal-gold);
  border-radius: 50%;
  opacity: 0;
  animation: floatParticle 4s ease-in-out infinite;
  animation-delay: var(--delay);
}

.particle:nth-child(1) { top: 10%; left: 10%; }
.particle:nth-child(2) { top: 20%; right: 15%; }
.particle:nth-child(3) { top: 50%; left: 5%; }
.particle:nth-child(4) { top: 70%; right: 10%; }
.particle:nth-child(5) { bottom: 20%; left: 15%; }
.particle:nth-child(6) { bottom: 10%; right: 20%; }
.particle:nth-child(7) { top: 40%; left: 12%; }
.particle:nth-child(8) { bottom: 30%; right: 8%; }

.particle:nth-child(even) {
  background: var(--lightning-cyan);
}

@keyframes floatParticle {
  0%, 100% {
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  50% {
    opacity: 0.6;
    transform: translateY(-20px) scale(1);
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted);
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .random-highlight-modal,
.modal-leave-to .random-highlight-modal {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

/* ===== 移动端响应式 (< 640px) ===== */
@media (max-width: 639px) {
  .random-highlight-overlay {
    padding: var(--spacing-md);
    align-items: flex-start;
    padding-top: 5vh;
  }

  .random-highlight-modal {
    max-width: 100%;
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
  }

  .close-btn {
    width: 44px;
    height: 44px;
    top: var(--spacing-sm);
    right: var(--spacing-sm);
  }

  .modal-header {
    margin-bottom: var(--spacing-lg);
  }

  .modal-title {
    font-size: var(--text-xl);
  }

  .modal-subtitle {
    font-size: var(--text-xs);
  }

  .modal-content {
    min-height: 180px;
    margin-bottom: var(--spacing-lg);
  }

  .loading-state {
    height: 180px;
  }

  .era-badge {
    flex-wrap: wrap;
    font-size: var(--text-xs);
    margin-bottom: var(--spacing-md);
  }

  .highlight-showcase {
    padding: var(--spacing-md);
  }

  .type-badge {
    width: 32px;
    height: 32px;
    font-size: var(--text-sm);
  }

  .highlight-title {
    font-size: var(--text-lg);
    padding-right: 40px;
    margin-bottom: var(--spacing-sm);
  }

  .highlight-desc {
    font-size: var(--text-sm);
    margin-bottom: var(--spacing-sm);
  }

  .highlight-quote {
    font-size: var(--text-sm);
  }

  .modal-actions {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .action-btn {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--text-xs);
    min-height: 44px;
    flex: 1;
    min-width: calc(50% - var(--spacing-sm));
    justify-content: center;
  }

  .action-btn .icon {
    font-size: var(--text-sm);
  }

  .action-btn.goto {
    flex: 1 1 100%;
  }

  .decoration-particles {
    display: none;
  }
}
</style>
