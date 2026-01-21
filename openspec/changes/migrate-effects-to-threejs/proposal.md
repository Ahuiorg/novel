# Proposal: migrate-effects-to-threejs

## Summary

将 StarField 组件中所有特效统一迁移到 Three.js 实现，移除所有 CSS/DOM 元素，实现纯 WebGL 渲染的星空背景。

## Motivation

当前 StarField.vue 混合使用了两种渲染方式：
- **Three.js**: 10000颗普通星星
- **CSS/DOM**: 8颗带星芒大星星 + 5颗流星 + 200颗备用星星

问题：
1. 混合渲染增加了代码复杂度
2. DOM 元素和 WebGL canvas 的层级管理容易出问题
3. 无法充分利用 Three.js 的 GPU 加速能力
4. 难以实现统一的 3D 视觉效果（如景深、视差）

## Proposed Solution

将所有特效统一用 Three.js 实现：

| 特效 | 当前实现 | 迁移方案 |
|-----|---------|---------|
| 普通星星 | Points (已有) | 保持不变 |
| 带星芒大星星 | CSS ::before/::after | Three.js Sprite + 星芒纹理 |
| 流星 | CSS animation | Three.js Line + 粒子尾迹 |
| CSS 备用 | DOM 元素 | 移除，WebGL 失败时显示静态提示 |

## Technical Approach

### 1. 星芒大星星 (Sprite)
- 使用 `THREE.Sprite` 或 `THREE.Points` with custom shader
- 动态生成星芒纹理（十字 + 发光效果）
- 添加呼吸动画（scale + opacity）

### 2. 流星 (Line + Particles)
- 使用 `THREE.Line` 绘制流星轨迹
- 使用 `THREE.Points` 绘制尾迹粒子
- 动画更新位置，循环重置

### 3. 统一渲染
- 所有元素在同一 Scene 中渲染
- 共享同一渲染循环
- 统一的资源管理和清理

## Impact

- **文件变更**: `web/src/components/effects/StarField.vue`
- **依赖**: 无新增（已有 Three.js）
- **性能**: GPU 渲染更高效，特别是在移动端
- **兼容性**: 依赖 WebGL，不支持时显示静态背景

## Risks & Mitigations

| 风险 | 缓解措施 |
|-----|---------|
| WebGL 不可用 | 显示静态渐变背景 + 提示信息 |
| Shader 编译失败 | 提供简化版本作为降级方案 |
| 移动端性能 | 可配置粒子数量，低端设备减少特效 |

## Success Criteria

1. 所有特效通过 Three.js 渲染
2. 模板中除容器外无其他 DOM 元素
3. 视觉效果与原实现一致或更好
4. 性能不低于原实现
