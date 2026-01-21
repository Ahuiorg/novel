# Spec: Three.js Effects

## Overview

StarField 组件使用纯 Three.js 实现所有视觉特效，包括普通星星、带星芒的大星星和流星效果。

---

## MODIFIED Requirements

### Requirement: StarField 渲染方式

StarField 组件 SHALL 使用纯 Three.js/WebGL 渲染所有视觉特效。组件模板中除容器 div 外 SHALL NOT 包含任何其他 DOM 元素用于特效渲染。

#### Scenario: 正常渲染
- **WHEN** WebGL 可用且 StarField 组件挂载
- **THEN** 创建 Three.js 场景、相机、渲染器
- **AND** 渲染 10000 颗普通星星 (Points)
- **AND** 渲染 8-10 颗带星芒的大星星 (Sprite/Shader)
- **AND** 渲染 3-5 颗循环流星 (Line/Particles)
- **AND** 所有元素在同一 canvas 中渲染

#### Scenario: WebGL 不可用
- **WHEN** WebGL 不可用或创建失败
- **THEN** 显示静态渐变背景
- **AND** 不渲染任何动态特效

---

## ADDED Requirements

### Requirement: 星芒大星星

系统 SHALL 使用 Three.js Sprite 或 ShaderMaterial 实现带十字光芒效果的大星星。星芒 SHALL 包含十字形光芒和中心发光点效果。

#### Scenario: 星芒视觉效果
- **WHEN** Three.js 场景已初始化
- **THEN** 8-10 颗大星星随机分布在可视区域
- **AND** 每颗星星显示十字形光芒效果
- **AND** 中心有发光点
- **AND** 颜色从配置的调色板中随机选取 (金色、青色、白色、紫色)

#### Scenario: 星芒呼吸动画
- **WHEN** 星芒大星星已创建且动画循环运行
- **THEN** 星星大小周期性变化 (scale 0.8 - 1.2)
- **AND** 透明度周期性变化 (opacity 0.6 - 1.0)
- **AND** 动画周期约 3 秒
- **AND** 各星星动画相位随机错开

---

### Requirement: 流星效果

系统 SHALL 使用 Three.js Line 或 Particles 实现流星划过效果。流星 SHALL 包含渐变尾巴和头部发光点。

#### Scenario: 流星视觉效果
- **WHEN** Three.js 场景已初始化
- **THEN** 3-5 颗流星在场景中
- **AND** 流星有渐变尾巴（从透明到明亮白色）
- **AND** 流星头部有发光点
- **AND** 流星沿 45° 方向从左上向右下划过

#### Scenario: 流星动画循环
- **WHEN** 流星已创建且动画循环运行
- **THEN** 流星从起点移动到终点（划过整个屏幕）
- **AND** 移动时间 1-2.5 秒
- **AND** 各流星启动时间错开 3-8 秒
- **AND** 流星到达终点后重置到新的随机起点
- **AND** 循环播放

---

### Requirement: 资源管理

系统 SHALL 正确管理 Three.js 资源，防止内存泄漏。组件卸载时 SHALL 释放所有 GPU 资源。

#### Scenario: 组件卸载清理
- **WHEN** StarField 组件卸载 (onUnmounted)
- **THEN** 取消动画帧 (cancelAnimationFrame)
- **AND** 释放所有 Geometry (dispose)
- **AND** 释放所有 Material (dispose)
- **AND** 释放所有 Texture (dispose)
- **AND** 释放 WebGLRenderer (dispose + forceContextLoss)
- **AND** 移除 canvas 元素

#### Scenario: 热重载处理
- **WHEN** 开发环境下 HMR 触发组件重新挂载
- **THEN** 先清理之前的资源
- **AND** 再初始化新实例
- **AND** 不产生 WebGL 上下文泄漏

---

## REMOVED Requirements

### Requirement: CSS 星芒效果

**Reason**: 统一使用 Three.js 实现，移除 CSS ::before/::after 伪元素实现的星芒效果。

**Migration**: 使用 Three.js Sprite + 动态纹理替代。

#### Scenario: CSS 星芒不再使用
- **WHEN** StarField 组件渲染
- **THEN** 不使用 CSS 伪元素绘制星芒

### Requirement: CSS 流星动画

**Reason**: 统一使用 Three.js 实现，移除 CSS animation 实现的流星效果。

**Migration**: 使用 Three.js Line + 粒子尾迹替代。

#### Scenario: CSS 流星不再使用
- **WHEN** StarField 组件渲染
- **THEN** 不使用 CSS animation 绘制流星

### Requirement: CSS 备用星星

**Reason**: 简化实现，WebGL 不可用时仅显示静态背景。

**Migration**: 无需迁移，静态背景由 CSS 渐变提供。

#### Scenario: DOM 备用星星不再使用
- **WHEN** WebGL 不可用
- **THEN** 显示静态渐变背景而非 DOM 元素星星
