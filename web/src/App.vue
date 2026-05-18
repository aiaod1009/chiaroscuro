<template>
  <div class="ai-test-container">
    <div class="card">
      <div class="header">
        <h1>📸 AI 摄影灵感测试舱</h1>
        <p>Vue3 + Express 全链路联调面板</p>
      </div>

      <div class="input-group">
        <label>MongoDB 照片 ID (photoId)</label>
        <input v-model="photoId" type="text" placeholder="贴入你在 Navicat 里复制的 24位 _id" :disabled="loading" />
      </div>

      <button @click="triggerAiInspiration" :disabled="loading" :class="{ 'btn-loading': loading }" class="action-btn">
        <span v-if="loading">🛰️ AI 正在像素级端详照片...</span>
        <span v-else>✨ 唤醒 AI 摄影师</span>
      </button>

      <div class="divider"></div>

      <div class="result-section">
        <h3>🎯 灵感落盘看板</h3>

        <div class="display-box">
          <div v-if="!loading && !result.title" class="status-empty">
            暂无灵感，在上方输入 ID 并点击唤醒
          </div>

          <div v-if="loading" class="skeleton-loader">
            <div class="skeleton-title animate-pulse"></div>
            <div class="skeleton-text animate-pulse"></div>
            <div class="skeleton-text-short animate-pulse"></div>
          </div>

          <div v-if="!loading && result.title" class="status-result">
            <div class="result-title"># {{ result.title }}</div>
            <p class="result-caption">“ {{ result.caption }} ”</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const photoId = ref('')
const loading = ref(false)
const result = ref({
  title: '',
  caption: ''
})

async function triggerAiInspiration() {
  if (!photoId.value.trim()) {
    alert('老哥，先把 Navicat 里的 photoId 贴进去再轰啊！')
    return
  }

  loading.value = true

  try {
    // 🚀 发起跨域冲锋，轰炸你本地的 Node.js 后端接口
    const response = await fetch('http://localhost:3000/api/ai/inspiration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ photoId: photoId.value.trim() })
    })

    const resData = await response.json()

    if (resData.success) {
      // 成功拿到智谱吐回来的结构化数据并响应式绑定
      result.value.title = resData.data.title
      result.value.caption = resData.data.caption
    } else {
      alert(`后端报错提示: ${resData.message}`)
    }
  } catch (error) {
    console.error(error)
    alert('无法连接到后端服务器，请确保后端服务 node app.js 已启动，且配置了 cors 跨域！')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 暗黑极客调色盘 */
.ai-test-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #020617;
  color: #f8fafc;
  font-family: sans-serif;
}

.card {
  max-width: 440px;
  width: 100%;
  background-color: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.header h1 {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  background: linear-gradient(to right, #2dd4bf, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.header p {
  color: #94a3b8;
  font-size: 14px;
  text-align: center;
  margin: 4px 0 0 0;
}

.input-group {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-group input {
  background-color: #020617;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  color: #e2e8f0;
  font-family: monospace;
  outline: none;
  transition: border-color 0.2s;
}

.input-group input:focus {
  border-color: #14b8a6;
}

.action-btn {
  width: 100%;
  margin-top: 16px;
  background: linear-gradient(to right, #14b8a6, #10b981);
  color: #020617;
  font-weight: 600;
  padding: 12px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.action-btn:hover {
  opacity: 0.9;
}

.btn-loading {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  border-top: 1px solid rgba(30, 41, 59, 0.6);
  margin: 24px 0;
}

.result-section h3 {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 16px 0;
}

.display-box {
  background-color: #020617;
  border: 1px solid rgba(30, 41, 59, 0.8);
  border-radius: 12px;
  padding: 20px;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.status-empty {
  text-align: center;
  color: #64748b;
  font-size: 14px;
}

/* 骨架屏动画 */
@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: .4;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-title {
  height: 20px;
  background-color: #1e293b;
  border-radius: 6px;
  width: 35%;
  margin-bottom: 16px;
}

.skeleton-text {
  height: 16px;
  background-color: #1e293b;
  border-radius: 6px;
  width: 100%;
  margin-bottom: 8px;
}

.skeleton-text-short {
  height: 16px;
  background-color: #1e293b;
  border-radius: 6px;
  width: 80%;
}

.result-title {
  color: #2dd4bf;
  font-weight: 700;
  font-size: 18px;
}

.result-caption {
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.6;
  font-style: italic;
  margin: 8px 0 0 0;
}
</style>