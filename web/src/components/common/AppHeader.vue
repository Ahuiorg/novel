<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const emit = defineEmits<{
  openSearch: []
  openSettings: []
}>()

const isScrolled = ref(false)

// Listen to scroll for header style changes
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => {
    isScrolled.value = window.scrollY > 20
  })
}

function goHome() {
  router.push('/')
}

function handleSearch() {
  emit('openSearch')
}

function handleSettings() {
  emit('openSettings')
}

function isActive(name: string): boolean {
  return route.name === name
}
</script>

<template>
  <header class="app-header" :class="{ scrolled: isScrolled }">
    <div class="header-left">
      <button class="logo-btn" @click="goHome">
        <span class="logo-text">仙逆</span>
        <span class="logo-sub">编年史</span>
      </button>
    </div>
    
    <nav class="header-nav">
      <router-link 
        to="/" 
        class="nav-link"
        :class="{ active: route.path === '/' }"
      >
        <span class="nav-icon">🕐</span>
        <span class="nav-label">时间线</span>
      </router-link>
      
      <router-link 
        to="/levels" 
        class="nav-link"
        :class="{ active: isActive('levels') }"
      >
        <span class="nav-icon">📊</span>
        <span class="nav-label">等级体系</span>
      </router-link>
      
      <router-link 
        to="/collection" 
        class="nav-link"
        :class="{ active: route.path.startsWith('/collection') }"
      >
        <span class="nav-icon">📚</span>
        <span class="nav-label">图鉴</span>
      </router-link>
    </nav>
    
    <div class="header-right">
      <button class="action-btn" title="搜索" @click="handleSearch">
        <span>🔍</span>
      </button>
      <button class="action-btn" title="设置" @click="handleSettings">
        <span>⚙️</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-xl);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid transparent;
  z-index: var(--z-header);
  transition: all 0.3s ease;
}

.app-header.scrolled {
  border-bottom-color: var(--glass-border);
  background: rgba(5, 5, 16, 0.95);
}

.header-left {
  flex: 0 0 auto;
}

.logo-btn {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logo-btn:hover {
  transform: scale(1.02);
}

.logo-text {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  background: linear-gradient(135deg, var(--immortal-gold) 0%, var(--lightning-cyan) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-sub {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.header-nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: var(--immortal-gold);
  transition: width 0.2s ease;
}

.nav-link:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.nav-link:hover::after {
  width: 60%;
}

.nav-link.active {
  color: var(--immortal-gold);
}

.nav-link.active::after {
  width: 80%;
}

.nav-icon {
  font-size: var(--text-base);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.action-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: var(--text-lg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--glass-border);
}

@media (max-width: 768px) {
  .header-nav {
    display: none;
  }
  
  .nav-label {
    display: none;
  }
}
</style>
