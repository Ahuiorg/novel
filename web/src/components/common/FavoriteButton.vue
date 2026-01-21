<script setup lang="ts">
import { computed } from 'vue'
import type { FavoriteType } from '@/types/favorite'
import { useFavoriteState } from '@/composables/useFavorites'
import { useGlobalAudio } from '@/composables/useAudio'

const props = defineProps<{
  type: FavoriteType
  targetId: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}>()

const emit = defineEmits<{
  change: [isFavorite: boolean]
}>()

const { isFavorite, toggle } = useFavoriteState(props.type, props.targetId)
const audio = useGlobalAudio()

const sizeClass = computed(() => props.size || 'md')

function handleClick() {
  const newState = toggle()
  audio.playClick()
  emit('change', newState)
}
</script>

<template>
  <button
    class="favorite-btn"
    :class="[sizeClass, { active: isFavorite }]"
    :title="isFavorite ? '取消收藏' : '添加收藏'"
    @click.stop="handleClick"
  >
    <span class="star-icon" :class="{ filled: isFavorite }">
      {{ isFavorite ? '★' : '☆' }}
    </span>
    <span v-if="showLabel" class="label">
      {{ isFavorite ? '已收藏' : '收藏' }}
    </span>
    
    <!-- 收藏动画 -->
    <Transition name="sparkle">
      <div v-if="isFavorite" class="sparkle-effect">
        <span class="sparkle" v-for="i in 6" :key="i" />
      </div>
    </Transition>
  </button>
</template>

<style scoped>
.favorite-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: transparent;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: visible;
}

/* 尺寸变体 */
.favorite-btn.sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--text-xs);
}

.favorite-btn.sm .star-icon {
  font-size: var(--text-sm);
}

.favorite-btn.md {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-sm);
}

.favorite-btn.md .star-icon {
  font-size: var(--text-base);
}

.favorite-btn.lg {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--text-base);
}

.favorite-btn.lg .star-icon {
  font-size: var(--text-lg);
}

/* 悬停状态 */
.favorite-btn:hover {
  border-color: var(--immortal-gold-dim);
  color: var(--immortal-gold);
}

/* 激活状态 */
.favorite-btn.active {
  border-color: var(--immortal-gold);
  color: var(--immortal-gold);
  background: rgba(255, 215, 0, 0.1);
}

/* 星星图标 */
.star-icon {
  display: inline-block;
  transition: transform 0.3s ease;
}

.favorite-btn:hover .star-icon {
  transform: scale(1.1);
}

.star-icon.filled {
  animation: starBounce 0.5s ease;
}

@keyframes starBounce {
  0% { transform: scale(1); }
  30% { transform: scale(1.3); }
  50% { transform: scale(0.9); }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* 标签 */
.label {
  white-space: nowrap;
}

/* 闪光效果 */
.sparkle-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  background: var(--immortal-gold);
  border-radius: 50%;
  animation: sparkleOut 0.6s ease-out forwards;
}

.sparkle:nth-child(1) { --angle: 0deg; --distance: 20px; }
.sparkle:nth-child(2) { --angle: 60deg; --distance: 18px; }
.sparkle:nth-child(3) { --angle: 120deg; --distance: 22px; }
.sparkle:nth-child(4) { --angle: 180deg; --distance: 19px; }
.sparkle:nth-child(5) { --angle: 240deg; --distance: 21px; }
.sparkle:nth-child(6) { --angle: 300deg; --distance: 17px; }

@keyframes sparkleOut {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(calc(-1 * var(--distance))) scale(0);
    opacity: 0;
  }
}

/* 过渡动画 */
.sparkle-enter-active {
  transition: opacity 0.1s ease;
}

.sparkle-leave-active {
  transition: opacity 0.3s ease;
}

.sparkle-enter-from,
.sparkle-leave-to {
  opacity: 0;
}
</style>
