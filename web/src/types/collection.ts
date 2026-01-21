// 仙逆编年史 - 收集品类型定义

/**
 * 收集品类型
 */
export type CollectibleType = 'ability' | 'treasure' | 'beast'

/**
 * 收集品条目
 */
export interface CollectibleItem {
  id: string
  name: string
  type: CollectibleType
  description?: string // 详细描述
  obtainedEra: string // 获得时的纪元ID
  obtainedYear?: number // 获得时的仙逆年
  category?: string // 子分类（如法宝的品级）
  origin?: string // 来源
  power?: string // 威力/能力描述
}

/**
 * 收集品数据
 */
export interface CollectionData {
  abilities: CollectibleItem[] // 神通
  treasures: CollectibleItem[] // 法宝
  beasts: CollectibleItem[] // 灵兽
}

/**
 * 收集品分类统计
 */
export interface CollectionStats {
  totalAbilities: number
  totalTreasures: number
  totalBeasts: number
  total: number
}
