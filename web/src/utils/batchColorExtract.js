/**
 * 批量补色工具
 * 遍历所有没有颜色数据的照片，提取主色调并存储
 */

import { extractColors } from './colorExtractor'
import { fetchPhotosWithoutColors, savePhotoColors } from './photoApi'

/**
 * 批量补色
 * @param {Function} onProgress - 进度回调 (processed, total, current)
 * @returns {Promise<number>} 处理的总数量
 */
export async function batchExtractColors(onProgress) {
  let totalProcessed = 0

  while (true) {
    const batch = await fetchPhotosWithoutColors(20)
    if (batch.length === 0) break

    for (const photo of batch) {
      try {
        const colors = await extractColors(photo.imageUrl, 10)
        await savePhotoColors(photo.id, colors)
        totalProcessed++
        if (onProgress) onProgress(totalProcessed, photo.id)
      } catch (err) {
        console.warn(`跳过照片 ${photo.id}:`, err.message)
        totalProcessed++
        if (onProgress) onProgress(totalProcessed, photo.id, true)
      }
    }
  }

  return totalProcessed
}
