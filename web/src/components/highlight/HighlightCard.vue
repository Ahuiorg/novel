<script setup lang="ts">
import { computed } from 'vue'
import type { Highlight } from '@/types'

const props = defineProps<{
  highlight: Highlight
  eraTitle?: string
  eraId?: string
  showEraInfo?: boolean
  compact?: boolean
}>()

const emit = defineEmits<{
  share: [highlight: Highlight]
  favorite: [highlight: Highlight]
}>()

const typeLabel = computed(() => {
  const labels = {
    epic: '燃',
    emotional: '泪',
    cool: '爽',
  }
  return labels[props.highlight.type]
})

const typeClass = computed(() => props.highlight.type)

function handleShare() {
  emit('share', props.highlight)
}

function handleFavorite() {
  emit('favorite', props.highlight)
}
</script>

<template>
  <div class="highlight-card" :class="[typeClass, { compact }]">
    <!-- 类型标签 -->
    <div class="type-badge" :class="typeClass">
      {{ typeLabel }}
    </div>

    <!-- 主要内容 -->
    <div class="card-body">
      <h3 class="highlight-title">{{ highlight.title }}</h3>
      
      <p class="highlight-desc">{{ highlight.description }}</p>

      <!-- 经典台词引用 -->
      <blockquote v-if="highlight.quote" class="highlight-quote">
        「{{ highlight.quote }}」
      </blockquote>

      <!-- 纪元信息 -->
      <div v-if="showEraInfo && eraTitle" class="era-info">
        <span class="era-label">📍</span>
        <span class="era-title">{{ eraTitle }}</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="card-actions">
      <button class="action-btn share" title="分享" @click="handleShare">
        <span class="icon">📤</span>
      </button>
      <button class="action-btn favorite" title="收藏" @click="handleFavorite">
        <span class="icon">⭐</span>
      </button>
    </div>

    <!-- 装饰光效 -->
    <div class="card-glow" />
  </div>
</template>

<style scoped>
.highlight-card {
  position: relative;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  overflow: hidden;
  transition: all 0.3s ease;
}

.highlight-card:hover {
  border-color: var(--immortal-gold-dim);
  transform: translateY(-2px);
}

.highlight-card.compact {
  padding: var(--spacing-md);
}

/* 类型特定边框颜色 */
.highlight-card.epic {
  border-left: 3px solid #ff6464;
}

.highlight-card.emotional {
  border-left: 3px solid #6496ff;
}

.highlight-card.cool {
  border-left: 3px solid #64ff96;
}

/* 类型标签 */
.type-badge {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: var(--text-sm);
  font-weight: 700;
  transition: transform 0.2s ease;
}

.type-badge.epic {
  background: rgba(255, 100, 100, 0.2);
  color: #ff6464;
  box-shadow: 0 0 12px rgba(255, 100, 100, 0.3);
}

.type-badge.emotional {
  background: rgba(100, 150, 255, 0.2);
  color: #6496ff;
  box-shadow: 0 0 12px rgba(100, 150, 255, 0.3);
}

.type-badge.cool {
  background: rgba(100, 255, 150, 0.2);
  color: #64ff96;
  box-shadow: 0 0 12px rgba(100, 255, 150, 0.3);
}

.highlight-card:hover .type-badge {
  transform: scale(1.1);
}

/* 卡片内容 */
.card-body {
  padding-right: 48px;
}

.highlight-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm);
  line-height: var(--leading-tight);
}

.highlight-card.compact .highlight-title {
  font-size: var(--text-lg);
}

.highlight-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0 0 var(--spacing-md);
}

/* 引用台词 */
.highlight-quote {
  font-family: var(--font-display);
  font-style: italic;
  color: var(--immortal-gold);
  border-left: 2px solid var(--immortal-gold-dim);
  padding-left: var(--spacing-md);
  margin: 0 0 var(--spacing-md);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

/* 纪元信息 */
.era-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: var(--spacing-sm);
}

.era-label {
  font-size: var(--text-sm);
}

.era-title {
  color: var(--lightning-cyan);
}

/* 操作按钮 */
.card-actions {
  position: absolute;
  bottom: var(--spacing-md);
  right: var(--spacing-md);
  display: flex;
  gap: var(--spacing-xs);
  opacity: 0;
  transform: translateY(4px);
  transition: all 0.2s ease;
}

.highlight-card:hover .card-actions {
  opacity: 1;
  transform: translateY(0);
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.action-btn .icon {
  font-size: var(--text-sm);
}

/* 光效 */
.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top left, rgba(255, 215, 0, 0.05) 0%, transparent 50%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.highlight-card:hover .card-glow {
  opacity: 1;
}
</style>
