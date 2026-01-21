// 仙逆编年史 - 等级体系类型定义

/**
 * 修炼阶段
 */
export interface CultivationStep {
  step: number // 第几步（1-10）
  name: string // 境界名称
  stages: string[] // 该境界的各个小阶段
  powerType: string // 力量类型描述
  description: string // 境界详细描述
  requirements?: string // 突破要求
  characteristics?: string[] // 境界特征
}

/**
 * 等级体系数据
 */
export interface LevelSystemData {
  title: string // "仙道十步"
  description: string // 体系介绍
  steps: CultivationStep[] // 十个境界
  specialPaths: SpecialPath[] // 特殊修炼路径（如古神之躯）
}

/**
 * 特殊修炼路径
 */
export interface SpecialPath {
  id: string
  name: string
  description: string
  stages: string[]
}
