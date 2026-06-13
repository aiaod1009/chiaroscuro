/**
 * 文件处理工具函数库
 * 统一处理：拖拽、选择、预览、验证
 */

/**
 * 处理文件拖拽
 * @param {DragEvent} e - 拖拽事件
 * @returns {File|null} 拖拽的文件
 */
export function handleFileDrop(e) {
  return e.dataTransfer?.files?.[0] || null
}

/**
 * 处理文件选择
 * @param {Event} e - input change 事件
 * @returns {File|null} 选择的文件
 */
export function handleFileChange(e) {
  return e.target?.files?.[0] || null
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化的大小字符串
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

/**
 * 创建文件预览 URL
 * @param {File} file - 文件对象
 * @returns {string} 预览 URL
 */
export function createFilePreview(file) {
  return URL.createObjectURL(file)
}

/**
 * 清理文件预览 URL
 * @param {string} url - 预览 URL
 */
export function revokeFilePreview(url) {
  if (url) URL.revokeObjectURL(url)
}

/**
 * 验证文件类型
 * @param {File} file - 文件对象
 * @param {string} acceptStr - accept 属性字符串，如 ".jpg,.png,.webp"
 * @returns {boolean} 是否符合类型
 */
export function validateFileType(file, acceptStr) {
  if (!acceptStr) return true
  const accepts = acceptStr.split(',').map(s => s.trim().toLowerCase())
  const fileName = file.name.toLowerCase()
  return accepts.some(ext => fileName.endsWith(ext))
}

/**
 * 验证文件大小
 * @param {File} file - 文件对象
 * @param {number} maxMB - 最大 MB 数，默认 50MB
 * @returns {boolean} 是否符合大小
 */
export function validateFileSize(file, maxMB = 50) {
  return file.size <= maxMB * 1024 * 1024
}

/**
 * 读取 Canvas 并导出为 Blob（用于原始图片压缩）
 * @param {HTMLCanvasElement} canvas - Canvas 元素
 * @param {string} type - 输出类型，默认 'image/webp'
 * @param {number} quality - 质量，0-1
 * @returns {Promise<Blob>} 导出的 Blob
 */
export function canvasToBlob(canvas, type = 'image/webp', quality = 0.8) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
      type,
      quality
    )
  })
}

/**
 * 读取文件为 Data URL（用于预览）
 * @param {File} file - 文件对象
 * @returns {Promise<string>} Data URL
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 触发隐藏的文件输入框
 * @param {HTMLInputElement} fileInput - 文件输入框 ref
 */
export function triggerFileInput(fileInput) {
  fileInput?.click()
}

/**
 * 清空文件输入框
 * @param {HTMLInputElement} fileInput - 文件输入框 ref
 */
export function clearFileInput(fileInput) {
  if (fileInput) fileInput.value = ''
}
