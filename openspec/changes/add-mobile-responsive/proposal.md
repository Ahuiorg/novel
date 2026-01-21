# Change: 添加移动端响应式适配

## Why
当前「仙逆编年史」Web 应用主要针对桌面端设计，使用固定宽度的卡片（320px）和固定的间距，在移动设备上（如手机）布局会出现问题：
- 时间线卡片在小屏幕上显示不完整
- 导航栏和按钮间距过大，点击区域不友好
- 弹窗和模态框可能超出视口
- 字体大小在移动端过小或过大
- 使用 `100vh` 在移动端浏览器会被地址栏遮挡

需要采用**现代响应式设计技术**，确保在各种屏幕尺寸上都有良好的视觉效果和用户体验。

## What Changes

### 1. 全局样式基础设施
- 在 `variables.css` 中添加移动端断点变量（遵循 Tailwind 标准）
- **Fluid Typography**：使用 `clamp()` 实现字体平滑缩放
- **Fluid Spacing**：使用 `clamp()` 实现间距平滑缩放
- **动态视口单位**：使用 `dvh` 替代 `vh` 解决移动端浏览器 UI 问题
- 在 `global.css` 中添加响应式工具类

### 2. 首页 (HomePage.vue) 适配
- 顶部导航栏：缩小 logo、按钮仅显示图标
- EraCard：响应式宽度，使用 CSS `min()` 函数
- TimelineRail：移动端隐藏标签，仅保留圆点
- 底部导航：紧凑布局，图标优先
- 操作提示：移动端显示触摸手势提示

### 3. 纪元详情页 (EraDetail.vue) 适配
- 内容区域使用 fluid padding
- 标题使用 fluid typography
- 标签列表优化换行和间距

### 4. 等级体系页 (LevelSystem.vue) 适配
- 卡片单列显示
- 境界标签自适应换行

### 5. 模态框组件适配
- SearchModal：移动端接近全屏
- SettingsModal/RandomHighlight：响应式尺寸
- 确保 44x44px 最小触摸目标

## Technical Approach

### 断点策略（Mobile-First）
```css
/* Base: Mobile (< 640px) */
@media (min-width: 640px) { /* sm: 平板竖屏 */ }
@media (min-width: 768px) { /* md: 平板横屏 */ }
@media (min-width: 1024px) { /* lg: 笔记本 */ }
```

### Fluid Typography 示例
```css
:root {
  --text-base: clamp(0.875rem, 0.8rem + 0.4vw, 1rem);
  --text-xl: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --text-3xl: clamp(1.5rem, 1.25rem + 1.25vw, 2rem);
}
```

### 动态视口单位
```css
.full-height {
  height: 100dvh; /* 自动适应移动端浏览器 UI */
}
```

## Impact
- Affected code: 
  - `web/src/styles/variables.css` - 添加断点、fluid 变量
  - `web/src/styles/global.css` - 响应式工具类
  - `web/src/views/HomePage.vue`
  - `web/src/views/EraDetail.vue`
  - `web/src/views/LevelSystem.vue`
  - `web/src/views/Collection.vue`
  - `web/src/views/Favorites.vue`
  - `web/src/components/timeline/EraCard.vue`
  - `web/src/components/timeline/TimelineRail.vue`
  - `web/src/components/common/SearchModal.vue`
  - `web/src/components/common/SettingsModal.vue`
  - `web/src/components/highlight/RandomHighlight.vue`
- 不涉及功能逻辑变更，仅 CSS/样式调整
- 不影响现有桌面端用户体验（渐进增强）
