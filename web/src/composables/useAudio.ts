// 仙逆编年史 - 音效系统
import { ref, computed, watch, onUnmounted } from 'vue'
import { Howl, Howler } from 'howler'

// Audio settings interface
interface AudioSettings {
  masterVolume: number
  musicVolume: number
  sfxVolume: number
  musicEnabled: boolean
  sfxEnabled: boolean
}

// Default settings
const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 0.7,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  musicEnabled: true,
  sfxEnabled: true,
}

// Global audio state
const settings = ref<AudioSettings>(loadSettings())
const isInitialized = ref(false)
const currentAmbient = ref<Howl | null>(null)

// Sound cache
const soundCache = new Map<string, Howl>()

// Load settings from localStorage
function loadSettings(): AudioSettings {
  try {
    const saved = localStorage.getItem('xianni-audio-settings')
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
    }
  } catch (e) {
    console.warn('Failed to load audio settings:', e)
  }
  return { ...DEFAULT_SETTINGS }
}

// Save settings to localStorage
function saveSettings() {
  try {
    localStorage.setItem('xianni-audio-settings', JSON.stringify(settings.value))
  } catch (e) {
    console.warn('Failed to save audio settings:', e)
  }
}

// Watch settings changes
watch(settings, saveSettings, { deep: true })

// Sound file paths
const SOUNDS = {
  // Ambient / Music
  ambient_cosmos: '/audio/ambient/cosmos.mp3',
  ambient_void: '/audio/ambient/void.mp3',

  // UI interactions
  click: '/audio/sfx/click.mp3',
  hover: '/audio/sfx/hover.mp3',
  whoosh: '/audio/sfx/whoosh.mp3',

  // Breakthrough effects
  breakthrough_start: '/audio/sfx/breakthrough_start.mp3',
  breakthrough_burst: '/audio/sfx/breakthrough_burst.mp3',
  breakthrough_complete: '/audio/sfx/breakthrough_complete.mp3',

  // Navigation
  page_enter: '/audio/sfx/page_enter.mp3',
  page_exit: '/audio/sfx/page_exit.mp3',

  // Special effects
  lightning: '/audio/sfx/lightning.mp3',
  energy_gather: '/audio/sfx/energy_gather.mp3',
  spirit_flow: '/audio/sfx/spirit_flow.mp3',
} as const

type SoundName = keyof typeof SOUNDS

// Create or get cached sound
function getSound(name: SoundName): Howl | null {
  if (soundCache.has(name)) {
    return soundCache.get(name)!
  }

  const path = SOUNDS[name]
  if (!path) return null

  const isAmbient = name.startsWith('ambient_')
  const sound = new Howl({
    src: [path],
    loop: isAmbient,
    volume: isAmbient ? settings.value.musicVolume : settings.value.sfxVolume,
    preload: true,
    html5: isAmbient, // Use HTML5 for ambient to allow streaming
  })

  soundCache.set(name, sound)
  return sound
}

// Main composable
export function useAudio() {
  // Initialize audio context on user interaction
  function initialize() {
    if (isInitialized.value) return

    // Resume audio context if suspended
    Howler.ctx?.resume()
    isInitialized.value = true
  }

  // Play a sound effect
  function playSfx(name: SoundName, volume?: number) {
    if (!settings.value.sfxEnabled) return

    const sound = getSound(name)
    if (!sound) return

    const vol = (volume ?? 1) * settings.value.sfxVolume * settings.value.masterVolume
    sound.volume(vol)
    sound.play()
  }

  // Play ambient music
  function playAmbient(name: SoundName = 'ambient_cosmos', fadeIn = 2000) {
    if (!settings.value.musicEnabled) return

    // Stop current ambient
    if (currentAmbient.value) {
      const oldAmbient = currentAmbient.value
      oldAmbient.fade(oldAmbient.volume(), 0, fadeIn)
      setTimeout(() => oldAmbient.stop(), fadeIn)
    }

    const sound = getSound(name)
    if (!sound) return

    currentAmbient.value = sound
    const targetVol = settings.value.musicVolume * settings.value.masterVolume
    sound.volume(0)
    sound.play()
    sound.fade(0, targetVol, fadeIn)
  }

  // Stop ambient music
  function stopAmbient(fadeOut = 2000) {
    if (!currentAmbient.value) return

    const ambient = currentAmbient.value
    ambient.fade(ambient.volume(), 0, fadeOut)
    setTimeout(() => {
      ambient.stop()
      currentAmbient.value = null
    }, fadeOut)
  }

  // Toggle music
  function toggleMusic(enabled?: boolean) {
    settings.value.musicEnabled = enabled ?? !settings.value.musicEnabled

    if (settings.value.musicEnabled) {
      playAmbient()
    } else {
      stopAmbient()
    }
  }

  // Toggle SFX
  function toggleSfx(enabled?: boolean) {
    settings.value.sfxEnabled = enabled ?? !settings.value.sfxEnabled
  }

  // Set volumes
  function setMasterVolume(volume: number) {
    settings.value.masterVolume = Math.max(0, Math.min(1, volume))
    Howler.volume(settings.value.masterVolume)
  }

  function setMusicVolume(volume: number) {
    settings.value.musicVolume = Math.max(0, Math.min(1, volume))

    if (currentAmbient.value) {
      currentAmbient.value.volume(settings.value.musicVolume * settings.value.masterVolume)
    }
  }

  function setSfxVolume(volume: number) {
    settings.value.sfxVolume = Math.max(0, Math.min(1, volume))
  }

  // Breakthrough sound sequence
  function playBreakthroughSequence() {
    if (!settings.value.sfxEnabled) return

    // Energy gathering
    playSfx('energy_gather')

    // Lightning burst after 1.5s
    setTimeout(() => {
      playSfx('lightning')
      playSfx('breakthrough_burst', 0.8)
    }, 1500)

    // Complete sound after 2.5s
    setTimeout(() => {
      playSfx('breakthrough_complete')
    }, 2500)
  }

  // UI sound helpers
  function playClick() {
    playSfx('click', 0.5)
  }

  function playHover() {
    playSfx('hover', 0.3)
  }

  function playPageTransition(direction: 'enter' | 'exit') {
    playSfx(direction === 'enter' ? 'page_enter' : 'page_exit', 0.6)
  }

  // Computed properties
  const isMusicEnabled = computed(() => settings.value.musicEnabled)
  const isSfxEnabled = computed(() => settings.value.sfxEnabled)
  const masterVolume = computed(() => settings.value.masterVolume)
  const musicVolume = computed(() => settings.value.musicVolume)
  const sfxVolume = computed(() => settings.value.sfxVolume)

  // Cleanup on unmount
  onUnmounted(() => {
    // Don't stop ambient globally, just clean up local references
  })

  return {
    // State
    isInitialized,
    settings,
    isMusicEnabled,
    isSfxEnabled,
    masterVolume,
    musicVolume,
    sfxVolume,

    // Methods
    initialize,
    playSfx,
    playAmbient,
    stopAmbient,
    toggleMusic,
    toggleSfx,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,

    // Helpers
    playBreakthroughSequence,
    playClick,
    playHover,
    playPageTransition,
  }
}

// Create a singleton instance for global access
let globalAudioInstance: ReturnType<typeof useAudio> | null = null

export function useGlobalAudio() {
  if (!globalAudioInstance) {
    globalAudioInstance = useAudio()
  }
  return globalAudioInstance
}
