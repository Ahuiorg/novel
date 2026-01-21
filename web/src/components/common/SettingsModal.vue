<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useGlobalAudio } from '@/composables/useAudio'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const settingsStore = useSettingsStore()
const audio = useGlobalAudio()

// 本地状态（用于实时预览）
const soundEnabled = ref(settingsStore.soundEnabled)
const soundVolume = ref(settingsStore.soundVolume)
const animationLevel = ref(settingsStore.animationLevel)
const particleDensity = ref(settingsStore.particleDensity)

// 动画等级选项
const animationLevels = [
  { value: 'full', label: '完整', desc: '所有动画效果' },
  { value: 'reduced', label: '简洁', desc: '减少部分动画' },
  { value: 'minimal', label: '最小', desc: '仅保留必要动画' },
] as const

// 粒子密度选项
const particleDensities = [
  { value: 'high', label: '高', desc: '5000 粒子' },
  { value: 'medium', label: '中', desc: '2500 粒子' },
  { value: 'low', label: '低', desc: '1000 粒子' },
] as const

// 同步设置到 store
watch(soundEnabled, (value) => {
  settingsStore.setSoundEnabled(value)
  if (value) {
    audio.playClick()
  }
})

watch(soundVolume, (value) => {
  settingsStore.setSoundVolume(value)
})

watch(animationLevel, (value) => {
  settingsStore.setAnimationLevel(value)
})

watch(particleDensity, (value) => {
  settingsStore.setParticleDensity(value)
})

// 重置所有设置
function resetSettings() {
  if (confirm('确定要重置所有设置吗？')) {
    settingsStore.resetToDefaults()
    soundEnabled.value = settingsStore.soundEnabled
    soundVolume.value = settingsStore.soundVolume
    animationLevel.value = settingsStore.animationLevel
    particleDensity.value = settingsStore.particleDensity
  }
}

// 关闭弹窗
function handleClose() {
  emit('close')
}

// 点击背景关闭
function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    handleClose()
  }
}

// 同步初始值
onMounted(() => {
  soundEnabled.value = settingsStore.soundEnabled
  soundVolume.value = settingsStore.soundVolume
  animationLevel.value = settingsStore.animationLevel
  particleDensity.value = settingsStore.particleDensity
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="visible" 
        class="settings-overlay"
        @click="handleBackdropClick"
        @keydown.esc="handleClose"
      >
        <div class="settings-modal">
          <!-- 头部 -->
          <div class="modal-header">
            <h2 class="modal-title">⚙️ 设置</h2>
            <button class="close-btn" @click="handleClose" aria-label="关闭">
              ✕
            </button>
          </div>
          
          <!-- 设置内容 -->
          <div class="settings-content">
            <!-- 音效设置 -->
            <section class="settings-section">
              <h3 class="section-title">🔊 音效</h3>
              
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">启用音效</span>
                  <span class="setting-desc">开启交互音效和环境音</span>
                </div>
                <label class="switch">
                  <input v-model="soundEnabled" type="checkbox" />
                  <span class="slider" />
                </label>
              </div>
              
              <div class="setting-item" :class="{ disabled: !soundEnabled }">
                <div class="setting-info">
                  <span class="setting-label">音量</span>
                  <span class="setting-value">{{ Math.round(soundVolume * 100) }}%</span>
                </div>
                <input
                  v-model.number="soundVolume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  class="range-slider"
                  :disabled="!soundEnabled"
                />
              </div>
            </section>
            
            <!-- 动画设置 -->
            <section class="settings-section">
              <h3 class="section-title">✨ 动画</h3>
              
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">动画强度</span>
                  <span class="setting-desc">调整动画效果的复杂程度</span>
                </div>
              </div>
              
              <div class="option-group">
                <button
                  v-for="level in animationLevels"
                  :key="level.value"
                  class="option-btn"
                  :class="{ active: animationLevel === level.value }"
                  @click="animationLevel = level.value"
                >
                  <span class="option-label">{{ level.label }}</span>
                  <span class="option-desc">{{ level.desc }}</span>
                </button>
              </div>
            </section>
            
            <!-- 性能设置 -->
            <section class="settings-section">
              <h3 class="section-title">🚀 性能</h3>
              
              <div class="setting-item">
                <div class="setting-info">
                  <span class="setting-label">粒子密度</span>
                  <span class="setting-desc">调整背景星空粒子数量</span>
                </div>
              </div>
              
              <div class="option-group">
                <button
                  v-for="density in particleDensities"
                  :key="density.value"
                  class="option-btn"
                  :class="{ active: particleDensity === density.value }"
                  @click="particleDensity = density.value"
                >
                  <span class="option-label">{{ density.label }}</span>
                  <span class="option-desc">{{ density.desc }}</span>
                </button>
              </div>
            </section>
          </div>
          
          <!-- 底部操作 -->
          <div class="modal-footer">
            <button class="reset-btn" @click="resetSettings">
              重置默认
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 遮罩层 */
.settings-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 5, 16, 0.9);
  backdrop-filter: blur(8px);
  z-index: var(--z-modal);
  padding: var(--spacing-xl);
}

/* 弹窗 */
.settings-modal {
  width: 100%;
  max-width: 480px;
  background: var(--cosmos-dark);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

/* 头部 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--glass-border);
}

.modal-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;
  color: var(--text-muted);
  font-size: var(--text-lg);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

/* 内容 */
.settings-content {
  padding: var(--spacing-lg) var(--spacing-xl);
  max-height: 60vh;
  overflow-y: auto;
}

/* 设置分区 */
.settings-section {
  margin-bottom: var(--spacing-xl);
}

.settings-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0 0 var(--spacing-md);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 设置项 */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) 0;
  transition: opacity 0.2s ease;
}

.setting-item.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-label {
  font-size: var(--text-base);
  color: var(--text-primary);
}

.setting-desc {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.setting-value {
  font-size: var(--text-xs);
  color: var(--lightning-cyan);
}

/* 开关 */
.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 28px;
  transition: all 0.3s ease;
}

.slider::before {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  left: 2px;
  top: 2px;
  background: var(--text-secondary);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.switch input:checked + .slider {
  background: rgba(255, 215, 0, 0.2);
  border-color: var(--immortal-gold-dim);
}

.switch input:checked + .slider::before {
  background: var(--immortal-gold);
  transform: translateX(20px);
}

/* 滑块 */
.range-slider {
  width: 120px;
  height: 4px;
  appearance: none;
  background: var(--glass-bg);
  border-radius: 2px;
  outline: none;
}

.range-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--immortal-gold);
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

/* 选项组 */
.option-group {
  display: flex;
  gap: var(--spacing-sm);
}

.option-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--spacing-md);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.option-btn:hover {
  border-color: var(--immortal-gold-dim);
}

.option-btn.active {
  background: rgba(255, 215, 0, 0.1);
  border-color: var(--immortal-gold);
}

.option-label {
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.option-btn.active .option-label {
  color: var(--immortal-gold);
}

.option-desc {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* 底部 */
.modal-footer {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md) var(--spacing-xl) var(--spacing-lg);
  border-top: 1px solid var(--glass-border);
}

.reset-btn {
  font-size: var(--text-sm);
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.reset-btn:hover {
  color: var(--blood-crimson);
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .settings-modal,
.modal-leave-to .settings-modal {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* ===== 移动端响应式 (< 640px) ===== */
@media (max-width: 639px) {
  .settings-overlay {
    padding: var(--spacing-md);
    align-items: flex-start;
    padding-top: 10vh;
  }

  .settings-modal {
    max-width: 100%;
    border-radius: var(--radius-lg);
  }

  .modal-header {
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .modal-title {
    font-size: var(--text-lg);
  }

  .close-btn {
    width: 44px;
    height: 44px;
  }

  .settings-content {
    padding: var(--spacing-md) var(--spacing-lg);
    max-height: 50vh;
  }

  .settings-section {
    margin-bottom: var(--spacing-lg);
  }

  .section-title {
    font-size: var(--text-xs);
    margin-bottom: var(--spacing-sm);
  }

  .setting-item {
    padding: var(--spacing-sm) 0;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .setting-label {
    font-size: var(--text-sm);
  }

  .setting-desc {
    font-size: 10px;
  }

  .range-slider {
    width: 100px;
  }

  .option-group {
    gap: var(--spacing-xs);
  }

  .option-btn {
    padding: var(--spacing-sm);
  }

  .option-label {
    font-size: var(--text-xs);
  }

  .option-desc {
    font-size: 10px;
    display: none;
  }

  .modal-footer {
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .reset-btn {
    min-height: 44px;
    padding: var(--spacing-sm) var(--spacing-lg);
  }
}
</style>
