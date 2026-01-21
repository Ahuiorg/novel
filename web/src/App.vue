<script setup lang="ts">
import { onMounted } from 'vue'
import GlobalEffects from '@/components/effects/GlobalEffects.vue'
import AudioControl from '@/components/ui/AudioControl.vue'
import { useProgressStore } from '@/stores/progress'

const progressStore = useProgressStore()

onMounted(() => {
  progressStore.loadProgress()
})
</script>

<template>
  <div class="app">
    <GlobalEffects />
    <AudioControl />
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  position: relative;
}

/* Enhanced Page Transitions */
.page-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
  filter: blur(4px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  filter: blur(2px);
}

/* Fade-scale variant for modals/overlays */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
