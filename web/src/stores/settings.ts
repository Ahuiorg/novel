import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'xianni-settings'

export type AnimationLevel = 'full' | 'reduced' | 'minimal'
export type ParticleDensity = 'high' | 'medium' | 'low'

interface SettingsState {
  soundEnabled: boolean
  soundVolume: number
  animationLevel: AnimationLevel
  particleDensity: ParticleDensity
}

const defaultSettings: SettingsState = {
  soundEnabled: true,
  soundVolume: 0.5,
  animationLevel: 'full',
  particleDensity: 'medium',
}

export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const soundEnabled = ref(defaultSettings.soundEnabled)
  const soundVolume = ref(defaultSettings.soundVolume)
  const animationLevel = ref<AnimationLevel>(defaultSettings.animationLevel)
  const particleDensity = ref<ParticleDensity>(defaultSettings.particleDensity)
  
  // 粒子数量映射
  const particleCountMap: Record<ParticleDensity, number> = {
    high: 5000,
    medium: 2500,
    low: 1000,
  }
  
  // 计算属性
  function getParticleCount(): number {
    return particleCountMap[particleDensity.value]
  }
  
  function shouldReduceMotion(): boolean {
    return animationLevel.value === 'minimal'
  }
  
  // 设置方法
  function setSoundEnabled(value: boolean) {
    soundEnabled.value = value
    saveSettings()
  }
  
  function setSoundVolume(value: number) {
    soundVolume.value = Math.max(0, Math.min(1, value))
    saveSettings()
  }
  
  function setAnimationLevel(value: AnimationLevel) {
    animationLevel.value = value
    saveSettings()
  }
  
  function setParticleDensity(value: ParticleDensity) {
    particleDensity.value = value
    saveSettings()
  }
  
  // 重置为默认值
  function resetToDefaults() {
    soundEnabled.value = defaultSettings.soundEnabled
    soundVolume.value = defaultSettings.soundVolume
    animationLevel.value = defaultSettings.animationLevel
    particleDensity.value = defaultSettings.particleDensity
    saveSettings()
  }
  
  // 从 localStorage 加载设置
  function loadSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored) as Partial<SettingsState>
        if (typeof data.soundEnabled === 'boolean') soundEnabled.value = data.soundEnabled
        if (typeof data.soundVolume === 'number') soundVolume.value = data.soundVolume
        if (data.animationLevel) animationLevel.value = data.animationLevel
        if (data.particleDensity) particleDensity.value = data.particleDensity
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }
  
  // 保存设置到 localStorage
  function saveSettings() {
    try {
      const data: SettingsState = {
        soundEnabled: soundEnabled.value,
        soundVolume: soundVolume.value,
        animationLevel: animationLevel.value,
        particleDensity: particleDensity.value,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }
  
  // 初始化时加载设置
  loadSettings()
  
  return {
    // 状态
    soundEnabled,
    soundVolume,
    animationLevel,
    particleDensity,
    
    // 计算
    getParticleCount,
    shouldReduceMotion,
    
    // 方法
    setSoundEnabled,
    setSoundVolume,
    setAnimationLevel,
    setParticleDensity,
    resetToDefaults,
    loadSettings,
    saveSettings,
  }
})
