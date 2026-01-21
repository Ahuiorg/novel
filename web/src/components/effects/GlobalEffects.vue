<script setup lang="ts">
import StarField from './StarField.vue'
import MouseFollower from './MouseFollower.vue'
import ClickRipple from './ClickRipple.vue'
</script>

<template>
  <div class="global-effects">
    <!-- Background layer -->
    <StarField />
    
    <!-- Interactive layer (above content) -->
    <MouseFollower />
    <ClickRipple />
  </div>
</template>

<style scoped>
.global-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: var(--z-background);
  pointer-events: none;
}
</style>
