# Tasks: migrate-effects-to-threejs

## Phase 1: 星芒大星星迁移

### 1.1 创建星芒纹理生成器
- [x] 使用 Canvas 2D API 动态生成星芒纹理
- [x] 支持十字光芒 + 中心发光效果
- [x] 支持多种颜色配置

### 1.2 实现 Three.js 星芒星星
- [x] 使用 THREE.Sprite 或 ShaderMaterial 实现
- [x] 添加呼吸脉冲动画（scale + opacity）
- [x] 随机分布 8-10 颗大星星
- [x] 确保星芒效果与原 CSS 实现视觉一致

## Phase 2: 流星效果迁移

### 2.1 实现流星主体
- [x] 使用 THREE.Line 或自定义 Shader 绘制流星
- [x] 实现渐变尾巴效果（从透明到明亮）
- [x] 头部发光点效果

### 2.2 实现流星动画
- [x] 流星从起点到终点的移动动画
- [x] 3-5 颗流星错开时间循环
- [x] 流星消失后重置位置继续循环

## Phase 3: 清理与整合

### 3.1 移除 CSS/DOM 实现
- [x] 删除 cssStars、bigStars、meteors 响应式数据
- [x] 删除 generateCSSStars、generateBigStars、generateMeteors 函数
- [x] 删除模板中的 DOM 元素（保留容器）
- [x] 删除相关 CSS 样式

### 3.2 统一渲染循环
- [x] 所有特效在 animate() 中统一更新
- [x] 统一的资源清理逻辑
- [x] 优化内存管理

### 3.3 WebGL 降级处理
- [x] WebGL 不可用时显示静态渐变背景
- [x] 可选：显示简单提示文字 (使用 CSS 渐变背景作为降级)

## Phase 4: 验证

### 4.1 视觉验证
- [ ] 星芒效果与原实现对比
- [ ] 流星效果与原实现对比
- [ ] 整体视觉效果协调

### 4.2 性能验证
- [ ] 桌面端帧率测试
- [ ] 移动端帧率测试
- [ ] 内存使用监控

### 4.3 兼容性验证
- [ ] Chrome/Firefox/Safari 测试
- [ ] iOS/Android 移动端测试
- [ ] WebGL 降级场景测试
