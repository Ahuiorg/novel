<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

interface TrailPoint {
  x: number
  y: number
  id: number
  velocityX: number
  velocityY: number
  hue: number
}

const mouseX = ref(0)
const mouseY = ref(0)
const isVisible = ref(false)
const trail = ref<TrailPoint[]>([])
const velocity = ref({ x: 0, y: 0 })

let trailId = 0
const TRAIL_LENGTH = 12
const TRAIL_INTERVAL = 30

let lastTrailTime = 0
let lastMouseX = 0
let lastMouseY = 0
let lastMoveTime = Date.now()

function handleMouseMove(e: MouseEvent) {
  const now = Date.now()
  const dt = Math.max(1, now - lastMoveTime)

  // Calculate velocity
  velocity.value.x = (e.clientX - lastMouseX) / dt * 16
  velocity.value.y = (e.clientY - lastMouseY) / dt * 16

  lastMouseX = e.clientX
  lastMouseY = e.clientY
  lastMoveTime = now

  mouseX.value = e.clientX
  mouseY.value = e.clientY
  isVisible.value = true

  if (now - lastTrailTime > TRAIL_INTERVAL) {
    lastTrailTime = now

    // Calculate hue based on velocity (faster = more cyan, slower = more gold)
    const speed = Math.sqrt(velocity.value.x ** 2 + velocity.value.y ** 2)
    const hue = Math.min(speed * 2, 60) // 0 = gold, 60 = cyan range

    trail.value.push({
      x: e.clientX,
      y: e.clientY,
      id: trailId++,
      velocityX: velocity.value.x,
      velocityY: velocity.value.y,
      hue,
    })

    if (trail.value.length > TRAIL_LENGTH) {
      trail.value.shift()
    }
  }
}

function handleMouseLeave() {
  isVisible.value = false
  trail.value = []
}

const followerStyle = computed(() => ({
  transform: `translate(${mouseX.value}px, ${mouseY.value}px)`,
  opacity: isVisible.value ? 1 : 0,
}))

// Calculate rotation based on velocity
const rotation = computed(() => {
  if (velocity.value.x === 0 && velocity.value.y === 0) return 0
  return Math.atan2(velocity.value.y, velocity.value.x) * (180 / Math.PI)
})

// Calculate scale based on speed
const speedScale = computed(() => {
  const speed = Math.sqrt(velocity.value.x ** 2 + velocity.value.y ** 2)
  return 1 + Math.min(speed * 0.02, 0.5)
})

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseleave', handleMouseLeave)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseleave', handleMouseLeave)
})
</script>

<template>
  <div class="mouse-follower-container">
    <!-- Trail particles -->
    <TransitionGroup name="trail">
      <div
        v-for="(point, index) in trail"
        :key="point.id"
        class="trail-particle"
        :class="{ fast: Math.abs(point.velocityX) + Math.abs(point.velocityY) > 5 }"
        :style="{
          transform: `translate(${point.x}px, ${point.y}px) scale(${((index + 1) / TRAIL_LENGTH) * 0.8})`,
          opacity: ((index + 1) / TRAIL_LENGTH) * 0.6,
          '--hue': point.hue,
        }"
      />
    </TransitionGroup>

    <!-- Speed lines (visible when moving fast) -->
    <div
      v-if="Math.abs(velocity.x) + Math.abs(velocity.y) > 8"
      class="speed-line"
      :style="{
        transform: `translate(${mouseX - 20}px, ${mouseY - 20}px) rotate(${rotation}deg)`,
        opacity: Math.min((Math.abs(velocity.x) + Math.abs(velocity.y)) * 0.05, 0.8),
      }"
    />

    <!-- Main follower -->
    <div class="mouse-follower" :style="followerStyle">
      <div
        class="follower-inner"
        :style="{
          transform: `scale(${speedScale})`,
        }"
      />
      <div class="follower-ring" />
      <div class="follower-outer-ring" />
    </div>
  </div>
</template>

<style scoped>
.mouse-follower-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: var(--z-effects);
  pointer-events: none;
  overflow: hidden;
}

.mouse-follower {
  position: absolute;
  top: 0;
  left: 0;
  width: 24px;
  height: 24px;
  margin-left: -12px;
  margin-top: -12px;
  transition: opacity 0.3s ease;
}

.follower-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  background: radial-gradient(
    circle,
    white 0%,
    var(--immortal-gold) 30%,
    rgba(255, 215, 0, 0.5) 60%,
    transparent 100%
  );
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
  transition: transform 0.1s ease-out;
}

.follower-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24px;
  height: 24px;
  margin: -12px 0 0 -12px;
  border: 1px solid var(--immortal-gold-dim);
  border-radius: 50%;
  animation: ringPulse 2s ease-in-out infinite;
}

.follower-outer-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 36px;
  height: 36px;
  margin: -18px 0 0 -18px;
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 50%;
  animation: outerRingPulse 3s ease-in-out infinite;
}

.trail-particle {
  position: absolute;
  top: 0;
  left: 0;
  width: 8px;
  height: 8px;
  margin-left: -4px;
  margin-top: -4px;
  background: radial-gradient(
    circle,
    hsl(calc(40 + var(--hue, 0)), 100%, 60%) 0%,
    hsl(calc(40 + var(--hue, 0)), 100%, 50%) 40%,
    transparent 100%
  );
  border-radius: 50%;
  transition: opacity 0.15s ease-out;
  box-shadow: 0 0 6px hsl(calc(40 + var(--hue, 0)), 100%, 50%);
}

.trail-particle.fast {
  width: 10px;
  height: 10px;
  margin-left: -5px;
  margin-top: -5px;
}

.speed-line {
  position: absolute;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--lightning-cyan), transparent);
  border-radius: 2px;
  filter: blur(1px);
}

.trail-enter-active,
.trail-leave-active {
  transition: all 0.2s ease;
}

.trail-enter-from,
.trail-leave-to {
  opacity: 0 !important;
  transform: scale(0) !important;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    filter: brightness(1);
  }
  50% {
    opacity: 0.8;
    filter: brightness(1.3);
  }
}

@keyframes ringPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.2;
  }
}

@keyframes outerRingPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.1;
  }
}
</style>
