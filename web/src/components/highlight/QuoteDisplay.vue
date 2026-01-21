<script setup lang="ts">
import { computed } from 'vue'
import type { Quote } from '@/types'

const props = defineProps<{
  quote: Quote
  variant?: 'default' | 'featured' | 'compact'
}>()

const emit = defineEmits<{
  share: [quote: Quote]
}>()

const displayVariant = computed(() => props.variant || 'default')

function handleShare() {
  emit('share', props.quote)
}
</script>

<template>
  <div class="quote-display" :class="displayVariant">
    <!-- 装饰引号 -->
    <div class="quote-mark start">"</div>
    
    <div class="quote-content">
      <!-- 台词文本 -->
      <p class="quote-text">{{ quote.text }}</p>
      
      <!-- 说话人和背景 -->
      <div class="quote-meta">
        <span v-if="quote.speaker" class="quote-speaker">
          —— {{ quote.speaker }}
        </span>
        <span v-if="quote.context" class="quote-context">
          · {{ quote.context }}
        </span>
      </div>
    </div>

    <div class="quote-mark end">"</div>

    <!-- 分享按钮 -->
    <button class="share-btn" title="分享" @click="handleShare">
      <span class="icon">📤</span>
    </button>

    <!-- 装饰线 -->
    <div class="quote-decoration" />
  </div>
</template>

<style scoped>
.quote-display {
  position: relative;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
}

.quote-display:hover {
  border-color: var(--immortal-gold-dim);
}

/* 变体样式 */
.quote-display.featured {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, var(--glass-bg) 100%);
  border-color: var(--immortal-gold-dim);
}

.quote-display.compact {
  padding: var(--spacing-md);
}

/* 装饰引号 */
.quote-mark {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  color: var(--immortal-gold);
  opacity: 0.3;
  line-height: 1;
  position: absolute;
}

.quote-mark.start {
  top: var(--spacing-sm);
  left: var(--spacing-md);
}

.quote-mark.end {
  bottom: var(--spacing-sm);
  right: var(--spacing-md);
  transform: rotate(180deg);
}

.quote-display.compact .quote-mark {
  font-size: var(--text-2xl);
}

/* 内容区域 */
.quote-content {
  position: relative;
  z-index: 1;
  padding-left: var(--spacing-md);
}

.quote-text {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  color: var(--text-primary);
  line-height: var(--leading-relaxed);
  margin: 0 0 var(--spacing-md);
  font-style: italic;
}

.quote-display.featured .quote-text {
  font-size: var(--text-xl);
  color: var(--immortal-gold);
}

.quote-display.compact .quote-text {
  font-size: var(--text-base);
  margin-bottom: var(--spacing-sm);
}

/* 元信息 */
.quote-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-sm);
}

.quote-speaker {
  color: var(--lightning-cyan);
  font-weight: 500;
}

.quote-context {
  color: var(--text-muted);
}

/* 分享按钮 */
.share-btn {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: transparent;
  opacity: 0;
  transform: translateX(4px);
  transition: all 0.2s ease;
}

.quote-display:hover .share-btn {
  opacity: 1;
  transform: translateX(0);
}

.share-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.share-btn .icon {
  font-size: var(--text-sm);
}

/* 装饰线 */
.quote-decoration {
  position: absolute;
  left: 0;
  top: 50%;
  width: 3px;
  height: 60%;
  transform: translateY(-50%);
  background: linear-gradient(
    to bottom,
    transparent 0%,
    var(--immortal-gold) 20%,
    var(--immortal-gold) 80%,
    transparent 100%
  );
  border-radius: 2px;
}

.quote-display.compact .quote-decoration {
  height: 50%;
}
</style>
