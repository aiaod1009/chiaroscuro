/**
 * 表单验证工具函数库
 */

/**
 * 验证非空字符串
 * @param {string} value - 要验证的值
 * @param {string} fieldName - 字段名称
 * @returns {string|null} 错误信息或 null
 */
export function validateRequired(value, fieldName) {
  if (!value || !String(value).trim()) {
    return `${fieldName}不能为空`
  }
  return null
}

/**
 * 验证最小长度
 * @param {string} value - 要验证的值
 * @param {number} min - 最小长度
 * @param {string} fieldName - 字段名称
 * @returns {string|null} 错误信息或 null
 */
export function validateMinLength(value, min, fieldName) {
  if (value && String(value).length < min) {
    return `${fieldName}至少需要 ${min} 个字符`
  }
  return null
}

/**
 * 验证最大长度
 * @param {string} value - 要验证的值
 * @param {number} max - 最大长度
 * @param {string} fieldName - 字段名称
 * @returns {string|null} 错误信息或 null
 */
export function validateMaxLength(value, max, fieldName) {
  if (value && String(value).length > max) {
    return `${fieldName}不能超过 ${max} 个字符`
  }
  return null
}

/**
 * 验证邮箱格式
 * @param {string} value - 要验证的值
 * @returns {string|null} 错误信息或 null
 */
export function validateEmail(value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (value && !emailRegex.test(value)) {
    return '请输入有效的邮箱地址'
  }
  return null
}

/**
 * 验证 URL 格式
 * @param {string} value - 要验证的值
 * @returns {string|null} 错误信息或 null
 */
export function validateURL(value) {
  try {
    if (value) new URL(value)
    return null
  } catch {
    return '请输入有效的 URL'
  }
}

/**
 * 验证数字范围
 * @param {number} value - 要验证的值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @param {string} fieldName - 字段名称
 * @returns {string|null} 错误信息或 null
 */
export function validateNumberRange(value, min, max, fieldName) {
  if (value === null || value === undefined) return null
  if (value < min || value > max) {
    return `${fieldName}必须在 ${min} 到 ${max} 之间`
  }
  return null
}

/**
 * 验证照片表单
 * @param {object} formData - {title, caption, locationName}
 * @returns {object} {isValid, errors: {title, caption, ...}}
 */
export function validatePhotoForm(formData) {
  const errors = {}

  if (formData.title) {
    errors.title = validateMaxLength(formData.title, 100, '标题')
  }

  if (formData.caption) {
    errors.caption = validateMaxLength(formData.caption, 500, '配文')
  }

  if (formData.locationName) {
    errors.locationName = validateMaxLength(formData.locationName, 50, '地点名')
  }

  // 移除空错误
  Object.keys(errors).forEach(key => !errors[key] && delete errors[key])

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * 验证作品集表单
 * @param {object} formData - {name, description}
 * @returns {object} {isValid, errors}
 */
export function validateWorkForm(formData) {
  const errors = {}

  if (!formData.name || !String(formData.name).trim()) {
    errors.name = '作品集名称不能为空'
  }

  if (formData.name) {
    errors.name = errors.name || validateMaxLength(formData.name, 50, '作品集名称')
  }

  if (formData.description) {
    errors.description = validateMaxLength(formData.description, 200, '作品集描述')
  }

  // 移除空错误
  Object.keys(errors).forEach(key => !errors[key] && delete errors[key])

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * 验证版本名称
 * @param {string} versionName - 版本名称
 * @returns {string|null} 错误信息或 null
 */
export function validateVersionName(versionName) {
  if (!versionName || !String(versionName).trim()) {
    return '版本名称不能为空'
  }
  if (String(versionName).length > 50) {
    return '版本名称不能超过 50 个字符'
  }
  return null
}

/**
 * 批量验证规则
 * @param {object} formData - 表单数据
 * @param {object} rules - {fieldName: [validatorFn1, validatorFn2, ...]}
 * @returns {object} {isValid, errors}
 */
export function validateFormData(formData, rules) {
  const errors = {}

  for (const [field, validatorArray] of Object.entries(rules)) {
    const value = formData[field]
    for (const validator of validatorArray) {
      const error = validator(value)
      if (error) {
        errors[field] = error
        break
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
