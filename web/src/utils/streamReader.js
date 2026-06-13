/**
 * 流式数据读取工具
 * 用于处理 SSE (Server-Sent Events) 响应
 */

/**
 * 读取 SSE 流响应
 * @param {Response} response - fetch 响应对象
 * @param {Function} onChunk - 接收每个数据块的回调
 * @param {Function} onComplete - 完成回调（可选）
 * @param {Function} onError - 错误回调（可选）
 * @returns {Promise<void>}
 */
export async function readSSEStream(response, onChunk, onComplete, onError) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')

      // 保留最后一个未完整的行到缓冲区
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()

        // 跳过空行和注释
        if (!trimmed || trimmed.startsWith(':')) continue

        // 处理 data: 前缀
        if (trimmed.startsWith('data: ')) {
          const content = trimmed.slice(6)

          // 检查结束标记
          if (content === '[DONE]') {
            onComplete?.()
            return
          }

          // 尝试解析 JSON
          try {
            const parsed = JSON.parse(content)
            onChunk(parsed)
          } catch (parseErr) {
            // 如果不是 JSON，直接传递原始内容
            onChunk({ content })
          }
        }

        // 处理 event: 和其他 SSE 字段
        if (trimmed.startsWith('event: ')) {
          const eventType = trimmed.slice(7)
          onChunk({ _event: eventType })
        }
      }
    }

    onComplete?.()
  } catch (err) {
    onError?.(err)
    throw err
  } finally {
    reader.releaseLock()
  }
}

/**
 * 读取标准 JSON Lines 流（每行一个 JSON 对象）
 * @param {Response} response - fetch 响应对象
 * @param {Function} onLine - 接收每行 JSON 的回调
 * @param {Function} onComplete - 完成回调
 * @param {Function} onError - 错误回调
 * @returns {Promise<void>}
 */
export async function readJSONLinesStream(response, onLine, onComplete, onError) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')

      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue

        try {
          const parsed = JSON.parse(trimmed)
          onLine(parsed)
        } catch (parseErr) {
          console.warn('JSON parse error:', parseErr, line)
        }
      }
    }

    // 处理最后一行
    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer.trim())
        onLine(parsed)
      } catch (parseErr) {
        console.warn('JSON parse error:', parseErr, buffer)
      }
    }

    onComplete?.()
  } catch (err) {
    onError?.(err)
    throw err
  } finally {
    reader.releaseLock()
  }
}

/**
 * 创建一个缓冲区用于聚合流数据
 * @returns {object} {add, get, reset, toArray, toJSON}
 */
export function createStreamBuffer() {
  let buffer = []

  return {
    add(chunk) {
      buffer.push(chunk)
    },

    get() {
      return buffer
    },

    reset() {
      buffer = []
    },

    toArray() {
      return [...buffer]
    },

    toJSON() {
      return JSON.stringify(buffer, null, 2)
    },

    // 仅保留 content 字段
    getContent() {
      return buffer.map(c => c.content || c).filter(Boolean).join('')
    }
  }
}
