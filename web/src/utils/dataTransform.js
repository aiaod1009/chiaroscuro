/**
 * 数据转换工具函数
 * 用于地区代码、EXIF 数据等的转换和映射
 */

// 导入地区常量（与后端保持一致）
const REGION_CODE_MAP = {
  'CN-11': { id: 'beijing', name: '北京' },
  'CN-12': { id: 'tianjin', name: '天津' },
  'CN-13': { id: 'hebei', name: '河北' },
  'CN-14': { id: 'shanxi', name: '山西' },
  'CN-15': { id: 'neimeng', name: '内蒙古' },
  'CN-21': { id: 'liaoning', name: '辽宁' },
  'CN-22': { id: 'jilin', name: '吉林' },
  'CN-23': { id: 'heilong', name: '黑龙江' },
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
  'CN-65': { id: 'xinjiang', name: '新疆' }
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
  // 国家代码映射
  const countryMap = {
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
  return countryMap[mapCode] || mapCode
}

/**
 * 判断是否是中国省份代码
 * @param {string} mapCode - 地区代码
 * @returns {boolean}
 */
export function isProvinceCode(mapCode) {
  return mapCode?.startsWith('CN-')
}

/**
 * 标准化 EXIF 数据格式
 * @param {object} rawExif - 原始 EXIF 数据
 * @returns {object} 标准化后的 EXIF 数据
 */
export function parseExifData(rawExif) {
  if (!rawExif) return null

  return {
    camera: rawExif.Model || rawExif.Make || 'Unknown Camera',
    lens: rawExif.LensModel || 'Unknown Lens',
    aperture: rawExif.FNumber ? `f/${rawExif.FNumber}` : 'f/0.0',
    iso: String(rawExif.ISO || '0'),
    shutterSpeed: rawExif.ExposureTime
      ? rawExif.ExposureTime < 1
        ? `1/${Math.round(1 / rawExif.ExposureTime)}s`
        : `${rawExif.ExposureTime}s`
      : 'Unknown',
    focalLength: rawExif.FocalLength ? `${rawExif.FocalLength}mm` : 'Unknown',
    dateTime: rawExif.DateTimeOriginal || rawExif.CreateDate || null
  }
}

/**
 * 按地区聚合照片数组
 * @param {Array} photos - 照片数组
 * @returns {object} 按地区代码分组的对象
 */
export function aggregatePhotosByRegion(photos) {
  const map = {}

  for (const photo of photos) {
    const mapCode = photo.mapCode || photo.region || 'unknown'
    if (!map[mapCode]) {
      map[mapCode] = {
        mapCode,
        name: mapCodeToName(mapCode),
        photos: [],
        count: 0
      }
    }
    map[mapCode].photos.push(photo)
    map[mapCode].count++
  }

  return map
}

/**
 * 从地区聚合数据转换为展示格式
 * @param {Array} aggregated - 聚合后的数据数组
 * @returns {Array} 转换后的展示格式
 */
export function transformRegionData(aggregated) {
  return aggregated.map(item => {
    const isProvince = item.mapCode?.startsWith('CN-')

    if (isProvince) {
      const meta = REGION_CODE_MAP[item.mapCode]
      return {
        id: meta?.id || item.mapCode,
        name: meta?.name || item.mapCode,
        mapCode: item.mapCode,
        albums: item.albumCount || 0,
        photoCount: item.photoCount || 0,
        photos: item.photos || []
      }
    }

    return {
      id: item.mapCode?.toLowerCase() || 'unknown',
      name: item.locationName || mapCodeToName(item.mapCode),
      mapCode: item.mapCode,
      albums: item.albumCount || 0,
      photoCount: item.photoCount || 0,
      photos: item.photos || []
    }
  })
}

/**
 * 将相对时间转为日期对象
 * @param {string} dateTime - 日期时间字符串，如 "2024-06-13T10:30:00"
 * @returns {Date} 日期对象
 */
export function parseDateTime(dateTime) {
  return dateTime ? new Date(dateTime) : null
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date|string} date - 日期
 * @returns {string} 格式化后的日期
 */
export function formatDate(date) {
  const d = typeof date === 'string' ? new Date(date) : date
  if (!(d instanceof Date)) return ''
  return d.toISOString().split('T')[0]
}

/**
 * 格式化日期为 YYYY-MM-DD HH:mm
 * @param {Date|string} date - 日期
 * @returns {string} 格式化后的日期时间
 */
export function formatDateTime(date) {
  const d = typeof date === 'string' ? new Date(date) : date
  if (!(d instanceof Date)) return ''
  return d.toISOString().replace('T', ' ').split('.')[0]
}

/**
 * 计算两个日期的天数差
 * @param {Date|string} date1 - 开始日期
 * @param {Date|string} date2 - 结束日期
 * @returns {number} 天数差
 */
export function daysDifference(date1, date2) {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24))
}

/**
 * 按年份分组照片
 * @param {Array} photos - 照片数组
 * @returns {object} 按年份分组的对象
 */
export function groupPhotosByYear(photos) {
  const map = {}

  for (const photo of photos) {
    const date = new Date(photo.createdAt)
    const year = date.getFullYear()

    if (!map[year]) {
      map[year] = []
    }
    map[year].push(photo)
  }

  return map
}
