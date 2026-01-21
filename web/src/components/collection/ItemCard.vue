<script setup lang="ts">
import { computed } from 'vue'
import type { CollectibleItem } from '@/types'

const props = defineProps<{
  item: CollectibleItem
  type: 'abilities' | 'treasures' | 'beasts'
}>()

const emit = defineEmits<{
  click: [item: CollectibleItem]
}>()

const typeConfig = computed(() => {
  const configs = {
    abilities: {
      icon: '⚡',
      color: 'var(--spirit-purple)',
      label: '神通'
    },
    treasures: {
      icon: '💎',
      color: 'var(--immortal-gold)',
      label: '法宝'
    },
    beasts: {
      icon: '🐉',
      color: 'var(--lightning-cyan)',
      label: '灵兽'
    }
  }
  return configs[props.type]
})

const eraLabel = computed(() => {
  const eraMap: Record<string, string> = {
    'era-02-entry': '踏入仙途',
    'era-03-demon-sea': '修魔海',
    'era-04-revenge': '血仇得报',
    'era-05-immortal-land': '仙遗之劫',
    'era-06-sky-fortune': '天运星崛起',
    'era-07-luotian': '罗天星域',
    'era-08-thunder': '雷之仙界',
    'era-09-hunt': '天穹令追杀',
    'era-10-war': '界内外大战',
    'era-11-immortal-mansion': '仙府之战',
    'era-12-cloud-sea': '云海星域',
    'era-13-ancient-tomb': '古之墓地',
    'era-14-border-war': '封界之战',
    'era-15-xiangang': '仙罡大陆',
    'era-16-finale': '踏天之路'
  }
  return eraMap[props.item.obtainedEra] || props.item.obtainedEra
})

function handleClick() {
  emit('click', props.item)
}
</script>

<template>
  <div 
    class="item-card glass" 
    :style="{ '--card-color': typeConfig.color }"
    @click="handleClick"
  >
    <div class="card-glow" />
    
    <div class="item-icon">
      {{ typeConfig.icon }}
    </div>
    
    <div class="item-content">
      <h3 class="item-name">{{ item.name }}</h3>
      
      <p v-if="item.description" class="item-desc">
        {{ item.description }}
      </p>
      
      <div class="item-meta">
        <span v-if="item.category" class="meta-category">
          {{ item.category }}
        </span>
        <span class="meta-era">
          <span class="era-icon">📍</span>
          {{ eraLabel }}
        </span>
      </div>
    </div>
    
    <div class="card-arrow">
      <span>→</span>
    </div>
  </div>
</template>

<style scoped>
.item-card {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.05) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.item-card:hover {
  border-color: var(--card-color);
  transform: translateY(-4px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.item-card:hover .card-glow {
  opacity: 1;
}

.item-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-2xl);
  background: var(--cosmos-dark);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.item-card:hover .item-icon {
  border-color: var(--card-color);
  box-shadow: 0 0 20px rgba(var(--card-color), 0.3);
  transform: scale(1.05);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  margin: 0 0 var(--spacing-xs);
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.item-card:hover .item-name {
  color: var(--card-color);
}

.item-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.meta-category {
  font-size: var(--text-xs);
  padding: 2px 10px;
  background: rgba(155, 89, 182, 0.1);
  border: 1px solid var(--card-color);
  border-radius: var(--radius-sm);
  color: var(--card-color);
}

.meta-era {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.era-icon {
  font-size: 10px;
}

.card-arrow {
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%) translateX(10px);
  opacity: 0;
  color: var(--card-color);
  font-size: var(--text-lg);
  transition: all 0.3s ease;
}

.item-card:hover .card-arrow {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}
</style>
