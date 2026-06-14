/**
 * 数据转换工具函数
 * 用于地区代码的转换和映射
 */

// 导入地区常量（与后端保持一致）
export const REGION_CODE_MAP = {
  'CN-11': { id: 'beijing', name: '北京' },
  'CN-12': { id: 'tianjin', name: '天津' },
  'CN-13': { id: 'hebei', name: '河北' },
  'CN-14': { id: 'shanxi', name: '山西' },
  'CN-15': { id: 'neimenggu', name: '内蒙古' },
  'CN-21': { id: 'liaoning', name: '辽宁' },
  'CN-22': { id: 'jilin', name: '吉林' },
  'CN-23': { id: 'heilongjiang', name: '黑龙江' },
  'CN-31': { id: 'shanghai', name: '上海' },
  'CN-32': { id: 'jiangsu', name: '江苏' },
  'CN-33': { id: 'zhejiang', name: '浙江' },
  'CN-34': { id: 'anhui', name: '安徽' },
  'CN-35': { id: 'fujian', name: '福建' },
  'CN-36': { id: 'jiangxi', name: '江西' },
  'CN-37': { id: 'shandong', name: '山东' },
  'CN-41': { id: 'henan', name: '河南' },
  'CN-42': { id: 'hubei', name: '湖北' },
  'CN-43': { id: 'hunan', name: '湖南' },
  'CN-44': { id: 'guangdong', name: '广东' },
  'CN-45': { id: 'guangxi', name: '广西' },
  'CN-46': { id: 'hainan', name: '海南' },
  'CN-50': { id: 'chongqing', name: '重庆' },
  'CN-51': { id: 'sichuan', name: '四川' },
  'CN-52': { id: 'guizhou', name: '贵州' },
  'CN-53': { id: 'yunnan', name: '云南' },
  'CN-54': { id: 'xizang', name: '西藏' },
  'CN-61': { id: 'shaanxi', name: '陕西' },
  'CN-62': { id: 'gansu', name: '甘肃' },
  'CN-63': { id: 'qinghai', name: '青海' },
  'CN-64': { id: 'ningxia', name: '宁夏' },
  'CN-65': { id: 'xinjiang', name: '新疆' },
  'CN-HK': { id: 'hongkong', name: '香港' },
  'CN-MO': { id: 'macau', name: '澳门' },
  'CN-TW': { id: 'taiwan', name: '台湾' },
}

const COUNTRY_CODE_MAP = {
  JP: '日本',
  US: '美国',
  GB: '英国',
  FR: '法国',
  DE: '德国',
  IT: '意大利',
  ES: '西班牙',
  TH: '泰国',
  KR: '韩国',
  VN: '越南',
  SG: '新加坡',
  MY: '马来西亚',
  ID: '印度尼西亚',
  PH: '菲律宾',
  AU: '澳大利亚',
  NZ: '新西兰'
}

/**
 * 将地区代码转换为中文名称
 * @param {string} mapCode - 地区代码（如 CN-11 或 JP）
 * @returns {string} 中文名称
 */
export function mapCodeToName(mapCode) {
  if (mapCode?.startsWith('CN-')) {
    return REGION_CODE_MAP[mapCode]?.name || mapCode
  }
  return COUNTRY_CODE_MAP[mapCode] || mapCode
}

/**
 * 判断是否是中国省份代码
 * @param {string} mapCode - 地区代码
 * @returns {boolean}
 */
export function isProvinceCode(mapCode) {
  return mapCode?.startsWith('CN-')
}
