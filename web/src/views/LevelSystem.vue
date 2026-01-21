<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import levelsData from '@/data/levels.json'

const router = useRouter()
const expandedStep = ref<number | null>(null)
const isLoaded = ref(false)

// 王林最终达到的境界 - 第四步踏天境
const currentMaxStep = 4

function toggleStep(step: number) {
  expandedStep.value = expandedStep.value === step ? null : step
}

function goBack() {
  router.push('/')
}

function isStepReached(step: number): boolean {
  return step <= currentMaxStep
}

function isCurrentStep(step: number): boolean {
  return step === currentMaxStep
}

onMounted(async () => {
  await nextTick()
  
  // 先设置初始状态
  gsap.set('.page-header', { y: -50, opacity: 0 })
  gsap.set('.description', { y: 30, opacity: 0 })
  gsap.set('.step-card', { y: 40, opacity: 0 })
  gsap.set('.special-paths', { y: 40, opacity: 0 })
  
  isLoaded.value = true
  
  // 入场动画
  gsap.to('.page-header', {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out'
  })
  
  gsap.to('.description', {
    y: 0,
    opacity: 1,
    duration: 0.6,
    delay: 0.2,
    ease: 'power2.out'
  })
  
  gsap.to('.step-card', {
    y: 0,
    opacity: 1,
    duration: 0.5,
    stagger: 0.08,
    delay: 0.4,
    ease: 'power2.out'
  })
  
  gsap.to('.special-paths', {
    y: 0,
    opacity: 1,
    duration: 0.6,
    delay: 1.2,
    ease: 'power2.out'
  })
})
</script>

<template>
  <div class="level-system" :class="{ loaded: isLoaded }">
    <header class="page-header glass">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">←</span>
        返回时间线
      </button>
      <h1 class="page-title">
        <span class="title-icon">📊</span>
        {{ levelsData.title }}
      </h1>
    </header>
    
    <main class="page-content">
      <p class="description">{{ levelsData.description }}</p>
      
      <!-- 进度指示器 -->
      <div class="progress-indicator">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${(currentMaxStep / 10) * 100}%` }" />
        </div>
        <div class="progress-labels">
          <span>凡人</span>
          <span>踏天</span>
          <span>煌天</span>
        </div>
      </div>
      
      <div class="steps-list">
        <div
          v-for="step in levelsData.steps"
          :key="step.step"
          class="step-card glass"
          :class="{ 
            expanded: expandedStep === step.step,
            reached: isStepReached(step.step),
            current: isCurrentStep(step.step),
            locked: !isStepReached(step.step)
          }"
          @click="toggleStep(step.step)"
        >
          <div class="step-header">
            <div class="step-number" :class="{ glow: isCurrentStep(step.step) }">
              <span v-if="isStepReached(step.step)">{{ step.step }}</span>
              <span v-else class="lock-icon">🔒</span>
            </div>
            <div class="step-info">
              <h2>{{ step.name }}</h2>
              <span class="power-type">
                <span class="power-icon">✦</span>
                {{ step.powerType }}
              </span>
            </div>
            <div class="step-status">
              <span v-if="isCurrentStep(step.step)" class="current-badge">当前</span>
              <span v-else-if="isStepReached(step.step)" class="reached-badge">已达成</span>
            </div>
            <div class="step-toggle">
              <span class="toggle-icon" :class="{ rotated: expandedStep === step.step }">▼</span>
            </div>
          </div>
          
          <Transition name="expand">
            <div v-if="expandedStep === step.step" class="step-details">
              <p class="step-description">{{ step.description }}</p>
              
              <div class="stages">
                <h3>
                  <span class="stages-icon">⚔️</span>
                  境界划分
                </h3>
                <div class="stage-list">
                  <span 
                    v-for="(stage, idx) in step.stages" 
                    :key="stage" 
                    class="stage-tag"
                    :class="{ 
                      reached: isStepReached(step.step),
                      final: idx === step.stages.length - 1 && step.step === currentMaxStep
                    }"
                    :style="{ animationDelay: `${idx * 0.05}s` }"
                  >
                    {{ stage }}
                  </span>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
      
      <section class="special-paths">
        <h2>
          <span class="section-icon">🌟</span>
          特殊修炼路径
        </h2>
        <div class="paths-grid">
          <div v-for="path in levelsData.specialPaths" :key="path.id" class="path-card glass">
            <div class="path-header">
              <span class="path-icon">{{ path.id === 'ancient-god' ? '👁️' : '🔥' }}</span>
              <h3>{{ path.name }}</h3>
            </div>
            <p>{{ path.description }}</p>
            <div class="stage-list">
              <span 
                v-for="(stage, idx) in path.stages" 
                :key="stage" 
                class="stage-tag special"
                :style="{ animationDelay: `${idx * 0.05}s` }"
              >
                {{ stage }}
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.level-system {
  min-height: 100vh;
  padding-bottom: var(--spacing-3xl);
}

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  padding: 0 var(--spacing-xl);
  z-index: var(--z-header);
}

.page-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  margin: 0;
  background: linear-gradient(135deg, var(--immortal-gold) 0%, var(--lightning-cyan) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-icon {
  font-size: var(--text-xl);
  -webkit-text-fill-color: initial;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-family: var(--font-body);
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.back-btn:hover {
  color: var(--immortal-gold);
}

.back-btn:hover .back-icon {
  transform: translateX(-4px);
}

.back-icon {
  transition: transform 0.2s ease;
}

.page-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 100px var(--spacing-xl) var(--spacing-3xl);
  position: relative;
  z-index: var(--z-content);
}

.description {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: var(--spacing-xl);
  line-height: 1.8;
}

/* Progress Indicator */
.progress-indicator {
  margin-bottom: var(--spacing-3xl);
  padding: var(--spacing-lg);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
}

.progress-track {
  height: 8px;
  background: var(--nebula-blue);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--immortal-gold) 0%, var(--lightning-cyan) 100%);
  border-radius: 4px;
  position: relative;
  transition: width 1s ease;
}

.progress-fill::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background: var(--lightning-cyan);
  border-radius: 50%;
  box-shadow: 0 0 20px var(--lightning-cyan);
  animation: pulse 2s infinite;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* Steps List */
.steps-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  position: relative;
  z-index: var(--z-content);
}

.step-card {
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  z-index: var(--z-content);
}

.step-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--glass-border), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.step-card:hover::before {
  opacity: 1;
}

.step-card.reached {
  border-color: var(--immortal-gold-dim);
}

.step-card.reached::before {
  background: linear-gradient(90deg, transparent, var(--immortal-gold), transparent);
}

.step-card.current {
  border-color: var(--lightning-cyan);
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.2);
}

.step-card.current::before {
  background: linear-gradient(90deg, transparent, var(--lightning-cyan), transparent);
  opacity: 1;
}

.step-card.locked {
  opacity: 0.6;
}

.step-card.expanded {
  border-color: var(--immortal-gold);
}

.step-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.step-number {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cosmos-dark);
  border: 2px solid var(--glass-border);
  border-radius: 50%;
  font-family: var(--font-accent);
  font-size: var(--text-xl);
  font-weight: bold;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.step-card.reached .step-number {
  background: linear-gradient(135deg, var(--immortal-gold) 0%, var(--lightning-cyan) 100%);
  border-color: var(--immortal-gold);
  color: var(--void-black);
}

.step-number.glow {
  box-shadow: 0 0 20px var(--lightning-cyan), 0 0 40px rgba(0, 212, 255, 0.3);
  animation: glow-pulse 2s infinite;
}

.lock-icon {
  font-size: var(--text-lg);
}

.step-info {
  flex: 1;
}

.step-info h2 {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  margin: 0 0 var(--spacing-xs);
  color: var(--text-primary);
}

.step-card.reached .step-info h2 {
  color: var(--immortal-gold);
}

.step-card.current .step-info h2 {
  color: var(--lightning-cyan);
}

.power-type {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.power-icon {
  color: var(--spirit-purple);
}

.step-status {
  display: flex;
  align-items: center;
}

.current-badge,
.reached-badge {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 500;
}

.current-badge {
  background: rgba(0, 212, 255, 0.2);
  border: 1px solid var(--lightning-cyan);
  color: var(--lightning-cyan);
  animation: pulse 2s infinite;
}

.reached-badge {
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid var(--immortal-gold-dim);
  color: var(--immortal-gold);
}

.step-toggle {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-icon {
  font-size: var(--text-sm);
  color: var(--text-muted);
  transition: transform 0.3s ease;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

/* Expand Transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  margin-top: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}

.step-details {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--glass-border);
}

.step-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.8;
}

.stages h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-bottom: var(--spacing-md);
}

.stages-icon {
  font-size: var(--text-base);
}

.stage-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.stage-tag {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--cosmos-dark);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  animation: fadeInUp 0.3s ease forwards;
  opacity: 0;
}

.stage-tag.reached {
  border-color: var(--immortal-gold-dim);
  color: var(--immortal-gold);
}

.stage-tag.final {
  background: rgba(0, 212, 255, 0.1);
  border-color: var(--lightning-cyan);
  color: var(--lightning-cyan);
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

.stage-tag.special {
  border-color: var(--spirit-purple);
  color: var(--spirit-purple);
}

/* Special Paths */
.special-paths {
  margin-top: var(--spacing-3xl);
}

.special-paths > h2 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  margin-bottom: var(--spacing-lg);
  color: var(--spirit-purple);
}

.section-icon {
  font-size: var(--text-xl);
}

.paths-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.path-card {
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  border-color: var(--spirit-purple);
  transition: all 0.3s ease;
}

.path-card:hover {
  border-color: var(--spirit-purple);
  box-shadow: 0 0 30px rgba(155, 89, 182, 0.2);
}

.path-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.path-icon {
  font-size: var(--text-2xl);
}

.path-card h3 {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  color: var(--spirit-purple);
  margin: 0;
}

.path-card p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  line-height: 1.6;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 20px var(--lightning-cyan), 0 0 40px rgba(0, 212, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 30px var(--lightning-cyan), 0 0 60px rgba(0, 212, 255, 0.5);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 移动端响应式 (< 640px) ===== */
@media (max-width: 639px) {
  .level-system {
    min-height: 100dvh;
    padding-bottom: var(--spacing-2xl);
  }

  .page-header {
    height: 56px;
    gap: var(--spacing-sm);
    padding: 0 var(--spacing-md);
    flex-wrap: wrap;
  }

  .page-title {
    font-size: var(--text-lg);
  }

  .title-icon {
    font-size: var(--text-base);
  }

  .back-btn {
    font-size: var(--text-sm);
    min-height: 44px;
  }

  .page-content {
    padding: 72px var(--spacing-md) var(--spacing-2xl);
  }

  .description {
    font-size: var(--text-base);
    margin-bottom: var(--spacing-lg);
    line-height: 1.6;
  }

  .progress-indicator {
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-md);
  }

  .progress-track {
    height: 6px;
  }

  .progress-fill::after {
    width: 12px;
    height: 12px;
  }

  .steps-list {
    gap: var(--spacing-sm);
  }

  .step-card {
    padding: var(--spacing-md);
  }

  .step-header {
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }

  .step-number {
    width: 44px;
    height: 44px;
    font-size: var(--text-lg);
    flex-shrink: 0;
  }

  .step-info {
    min-width: 0;
    flex: 1;
  }

  .step-info h2 {
    font-size: var(--text-lg);
  }

  .power-type {
    font-size: var(--text-xs);
  }

  .step-status {
    order: 3;
    width: 100%;
    margin-top: var(--spacing-xs);
  }

  .current-badge,
  .reached-badge {
    font-size: 10px;
    padding: 2px var(--spacing-sm);
  }

  .step-toggle {
    position: absolute;
    top: var(--spacing-md);
    right: var(--spacing-md);
  }

  .step-card {
    position: relative;
  }

  .step-details {
    margin-top: var(--spacing-md);
    padding-top: var(--spacing-md);
  }

  .step-description {
    font-size: var(--text-sm);
    margin-bottom: var(--spacing-md);
    line-height: 1.6;
  }

  .stages h3 {
    font-size: var(--text-xs);
    margin-bottom: var(--spacing-sm);
  }

  .stage-list {
    gap: var(--spacing-xs);
  }

  .stage-tag {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--text-xs);
  }

  .special-paths {
    margin-top: var(--spacing-2xl);
  }

  .special-paths > h2 {
    font-size: var(--text-xl);
    margin-bottom: var(--spacing-md);
  }

  .paths-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .path-card {
    padding: var(--spacing-md);
  }

  .path-icon {
    font-size: var(--text-xl);
  }

  .path-card h3 {
    font-size: var(--text-base);
  }

  .path-card p {
    font-size: var(--text-sm);
    margin-bottom: var(--spacing-sm);
  }
}

/* ===== 中等屏幕 (640px - 767px) ===== */
@media (min-width: 640px) and (max-width: 767px) {
  .page-content {
    padding: 88px var(--spacing-lg) var(--spacing-2xl);
  }

  .paths-grid {
    grid-template-columns: 1fr;
  }
}
</style>
