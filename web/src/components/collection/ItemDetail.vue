<script setup lang="ts">
import { computed, watch } from 'vue'
import type { CollectibleItem } from '@/types'

const props = defineProps<{
  item: CollectibleItem | null
  type: 'abilities' | 'treasures' | 'beasts'
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  navigate: [eraId: string]
}>()

const typeConfig = computed(() => {
  const configs = {
    abilities: {
      icon: '⚡',
      color: 'var(--spirit-purple)',
      label: '神通',
      bgGradient: 'linear-gradient(135deg, rgba(155, 89, 182, 0.2) 0%, transparent 100%)'
    },
    treasures: {
      icon: '💎',
      color: 'var(--immortal-gold)',
      label: '法宝',
      bgGradient: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, transparent 100%)'
    },
    beasts: {
      icon: '🐉',
      color: 'var(--lightning-cyan)',
      label: '灵兽',
      bgGradient: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, transparent 100%)'
    }
  }
  return configs[props.type]
})

const eraInfo = computed(() => {
  if (!props.item) return null
  
  const eraMap: Record<string, { name: string; year: string }> = {
    'era-02-entry': { name: '踏入仙途', year: '仙逆年 15-101' },
    'era-03-demon-sea': { name: '修魔海历练', year: '仙逆年 102-410' },
    'era-04-revenge': { name: '血仇得报', year: '仙逆年 411-530' },
    'era-05-immortal-land': { name: '仙遗之劫', year: '仙逆年 530-600' },
    'era-06-sky-fortune': { name: '天运星崛起', year: '仙逆年 600-800' },
    'era-07-luotian': { name: '罗天星域', year: '仙逆年 800-1050' },
    'era-08-thunder': { name: '雷之仙界', year: '仙逆年 1050-1120' },
    'era-09-hunt': { name: '天穹令追杀', year: '仙逆年 1120-1170' },
    'era-10-war': { name: '界内外大战', year: '仙逆年 1170-1252' },
    'era-11-immortal-mansion': { name: '仙府之战', year: '仙逆年 1252-1300' },
    'era-12-cloud-sea': { name: '云海星域', year: '仙逆年 1300-1428' },
    'era-13-ancient-tomb': { name: '古之墓地', year: '仙逆年 1428-1453' },
    'era-14-border-war': { name: '封界之战', year: '仙逆年 1454-1533' },
    'era-15-xiangang': { name: '仙罡大陆', year: '仙逆年 1534-1987' },
    'era-16-finale': { name: '踏天之路', year: '仙逆年 1988-2288' }
  }
  return eraMap[props.item.obtainedEra] || { name: props.item.obtainedEra, year: '' }
})

// Lock body scroll when modal is visible
watch(() => props.visible, (visible) => {
  if (visible) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

function handleClose() {
  emit('close')
}

function handleNavigate() {
  if (props.item) {
    emit('navigate', props.item.obtainedEra)
  }
}

function handleBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
    handleClose()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="visible && item" 
        class="modal-backdrop" 
        @click="handleBackdropClick"
      >
        <div 
          class="modal-content glass"
          :style="{ '--detail-color': typeConfig.color, '--detail-bg': typeConfig.bgGradient }"
        >
          <button class="close-btn" @click="handleClose">
            <span>✕</span>
          </button>
          
          <div class="modal-header">
            <div class="item-icon">
              {{ typeConfig.icon }}
            </div>
            <div class="item-title">
              <span class="item-type">{{ typeConfig.label }}</span>
              <h2>{{ item.name }}</h2>
            </div>
          </div>
          
          <div class="modal-body">
            <div v-if="item.description" class="description-section">
              <h3>描述</h3>
              <p>{{ item.description }}</p>
            </div>
            
            <div v-if="item.category" class="category-section">
              <h3>分类</h3>
              <span class="category-tag">{{ item.category }}</span>
            </div>
            
            <div class="era-section">
              <h3>获取时期</h3>
              <div class="era-card" @click="handleNavigate">
                <div class="era-info">
                  <span class="era-name">{{ eraInfo?.name }}</span>
                  <span class="era-year">{{ eraInfo?.year }}</span>
                </div>
                <span class="era-arrow">查看详情 →</span>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="action-btn" @click="handleClose">
              关闭
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-xl);
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: var(--radius-xl);
  border-color: var(--detail-color);
  background: var(--detail-bg), var(--glass-bg);
}

.close-btn {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cosmos-dark);
  border: 1px solid var(--glass-border);
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  border-color: var(--detail-color);
  color: var(--detail-color);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--glass-border);
}

.item-icon {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-4xl);
  background: var(--cosmos-dark);
  border: 2px solid var(--detail-color);
  border-radius: var(--radius-lg);
  box-shadow: 0 0 30px rgba(var(--detail-color), 0.3);
}

.item-title {
  flex: 1;
}

.item-type {
  display: inline-block;
  padding: 2px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--detail-color);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--detail-color);
  margin-bottom: var(--spacing-xs);
}

.item-title h2 {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  margin: 0;
  color: var(--text-primary);
}

.modal-body {
  padding: var(--spacing-xl);
}

.modal-body h3 {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0 0 var(--spacing-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.description-section {
  margin-bottom: var(--spacing-xl);
}

.description-section p {
  color: var(--text-secondary);
  line-height: 1.8;
  margin: 0;
}

.category-section {
  margin-bottom: var(--spacing-xl);
}

.category-tag {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--detail-color);
  border-radius: var(--radius-md);
  color: var(--detail-color);
}

.era-section {
  margin-bottom: var(--spacing-lg);
}

.era-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--cosmos-dark);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.era-card:hover {
  border-color: var(--immortal-gold);
  background: rgba(255, 215, 0, 0.05);
}

.era-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.era-name {
  font-family: var(--font-display);
  color: var(--text-primary);
}

.era-year {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.era-arrow {
  font-size: var(--text-sm);
  color: var(--immortal-gold);
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.era-card:hover .era-arrow {
  opacity: 1;
  transform: translateX(0);
}

.modal-footer {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--glass-border);
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  padding: var(--spacing-sm) var(--spacing-xl);
  background: var(--cosmos-dark);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  border-color: var(--detail-color);
  color: var(--detail-color);
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}
</style>
