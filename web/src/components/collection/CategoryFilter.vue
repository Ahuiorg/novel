<script setup lang="ts">
import { computed } from 'vue'

type TabType = 'abilities' | 'treasures' | 'beasts'

interface Tab {
  key: TabType
  label: string
  icon: string
  color: string
}

const props = defineProps<{
  activeTab: TabType
  counts: Record<TabType, number>
}>()

const emit = defineEmits<{
  change: [tab: TabType]
}>()

const tabs: Tab[] = [
  { key: 'abilities', label: '神通', icon: '⚡', color: 'var(--spirit-purple)' },
  { key: 'treasures', label: '法宝', icon: '💎', color: 'var(--immortal-gold)' },
  { key: 'beasts', label: '灵兽', icon: '🐉', color: 'var(--lightning-cyan)' },
]

const totalCount = computed(() => {
  return props.counts.abilities + props.counts.treasures + props.counts.beasts
})

function handleTabClick(tab: TabType) {
  emit('change', tab)
}
</script>

<template>
  <div class="category-filter">
    <div class="filter-header">
      <span class="total-label">全部收集</span>
      <span class="total-count">{{ totalCount }} 项</span>
    </div>
    
    <div class="filter-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="filter-tab"
        :class="{ active: activeTab === tab.key }"
        :style="{ '--tab-color': tab.color }"
        @click="handleTabClick(tab.key)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
        <span class="tab-count">{{ counts[tab.key] }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.category-filter {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
}

.total-label {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.total-count {
  font-family: var(--font-accent);
  font-size: var(--text-sm);
  color: var(--text-primary);
  padding: 2px 8px;
  background: var(--cosmos-dark);
  border-radius: var(--radius-sm);
}

.filter-tabs {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.filter-tab::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--tab-color);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.filter-tab:hover {
  border-color: var(--tab-color);
  color: var(--text-primary);
}

.filter-tab:hover::before {
  transform: scaleX(0.5);
}

.filter-tab.active {
  border-color: var(--tab-color);
  color: var(--tab-color);
  background: rgba(255, 255, 255, 0.05);
}

.filter-tab.active::before {
  transform: scaleX(1);
}

.tab-icon {
  font-size: var(--text-xl);
  transition: transform 0.3s ease;
}

.filter-tab:hover .tab-icon {
  transform: scale(1.1);
}

.filter-tab.active .tab-icon {
  animation: bounce 0.5s ease;
}

.tab-label {
  font-weight: 500;
}

.tab-count {
  font-family: var(--font-accent);
  font-size: var(--text-xs);
  padding: 2px 8px;
  background: var(--cosmos-dark);
  border-radius: var(--radius-sm);
  transition: all 0.3s ease;
}

.filter-tab.active .tab-count {
  background: var(--tab-color);
  color: var(--void-black);
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
</style>
