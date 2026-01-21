<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGlobalAudio } from '@/composables/useAudio'

const audio = useGlobalAudio()

const isExpanded = ref(false)
const hasInteracted = ref(false)

// Initialize audio on first user interaction
function handleFirstInteraction() {
  if (hasInteracted.value) return
  hasInteracted.value = true
  audio.initialize()

  // Auto-play ambient if music enabled
  if (audio.isMusicEnabled.value) {
    audio.playAmbient('ambient_cosmos')
  }
}

// Toggle expand
function toggleExpand() {
  isExpanded.value = !isExpanded.value
  audio.playClick()
}

// Toggle music
function toggleMusic() {
  audio.toggleMusic()
  audio.playClick()
}

// Toggle SFX
function toggleSfx() {
  audio.toggleSfx()
  audio.playClick()
}

// Volume slider handler
function handleMasterVolume(e: Event) {
  const target = e.target as HTMLInputElement
  audio.setMasterVolume(parseFloat(target.value))
}

function handleMusicVolume(e: Event) {
  const target = e.target as HTMLInputElement
  audio.setMusicVolume(parseFloat(target.value))
}

function handleSfxVolume(e: Event) {
  const target = e.target as HTMLInputElement
  audio.setSfxVolume(parseFloat(target.value))
}

// Listen for first interaction
onMounted(() => {
  const events = ['click', 'touchstart', 'keydown']
  const handler = () => {
    handleFirstInteraction()
    events.forEach((event) => document.removeEventListener(event, handler))
  }
  events.forEach((event) => document.addEventListener(event, handler, { once: true }))
})

const volumeIcon = computed(() => {
  if (!audio.isMusicEnabled.value && !audio.isSfxEnabled.value) return '🔇'
  if (audio.masterVolume.value > 0.5) return '🔊'
  if (audio.masterVolume.value > 0) return '🔉'
  return '🔈'
})
</script>

<template>
  <div class="audio-control" :class="{ expanded: isExpanded }">
    <!-- Main toggle button -->
    <button class="audio-toggle" @click="toggleExpand" :title="isExpanded ? '收起音量控制' : '展开音量控制'">
      <span class="volume-icon">{{ volumeIcon }}</span>
    </button>

    <!-- Expanded panel -->
    <Transition name="panel">
      <div v-if="isExpanded" class="audio-panel">
        <div class="panel-header">
          <span>音效设置</span>
        </div>

        <!-- Master volume -->
        <div class="control-row">
          <label>总音量</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            :value="audio.masterVolume.value"
            @input="handleMasterVolume"
          />
          <span class="volume-value">{{ Math.round(audio.masterVolume.value * 100) }}%</span>
        </div>

        <!-- Music toggle and volume -->
        <div class="control-row">
          <button
            class="toggle-btn"
            :class="{ active: audio.isMusicEnabled.value }"
            @click="toggleMusic"
          >
            {{ audio.isMusicEnabled.value ? '🎵' : '🚫' }}
          </button>
          <label>背景音乐</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            :value="audio.musicVolume.value"
            :disabled="!audio.isMusicEnabled.value"
            @input="handleMusicVolume"
          />
        </div>

        <!-- SFX toggle and volume -->
        <div class="control-row">
          <button
            class="toggle-btn"
            :class="{ active: audio.isSfxEnabled.value }"
            @click="toggleSfx"
          >
            {{ audio.isSfxEnabled.value ? '🔔' : '🚫' }}
          </button>
          <label>音效</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            :value="audio.sfxVolume.value"
            :disabled="!audio.isSfxEnabled.value"
            @input="handleSfxVolume"
          />
        </div>

        <!-- Hint -->
        <div class="panel-hint">
          设置将自动保存
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.audio-control {
  position: fixed;
  bottom: 80px;
  right: var(--spacing-lg);
  z-index: calc(var(--z-nav) + 10);
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-end;
  gap: var(--spacing-sm);
}

.audio-toggle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-normal) ease;
  box-shadow: var(--glow-subtle);
}

.audio-toggle:hover {
  border-color: var(--immortal-gold-dim);
  box-shadow: var(--glow-gold);
  transform: scale(1.05);
}

.volume-icon {
  font-size: var(--text-xl);
}

.audio-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  min-width: 240px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.panel-header {
  font-family: var(--font-display);
  font-size: var(--text-base);
  color: var(--immortal-gold);
  text-align: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--glass-border);
}

.control-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.control-row label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  min-width: 60px;
}

.control-row input[type="range"] {
  flex: 1;
  height: 4px;
  background: var(--nebula-blue);
  border-radius: 2px;
  cursor: pointer;
  accent-color: var(--immortal-gold);
}

.control-row input[type="range"]:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.volume-value {
  font-size: var(--text-xs);
  color: var(--text-muted);
  min-width: 35px;
  text-align: right;
}

.toggle-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--deep-space);
  border: 1px solid var(--glass-border);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
  font-size: var(--text-sm);
}

.toggle-btn.active {
  background: var(--immortal-gold-dim);
  border-color: var(--immortal-gold);
}

.panel-hint {
  font-size: var(--text-xs);
  color: var(--text-muted);
  text-align: center;
  margin-top: var(--spacing-sm);
  opacity: 0.6;
}

/* Panel transition */
.panel-enter-active,
.panel-leave-active {
  transition: all var(--duration-normal) ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}
</style>
