// 仙逆编年史 - 时间线类型定义

/**
 * 名场面类型
 */
export type HighlightType = 'epic' | 'emotional' | 'cool'

/**
 * 名场面
 */
export interface Highlight {
  id: string
  title: string // 名场面标题，如"怒杀藤化元"
  description: string // 简短描述
  type: HighlightType // 燃/泪/爽
  quote?: string // 相关台词（可选）
}

/**
 * 经典台词
 */
export interface Quote {
  id: string
  text: string // 台词内容
  speaker?: string // 说话人（可选）
  context?: string // 背景说明（可选）
}

/**
 * 境界突破记录
 */
export interface Breakthrough {
  level: string
  description: string
}

/**
 * 境界进度
 */
export interface LevelProgress {
  mainBody: string // 本体境界
  clone?: string // 分身境界
  ancientGodBody?: string // 古神之躯
}

/**
 * 纪元数据
 */
export interface Era {
  id: string
  timeRange: {
    start: number // 仙逆年开始
    end: number // 仙逆年结束
  }
  title: string // 纪元标题
  summary: string // 简短摘要（用于卡片显示）
  fullContent: string // 完整故事内容
  locations: string[] // 涉及地点
  levelProgress: LevelProgress // 境界进度
  newAbilities: string[] // 新获得神通
  newTreasures: string[] // 新获得法宝
  newBeasts: string[] // 新获得灵兽
  breakthroughs?: Breakthrough[] // 境界突破事件
  highlights: Highlight[] // 名场面
  quotes: Quote[] // 经典台词
  keyCharacters: string[] // 该纪元重要人物
}

/**
 * 时间线数据
 */
export interface TimelineData {
  eras: Era[]
  totalYears: number // 总年数
  lastUpdated: string // 最后更新时间
}
