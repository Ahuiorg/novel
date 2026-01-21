// 仙逆编年史 - 平滑滚动和惯性效果
import { ref, onMounted, onUnmounted, type Ref } from 'vue'

interface SmoothScrollOptions {
  friction?: number // 摩擦系数，越大减速越快 (0.1 - 0.3)
  sensitivity?: number // 滚动灵敏度
  minVelocity?: number // 最小速度阈值
  bounceBack?: boolean // 边界回弹
  bounceStrength?: number // 回弹强度
}

const DEFAULT_OPTIONS: Required<SmoothScrollOptions> = {
  friction: 0.92,
  sensitivity: 1.2,
  minVelocity: 0.5,
  bounceBack: true,
  bounceStrength: 0.15,
}

export function useSmoothScroll(
  containerRef: Ref<HTMLElement | null>,
  options: SmoothScrollOptions = {}
) {
  const config = { ...DEFAULT_OPTIONS, ...options }

  const velocity = ref(0)
  const isScrolling = ref(false)
  const isDragging = ref(false)

  let animationId: number | null = null
  let lastTouchX = 0
  let lastTouchTime = 0
  let startX = 0
  let startScrollLeft = 0

  // Animation loop for inertia
  function animateScroll() {
    if (!containerRef.value) return

    const container = containerRef.value
    const maxScroll = container.scrollWidth - container.clientWidth

    // Apply velocity
    if (Math.abs(velocity.value) > config.minVelocity) {
      container.scrollLeft += velocity.value

      // Apply friction
      velocity.value *= config.friction

      // Bounce back at boundaries
      if (config.bounceBack) {
        if (container.scrollLeft < 0) {
          velocity.value *= -config.bounceStrength
          container.scrollLeft = 0
        } else if (container.scrollLeft > maxScroll) {
          velocity.value *= -config.bounceStrength
          container.scrollLeft = maxScroll
        }
      }

      isScrolling.value = true
      animationId = requestAnimationFrame(animateScroll)
    } else {
      velocity.value = 0
      isScrolling.value = false
      animationId = null
    }
  }

  // Handle wheel events
  function handleWheel(e: WheelEvent) {
    if (!containerRef.value) return

    e.preventDefault()

    // Convert vertical scroll to horizontal with sensitivity
    const delta = (e.deltaY || e.deltaX) * config.sensitivity

    // Add to velocity instead of directly scrolling
    velocity.value += delta * 0.5

    // Start animation if not running
    if (!animationId) {
      animationId = requestAnimationFrame(animateScroll)
    }
  }

  // Touch/Mouse drag handling
  function handleDragStart(e: MouseEvent | TouchEvent) {
    if (!containerRef.value) return

    isDragging.value = true
    velocity.value = 0

    // Cancel any ongoing animation
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }

    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX
    startX = clientX
    startScrollLeft = containerRef.value.scrollLeft
    lastTouchX = clientX
    lastTouchTime = Date.now()

    // Prevent text selection during drag
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
  }

  function handleDragMove(e: MouseEvent | TouchEvent) {
    if (!isDragging.value || !containerRef.value) return

    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX
    const now = Date.now()
    const dt = Math.max(1, now - lastTouchTime)

    // Calculate velocity from movement
    const deltaX = lastTouchX - clientX
    velocity.value = (deltaX / dt) * 16 * config.sensitivity

    // Update scroll position directly during drag
    const walk = startX - clientX
    containerRef.value.scrollLeft = startScrollLeft + walk

    lastTouchX = clientX
    lastTouchTime = now
  }

  function handleDragEnd() {
    if (!isDragging.value) return

    isDragging.value = false
    document.body.style.userSelect = ''
    document.body.style.cursor = ''

    // Start inertia animation with current velocity
    if (Math.abs(velocity.value) > config.minVelocity) {
      animationId = requestAnimationFrame(animateScroll)
    }
  }

  // Scroll to specific position with easing
  function scrollTo(position: number, duration = 500) {
    if (!containerRef.value) return

    velocity.value = 0
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }

    const container = containerRef.value
    const start = container.scrollLeft
    const distance = position - start
    const startTime = performance.now()

    function easeOutCubic(t: number): number {
      return 1 - Math.pow(1 - t, 3)
    }

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutCubic(progress)

      container.scrollLeft = start + distance * easedProgress

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  // Scroll to center a specific element
  function scrollToElement(element: HTMLElement, duration = 500) {
    if (!containerRef.value) return

    const container = containerRef.value
    const containerRect = container.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()

    const scrollLeft =
      container.scrollLeft + elementRect.left - containerRect.left - (containerRect.width - elementRect.width) / 2

    scrollTo(scrollLeft, duration)
  }

  // Stop scrolling immediately
  function stop() {
    velocity.value = 0
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    isScrolling.value = false
  }

  // Setup event listeners
  onMounted(() => {
    const container = containerRef.value
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('mousedown', handleDragStart)
    container.addEventListener('touchstart', handleDragStart, { passive: true })

    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('touchmove', handleDragMove, { passive: true })

    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('touchend', handleDragEnd)
  })

  onUnmounted(() => {
    const container = containerRef.value
    if (container) {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('mousedown', handleDragStart)
      container.removeEventListener('touchstart', handleDragStart)
    }

    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('touchmove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchend', handleDragEnd)

    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  })

  return {
    velocity,
    isScrolling,
    isDragging,
    scrollTo,
    scrollToElement,
    stop,
  }
}
