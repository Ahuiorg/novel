# Tasks: 移动端响应式适配

## 1. 基础设施 - CSS 变量与工具类

- [x] 1.1 在 `variables.css` 添加断点变量
  ```css
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  ```

- [x] 1.2 添加 Fluid Typography 变量（使用 clamp）
  ```css
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.813rem, 0.75rem + 0.3vw, 0.875rem);
  --text-base: clamp(0.875rem, 0.8rem + 0.4vw, 1rem);
  --text-lg: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-xl: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --text-2xl: clamp(1.25rem, 1rem + 1.25vw, 1.5rem);
  --text-3xl: clamp(1.5rem, 1.25rem + 1.25vw, 2rem);
  --text-5xl: clamp(2rem, 1.5rem + 2.5vw, 3rem);
  ```

- [x] 1.3 添加 Fluid Spacing 变量
  ```css
  --spacing-xs: clamp(2px, 0.125rem + 0.1vw, 4px);
  --spacing-sm: clamp(4px, 0.25rem + 0.2vw, 8px);
  --spacing-md: clamp(8px, 0.5rem + 0.5vw, 16px);
  --spacing-lg: clamp(16px, 1rem + 0.5vw, 24px);
  --spacing-xl: clamp(20px, 1.25rem + 0.75vw, 32px);
  ```

- [x] 1.4 在 `global.css` 添加响应式工具类
  ```css
  .hide-mobile { } /* 小屏隐藏 */
  .show-mobile { } /* 仅小屏显示 */
  .touch-target { min-width: 44px; min-height: 44px; }
  ```

- [x] 1.5 更新全局使用 `100dvh` 替代 `100vh`

## 2. 首页 (HomePage.vue) 适配

- [x] 2.1 顶部导航栏 `.top-bar` 移动端适配
  - 减少 padding: `padding: 0 var(--spacing-md)`
  - Logo 字体缩小: `font-size: var(--text-xl)` on mobile
  - 「继续阅读」按钮移动端仅显示图标（隐藏 `.label`）

- [x] 2.2 TimelineRail 移动端适配
  - 高度从 60px 减少到 40px
  - 隐藏 `.marker-label` 文字
  - 缩小 `.marker-dot` 尺寸

- [x] 2.3 EraCard 响应式宽度
  ```css
  .era-card {
    width: min(280px, calc(100vw - 48px));
    min-width: min(280px, calc(100vw - 48px));
  }
  ```
  - 调整内部 padding 和字体大小

- [x] 2.4 `.timeline-padding` 响应式调整
  - 移动端减少 padding 宽度

- [x] 2.5 底部导航 `.bottom-nav` 移动端适配
  - 减少 `gap` 间距: `gap: var(--spacing-xs)`
  - 缩小 `.nav-label` 字体
  - 确保 44x44px 触摸目标

- [x] 2.6 `.current-info` 移动端适配
  - 调整位置和 padding
  - 限制最大宽度防止溢出

## 3. 纪元详情页 (EraDetail.vue) 适配

- [x] 3.1 `.detail-header` 移动端布局
  - 减少 padding
  - 高度调整为 56px

- [x] 3.2 `.detail-content` 响应式
  - `padding: 72px var(--spacing-md) var(--spacing-2xl)` on mobile
  - `max-width: 100%` on mobile

- [x] 3.3 `.hero-section` 适配
  - `.era-title` 使用 fluid typography
  - `.era-summary` 减少 max-width 限制

- [x] 3.4 `.tag-list` 优化
  - 确保正确换行
  - 调整 gap 间距

- [x] 3.5 `.era-nav` 移动端按钮适配
  - 减小字体大小和 padding
  - 确保触摸友好 (44px 最小高度)

## 4. 等级体系页 (LevelSystem.vue) 适配

- [x] 4.1 `.page-header` 移动端布局
  - 减少 padding
  - 标题字体缩小

- [x] 4.2 `.page-content` 响应式
  - 减少 padding
  - `margin-top` 调整

- [x] 4.3 `.step-card` 适配
  - `.step-header` 改为可换行布局
  - `.step-number` 尺寸缩小（44px on mobile）

- [x] 4.4 `.paths-grid` 响应式
  - 移动端单列: `grid-template-columns: 1fr`

## 5. 其他页面适配

- [x] 5.1 Collection.vue 移动端适配
  - 网格布局响应式（移动端单列）
  - 搜索栏和筛选器布局调整

- [x] 5.2 Favorites.vue 移动端适配
  - 卡片网格响应式（移动端单列）
  - 标签页移动端优化

## 6. 模态框/弹窗组件适配

- [x] 6.1 SearchModal 移动端适配
  - `max-width: calc(100vw - 24px)` on mobile
  - `padding-top: 5vh` on mobile
  - `.search-types` 按钮可滚动
  - 缩小搜索框和结果项

- [x] 6.2 SettingsModal 移动端适配
  - 全宽显示
  - 内容区域可滚动
  - 选项按钮适配

- [x] 6.3 RandomHighlight 移动端适配
  - 响应式宽度
  - 内容适配
  - 操作按钮布局优化

- [x] 6.4 ShareCard 移动端适配
  - 卡片尺寸响应式缩放
  - 操作按钮适配

## 7. 测试与验证

- [ ] 7.1 浏览器开发者工具测试
  - iPhone SE (375px)
  - iPhone 14 (390px)
  - iPhone 14 Pro Max (430px)
  - iPad Mini (768px)

- [ ] 7.2 测试横屏模式
  - 确保布局不崩溃
  - 时间线滚动正常

- [ ] 7.3 验证触摸交互
  - 所有按钮可点击
  - 卡片滑动顺畅
  - 弹窗关闭正常

- [ ] 7.4 验证动态视口
  - 移动端浏览器地址栏隐藏/显示时布局正确
  - 底部导航不被遮挡
