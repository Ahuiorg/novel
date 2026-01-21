<script setup lang="ts">
import { computed } from 'vue'

interface EraMarker {
  id: string
  title: string
  levelEnd: string
  position: number // percentage
}

const props = defineProps<{
  markers: EraMarker[]
  currentIndex: number
  progress: number
}>()

const emit = defineEmits<{
  markerClick: [index: number]
}>()

const indicatorStyle = computed(() => ({
  '--indicator-position': `${props.progress}%`,
}))

function handleMarkerClick(index: number) {
  emit('markerClick', index)
}
</script>

<template>
  <div class="timeline-rail">
    <div class="rail-track">
      <div class="rail-fill" :style="{ width: `${progress}%` }" />
    </div>
    
    <div class="rail-markers">
      <button
        v-for="(marker, index) in markers"
        :key="marker.id"
        class="rail-marker"
        :class="{ 
          active: index === currentIndex,
          passed: index < currentIndex 
        }"
        :style="{ left: `${marker.position}%` }"
        @click="handleMarkerClick(index)"
        :title="`${marker.title} - ${marker.levelEnd}`"
      >
        <div class="marker-dot" />
        <div class="marker-label">{{ marker.levelEnd }}</div>
      </button>
    </div>
    
    <div class="rail-indicator" :style="indicatorStyle" />
  </div>
</template>

<style scoped>
.timeline-rail {
  position: relative;
  width: 100%;
  height: 60px;
  padding: 0 var(--spacing-xl);
}

.rail-track {
  position: absolute;
  top: 16px; /* 圆点中心在18px，轨道高度4px，所以16px让轨道中心对齐圆点中心 */
  left: var(--spacing-xl);
  right: var(--spacing-xl);
  height: 4px;
  background: var(--nebula-blue);
  border-radius: 2px;
  overflow: hidden;
}

.rail-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--immortal-gold) 0%, var(--lightning-cyan) 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.rail-markers {
  position: absolute;
  top: 0;
  left: var(--spacing-xl);
  right: var(--spacing-xl);
  height: 100%;
}

.rail-marker {
  position: absolute;
  top: 12px;
  transform: translateX(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--cosmos-dark);
  border: 2px solid var(--nebula-blue);
  transition: all 0.3s ease;
}

.rail-marker.passed .marker-dot {
  background: var(--immortal-gold);
  border-color: var(--immortal-gold);
}

.rail-marker.active .marker-dot {
  background: var(--lightning-cyan);
  border-color: var(--lightning-cyan);
  box-shadow: 0 0 10px var(--lightning-cyan);
  transform: scale(1.3);
}

.marker-label {
  margin-top: var(--spacing-sm);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--text-muted);
  white-space: nowrap;
  opacity: 0;
  transform: translateY(-5px);
  transition: all 0.3s ease;
}

.rail-marker:hover .marker-label,
.rail-marker.active .marker-label {
  opacity: 1;
  transform: translateY(0);
}

.rail-marker.active .marker-label {
  color: var(--lightning-cyan);
}

.rail-indicator {
  position: absolute;
  top: 26px; /* 轨道底部(16+4=20px) + 6px间距 */
  left: var(--spacing-xl);
  right: var(--spacing-xl);
  height: 0;
  pointer-events: none;
}

.rail-indicator::before {
  content: '';
  position: absolute;
  left: var(--indicator-position, 0%);
  transform: translateX(-50%);
  transition: left 0.3s ease;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 8px solid var(--immortal-gold);
}

/* ===== 移动端响应式 (< 640px) ===== */
@media (max-width: 639px) {
  .timeline-rail {
    height: 40px;
    padding: 0 var(--spacing-sm);
  }

  .rail-track {
    top: 12px;
    left: var(--spacing-sm);
    right: var(--spacing-sm);
    height: 3px;
  }

  .rail-markers {
    left: var(--spacing-sm);
    right: var(--spacing-sm);
  }

  .rail-marker {
    top: 8px;
  }

  .marker-dot {
    width: 10px;
    height: 10px;
  }

  .rail-marker.active .marker-dot {
    transform: scale(1.2);
  }

  /* 移动端隐藏标签，仅保留圆点 */
  .marker-label {
    display: none;
  }

  .rail-indicator {
    top: 20px;
    left: var(--spacing-sm);
    right: var(--spacing-sm);
  }

  .rail-indicator::before {
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 6px solid var(--immortal-gold);
  }
}

/* ===== 中等屏幕 (640px - 767px) ===== */
@media (min-width: 640px) and (max-width: 767px) {
  .timeline-rail {
    height: 50px;
    padding: 0 var(--spacing-md);
  }

  .rail-track {
    left: var(--spacing-md);
    right: var(--spacing-md);
  }

  .rail-markers {
    left: var(--spacing-md);
    right: var(--spacing-md);
  }

  .rail-indicator {
    left: var(--spacing-md);
    right: var(--spacing-md);
  }

  /* 平板上显示当前标签 */
  .marker-label {
    font-size: 10px;
  }
}
</style>
