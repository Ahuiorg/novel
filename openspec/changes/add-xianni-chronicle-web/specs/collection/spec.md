# Collection - 图鉴收集页

## ADDED Requirements

### Requirement: 图鉴分类展示
系统 SHALL 分类展示所有收集品（神通、法宝、灵兽）。

#### Scenario: 分类导航
- **WHEN** 用户进入图鉴页
- **THEN** 显示三个主分类：神通、法宝、灵兽
- **AND** 显示各分类的收集数量统计
- **AND** 默认显示全部或第一个分类

#### Scenario: 分类切换
- **WHEN** 用户点击分类标签
- **THEN** 平滑切换到对应分类内容
- **AND** URL 同步更新（/collection/abilities 等）

---

### Requirement: 神通图鉴
系统 SHALL 展示王林习得的所有神通。

#### Scenario: 神通列表
- **WHEN** 查看神通分类
- **THEN** 以卡片网格展示所有神通
- **AND** 卡片显示神通名称和图标
- **AND** 按获取时间排序

#### Scenario: 神通详情
- **WHEN** 用户点击神通卡片
- **THEN** 显示详情弹窗
- **AND** 显示神通名称、描述、获取时期
- **AND** 弹窗有紫色光效边框

---

### Requirement: 法宝图鉴
系统 SHALL 展示王林获得的所有法宝。

#### Scenario: 法宝列表
- **WHEN** 查看法宝分类
- **THEN** 以卡片网格展示所有法宝
- **AND** 卡片显示法宝名称和图标
- **AND** 可按获取时间或稀有度排序

#### Scenario: 法宝详情
- **WHEN** 用户点击法宝卡片
- **THEN** 显示详情弹窗
- **AND** 显示法宝名称、描述、获取时期
- **AND** 弹窗有金色光效边框

---

### Requirement: 灵兽图鉴
系统 SHALL 展示王林收服的所有灵兽。

#### Scenario: 灵兽列表
- **WHEN** 查看灵兽分类
- **THEN** 以卡片网格展示所有灵兽
- **AND** 卡片显示灵兽名称
- **AND** 按获取时间排序

#### Scenario: 灵兽详情
- **WHEN** 用户点击灵兽卡片
- **THEN** 显示详情弹窗
- **AND** 显示灵兽名称、描述、获取时期
- **AND** 弹窗有青色光效边框

---

### Requirement: 图鉴搜索筛选
系统 SHALL 提供图鉴内搜索和筛选功能。

#### Scenario: 搜索功能
- **WHEN** 用户在搜索框输入关键词
- **THEN** 实时过滤显示匹配的收集品
- **AND** 高亮匹配的文字

#### Scenario: 时间筛选
- **WHEN** 用户选择时间范围筛选
- **THEN** 只显示该时期获取的收集品

---

### Requirement: 收集品时间轴
系统 SHALL 可选以时间轴形式展示收集品获取顺序。

#### Scenario: 时间轴视图
- **WHEN** 用户切换到时间轴视图
- **THEN** 以垂直时间轴形式展示收集品
- **AND** 时间轴上标注获取时期
- **AND** 可点击跳转到对应纪元详情
