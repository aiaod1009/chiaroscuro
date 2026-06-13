/**
 * 异步状态管理工具
 * 用于统一管理 {loading, error, result} 三元组
 */

import { ref } from 'vue'

/**
 * 创建异步状态对象
 * @param {any} initialValue - 初始值，默认 null
 * @returns {object} {state, loading, error, setResult, setError, reset, isLoading, hasError}
 */
export function createAsyncState(initialValue = null) {
  const state = ref(initialValue)
  const loading = ref(false)
  const error = ref('')

  return {
    // 响应式数据
    state,
    loading,
    error,

    // 便利方法
    setResult(value) {
      state.value = value
      error.value = ''
      loading.value = false
    },

    setError(err) {
      error.value = typeof err === 'string' ? err : err?.message || '未知错误'
      loading.value = false
    },

    setLoading(isLoading = true) {
      loading.value = isLoading
    },

    reset() {
      state.value = initialValue
      loading.value = false
      error.value = ''
    },

    // 计算属性快捷方式
    get isLoading() {
      return loading.value
    },

    get hasError() {
      return !!error.value
    },

    get hasValue() {
      return state.value !== null && state.value !== undefined
    }
  }
}

/**
 * 便利 API 调用包装
 * 自动处理 loading 和 error 状态
 * @param {Function} asyncFn - 异步函数
 * @param {object} asyncState - createAsyncState() 返回的对象
 * @returns {Function} 包装后的函数
 */
export function withAsyncState(asyncFn, asyncState) {
  return async (...args) => {
    asyncState.setLoading(true)
    try {
      const result = await asyncFn(...args)
      asyncState.setResult(result)
      return result
    } catch (err) {
      asyncState.setError(err)
      throw err
    }
  }
}

/**
 * 多个异步操作的并行管理
 * @param {object} asyncFns - {key: asyncFn}
 * @param {object} asyncStates - {key: asyncState}
 * @returns {Function} 执行所有异步操作
 */
export function createParallelAsyncManager(asyncFns, asyncStates) {
  return async () => {
    // 标记全部加载中
    Object.values(asyncStates).forEach(state => state.setLoading(true))

    const results = {}
    const errors = {}

    await Promise.all(
      Object.entries(asyncFns).map(async ([key, fn]) => {
        try {
          const result = await fn()
          results[key] = result
          asyncStates[key]?.setResult(result)
        } catch (err) {
          errors[key] = err
          asyncStates[key]?.setError(err)
        }
      })
    )

    return { results, errors }
  }
}
