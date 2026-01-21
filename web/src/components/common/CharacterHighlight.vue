<script setup lang="ts">
import { computed, ref } from 'vue'
import charactersData from '@/data/characters.json'

const props = defineProps<{
  text: string
}>()

const hoveredCharacter = ref<string | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })

// 获取所有人物名称
const characters = computed(() => charactersData.characters as string[])
const mainCharacter = computed(() => charactersData.mainCharacter as string)

// 构建正则表达式（按名称长度降序排序，避免短名覆盖长名）
const characterPattern = computed(() => {
  const sortedNames = [...characters.value].sort((a, b) => b.length - a.length)
  return new RegExp(`(${sortedNames.join('|')})`, 'g')
})

// 将文本分割成普通文本和人物名称的片段
interface TextSegment {
  type: 'text' | 'character'
  content: string
  isMain?: boolean
}

const segments = computed<TextSegment[]>(() => {
  const result: TextSegment[] = []
  const text = props.text
  let lastIndex = 0
  
  let match: RegExpExecArray | null
  const pattern = new RegExp(characterPattern.value.source, 'g')
  
  while ((match = pattern.exec(text)) !== null) {
    // 添加匹配前的普通文本
    if (match.index > lastIndex) {
      result.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      })
    }
    
    // 添加人物名称
    const name = match[1] ?? ''
    result.push({
      type: 'character',
      content: name,
      isMain: name === mainCharacter.value
    })
    
    lastIndex = pattern.lastIndex
  }
  
  // 添加剩余的普通文本
  if (lastIndex < text.length) {
    result.push({
      type: 'text',
      content: text.slice(lastIndex)
    })
  }
  
  return result
})

// 显示提示
function showTooltip(event: MouseEvent, character: string) {
  hoveredCharacter.value = character
  tooltipPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
}

// 隐藏提示
function hideTooltip() {
  hoveredCharacter.value = null
}

// 获取人物类型描述
function getCharacterRole(name: string): string {
  if (name === mainCharacter.value) return '主角'
  
  // 简单的人物分类（可以后续扩展为从数据中获取）
  const allies = ['司徒南', '清水', '十三', '大头', '孙泰', '刘金彪', '周茹']
  const enemies = ['藤化元', '血祖', '血神子', '虚空子', '古魔塔珈']
  const masters = ['天运子', '青霖', '玄罗', '古道']
  const lovers = ['红蝶', '木冰眉', '西子凤']
  
  if (allies.includes(name)) return '挚友'
  if (enemies.includes(name)) return '仇敌'
  if (masters.includes(name)) return '前辈'
  if (lovers.includes(name)) return '红颜'
  
  return '人物'
}
</script>

<template>
  <span class="character-highlight-container">
    <template v-for="(segment, index) in segments" :key="index">
      <span v-if="segment.type === 'text'" class="plain-text">{{ segment.content }}</span>
      <span
        v-else
        class="character-name"
        :class="{ main: segment.isMain }"
        @mouseenter="showTooltip($event, segment.content)"
        @mouseleave="hideTooltip"
      >
        {{ segment.content }}
      </span>
    </template>
    
    <!-- 悬停提示 -->
    <Teleport to="body">
      <Transition name="tooltip">
        <div
          v-if="hoveredCharacter"
          class="character-tooltip"
          :style="{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 8}px`
          }"
        >
          <span class="tooltip-name">{{ hoveredCharacter }}</span>
          <span class="tooltip-role">{{ getCharacterRole(hoveredCharacter) }}</span>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style scoped>
.character-highlight-container {
  display: inline;
}

.plain-text {
  white-space: pre-wrap;
}

.character-name {
  color: var(--lightning-cyan);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  border-bottom: 1px dotted var(--lightning-cyan-dim);
}

.character-name:hover {
  color: var(--immortal-gold);
  border-bottom-color: var(--immortal-gold-dim);
}

.character-name.main {
  color: var(--immortal-gold);
  font-weight: 500;
  border-bottom-color: var(--immortal-gold-dim);
}

.character-name.main:hover {
  text-shadow: 0 0 8px var(--immortal-gold-dim);
}

/* 悬停提示 */
.character-tooltip {
  position: fixed;
  transform: translate(-50%, -100%);
  background: var(--cosmos-dark);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  pointer-events: none;
  z-index: var(--z-modal);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.tooltip-name {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.tooltip-role {
  font-size: var(--text-xs);
  color: var(--lightning-cyan);
}

/* 提示动画 */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.15s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translate(-50%, -90%);
}
</style>
