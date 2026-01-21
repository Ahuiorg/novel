<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import type { Highlight, Quote, Era } from '@/types'

type ShareContent = 
  | { type: 'highlight'; highlight: Highlight; era: Era }
  | { type: 'quote'; quote: Quote; era: Era }
  | { type: 'era'; era: Era }

type CardSize = 'square' | 'portrait' | 'landscape'

const props = defineProps<{
  visible: boolean
  content: ShareContent
}>()

const emit = defineEmits<{
  close: []
}>()

const cardRef = ref<HTMLDivElement | null>(null)
const selectedSize = ref<CardSize>('portrait')
const isGenerating = ref(false)
const generatedImage = ref<string | null>(null)

const sizeOptions: { key: CardSize; label: string; ratio: string }[] = [
  { key: 'portrait', label: '竖版', ratio: '4:5' },
  { key: 'square', label: '方形', ratio: '1:1' },
  { key: 'landscape', label: '横版', ratio: '16:9' },
]

// 获取类型标签
const typeLabel = computed(() => {
  if (props.content.type !== 'highlight') return null
  const labels = {
    epic: '燃',
    emotional: '泪',
    cool: '爽',
  }
  return labels[props.content.highlight.type]
})

// 生成分享图片
async function generateImage() {
  if (!cardRef.value) return
  
  isGenerating.value = true
  
  try {
    // 动态导入 html2canvas
    const html2canvas = (await import('html2canvas')).default
    
    const canvas = await html2canvas(cardRef.value, {
      backgroundColor: '#050510',
      scale: 2,
      useCORS: true,
      logging: false,
    })
    
    generatedImage.value = canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Failed to generate image:', error)
    alert('生成图片失败，请稍后重试')
  } finally {
    isGenerating.value = false
  }
}

// 下载图片
function downloadImage() {
  if (!generatedImage.value) return
  
  const link = document.createElement('a')
  link.download = `xianni-${props.content.type}-${Date.now()}.png`
  link.href = generatedImage.value
  link.click()
}

// 复制图片到剪贴板
async function copyImage() {
  if (!generatedImage.value) return
  
  try {
    const response = await fetch(generatedImage.value)
    const blob = await response.blob()
    
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])
    
    alert('图片已复制到剪贴板')
  } catch (error) {
    console.error('Failed to copy image:', error)
    alert('复制失败，请尝试下载图片')
  }
}

// 关闭弹窗
function handleClose() {
  generatedImage.value = null
  emit('close')
}

// 点击背景关闭
function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    handleClose()
  }
}

// 切换尺寸
function selectSize(size: CardSize) {
  selectedSize.value = size
  generatedImage.value = null
}

onMounted(() => {
  if (props.visible) {
    nextTick(() => generateImage())
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="visible" 
        class="share-overlay" 
        @click="handleBackdropClick"
        @keydown.esc="handleClose"
      >
        <div class="share-modal">
          <!-- 关闭按钮 -->
          <button class="close-btn" @click="handleClose" aria-label="关闭">
            ✕
          </button>
          
          <!-- 标题 -->
          <div class="modal-header">
            <h2 class="modal-title">生成分享卡片</h2>
          </div>
          
          <!-- 尺寸选择 -->
          <div class="size-selector">
            <button
              v-for="option in sizeOptions"
              :key="option.key"
              class="size-btn"
              :class="{ active: selectedSize === option.key }"
              @click="selectSize(option.key)"
            >
              <span class="size-label">{{ option.label }}</span>
              <span class="size-ratio">{{ option.ratio }}</span>
            </button>
          </div>
          
          <!-- 预览区域 -->
          <div class="preview-area">
            <!-- 卡片内容（用于生成图片） -->
            <div 
              ref="cardRef" 
              class="share-card" 
              :class="selectedSize"
            >
              <div class="card-bg" />
              
              <div class="card-header">
                <span class="brand">✨ 仙逆 · 编年史 ✨</span>
              </div>
              
              <div class="card-content">
                <!-- 名场面 -->
                <template v-if="content.type === 'highlight'">
                  <div class="type-badge" :class="content.highlight.type">
                    {{ typeLabel }}
                  </div>
                  <h3 class="content-title">{{ content.highlight.title }}</h3>
                  <p class="content-desc">{{ content.highlight.description }}</p>
                  <blockquote v-if="content.highlight.quote" class="content-quote">
                    「{{ content.highlight.quote }}」
                  </blockquote>
                </template>
                
                <!-- 经典台词 -->
                <template v-else-if="content.type === 'quote'">
                  <blockquote class="quote-main">
                    「{{ content.quote.text }}」
                  </blockquote>
                  <div v-if="content.quote.speaker" class="quote-speaker">
                    —— {{ content.quote.speaker }}
                  </div>
                </template>
                
                <!-- 纪元 -->
                <template v-else-if="content.type === 'era'">
                  <h3 class="era-title">{{ content.era.title }}</h3>
                  <p class="era-summary">{{ content.era.summary }}</p>
                  <div class="era-level">
                    境界：{{ content.era.levelProgress.mainBody }}
                  </div>
                </template>
              </div>
              
              <div class="card-footer">
                <span class="era-info">
                  📍 仙逆年 {{ content.era.timeRange.start }} - {{ content.era.timeRange.end }}
                </span>
                <span class="watermark">仙逆编年史</span>
              </div>
              
              <!-- 装饰元素 -->
              <div class="decoration-corner top-left" />
              <div class="decoration-corner top-right" />
              <div class="decoration-corner bottom-left" />
              <div class="decoration-corner bottom-right" />
            </div>
            
            <!-- 生成的图片预览 -->
            <div v-if="generatedImage" class="image-preview">
              <img :src="generatedImage" alt="分享卡片" />
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="modal-actions">
            <button 
              class="action-btn generate" 
              @click="generateImage" 
              :disabled="isGenerating"
            >
              <span class="icon">{{ isGenerating ? '⏳' : '🎨' }}</span>
              <span class="label">{{ isGenerating ? '生成中...' : '重新生成' }}</span>
            </button>
            <button 
              class="action-btn download" 
              @click="downloadImage"
              :disabled="!generatedImage"
            >
              <span class="icon">💾</span>
              <span class="label">下载图片</span>
            </button>
            <button 
              class="action-btn copy" 
              @click="copyImage"
              :disabled="!generatedImage"
            >
              <span class="icon">📋</span>
              <span class="label">复制图片</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 遮罩层 */
.share-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 5, 16, 0.95);
  backdrop-filter: blur(8px);
  z-index: var(--z-modal);
  padding: var(--spacing-xl);
  overflow-y: auto;
}

/* 弹窗 */
.share-modal {
  position: relative;
  width: 100%;
  max-width: 800px;
  background: var(--cosmos-dark);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
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

/* 标题 */
.modal-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.modal-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  color: var(--text-primary);
  margin: 0;
}

/* 尺寸选择器 */
.size-selector {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.size-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.size-btn:hover {
  border-color: var(--immortal-gold-dim);
}

.size-btn.active {
  background: rgba(255, 215, 0, 0.1);
  border-color: var(--immortal-gold);
  color: var(--immortal-gold);
}

.size-label {
  font-size: var(--text-sm);
}

.size-ratio {
  font-size: var(--text-xs);
  opacity: 0.7;
}

/* 预览区域 */
.preview-area {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-xl);
  min-height: 300px;
}

/* 分享卡片样式 */
.share-card {
  position: relative;
  background: linear-gradient(135deg, #0a0a1f 0%, #1a1a3e 100%);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 32px;
  color: #e8e8f0;
  font-family: 'ZCOOL XiaoWei', 'Noto Serif SC', serif;
}

.share-card.portrait {
  width: 320px;
  height: 400px;
}

.share-card.square {
  width: 320px;
  height: 320px;
}

.share-card.landscape {
  width: 480px;
  height: 270px;
}

/* 卡片背景 */
.card-bg {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at 20% 30%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(0, 212, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

/* 卡片头部 */
.card-header {
  text-align: center;
  margin-bottom: 16px;
}

.brand {
  font-size: 14px;
  color: #ffd700;
  letter-spacing: 2px;
}

/* 卡片内容 */
.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.type-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
}

.type-badge.epic {
  background: rgba(255, 100, 100, 0.3);
  color: #ff6464;
}

.type-badge.emotional {
  background: rgba(100, 150, 255, 0.3);
  color: #6496ff;
}

.type-badge.cool {
  background: rgba(100, 255, 150, 0.3);
  color: #64ff96;
}

.content-title, .era-title {
  font-size: 20px;
  margin: 0 0 12px;
  color: #ffd700;
}

.content-desc, .era-summary {
  font-size: 14px;
  color: #8888aa;
  line-height: 1.6;
  margin: 0 0 12px;
}

.content-quote, .quote-main {
  font-style: italic;
  color: #ffd700;
  border-left: 2px solid rgba(255, 215, 0, 0.5);
  padding-left: 12px;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.quote-main {
  font-size: 18px;
  text-align: center;
  border: none;
  padding: 0;
}

.quote-speaker {
  text-align: center;
  color: #00d4ff;
  margin-top: 16px;
  font-size: 14px;
}

.era-level {
  font-size: 12px;
  color: #00d4ff;
}

/* 卡片底部 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
  font-size: 12px;
}

.era-info {
  color: #00d4ff;
}

.watermark {
  color: rgba(255, 255, 255, 0.3);
  font-size: 10px;
}

/* 装饰角 */
.decoration-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.decoration-corner.top-left {
  top: 8px;
  left: 8px;
  border-right: none;
  border-bottom: none;
}

.decoration-corner.top-right {
  top: 8px;
  right: 8px;
  border-left: none;
  border-bottom: none;
}

.decoration-corner.bottom-left {
  bottom: 8px;
  left: 8px;
  border-right: none;
  border-top: none;
}

.decoration-corner.bottom-right {
  bottom: 8px;
  right: 8px;
  border-left: none;
  border-top: none;
}

/* 图片预览 */
.image-preview {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cosmos-dark);
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

/* 操作按钮 */
.modal-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
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

.action-btn.generate {
  background: rgba(255, 215, 0, 0.15);
  color: var(--immortal-gold);
  border: 1px solid var(--immortal-gold-dim);
}

.action-btn.generate:hover:not(:disabled) {
  background: rgba(255, 215, 0, 0.25);
}

.action-btn.download {
  background: rgba(0, 212, 255, 0.15);
  color: var(--lightning-cyan);
  border: 1px solid var(--lightning-cyan-dim);
}

.action-btn.download:hover:not(:disabled) {
  background: rgba(0, 212, 255, 0.25);
}

.action-btn.copy {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border: 1px solid var(--glass-border);
}

.action-btn.copy:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
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

.modal-enter-from .share-modal,
.modal-leave-to .share-modal {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

/* ===== 移动端响应式 (< 640px) ===== */
@media (max-width: 639px) {
  .share-overlay {
    padding: var(--spacing-md);
    align-items: flex-start;
    padding-top: 3vh;
  }

  .share-modal {
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
    margin-bottom: var(--spacing-md);
  }

  .modal-title {
    font-size: var(--text-lg);
  }

  .size-selector {
    margin-bottom: var(--spacing-lg);
    gap: var(--spacing-xs);
  }

  .size-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .size-label {
    font-size: var(--text-xs);
  }

  .size-ratio {
    font-size: 10px;
  }

  .preview-area {
    margin-bottom: var(--spacing-lg);
    min-height: 250px;
  }

  .share-card {
    transform: scale(0.85);
    transform-origin: top center;
  }

  .share-card.portrait {
    width: 280px;
    height: 350px;
  }

  .share-card.square {
    width: 280px;
    height: 280px;
  }

  .share-card.landscape {
    width: 340px;
    height: 190px;
  }

  .modal-actions {
    gap: var(--spacing-sm);
  }

  .action-btn {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--text-xs);
    min-height: 44px;
    flex: 1;
  }

  .action-btn .icon {
    font-size: var(--text-sm);
  }

  .action-btn .label {
    display: none;
  }
}

/* ===== 中等屏幕 (640px - 767px) ===== */
@media (min-width: 640px) and (max-width: 767px) {
  .share-modal {
    max-width: 600px;
    padding: var(--spacing-xl);
  }
}
</style>
