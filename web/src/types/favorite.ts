// 仙逆编年史 - 收藏功能类型定义

/**
 * 可收藏的类型
 */
export type FavoriteType = 'era' | 'highlight' | 'ability' | 'treasure' | 'beast'

/**
 * 收藏条目
 */
export interface FavoriteItem {
  id: string
  type: FavoriteType
  targetId: string // 收藏对象的 ID
  addedAt: number // 添加时间戳
  note?: string // 个人备注（可选）
}

/**
 * 用户收藏数据
 */
export interface FavoritesData {
  items: FavoriteItem[]
  lastUpdated: number
}
