<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

const ripples = ref<Ripple[]>([])
let rippleId = 0

function createRipple(e: MouseEvent) {
  const id = rippleId++
  const ripple: Ripple = {
    id,
    x: e.clientX,
    y: e.clientY,
    size: 10 + Math.random() * 20,
  }

  ripples.value.push(ripple)

  // Remove after animation
  setTimeout(() => {
    ripples.value = ripples.value.filter((r) => r.id !== id)
  }, 1000)
}

function handleClick(e: MouseEvent) {
  createRipple(e)
}

onMounted(() => {
  document.addEventListener('click', handleClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClick)
})
</script>

<template>
  <div class="click-ripple-container">
    <TransitionGroup name="ripple">
      <div
        v-for="ripple in ripples"
        :key="ripple.id"
        class="ripple"
        :style="{
          left: `${ripple.x}px`,
          top: `${ripple.y}px`,
          '--size': `${ripple.size}px`,
        }"
      >
        <div class="ripple-ring ripple-ring-1" />
        <div class="ripple-ring ripple-ring-2" />
        <div class="ripple-ring ripple-ring-3" />
        <div class="ripple-center" />
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.click-ripple-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: calc(var(--z-effects) - 1);
  pointer-events: none;
  overflow: hidden;
}

.ripple {
  position: absolute;
  transform: translate(-50%, -50%);
}

.ripple-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--size);
  height: var(--size);
  margin-left: calc(var(--size) / -2);
  margin-top: calc(var(--size) / -2);
  border: 1px solid var(--immortal-gold);
  border-radius: 50%;
  animation: rippleExpand 0.8s ease-out forwards;
}

.ripple-ring-1 {
  animation-delay: 0s;
}

.ripple-ring-2 {
  animation-delay: 0.1s;
  border-color: var(--lightning-cyan);
}

.ripple-ring-3 {
  animation-delay: 0.2s;
  border-color: var(--immortal-gold-dim);
}

.ripple-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  margin: -2px;
  background: var(--immortal-gold);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--immortal-gold);
  animation: rippleCenterPulse 0.5s ease-out forwards;
}

.ripple-enter-active,
.ripple-leave-active {
  transition: opacity 0.3s ease;
}

.ripple-leave-to {
  opacity: 0;
}

@keyframes rippleExpand {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(8);
    opacity: 0;
  }
}

@keyframes rippleCenterPulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}
</style>
