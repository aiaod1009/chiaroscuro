/**
 * 从图片提取主色调
 * @param {string} imageUrl - 图片URL
 * @param {number} colorCount - 提取颜色数量（默认5）
 * @returns {Promise<Array>} 颜色数组
 */
export async function extractColors(imageUrl, colorCount = 5) {
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

  // 采样像素
  for (let i = 0; i < pixels.length; i += 16) { // 每4个像素采样一次
    const r = Math.round(pixels[i] / 32) * 32
    const g = Math.round(pixels[i + 1] / 32) * 32
    const b = Math.round(pixels[i + 2] / 32) * 32
    const key = `${r},${g},${b}`

    if (!colorMap[key]) {
      colorMap[key] = { r, g, b, count: 0 }
    }
    colorMap[key].count++
  }

  // 按出现次数排序
  const sorted = Object.values(colorMap).sort((a, b) => b.count - a.count)

  // 过滤掉太接近的颜色
  const result = []
  for (const color of sorted) {
    if (result.length >= colorCount) break

    const tooClose = result.some(c =>
      Math.abs(c.r - color.r) < 64 &&
      Math.abs(c.g - color.g) < 64 &&
      Math.abs(c.b - color.b) < 64
    )

    if (!tooClose) {
      result.push(color)
    }
  }

  return result.map(c => ({
    hex: `#${c.r.toString(16).padStart(2, '0')}${c.g.toString(16).padStart(2, '0')}${c.b.toString(16).padStart(2, '0')}`,
    name: getColorName(c)
  }))
}

/**
 * 根据颜色值返回颜色名称
 */
function getColorName({ r, g, b }) {
  const hsl = rgbToHsl(r, g, b)

  if (hsl.s < 10) {
    if (hsl.l < 20) return '深黑'
    if (hsl.l > 80) return '浅白'
    return '灰色'
  }

  const hue = hsl.h
  if (hue < 15) return '红色'
  if (hue < 45) return '橙色'
  if (hue < 75) return '黄色'
  if (hue < 150) return '绿色'
  if (hue < 195) return '青色'
  if (hue < 255) return '蓝色'
  if (hue < 285) return '紫色'
  if (hue < 330) return '粉色'
  return '红色'
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
