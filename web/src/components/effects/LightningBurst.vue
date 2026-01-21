<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface LightningBolt {
  id: number
  points: string
  delay: number
  duration: number
  opacity: number
}

const bolts = ref<LightningBolt[]>([])
const canvas = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null

// Generate random lightning path
function generateLightningPath(startX: number, startY: number, endX: number, endY: number): string {
  const points: [number, number][] = [[startX, startY]]
  const segments = 8 + Math.floor(Math.random() * 6)

  for (let i = 1; i < segments; i++) {
    const t = i / segments
    const baseX = startX + (endX - startX) * t
    const baseY = startY + (endY - startY) * t
    const offsetX = (Math.random() - 0.5) * 100
    const offsetY = (Math.random() - 0.5) * 50
    points.push([baseX + offsetX, baseY + offsetY])
  }

  points.push([endX, endY])

  return points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ')
}

// Generate multiple lightning bolts
function generateBolts() {
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2
  const newBolts: LightningBolt[] = []

  // Main bolts from edges to center
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const radius = Math.max(window.innerWidth, window.innerHeight)
    const startX = centerX + Math.cos(angle) * radius
    const startY = centerY + Math.sin(angle) * radius

    newBolts.push({
      id: i,
      points: generateLightningPath(startX, startY, centerX, centerY),
      delay: Math.random() * 0.2,
      duration: 0.3 + Math.random() * 0.3,
      opacity: 0.7 + Math.random() * 0.3,
    })
  }

  // Secondary bolts
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2
    const startRadius = Math.max(window.innerWidth, window.innerHeight) * 0.5
    const endRadius = Math.random() * 100

    const startX = centerX + Math.cos(angle) * startRadius
    const startY = centerY + Math.sin(angle) * startRadius
    const endX = centerX + Math.cos(angle + (Math.random() - 0.5) * 0.5) * endRadius
    const endY = centerY + Math.sin(angle + (Math.random() - 0.5) * 0.5) * endRadius

    newBolts.push({
      id: 8 + i,
      points: generateLightningPath(startX, startY, endX, endY),
      delay: 0.1 + Math.random() * 0.3,
      duration: 0.2 + Math.random() * 0.2,
      opacity: 0.4 + Math.random() * 0.4,
    })
  }

  bolts.value = newBolts
}

// Canvas-based electric field effect
function drawElectricField() {
  if (!canvas.value) return

  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  canvas.value.width = window.innerWidth
  canvas.value.height = window.innerHeight

  const centerX = canvas.value.width / 2
  const centerY = canvas.value.height / 2
  const time = Date.now() * 0.001

  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  // Draw radial energy lines
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)'
  ctx.lineWidth = 1

  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 2 + time * 0.5
    const wobble = Math.sin(time * 3 + i) * 20

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)

    const endX = centerX + Math.cos(angle) * (300 + wobble)
    const endY = centerY + Math.sin(angle) * (300 + wobble)

    ctx.lineTo(endX, endY)
    ctx.stroke()
  }

  // Draw pulsing circles
  for (let i = 0; i < 5; i++) {
    const radius = ((time * 100 + i * 60) % 300) + 50
    const alpha = 1 - radius / 350

    ctx.strokeStyle = `rgba(255, 215, 0, ${alpha * 0.5})`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.stroke()
  }

  animationId = requestAnimationFrame(drawElectricField)
}

onMounted(() => {
  generateBolts()
  drawElectricField()

  // Regenerate bolts periodically
  const interval = setInterval(generateBolts, 150)

  onUnmounted(() => {
    clearInterval(interval)
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  })
})
</script>

<template>
  <div class="lightning-burst">
    <!-- Canvas for electric field -->
    <canvas ref="canvas" class="electric-field" />

    <!-- SVG Lightning bolts -->
    <svg class="lightning-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <filter id="lightning-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#lightning-glow)">
        <path
          v-for="bolt in bolts"
          :key="bolt.id"
          :d="bolt.points"
          class="lightning-bolt"
          :style="{
            animationDelay: `${bolt.delay}s`,
            animationDuration: `${bolt.duration}s`,
            opacity: bolt.opacity,
          }"
        />
      </g>
    </svg>

    <!-- Flash overlay -->
    <div class="flash-overlay" />

    <!-- Center burst -->
    <div class="center-burst">
      <div class="burst-core" />
      <div class="burst-ring burst-ring-1" />
      <div class="burst-ring burst-ring-2" />
      <div class="burst-ring burst-ring-3" />
    </div>
  </div>
</template>

<style scoped>
.lightning-burst {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.electric-field {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.6;
}

.lightning-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.lightning-bolt {
  fill: none;
  stroke: var(--lightning-cyan);
  stroke-width: 2px;
  stroke-linecap: round;
  stroke-linejoin: round;
  animation: lightningFlash 0.3s ease-out forwards;
}

.flash-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  opacity: 0;
  animation: flash 0.5s ease-out forwards;
}

.center-burst {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.burst-core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px;
  background: white;
  border-radius: 50%;
  box-shadow:
    0 0 30px var(--immortal-gold),
    0 0 60px var(--immortal-gold),
    0 0 90px var(--lightning-cyan);
  animation: burstCore 0.8s ease-out forwards;
}

.burst-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 3px solid var(--immortal-gold);
  border-radius: 50%;
  box-shadow: 0 0 20px var(--immortal-gold);
  animation: burstRing 1s ease-out forwards;
}

.burst-ring-1 {
  width: 100px;
  height: 100px;
  margin: -50px;
  animation-delay: 0s;
}

.burst-ring-2 {
  width: 150px;
  height: 150px;
  margin: -75px;
  animation-delay: 0.1s;
  border-color: var(--lightning-cyan);
  box-shadow: 0 0 20px var(--lightning-cyan);
}

.burst-ring-3 {
  width: 200px;
  height: 200px;
  margin: -100px;
  animation-delay: 0.2s;
}

@keyframes lightningFlash {
  0% {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    opacity: 1;
  }
  50% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0;
  }
}

@keyframes flash {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
  }
}

@keyframes burstCore {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    transform: scale(3);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

@keyframes burstRing {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}
</style>
