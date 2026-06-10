// server/routes/constants.js

const REGION_CODE_TO_NAME = {
  'CN-11': '北京', 'CN-12': '天津', 'CN-13': '河北', 'CN-14': '山西',
  'CN-15': '内蒙古', 'CN-21': '辽宁', 'CN-22': '吉林', 'CN-23': '黑龙江',
  'CN-31': '上海', 'CN-32': '江苏', 'CN-33': '浙江', 'CN-34': '安徽',
  'CN-35': '福建', 'CN-36': '江西', 'CN-37': '山东', 'CN-41': '河南',
  'CN-42': '湖北', 'CN-43': '湖南', 'CN-44': '广东', 'CN-45': '广西',
  'CN-46': '海南', 'CN-50': '重庆', 'CN-51': '四川', 'CN-52': '贵州',
  'CN-53': '云南', 'CN-54': '西藏', 'CN-61': '陕西', 'CN-62': '甘肃',
  'CN-63': '青海', 'CN-64': '宁夏', 'CN-65': '新疆', 'CN-HK': '香港',
  'CN-MO': '澳门', 'CN-TW': '台湾'
};

const COUNTRY_CN_TO_CODE = {
  '中国': 'CN', '日本': 'JP', '韩国': 'KR', '新加坡': 'SG',
  '泰国': 'TH', '越南': 'VN', '马来西亚': 'MY', '印度尼西亚': 'ID',
  '菲律宾': 'PH', '印度': 'IN', '美国': 'US', '加拿大': 'CA',
  '墨西哥': 'MX', '巴西': 'BR', '阿根廷': 'AR', '智利': 'CL',
  '英国': 'GB', '法国': 'FR', '德国': 'DE', '意大利': 'IT',
  '西班牙': 'ES', '葡萄牙': 'PT', '荷兰': 'NL', '比利时': 'BE',
  '瑞士': 'CH', '奥地利': 'AT', '挪威': 'NO', '瑞典': 'SE',
  '芬兰': 'FI', '冰岛': 'IS', '丹麦': 'DK', '俄罗斯': 'RU',
  '澳大利亚': 'AU', '新西兰': 'NZ'
};

// 由 COUNTRY_CN_TO_CODE 自动生成反向映射
const COUNTRY_CODE_TO_CN = Object.fromEntries(
  Object.entries(COUNTRY_CN_TO_CODE).map(([cn, code]) => [code, cn])
);

module.exports = {
  REGION_CODE_TO_NAME,
  COUNTRY_CN_TO_CODE,
  COUNTRY_CODE_TO_CN
};
