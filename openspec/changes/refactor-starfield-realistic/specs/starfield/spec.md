# Spec: Realistic 3D Starfield

## Overview

StarField 组件使用 Three.js 实现真实的 3D 星空效果，相机位于星空球体中心，星星在四周缓慢旋转，呈现"仰望星空，星辰流转"的视觉效果。

---

## MODIFIED Requirements

### Requirement: 星空渲染

StarField 组件 SHALL 使用 Three.js 渲染 3D 星空。星空 SHALL 给人"身处宇宙，仰望星空"的沉浸感。

#### Scenario: 包围球分布
- **WHEN** StarField 组件初始化
- **THEN** 相机位于原点 (0, 0, 0)
- **AND** 星星均匀分布在相机周围的球面上
- **AND** 球面半径范围 200-800
- **AND** 无论相机朝向哪里，视野内都有星星

#### Scenario: 星等系统
- **WHEN** 生成星星
- **THEN** 星星按照 1-6 等星分布
- **AND** 6等星（暗）数量最多，约 50%
- **AND** 1等星（亮）数量最少，约 1-2%
- **AND** 亮星比暗星更大

#### Scenario: 颜色分布
- **WHEN** 生成星星颜色
- **THEN** 约 80% 为白色/淡白色
- **AND** 约 10% 为蓝白色（模拟 O/B 型星）
- **AND** 约 10% 为橙红色（模拟 K/M 型星）

---

### Requirement: 旋转动画

星空 SHALL 整体缓慢旋转，呈现"星辰流转"的动态效果。

#### Scenario: 旋转行为
- **WHEN** 动画循环运行
- **THEN** 星空球体绕 Y 轴缓慢旋转
- **AND** 旋转速度约 60 秒一圈（可配置）
- **AND** 旋转平滑，无跳跃

---

## ADDED Requirements

### Requirement: 自然闪烁

星空 SHALL 包含自然的闪烁效果，模拟大气湍流和星星本身的光度变化。

#### Scenario: 闪烁分布
- **WHEN** 动画运行
- **THEN** 约 10-20% 的星星有明显闪烁
- **AND** 每颗闪烁星星的频率和幅度不同
- **AND** 闪烁波形不规则（非简单正弦波）

#### Scenario: 闪烁视觉
- **WHEN** 星星闪烁
- **THEN** 亮度变化平滑
- **AND** 变化幅度在原亮度的 ±30% 以内
- **AND** 整体效果自然，不机械

---

## REMOVED Requirements

### Requirement: 星芒大星星

**Reason**: 过于花哨，不符合真实星空效果。

#### Scenario: 移除星芒
- **WHEN** StarField 渲染
- **THEN** 不显示带十字光芒的 Sprite 大星星

### Requirement: 流星效果

**Reason**: 简化实现。可作为未来可选功能。

#### Scenario: 移除流星
- **WHEN** StarField 渲染
- **THEN** 不显示流星
