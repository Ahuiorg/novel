<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as THREE from 'three'

const containerRef = ref<HTMLDivElement>()
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer | null = null
let starsGroup: THREE.Group
let animationId: number
let isInitialized = false

// 配置
const STAR_COUNT = 8000
const MILKY_WAY_COUNT = 4000  // 银河带粒子数
const ROTATION_PERIOD = 300  // 秒，旋转一圈的时间（5分钟）
const TWINKLE_RATIO = 0.15   // 15% 的星星会闪烁

// 流星配置
const METEOR_INTERVAL_MIN = 400    // 最小间隔 0.4 秒
const METEOR_INTERVAL_MAX = 1500   // 最大间隔 1.5 秒

// 星星数据
interface StarData {
  baseOpacity: number
  twinkleSpeed: number
  twinklePhase: number
  isTwinkling: boolean
}
let starsData: StarData[] = []
let starsMaterial: THREE.PointsMaterial

// 流星数据
interface MeteorData {
  sprite: THREE.Sprite
  tail: THREE.Sprite[]  // 尾巴粒子
  position: THREE.Vector3
  velocity: THREE.Vector3
  life: number
  maxLife: number
  brightness: number
  trail: THREE.Vector3[]  // 历史位置
}
let meteors: MeteorData[] = []
let meteorsGroup: THREE.Group
let nextMeteorTime = 0
let meteorTexture: THREE.CanvasTexture | null = null

// ==================== 初始化 ====================

function cleanup() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = 0
  }
  
  // 清理流星
  if (meteors) {
    meteors.forEach(meteor => {
      if (meteor.sprite.material instanceof THREE.Material) {
        meteor.sprite.material.dispose()
      }
      meteor.tail.forEach(t => {
        if (t.material instanceof THREE.Material) {
          t.material.dispose()
        }
      })
    })
    meteors = []
  }
  
  if (meteorTexture) {
    meteorTexture.dispose()
    meteorTexture = null
  }
  
  if (starsGroup) {
    starsGroup.traverse((child) => {
      if (child instanceof THREE.Points) {
        child.geometry?.dispose()
        if (child.material instanceof THREE.Material) {
          child.material.dispose()
        }
      }
    })
  }
  
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    renderer = null
  }
  
  if (containerRef.value) {
    const canvas = containerRef.value.querySelector('canvas')
    if (canvas) {
      containerRef.value.removeChild(canvas)
    }
  }
  
  starsData = []
  isInitialized = false
}

function init() {
  if (!containerRef.value) return
  
  if (isInitialized) {
    cleanup()
  }
  
  const existingCanvas = containerRef.value.querySelector('canvas')
  if (existingCanvas) {
    containerRef.value.removeChild(existingCanvas)
  }

  // WebGL 检查
  try {
    const testCanvas = document.createElement('canvas')
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')
    if (!gl) {
      console.warn('WebGL not supported')
      return
    }
  } catch (e) {
    console.warn('WebGL check failed:', e)
    return
  }

  isInitialized = true

  // Scene
  scene = new THREE.Scene()

  // Camera - 在原点，看向 z 负方向
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  )
  camera.position.set(0, 0, 0)

  // Renderer
  try {
    renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'default'
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.value.appendChild(renderer.domElement)
  } catch (e) {
    console.warn('WebGL renderer creation failed:', e)
    isInitialized = false
    return
  }

  // 创建星空
  createStars()
  
  // 创建银河带
  createMilkyWay()
  
  // 初始化流星系统
  initMeteors()

  // 开始动画
  animate(0)
}

// ==================== 星星生成 ====================

/**
 * 生成星等分布
 * 1等星最亮最少，6等星最暗最多
 */
function generateMagnitude(): number {
  const r = Math.random()
  // 指数分布，越暗的星越多
  if (r < 0.01) return 1      // 1% 一等星
  if (r < 0.03) return 2      // 2% 二等星
  if (r < 0.08) return 3      // 5% 三等星
  if (r < 0.20) return 4      // 12% 四等星
  if (r < 0.45) return 5      // 25% 五等星
  return 6                     // 55% 六等星
}

/**
 * 根据星等获取星星大小
 */
function getSizeFromMagnitude(mag: number): number {
  // 1等星最大，6等星最小
  const sizes = [3.5, 2.8, 2.2, 1.6, 1.1, 0.7]
  return sizes[mag - 1] || 1
}

/**
 * 根据星等获取亮度
 */
function getOpacityFromMagnitude(mag: number): number {
  // 1等星最亮，6等星最暗
  const opacities = [1.0, 0.85, 0.7, 0.55, 0.4, 0.25]
  return opacities[mag - 1] || 0.3
}

/**
 * 生成星星颜色
 * 80% 白色，10% 蓝白，10% 橙红
 */
function generateStarColor(): THREE.Color {
  const r = Math.random()
  if (r < 0.80) {
    // 白色/淡白色 - 微微随机
    const white = 0.9 + Math.random() * 0.1
    return new THREE.Color(white, white, white * (0.95 + Math.random() * 0.05))
  } else if (r < 0.90) {
    // 蓝白色 (O/B 型星)
    return new THREE.Color(0.8 + Math.random() * 0.2, 0.85 + Math.random() * 0.15, 1.0)
  } else {
    // 橙红色 (K/M 型星)
    return new THREE.Color(1.0, 0.7 + Math.random() * 0.2, 0.4 + Math.random() * 0.2)
  }
}

/**
 * 球面均匀分布
 */
function randomPointOnSphere(radius: number): THREE.Vector3 {
  // 使用球面均匀分布算法
  const theta = Math.random() * Math.PI * 2
  const phi = Math.acos(2 * Math.random() - 1)
  
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  )
}

function createStars() {
  starsGroup = new THREE.Group()
  
  const positions: number[] = []
  const colors: number[] = []
  const sizes: number[] = []
  starsData = []
  
  for (let i = 0; i < STAR_COUNT; i++) {
    // 位置 - 在不同距离的球面上分布
    const radius = 300 + Math.random() * 700  // 300-1000 距离
    const pos = randomPointOnSphere(radius)
    positions.push(pos.x, pos.y, pos.z)
    
    // 星等决定大小和亮度
    const magnitude = generateMagnitude()
    const size = getSizeFromMagnitude(magnitude)
    const baseOpacity = getOpacityFromMagnitude(magnitude)
    sizes.push(size)
    
    // 颜色
    const color = generateStarColor()
    colors.push(color.r, color.g, color.b)
    
    // 闪烁数据
    const isTwinkling = Math.random() < TWINKLE_RATIO
    starsData.push({
      baseOpacity,
      twinkleSpeed: 0.5 + Math.random() * 2,  // 不同闪烁速度
      twinklePhase: Math.random() * Math.PI * 2,
      isTwinkling
    })
  }
  
  // 创建 geometry
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
  
  // 创建 material
  starsMaterial = new THREE.PointsMaterial({
    size: 1,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
  })
  
  const stars = new THREE.Points(geometry, starsMaterial)
  starsGroup.add(stars)
  scene.add(starsGroup)
}

// ==================== 银河带 ====================

/**
 * 简单的伪随机噪声
 */
function noise(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return n - Math.floor(n)
}

/**
 * 创建银河带 - 倾斜的粒子云带
 */
function createMilkyWay() {
  const positions: number[] = []
  const colors: number[] = []
  const sizes: number[] = []
  
  // 银河带参数
  const radius = 500  // 基础半径
  const bandWidth = 0.25  // 带宽（弧度）
  const tiltAngle = Math.PI * 0.35  // 倾斜角度（约 63°）
  
  for (let i = 0; i < MILKY_WAY_COUNT; i++) {
    // 沿着银河带分布
    // theta: 沿着带的方向 (0 - 2π)
    const theta = Math.random() * Math.PI * 2
    
    // phi: 垂直于带的偏移，用高斯分布让中心更密集
    const gaussianOffset = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5
    const phi = Math.PI / 2 + gaussianOffset * bandWidth
    
    // 基础球面坐标
    let x = radius * Math.sin(phi) * Math.cos(theta)
    let y = radius * Math.sin(phi) * Math.sin(theta)
    let z = radius * Math.cos(phi)
    
    // 应用倾斜（绕 X 轴旋转）
    const cosT = Math.cos(tiltAngle)
    const sinT = Math.sin(tiltAngle)
    const newY = y * cosT - z * sinT
    const newZ = y * sinT + z * cosT
    y = newY
    z = newZ
    
    // 添加噪声让边缘不规则
    const noiseVal = noise(theta * 3, phi * 5)
    const radiusVariation = 0.85 + noiseVal * 0.3
    x *= radiusVariation
    y *= radiusVariation
    z *= radiusVariation
    
    // 深度变化
    const depthVariation = 0.8 + Math.random() * 0.4
    x *= depthVariation
    y *= depthVariation
    z *= depthVariation
    
    positions.push(x, y, z)
    
    // 颜色 - 银河带偏蓝紫色，带一点暖色变化
    const colorRand = Math.random()
    let r, g, b
    if (colorRand < 0.6) {
      // 淡蓝白色
      r = 0.7 + Math.random() * 0.2
      g = 0.75 + Math.random() * 0.2
      b = 0.9 + Math.random() * 0.1
    } else if (colorRand < 0.85) {
      // 淡紫色
      r = 0.75 + Math.random() * 0.15
      g = 0.65 + Math.random() * 0.15
      b = 0.85 + Math.random() * 0.15
    } else {
      // 暖色点缀（模拟尘埃云中的红巨星）
      r = 0.9 + Math.random() * 0.1
      g = 0.7 + Math.random() * 0.2
      b = 0.5 + Math.random() * 0.2
    }
    
    // 根据到中心的距离调整亮度（中心更亮）
    const distFromCenter = Math.abs(gaussianOffset)
    const brightnessFactor = 1 - distFromCenter * 0.5
    r *= brightnessFactor
    g *= brightnessFactor
    b *= brightnessFactor
    
    colors.push(r, g, b)
    
    // 大小 - 银河带粒子更小更密
    const size = 0.3 + Math.random() * 0.5
    sizes.push(size)
  }
  
  // 创建 geometry
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  
  // 创建 material - 银河带用更柔和的混合
  const material = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
  })
  
  const milkyWay = new THREE.Points(geometry, material)
  starsGroup.add(milkyWay)
}

// ==================== 流星系统 ====================

/**
 * 初始化流星系统
 */
function initMeteors() {
  meteorsGroup = new THREE.Group()
  scene.add(meteorsGroup)
  meteors = []
  
  // 创建流星纹理
  meteorTexture = createMeteorTexture()
  
  // 设置第一颗流星的时间（2-5秒后）
  nextMeteorTime = 2000 + Math.random() * 3000
}

/**
 * 创建流星纹理 - 有星芒的锐利星星
 */
function createMeteorTexture(): THREE.CanvasTexture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  
  const cx = size / 2
  const cy = size / 2
  
  // 画星芒（十字光芒）
  ctx.strokeStyle = '#ffffff'
  ctx.lineCap = 'round'
  
  // 主十字（更长更亮）
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx, 2)
  ctx.lineTo(cx, size - 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(2, cy)
  ctx.lineTo(size - 2, cy)
  ctx.stroke()
  
  // 斜十字（稍短）
  ctx.lineWidth = 1.5
  const offset = size * 0.35
  ctx.beginPath()
  ctx.moveTo(cx - offset, cy - offset)
  ctx.lineTo(cx + offset, cy + offset)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx + offset, cy - offset)
  ctx.lineTo(cx - offset, cy + offset)
  ctx.stroke()
  
  // 中心亮点
  ctx.beginPath()
  ctx.arc(cx, cy, 3, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/**
 * 生成一颗流星
 * 真实流星：在星空任意位置快速闪过一小段
 */
function spawnMeteor() {
  if (!meteorTexture) return
  
  // 在星空球面上生成，但限制在相机前方可见区域
  const radius = 400
  
  // 限制角度范围，确保在视野内
  // theta: 水平角度 -90° 到 +90°（相机前方）
  // phi: 垂直角度 30° 到 150°（避免正上方和正下方）
  const theta = (Math.random() - 0.5) * Math.PI  // -90° 到 +90°
  const phi = 0.5 + Math.random() * 2.1  // 约 30° 到 150°
  
  const startPos = new THREE.Vector3(
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
    -radius * Math.sin(phi) * Math.cos(theta)  // 负Z确保在前方
  )
  
  // 随机方向 - 沿球面切线方向
  const radial = startPos.clone().normalize()
  const randomVec = new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5
  ).normalize()
  // 切线方向 = 径向 × 随机向量
  const direction = new THREE.Vector3().crossVectors(radial, randomVec).normalize()
  
  // 速度 - 慢一点
  const speed = 80 + Math.random() * 60
  const velocity = direction.clone().multiplyScalar(speed)
  
  // 流星参数
  const maxLife = 1.0 + Math.random() * 1.0  // 1.0-2.0 秒
  const brightness = 0.7 + Math.random() * 0.3
  
  // 创建 Sprite
  const material = new THREE.SpriteMaterial({
    map: meteorTexture,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    color: 0xffffff,
  })
  
  const sprite = new THREE.Sprite(material)
  sprite.position.copy(startPos)
  sprite.scale.set(0.5, 0.5, 1)  // 从小开始
  
  meteorsGroup.add(sprite)
  
  // 创建尾巴粒子（15个）
  const tail: THREE.Sprite[] = []
  for (let i = 0; i < 15; i++) {
    const tailMat = new THREE.SpriteMaterial({
      map: meteorTexture,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      color: 0xffffff,
    })
    const tailSprite = new THREE.Sprite(tailMat)
    tailSprite.position.copy(startPos)
    tailSprite.scale.set(0.1, 0.1, 1)
    meteorsGroup.add(tailSprite)
    tail.push(tailSprite)
  }
  
  meteors.push({
    sprite,
    tail,
    position: startPos.clone(),
    velocity,
    life: 0,
    maxLife,
    brightness,
    trail: [startPos.clone()],  // 初始位置
  })
}

/**
 * 更新流星
 */
function updateMeteors(currentTime: number, deltaTime: number) {
  // 检查是否需要生成新流星
  if (currentTime >= nextMeteorTime) {
    spawnMeteor()
    // 设置下一颗流星的时间
    nextMeteorTime = currentTime + METEOR_INTERVAL_MIN + Math.random() * (METEOR_INTERVAL_MAX - METEOR_INTERVAL_MIN)
  }
  
  // 更新现有流星
  for (let i = meteors.length - 1; i >= 0; i--) {
    const meteor = meteors[i]
    if (!meteor) continue
    
    meteor.life += deltaTime
    
    // 流星消亡
    if (meteor.life >= meteor.maxLife) {
      meteorsGroup.remove(meteor.sprite)
      if (meteor.sprite.material instanceof THREE.Material) {
        meteor.sprite.material.dispose()
      }
      // 清理尾巴
      meteor.tail.forEach(t => {
        meteorsGroup.remove(t)
        if (t.material instanceof THREE.Material) {
          t.material.dispose()
        }
      })
      meteors.splice(i, 1)
      continue
    }
    
    // 更新位置
    const movement = meteor.velocity.clone().multiplyScalar(deltaTime)
    meteor.position.add(movement)
    meteor.sprite.position.copy(meteor.position)
    
    // 记录轨迹（用于尾巴）
    meteor.trail.unshift(meteor.position.clone())
    if (meteor.trail.length > 18) {
      meteor.trail.pop()
    }
    
    // 生命周期进度
    const lifeProgress = meteor.life / meteor.maxLife
    
    // 头部大小变化：快速变大，然后逐渐缩小
    let headScale: number
    if (lifeProgress < 0.2) {
      headScale = (lifeProgress / 0.2) * 8
    } else {
      headScale = 8 * (1 - (lifeProgress - 0.2) / 0.8)
    }
    headScale = Math.max(0.5, headScale)
    
    // 更新头部
    const mat = meteor.sprite.material as THREE.SpriteMaterial
    mat.opacity = 1
    meteor.sprite.scale.set(headScale, headScale, 1)
    
    // 更新尾巴 - 跟随轨迹，逐渐变小
    for (let j = 0; j < meteor.tail.length; j++) {
      const tailSprite = meteor.tail[j]
      if (!tailSprite) continue
      
      const trailIndex = j + 1
      const trailPos = meteor.trail[trailIndex]
      
      if (trailPos) {
        tailSprite.position.copy(trailPos)
        // 尾巴逐渐变小
        const tailScale = headScale * (1 - (j + 1) / 16) * 0.6
        tailSprite.scale.set(Math.max(0.2, tailScale), Math.max(0.2, tailScale), 1)
        ;(tailSprite.material as THREE.SpriteMaterial).opacity = 1
      } else {
        tailSprite.scale.set(0.1, 0.1, 1)
      }
    }
  }
}

// ==================== 动画 ====================

let lastTime = 0

function animate(currentTime: number) {
  if (!renderer || !scene || !camera) return
  
  animationId = requestAnimationFrame(animate)
  
  const deltaTime = (currentTime - lastTime) / 1000
  lastTime = currentTime
  
  // 缓慢旋转星空
  if (starsGroup) {
    const rotationSpeed = (Math.PI * 2) / ROTATION_PERIOD
    starsGroup.rotation.y += rotationSpeed * deltaTime
    // 轻微的 x 轴旋转，增加立体感
    starsGroup.rotation.x += rotationSpeed * 0.1 * deltaTime
  }
  
  // 更新闪烁（降低更新频率以提高性能）
  if (Math.floor(currentTime / 50) !== Math.floor(lastTime / 50)) {
    updateTwinkle(currentTime)
  }
  
  // 更新流星
  updateMeteors(currentTime, deltaTime)
  
  renderer.render(scene, camera)
}

function updateTwinkle(time: number) {
  const t = time * 0.001
  
  // 获取星星的 geometry
  const stars = starsGroup.children[0] as THREE.Points
  if (!stars || !stars.geometry) return
  
  const colors = stars.geometry.attributes.color
  if (!colors) return
  
  for (let i = 0; i < starsData.length; i++) {
    const data = starsData[i]
    if (!data || !data.isTwinkling) continue
    
    // 使用多重正弦叠加产生不规则闪烁
    const wave1 = Math.sin(t * data.twinkleSpeed + data.twinklePhase)
    const wave2 = Math.sin(t * data.twinkleSpeed * 1.7 + data.twinklePhase * 0.5)
    const wave3 = Math.sin(t * data.twinkleSpeed * 0.3 + data.twinklePhase * 2)
    
    // 组合波形，产生不规则变化
    const combined = (wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2)
    const twinkleFactor = 0.7 + combined * 0.3  // 0.4 - 1.0 范围
    
    // 更新颜色亮度（通过调整 RGB）
    const baseR = colors.getX(i)
    const baseG = colors.getY(i)
    const baseB = colors.getZ(i)
    
    // 保持色相，调整亮度
    colors.setXYZ(i, baseR * twinkleFactor, baseG * twinkleFactor, baseB * twinkleFactor)
  }
  
  colors.needsUpdate = true
}

// ==================== 事件处理 ====================

function handleResize() {
  if (!camera || !renderer) return
  
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

// ==================== 生命周期 ====================

onMounted(async () => {
  await nextTick()
  
  requestAnimationFrame(() => {
    init()
  })
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  cleanup()
})
</script>

<template>
  <div ref="containerRef" class="star-field" />
</template>

<style scoped>
.star-field {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: var(--z-background);
  pointer-events: none;
  background: linear-gradient(
    180deg,
    #000510 0%,
    #0a0a1f 30%,
    #0d0d2b 60%,
    #0a0a1f 100%
  );
}

.star-field :deep(canvas) {
  display: block;
}
</style>
