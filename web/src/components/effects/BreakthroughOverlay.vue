<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import LightningBurst from './LightningBurst.vue'

interface Props {
  visible: boolean
  levelName: string // 境界名称，如"筑基期"
  fromLevel?: string // 原境界
  toLevel?: string // 新境界
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  levelName: '境界突破',
})

const emit = defineEmits<{
  complete: []
  close: []
}>()

// Animation state
const phase = ref<'idle' | 'gathering' | 'burst' | 'reveal' | 'complete'>('idle')
const particles = ref<{ id: number; x: number; y: number; delay: number }[]>([])
const showLightning = ref(false)
const showText = ref(false)
const textChars = ref<string[]>([])

// Container ref
const containerRef = ref<HTMLElement | null>(null)
const energyRingRef = ref<HTMLElement | null>(null)

// Generate particles
function generateParticles() {
  const count = 60
  particles.value = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 0.5,
  }))
}

// Main animation sequence
function playAnimation() {
  if (!containerRef.value) return

  phase.value = 'gathering'
  generateParticles()

  const tl = gsap.timeline({
    onComplete: () => {
      phase.value = 'complete'
      setTimeout(() => {
        emit('complete')
      }, 1000)
    },
  })

  // Phase 1: Gathering energy (particles flow to center)
  tl.to(
    {},
    {
      duration: 1.5,
      onStart: () => {
        // Animate particles gathering
        if (containerRef.value) {
          gsap.to('.breakthrough-particle', {
            x: '50vw',
            y: '50vh',
            scale: 0.5,
            opacity: 0.8,
            duration: 1.5,
            stagger: 0.02,
            ease: 'power2.in',
          })
        }
      },
    }
  )

  // Phase 2: Energy ring expansion
  tl.to(
    {},
    {
      duration: 0.1,
      onStart: () => {
        phase.value = 'burst'
        showLightning.value = true

        if (energyRingRef.value) {
          gsap.fromTo(
            energyRingRef.value,
            { scale: 0, opacity: 1 },
            {
              scale: 3,
              opacity: 0,
              duration: 1,
              ease: 'power2.out',
            }
          )
        }
      },
    }
  )

  // Phase 3: Lightning burst
  tl.to(
    {},
    {
      duration: 0.8,
      onComplete: () => {
        showLightning.value = false
      },
    }
  )

  // Phase 4: Text reveal
  tl.to(
    {},
    {
      duration: 0.1,
      onStart: () => {
        phase.value = 'reveal'
        showText.value = true
        textChars.value = props.levelName.split('')

        // 等待 DOM 更新后再执行动画
        nextTick(() => {
          // Animate each character
          gsap.fromTo(
            '.level-char',
            {
              opacity: 0,
              y: 50,
              rotateX: -90,
              filter: 'blur(10px)',
            },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              filter: 'blur(0px)',
              duration: 0.8,
              stagger: 0.1,
              ease: 'back.out(1.7)',
            }
          )
        })
      },
    }
  )

  // Hold the text
  tl.to({}, { duration: 2 })
}

// Watch for visibility changes
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      phase.value = 'idle'
      particles.value = []
      showLightning.value = false
      showText.value = false

      setTimeout(playAnimation, 100)
    }
  }
)

// Handle escape key
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.visible) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const overlayStyle = computed(() => ({
  opacity: props.visible ? 1 : 0,
  pointerEvents: props.visible ? 'auto' : 'none',
}))
</script>

<template>
  <Teleport to="body">
    <div
      ref="containerRef"
      class="breakthrough-overlay"
      :style="overlayStyle"
      @click="emit('close')"
    >
      <!-- Background gradient -->
      <div class="breakthrough-bg" :class="{ active: phase !== 'idle' }" />

      <!-- Energy particles -->
      <div
        v-for="p in particles"
        :key="p.id"
        class="breakthrough-particle"
        :style="{
          left: `${p.x}%`,
          top: `${p.y}%`,
          animationDelay: `${p.delay}s`,
        }"
      />

      <!-- Energy ring -->
      <div ref="energyRingRef" class="energy-ring" :class="{ active: phase === 'burst' }" />

      <!-- Lightning effect -->
      <LightningBurst v-if="showLightning" />

      <!-- Level name reveal -->
      <div v-if="showText" class="level-text-container">
        <div class="level-subtitle">境界突破</div>
        <div class="level-text">
          <span v-for="(char, index) in textChars" :key="index" class="level-char">
            {{ char }}
          </span>
        </div>
        <div v-if="fromLevel && toLevel" class="level-transition">
          <span class="from-level">{{ fromLevel }}</span>
          <span class="arrow">→</span>
          <span class="to-level">{{ toLevel }}</span>
        </div>
      </div>

      <!-- Skip hint -->
      <div class="skip-hint" :class="{ visible: phase !== 'idle' }">点击任意位置跳过</div>
    </div>
  </Teleport>
</template>

<style scoped>
.breakthrough-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.5s ease;
  overflow: hidden;
}

.breakthrough-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, var(--deep-space) 0%, var(--void-black) 100%);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.breakthrough-bg.active {
  opacity: 1;
}

.breakthrough-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--immortal-gold);
  border-radius: 50%;
  box-shadow:
    0 0 10px var(--immortal-gold),
    0 0 20px var(--immortal-gold-dim);
  animation: particleFloat 2s ease-in-out infinite;
}

.energy-ring {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 3px solid var(--immortal-gold);
  border-radius: 50%;
  box-shadow:
    0 0 30px var(--immortal-gold),
    0 0 60px var(--immortal-gold-dim),
    inset 0 0 30px var(--immortal-gold-dim);
  opacity: 0;
  transform: scale(0);
}

.energy-ring.active {
  opacity: 1;
}

.level-text-container {
  position: relative;
  z-index: 10;
  text-align: center;
  perspective: 1000px;
}

.level-subtitle {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  color: var(--lightning-cyan);
  letter-spacing: 0.3em;
  margin-bottom: var(--spacing-md);
  opacity: 0.8;
  text-shadow: 0 0 20px var(--lightning-cyan);
  animation: fadeIn 0.5s ease forwards;
}

.level-text {
  font-family: var(--font-display);
  font-size: var(--text-7xl);
  color: var(--immortal-gold);
  text-shadow:
    0 0 20px var(--immortal-gold),
    0 0 40px var(--immortal-gold-dim),
    0 0 60px rgba(255, 215, 0, 0.3);
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
}

.level-char {
  display: inline-block;
  transform-style: preserve-3d;
}

.level-transition {
  margin-top: var(--spacing-xl);
  font-family: var(--font-body);
  font-size: var(--text-xl);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  animation: fadeIn 1s ease 0.5s forwards;
  opacity: 0;
}

.from-level {
  color: var(--text-muted);
}

.arrow {
  color: var(--lightning-cyan);
  font-size: var(--text-2xl);
  animation: arrowPulse 1s ease-in-out infinite;
}

.to-level {
  color: var(--immortal-gold);
  font-weight: bold;
}

.skip-hint {
  position: absolute;
  bottom: var(--spacing-2xl);
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--text-sm);
  color: var(--text-muted);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.skip-hint.visible {
  opacity: 0.6;
}

@keyframes particleFloat {
  0%,
  100% {
    opacity: 0.6;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateY(-10px) scale(1.2);
  }
}

@keyframes arrowPulse {
  0%,
  100% {
    transform: translateX(0);
    opacity: 1;
  }
  50% {
    transform: translateX(5px);
    opacity: 0.7;
  }
}
</style>
