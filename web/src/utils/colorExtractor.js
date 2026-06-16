/**
 * 从图片提取主色调
 * @param {string} imageUrl - 图片URL
 * @param {number} colorCount - 提取颜色数量（默认10）
 * @returns {Promise<Array<{hex: string, name: string}>>} 颜色数组
 */
export async function extractColors(imageUrl, colorCount = 10) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // 缩小图片提高性能
      const maxSize = 100
      const ratio = Math.min(maxSize / img.width, maxSize / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const pixels = imageData.data

      // 量化算法提取主色
      const colors = quantize(pixels, colorCount)
      resolve(colors)
    }

    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = imageUrl
  })
}

/**
 * 简单的颜色量化算法
 */
function quantize(pixels, colorCount) {
  const colorMap = {}

  // 采样像素（每2个像素采样一次，精度更高）
  for (let i = 0; i < pixels.length; i += 8) {
    const r = Math.round(pixels[i] / 16) * 16
    const g = Math.round(pixels[i + 1] / 16) * 16
    const b = Math.round(pixels[i + 2] / 16) * 16
    const key = `${r},${g},${b}`

    if (!colorMap[key]) {
      colorMap[key] = { r, g, b, count: 0 }
    }
    colorMap[key].count++
  }

  // 按出现次数排序
  const sorted = Object.values(colorMap).sort((a, b) => b.count - a.count)

  // 过滤掉太接近的颜色（阈值更小，保留更多色彩差异）
  const result = []
  for (const color of sorted) {
    if (result.length >= colorCount) break

    const tooClose = result.some(c =>
      Math.abs(c.r - color.r) < 40 &&
      Math.abs(c.g - color.g) < 40 &&
      Math.abs(c.b - color.b) < 40
    )

    if (!tooClose) {
      result.push(color)
    }
  }

  return result.map(c => ({
    hex: '#' + [c.r, c.g, c.b].map(v => Math.min(255, v).toString(16).padStart(2, '0')).join(''),
    name: getColorName(c)
  }))
}

/**
 * 根据颜色值返回细分颜色名称
 */
function getColorName({ r, g, b }) {
  const hsl = rgbToHsl(r, g, b)
  const { h, s, l } = hsl

  // 无饱和度 → 灰阶
  if (s < 8) {
    if (l < 10) return '漆黑'
    if (l < 25) return '深灰'
    if (l < 45) return '中灰'
    if (l < 65) return '浅灰'
    if (l < 85) return '银白'
    return '纯白'
  }

  // 低饱和度 → 带灰调
  if (s < 25) {
    if (l < 30) return '暗灰调'
    if (l > 70) return '雾灰调'
    const prefix = l < 50 ? '暗' : '浅'
    return prefix + getHueName(h) + '灰'
  }

  // 按亮度细分
  const lightness = l < 30 ? '暗' : l > 70 ? '浅' : ''
  return lightness + getHueName(h)
}

function getHueName(h) {
  if (h < 10) return '红'
  if (h < 25) return '橘红'
  if (h < 40) return '橙'
  if (h < 50) return '金橙'
  if (h < 65) return '黄'
  if (h < 80) return '柠檬黄'
  if (h < 100) return '黄绿'
  if (h < 130) return '草绿'
  if (h < 155) return '翠绿'
  if (h < 170) return '青绿'
  if (h < 190) return '青'
  if (h < 210) return '天蓝'
  if (h < 235) return '蓝'
  if (h < 255) return '宝蓝'
  if (h < 275) return '蓝紫'
  if (h < 295) return '紫'
  if (h < 315) return '品红'
  if (h < 335) return '玫红'
  return '红'
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

