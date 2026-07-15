// 数据分析规则常量（tag 级，领域通识）
// 注：具体英雄级 synergy/counter 表待人工扩充（见 DEVELOPMENT.md），当前用 tag 级规则做 MVP

// tag 克制关系：key 克制 values（刺客→射手/法师、坦克→刺客、射手→坦克、法师→战士/坦克、战士→射手/法师）
export const COUNTER_RULES: Record<string, string[]> = {
  Assassin: ['Marksman', 'Mage'],
  Tank: ['Assassin'],
  Marksman: ['Tank'],
  Mage: ['Fighter', 'Tank'],
  Fighter: ['Marksman', 'Mage'],
}

// 经典协同组合：key 与 values 同时出现时加分
export const SYNERGY_PAIRS: Record<string, string[]> = {
  Assassin: ['Marksman'], // 刺客配合射手收割
  Support: ['Mage', 'Marksman', 'Fighter'], // 辅助保护核心
  Tank: ['Mage', 'Marksman'], // 前排保护后排
  Fighter: ['Support'],
}

// 理想阵容应覆盖的标签（多样性）
export const DESIRED_TAGS = ['Marksman', 'Mage', 'Tank', 'Support', 'Fighter', 'Assassin']
