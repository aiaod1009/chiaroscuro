<template>
  <div class="visual-notes-container">

    <header class="notes-header">
      <div class="header-left">
        <div class="module-tag">EXPERIMENTAL MODULE</div>
        <h1 class="main-title">
          影像叙事 <span class="en-title">VISUAL NOTES</span>
        </h1>
        <p class="subtitle">
          利用神经网络深度解析每一寸光影，将瞬时感官转化为永恒的叙事文字。
        </p>
      </div>

      <div class="header-right">
        <button class="btn-save" @click="handleSave">
          <svg class="save-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span>保存 SAVE</span>
        </button>
      </div>
    </header>

    <div class="notes-grid">

      <div class="workspace-column">
        <div class="image-viewer">
          <div class="tags-row">
            <div class="viewer-tag tag-analyzing">
              <span class="pulse-dot"></span>
              ANALYZING PIXELS...
            </div>
            <div class="viewer-tag tag-synced">
              <span class="sync-icon">◎</span>
              LATENT SPACE SYNCED
            </div>
          </div>

          <img src="/DSC_6510.jpg" alt="Visual Notes Source" class="source-img" />

          <div class="scan-line"></div>
        </div>

        <div class="meta-spec-bar">
          <button class="btn-ai-generate">
            <svg class="sparkle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI GENERATE
          </button>

          <div class="specs-group">
            <div class="spec-item">
              <span class="spec-label">RESOLUTION</span>
              <span class="spec-value">7680 × 4320</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">NEURAL MODEL</span>
              <span class="spec-value">LUMEN-V2</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">ISO EQUIVALENT</span>
              <span class="spec-value">64 (NATIVE)</span>
            </div>
          </div>
        </div>
      </div>

      <div class="control-column">

        <div class="mode-tabs-track">
          <button class="tab-btn" :class="{ active: currentMode === 'creator' }" @click="currentMode = 'creator'">
            CREATOR
          </button>
          <button class="tab-btn" :class="{ active: currentMode === 'ai' }" @click="currentMode = 'ai'">
            AI ASSIST
          </button>

          <div class="tab-slider" :class="`slide-${currentMode}`"></div>
        </div>

        <div class="interactive-panel">

          <div v-if="currentMode === 'ai'" class="panel-fade-in">
            <div class="perspective-section">
              <span class="panel-label">SELECT PERSPECTIVE</span>
              <div class="perspective-buttons">
                <button v-for="p in perspectives" :key="p.id" class="p-btn"
                  :class="{ active: activePerspective === p.id }" @click="activePerspective = p.id">
                  {{ p.name }}
                </button>
              </div>
            </div>

            <div class="output-narrative">
              <h2 class="narrative-title">寂静之巅的低语</h2>
              <p class="narrative-body">
                "当最后的微光在冷峻的岩壁上褪去，时间仿佛在此凝固。这些山脉不仅仅是岩石的堆砌，它们是大地在千万年沉寂中发出的深沉呼吸。"
              </p>
            </div>

            <div class="optimize-section">
              <div class="optimize-header">
                <span class="panel-label">DISS/OPTIMIZE GENERATION?</span>
                <span class="btn-redraft">
                  <svg class="mini-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H19" />
                  </svg>
                  RE-DRAFT
                </span>
              </div>
              <div class="input-wrapper">
                <input type="text" v-model="aiPrompt" placeholder="例如：再冷酷一点，减少抒情..." @keyup.enter="handleOptimize" />
                <button class="send-btn" @click="handleOptimize">➔</button>
              </div>
            </div>
          </div>

          <div v-else class="panel-fade-in">
            <div class="perspective-section">
              <span class="panel-label">CREATOR LOGBOOK</span>
              <div class="creator-meta-hint">手动记录光影灵感与现场手记</div>
            </div>

            <div class="manual-editor-box">
              <input type="text" v-model="manualTitle" class="manual-title-input" placeholder="在此输入手记标题..." />
              <textarea v-model="manualContent" class="manual-textarea"
                placeholder="光影变幻的瞬间，写下你的主观直觉与艺术思考..."></textarea>
            </div>

            <div class="word-count-badge">
              字数: {{ manualContent.length }}
            </div>
          </div>

          <div class="panel-footer-metrics">
            <div class="metric-card">
              <span class="panel-label">DOMINANT HUE</span>
              <div class="badge-item">
                <span class="color-dot" style="background-color: #1A2533"></span>
                <span class="mono-text">#1A2533</span>
              </div>
            </div>
            <div class="metric-card">
              <span class="panel-label">VISUAL RATIO</span>
              <div class="badge-item">
                <span class="color-dot" style="background-color: #ffffff"></span>
                <span class="mono-text">HIGH CONTRAST</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 核心状态：'creator' (手写) 或 'ai' (AI智能)
const currentMode = ref('ai')

// AI 模式相关状态
const activePerspective = ref('poetic')
const aiPrompt = ref('')
const perspectives = [
  { id: 'poetic', name: 'POETIC' },
  { id: 'narrative', name: 'NARRATIVE' },
  { id: 'minimal', name: 'MINIMAL' }
]

// 手写模式相关状态
const manualTitle = ref('寂静之巅的低语')
const manualContent = ref('当最后的微光在冷峻的岩壁上褪去，时间仿佛在此凝固。这些山脉不仅仅是岩石的堆砌，它们是大地在千万年沉寂中发出的深沉呼吸。')

// 触发优化生成
const handleOptimize = () => {
  if (!aiPrompt.value.trim()) return
  alert(`已发送微调指令: ${aiPrompt.value}`)
  aiPrompt.value = ''
}

// 触发保存操作
const handleSave = () => {
  const payload = {
    mode: currentMode.value,
    title: currentMode.value === 'ai' ? '寂静之巅的低语' : manualTitle.value,
    content: currentMode.value === 'ai' ? '当最后的微光在冷峻的岩壁上褪去...' : manualContent.value,
    perspective: currentMode.value === 'ai' ? activePerspective.value : null
  }
  console.log('保存叙事元数据:', payload)
  alert(`[保存成功] 已将当前 ${currentMode.value === 'ai' ? 'AI 辅助' : '手写'} 文本封存至元数据。`)
}
</script>

<style scoped>
/* ==========================================================================
   1. 全局排版及页面容器
   ========================================================================== */
.visual-notes-container {
  min-height: 100vh;
  background-color: #090d12;
  color: #c9d1d9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  margin-top: -5rem;
  padding: 5rem 160px 40px 160px;
  box-sizing: border-box;
}

.visual-notes-container * {
  box-sizing: border-box;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.module-tag {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.25em;
  color: #4b5563;
  margin-bottom: 6px;
}

.main-title {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
  letter-spacing: 0.05em;
}

.en-title {
  font-size: 28px;
  font-weight: 300;
  color: #4b5563;
  margin-left: 10px;
  font-family: "Times New Roman", serif;
  letter-spacing: 0.1em;
}

.subtitle {
  font-size: 13px;
  color: #8b949e;
  margin: 0;
}

/* 右上角保存按钮样式 */
.btn-save {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: rgba(31, 41, 55, 0.4);
  border: 1px solid rgba(55, 65, 81, 0.6);
  border-radius: 9999px;
  color: #e5e7eb;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.btn-save:hover {
  background-color: #1f2937;
  border-color: #22d3ee;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.2);
}

.save-icon {
  width: 14px;
  height: 14px;
  color: #22d3ee;
}

/* ==========================================================================
   2. 双栏网格架构
   ========================================================================== */
.notes-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 32px;
}

@media (max-width: 1150px) {
  .notes-grid {
    grid-template-columns: 1fr;
  }
}

/* ==========================================================================
   3. 左侧组件布局 (Image Platform)
   ========================================================================== */
.image-viewer {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 24px;
  overflow: hidden;
  background-color: #020617;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.source-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tags-row {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
  z-index: 2;
}

.viewer-tag {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #9ca3af;
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  gap: 6px;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background-color: #22d3ee;
  border-radius: 50%;
  box-shadow: 0 0 8px #22d3ee;
  animation: ripple 1.8s infinite ease-in-out;
}

@keyframes ripple {

  0%,
  100% {
    opacity: 0.4;
  }

  50% {
    opacity: 1;
  }
}

.sync-icon {
  font-size: 11px;
  color: #6b7280;
}

.scan-line {
  position: absolute;
  bottom: 12%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(34, 211, 238, 0) 0%, rgba(34, 211, 238, 0.3) 50%, rgba(34, 211, 238, 0) 100%);
  box-shadow: 0 0 6px rgba(34, 211, 238, 0.4);
}

/* 规格底栏 */
.meta-spec-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.btn-ai-generate {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #e0f7fa;
  border: none;
  border-radius: 9999px;
  color: #083344;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ai-generate:hover {
  background-color: #22d3ee;
  box-shadow: 0 0 15px rgba(34, 211, 238, 0.3);
}

.sparkle-icon {
  width: 14px;
  height: 14px;
}

.specs-group {
  display: flex;
  gap: 28px;
  font-family: monospace;
}

.spec-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.spec-label {
  font-size: 9px;
  color: #4b5563;
  font-weight: 700;
  margin-bottom: 2px;
}

.spec-value {
  font-size: 11px;
  color: #ffffff;
  font-weight: 600;
}

/* ==========================================================================
   4. 右侧控制列 (CREATOR / AI ASSIST 联动切换轨道)
   ========================================================================== */
.mode-tabs-track {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background-color: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 4px;
  border-radius: 9999px;
  margin-bottom: 20px;
  z-index: 1;
}

.tab-btn {
  position: relative;
  background: none;
  border: none;
  padding: 10px 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #6b7280;
  cursor: pointer;
  z-index: 3;
  transition: color 0.25s ease;
}

.tab-btn.active {
  color: #083344;
}

/* 滑块动画控制 */
.tab-slider {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: calc(50% - 4px);
  background-color: #e0f7fa;
  border-radius: 9999px;
  z-index: 2;
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.slide-creator {
  transform: translateX(0%);
}

.slide-ai {
  transform: translateX(100%);
  background-color: #e0f7fa;
}

/* 面板卡片底框 */
.interactive-panel {
  background-color: rgba(17, 22, 32, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 24px;
  padding: 28px;
  min-height: 440px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.panel-fade-in {
  animation: fadeIn 0.35s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-label {
  font-size: 9px;
  font-family: monospace;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #4b5563;
  display: block;
  margin-bottom: 12px;
}

/* ==========================================================================
   5. AI 模式专属子版面
   ========================================================================== */
.perspective-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.p-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 10px;
  font-family: monospace;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.p-btn.active {
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.02);
}

.output-narrative {
  margin-bottom: 24px;
}

.narrative-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
  border-left: 2px solid #22d3ee;
  padding-left: 10px;
}

.narrative-body {
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.7;
  margin: 0;
}

/* 指令优化底栏 */
.optimize-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-redraft {
  font-size: 10px;
  font-family: monospace;
  font-weight: 700;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.mini-icon {
  width: 12px;
  height: 12px;
}

.input-wrapper {
  position: relative;
  width: 100%;
  margin-top: 6px;
}

.input-wrapper input {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px 40px 12px 14px;
  font-size: 12px;
  color: #ffffff;
  outline: none;
}

.input-wrapper input:focus {
  border-color: rgba(34, 211, 238, 0.3);
}

.send-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
}

.send-btn:hover {
  color: #22d3ee;
}

/* ==========================================================================
   6. CREATOR 手写模式专属子版面
   ========================================================================== */
.creator-meta-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: -6px;
  margin-bottom: 16px;
}

.manual-editor-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.manual-title-input {
  background: none;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  outline: none;
}

.manual-textarea {
  background: none;
  border: none;
  resize: none;
  height: 140px;
  font-size: 13px;
  line-height: 1.7;
  color: #d1d5db;
  outline: none;
}

.word-count-badge {
  text-align: right;
  font-size: 10px;
  color: #4b5563;
  font-family: monospace;
  margin-top: 6px;
}

/* ==========================================================================
   7. 底部色彩标签公共区域
   ========================================================================== */
.panel-footer-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 20px;
  margin-top: 24px;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 8px 12px;
  border-radius: 8px;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.mono-text {
  font-size: 11px;
  font-family: monospace;
  color: #ffffff;
  font-weight: 600;
}
</style>