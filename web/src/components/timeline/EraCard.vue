<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGlobalAudio } from '@/composables/useAudio'

interface Era {
  id: string
  timeRange: { start: number; end: number }
  title: string
  summary: string
  levelStart: string
  levelEnd: string
}

const props = defineProps<{
  era: Era
  isActive: boolean
  index: number
}>()

const emit = defineEmits<{
  click: [era: Era]
}>()

const audio = useGlobalAudio()
const cardRef = ref<HTMLElement | null>(null)
const isHovered = ref(false)
const mouseX = ref(0)
const mouseY = ref(0)

const yearRange = computed(() => {
  return `仙逆年 ${props.era.timeRange.start} - ${props.era.timeRange.end}`
})

const duration = computed(() => {
  return props.era.timeRange.end - props.era.timeRange.start
})

// 3D tilt effect based on mouse position
const tiltStyle = computed(() => {
  if (!isHovered.value) return {}

  const rotateX = (mouseY.value - 0.5) * -10
  const rotateY = (mouseX.value - 0.5) * 10

  return {
    transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${props.isActive ? 1.02 : 0.88})`,
  }
})

function handleMouseMove(e: MouseEvent) {
  if (!cardRef.value) return

  const rect = cardRef.value.getBoundingClientRect()
  mouseX.value = (e.clientX - rect.left) / rect.width
  mouseY.value = (e.clientY - rect.top) / rect.height
}

function handleMouseEnter() {
  isHovered.value = true
  audio.playHover()
}

function handleMouseLeave() {
  isHovered.value = false
  mouseX.value = 0.5
  mouseY.value = 0.5
}

function handleClick() {
  audio.playClick()
  emit('click', props.era)
}

// Generate floating particles
const particles = ref<{ id: number; x: number; y: number; delay: number }[]>([])

onMounted(() => {
  particles.value = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
  }))
})
</script>

<template>
  <div
    ref="cardRef"
    class="era-card"
    :class="{ active: isActive, hovered: isHovered }"
    :style="tiltStyle"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
    role="button"
    tabindex="0"
    @keydown.enter="handleClick"
  >
    <!-- Floating particles (visible on hover) -->
    <div class="card-particles" :class="{ visible: isHovered || isActive }">
      <div
        v-for="p in particles"
        :key="p.id"
        class="particle"
        :style="{
          left: `${p.x}%`,
          top: `${p.y}%`,
          animationDelay: `${p.delay}s`,
        }"
      />
    </div>

    <!-- Glow effect -->
    <div class="card-glow" />

    <!-- Shine sweep effect -->
    <div class="card-shine" :class="{ active: isHovered }" />

    <div class="card-content">
      <div class="era-number">{{ String(index + 1).padStart(2, '0') }}</div>

      <div class="era-year">{{ yearRange }}</div>

      <h3 class="era-title">{{ era.title }}</h3>

      <p class="era-summary">{{ era.summary }}</p>

      <div class="era-levels">
        <div class="level-badge start">
          <span class="level-label">始</span>
          <span class="level-value">{{ era.levelStart }}</span>
        </div>
        <div class="level-arrow">→</div>
        <div class="level-badge end">
          <span class="level-label">终</span>
          <span class="level-value">{{ era.levelEnd }}</span>
        </div>
      </div>

      <div class="era-duration">
        <span class="duration-value">{{ duration }}</span>
        <span class="duration-unit">年</span>
      </div>
    </div>

    <div class="card-border" />
  </div>
</template>

<style scoped>
.era-card {
  position: relative;
  width: 380px;
  min-width: 380px;
  height: 500px;
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center center;
  transform-style: preserve-3d;
  scroll-snap-align: center; /* 吸附到中心 */
  background: transparent; /* 确保透明，不遮挡星星 */
}

.era-card:not(.active) {
  transform: scale(0.85);
  opacity: 0.6;
  filter: brightness(0.7);
}

.era-card.active {
  transform: scale(1);
  opacity: 1;
}

.era-card.hovered {
  z-index: 10;
}

/* Floating particles */
.card-particles {
  position: absolute;
  inset: -20px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.5s ease;
  background: transparent; /* 确保透明 */
}

.card-particles.visible {
  opacity: 1;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--immortal-gold);
  border-radius: 50%;
  box-shadow: 0 0 6px var(--immortal-gold);
  animation: particleFloat 3s ease-in-out infinite;
}

.particle:nth-child(even) {
  background: var(--lightning-cyan);
  box-shadow: 0 0 6px var(--lightning-cyan);
}

@keyframes particleFloat {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-15px) scale(1.2);
    opacity: 1;
  }
}

/* Glow effect */
.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.era-card.active .card-glow {
  opacity: 1;
}

.era-card.hovered .card-glow {
  opacity: 0.7;
}

/* Shine sweep effect */
.card-shine {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: var(--radius-lg);
  pointer-events: none;
}

.card-shine::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: skewX(-25deg);
  transition: none;
}

.card-shine.active::before {
  animation: shineSweep 0.8s ease-out;
}

@keyframes shineSweep {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}

.card-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  transition: border-color 0.3s ease;
}

.era-card.active .card-content {
  border-color: var(--immortal-gold-dim);
}

.era-number {
  font-family: var(--font-accent);
  font-size: var(--text-6xl);
  font-weight: 700;
  color: var(--immortal-gold);
  opacity: 0.2;
  line-height: 1;
  margin-bottom: var(--spacing-sm);
}

.era-card.active .era-number {
  opacity: 0.4;
}

.era-year {
  font-family: var(--font-accent);
  font-size: var(--text-base);
  color: var(--lightning-cyan);
  letter-spacing: 0.1em;
  margin-bottom: var(--spacing-md);
}

.era-title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md);
  line-height: var(--leading-tight);
}

.era-card.active .era-title {
  background: linear-gradient(135deg, var(--immortal-gold) 0%, var(--lightning-cyan) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.era-summary {
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.era-levels {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--glass-border);
}

.level-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.level-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-bottom: var(--spacing-xs);
}

.level-value {
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--text-primary);
  text-align: center;
}

.level-arrow {
  color: var(--immortal-gold);
  font-size: var(--text-lg);
}

.era-duration {
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.duration-value {
  font-family: var(--font-accent);
  font-size: var(--text-xl);
  color: var(--lightning-cyan);
  font-weight: 600;
}

.duration-unit {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.card-border {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-lg);
  border: 2px solid transparent;
  pointer-events: none;
  transition: border-color 0.3s ease;
}

.era-card.active .card-border {
  border-color: var(--immortal-gold);
  box-shadow: var(--glow-gold);
}

/* ===== 超大屏幕 (≥1440px) ===== */
@media (min-width: 1440px) {
  .era-card {
    width: 420px;
    min-width: 420px;
    height: 540px;
  }

  .era-number {
    font-size: 4.5rem;
  }

  .era-title {
    font-size: var(--text-4xl);
  }

  .era-summary {
    font-size: var(--text-lg);
    -webkit-line-clamp: 5;
  }
}

/* ===== 中等屏幕 (768px - 1023px) ===== */
@media (min-width: 768px) and (max-width: 1023px) {
  .era-card {
    width: 340px;
    min-width: 340px;
    height: 460px;
  }

  .era-number {
    font-size: var(--text-5xl);
  }

  .era-title {
    font-size: var(--text-2xl);
  }
}

/* ===== 平板竖屏 (640px - 767px) ===== */
@media (min-width: 640px) and (max-width: 767px) {
  .era-card {
    width: 320px;
    min-width: 320px;
    height: 420px;
  }

  .era-number {
    font-size: var(--text-5xl);
  }

  .era-title {
    font-size: var(--text-2xl);
  }

  .era-summary {
    font-size: var(--text-sm);
  }
}

/* ===== 移动端响应式 (< 640px) ===== */
@media (max-width: 639px) {
  .era-card {
    width: min(300px, calc(100vw - 40px));
    min-width: min(300px, calc(100vw - 40px));
    height: 400px;
    padding: var(--spacing-md);
  }

  .era-card:not(.active) {
    transform: scale(0.88);
  }

  .card-content {
    padding: var(--spacing-md);
  }

  .era-number {
    font-size: var(--text-4xl);
    margin-bottom: var(--spacing-xs);
  }

  .era-year {
    font-size: var(--text-sm);
    margin-bottom: var(--spacing-sm);
  }

  .era-title {
    font-size: var(--text-xl);
    margin-bottom: var(--spacing-sm);
  }

  .era-summary {
    font-size: var(--text-sm);
    -webkit-line-clamp: 3;
  }

  .era-levels {
    margin-top: var(--spacing-sm);
    padding-top: var(--spacing-sm);
    gap: var(--spacing-xs);
  }

  .level-value {
    font-size: var(--text-sm);
  }

  .level-arrow {
    font-size: var(--text-base);
  }

  .era-duration {
    top: var(--spacing-md);
    right: var(--spacing-md);
  }

  .duration-value {
    font-size: var(--text-base);
  }
}
</style>
