<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

interface NavItem {
  path: string
  name: string
  icon: string
  label: string
}

const navItems: NavItem[] = [
  { path: '/', name: 'home', icon: '🕐', label: '时间线' },
  { path: '/levels', name: 'levels', icon: '📊', label: '等级体系' },
  { path: '/collection', name: 'collection', icon: '📚', label: '图鉴' },
]

const currentPath = computed(() => route.path)

function isActive(item: NavItem): boolean {
  if (item.path === '/') {
    return currentPath.value === '/'
  }
  return currentPath.value.startsWith(item.path)
}
</script>

<template>
  <nav class="app-nav">
    <router-link
      v-for="item in navItems"
      :key="item.name"
      :to="item.path"
      class="nav-item"
      :class="{ active: isActive(item) }"
    >
      <span class="nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ item.label }}</span>
      <span class="nav-indicator" />
    </router-link>
  </nav>
</template>

<style scoped>
.app-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-xl);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border-top: 1px solid var(--glass-border);
  z-index: var(--z-nav);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-xl);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  position: relative;
}

.nav-item:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  color: var(--immortal-gold);
}

.nav-icon {
  font-size: var(--text-xl);
  transition: transform 0.3s ease;
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
}

.nav-item.active .nav-icon {
  animation: bounce 0.5s ease;
}

.nav-label {
  font-family: var(--font-body);
  font-size: var(--text-xs);
}

.nav-indicator {
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  background: var(--immortal-gold);
  border-radius: 50%;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s ease;
}

.nav-item.active .nav-indicator {
  opacity: 1;
  transform: scale(1);
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

/* Desktop: Hide bottom nav, use header nav instead */
@media (min-width: 769px) {
  .app-nav {
    display: none;
  }
}
</style>
