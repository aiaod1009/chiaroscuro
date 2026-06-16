/**
 * 照片相关 API 调用封装
 */

import axios from 'axios'

const API_BASE = '/api'

/**
 * 获取 COS 临时上传凭证
 * @returns {Promise<object>} STS 凭证数据
 */
export async function fetchCOSCredentials() {
  const { data } = await axios.get(`${API_BASE}/cos/sts`)
  return data
}

/**
 * 上传原图（WebP 草稿）
 * @param {object} payload - {imageUrl, fileName, locationName, region, exif, selectedAlbumId}
 * @returns {Promise<object>} API 响应
 */
export async function uploadRawPhoto(payload) {
  const { data } = await axios.post(`${API_BASE}/photos/upload-raw`, payload)
  return data
}

/**
 * 上传成片版本
 * @param {File} file - 图片文件
 * @param {string} parentId - 原图 ID
 * @param {string} versionName - 版本名称
 * @returns {Promise<object>} API 响应
 */
export async function uploadMasterVersion(file, parentId, versionName = '未命名调色版') {
  const formData = new FormData()
  formData.append('photo', file)
  formData.append('parentId', parentId)
  formData.append('versionName', versionName)

  const { data } = await axios.post(`${API_BASE}/photos/upload-master`, formData)
  return data
}

/**
 * 获取草稿列表
 * @returns {Promise<Array>} 草稿数组
 */
export async function fetchDrafts() {
  const { data } = await axios.get(`${API_BASE}/photos/drafts`)
  return data.success ? data.data : []
}

/**
 * 获取作品集列表
 * @returns {Promise<Array>} 作品集数组
 */
export async function fetchWorks() {
  const { data } = await axios.get(`${API_BASE}/works`)
  return data.success ? data.data : []
}

/**
 * 按地区获取照片列表
 * @param {string} mapCode - 地区代码（如 CN-11、JP）
 * @param {number} page - 页码，默认 1
 * @param {number} limit - 每页数量，默认 20
 * @returns {Promise<object>} 照片列表数据
 */
export async function fetchPhotosByRegion(mapCode, page = 1, limit = 20) {
  const { data } = await axios.get(`${API_BASE}/photos/gallery/${mapCode}`, {
    params: { page, limit }
  })
  return data.success ? data.data : null
}

/**
 * 获取单张照片详情
 * @param {string} photoId - 照片 ID
 * @returns {Promise<object>} 照片详情
 */
export async function fetchPhotoDetail(photoId) {
  const { data } = await axios.get(`${API_BASE}/photos/${photoId}`)
  return data.success ? data.data : null
}

/**
 * 获取足迹数据（地区聚合）
 * @returns {Promise<Array>} 足迹数组
 */
export async function fetchFootprints() {
  const { data } = await axios.get(`${API_BASE}/photos/footprints`)
  return data.success ? data.data : []
}

/**
 * 获取首页明信片照片
 * @param {number} limit - 返回数量，默认 11
 * @returns {Promise<Array>} 明信片照片数组
 */
export async function fetchPhotoPostcards(limit = 11) {
  const { data } = await axios.get(`${API_BASE}/photos/postcards`, {
    params: { limit }
  })
  return data.success ? data.data : []
}


/**
 * 更新照片标题和配文
 * @param {string} photoId - 照片 ID
 * @param {object} updateData - {title, caption}
 * @returns {Promise<object>} API 响应
 */
export async function updatePhoto(photoId, updateData) {
  const { data } = await axios.patch(`${API_BASE}/photos/${photoId}`, updateData)
  return data
}

/**
 * 从作品集移除照片
 * @param {string} photoId - 照片 ID
 * @param {string} albumId - 作品集 ID
 * @returns {Promise<object>} API 响应
 */
export async function removePhotoFromAlbum(photoId, albumId) {
  const { data } = await axios.patch(`${API_BASE}/photos/${photoId}/remove-album`, { albumId })
  return data
}

/**
 * 移动照片到其他作品集
 * @param {string} photoId - 照片 ID
 * @param {string} targetAlbumId - 目标作品集 ID
 * @returns {Promise<object>} API 响应
 */
export async function movePhoto(photoId, targetAlbumId) {
  const { data } = await axios.patch(`${API_BASE}/photos/${photoId}/move`, {
    targetAlbumId
  })
  return data
}

/**
 * 复制照片到其他作品集
 * @param {string} photoId - 照片 ID
 * @param {string} targetAlbumId - 目标作品集 ID
 * @returns {Promise<object>} API 响应
 */
export async function copyPhoto(photoId, targetAlbumId) {
  const { data } = await axios.patch(`${API_BASE}/photos/${photoId}/copy`, {
    targetAlbumId
  })
  return data
}

/**
 * 删除照片
 * @param {string} photoId - 照片 ID
 * @returns {Promise<object>} API 响应
 */
export async function deletePhoto(photoId) {
  const { data } = await axios.delete(`${API_BASE}/photos/${photoId}`)
  return data
}

/**
 * 设置展示版本
 * @param {string} photoId - 照片 ID
 * @param {string|null} versionId - 版本 ID，null 表示取消展示版
 * @returns {Promise<object>} API 响应
 */
export async function setDisplayVersion(photoId, versionId) {
  const { data } = await axios.patch(`${API_BASE}/photos/${photoId}/display-version`, { versionId })
  return data
}

/**
 * 缓存色彩分析结果
 * @param {string} photoId - 照片 ID
 * @param {Array} colors - 颜色数组
 * @returns {Promise<object>} API 响应
 */
export async function savePhotoColors(photoId, colors) {
  const { data } = await axios.patch(`${API_BASE}/photos/${photoId}/colors`, { colors })
  return data
}

/**
 * 获取照片的所有版本
 * @param {string} photoId - 照片 ID
 * @returns {Promise<object>} 版本列表数据
 */
export async function fetchPhotoVersions(photoId) {
  const { data } = await axios.get(`${API_BASE}/photos/${photoId}/versions`)
  return data.success ? data.data : null
}

/**
 * 获取单个作品集详情
 * @param {string} workId - 作品集 ID
 * @returns {Promise<object>} 作品集详情
 */
export async function fetchWorkDetail(workId) {
  const { data } = await axios.get(`${API_BASE}/works/${workId}`)
  return data.success ? data.data : null
}

/**
 * 创建作品集
 * @param {object} workData - {name, description, realDate, coverImage}
 * @returns {Promise<object>} API 响应
 */
export async function createWork(workData) {
  const { data } = await axios.post(`${API_BASE}/works`, workData)
  return data
}

/**
 * 更新作品集
 * @param {string} workId - 作品集 ID
 * @param {object} updateData - 更新数据
 * @returns {Promise<object>} API 响应
 */
export async function updateWork(workId, updateData) {
  const { data } = await axios.patch(`${API_BASE}/works/${workId}`, updateData)
  return data
}

/**
 * AI 首轮生成
 * @param {string} photoId - 照片 ID
 * @param {string} imageUrl - 照片 URL
 * @param {string} style - 风格名称
 * @returns {Promise<object>} API 响应
 */
export async function generateFirstRound(photoId, imageUrl, style) {
  const { data } = await axios.post(`${API_BASE}/ai/inspire/first-round`, {
    photoId,
    imageUrl,
    style
  })
  return data
}

/**
 * AI 迭代优化
 * @param {string} sessionId - 会话 ID
 * @param {number} optionId - 方案 ID
 * @param {string} userFeedback - 用户反馈
 * @param {object} currentContent - 当前内容 {title, caption}
 * @returns {Promise<object>} API 响应
 */
export async function iterateGeneration(sessionId, optionId, userFeedback, currentContent) {
  const { data } = await axios.post(`${API_BASE}/ai/inspire/iterate`, {
    sessionId,
    optionId,
    currentContent,
    userFeedback
  })
  return data
}

/**
 * 获取 AI 会话历史
 * @param {string} photoId - 照片 ID
 * @param {string} style - 风格
 * @returns {Promise<object>} API 响应
 */
export async function fetchAISession(photoId, style) {
  const { data } = await axios.get(`${API_BASE}/ai/inspire/session`, {
    params: { photoId, style }
  })
  return data
}

/**
 * 流式构图分析
 * @param {string} imageUrl - 图片 URL
 * @param {string} photoId - 照片 ID（可选）
 * @param {Function} onChunk - 接收每个流块的回调
 * @returns {Promise<void>}
 */
export async function analyzeCompositionStream(imageUrl, photoId, onChunk) {
  const response = await fetch(`${API_BASE}/ai/analyze-composition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, photoId })
  })

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.slice(6)
          if (content !== '[DONE]') {
            try {
              const parsed = JSON.parse(content)
              onChunk(parsed)
            } catch {
              // 忽略 JSON 解析错误
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
