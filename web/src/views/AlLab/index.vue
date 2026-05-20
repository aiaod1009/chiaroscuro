<template>
  <div class="darkroom-container">

    <aside class="sidebar-scroll">
      <span class="scroll-text">SCROLL</span>
      <div class="scroll-dots">
        <span class="dot"></span>
        <span class="dot active"></span>
        <span class="dot"></span>
      </div>
      <span class="section-num">03</span>
    </aside>

    <main class="main-content">

      <header class="darkroom-header">
        <div class="module-tag">EXPERIMENTAL MODULE</div>
        <h1 class="main-title">
          AI 数字暗房 <span class="en-title">AI DARKROOM</span>
        </h1>
        <p class="subtitle">
          利用神经网络深度解析每一寸光影，将瞬时感官转化为永恒的叙事文字。我们的 AI 实验室正在探索图像语义与诗意表达的交界。
        </p>
      </header>

      <div class="workspace-grid">

        <div class="viewer-column">
          <div class="image-viewer">
            <div class="analyzing-tag">
              <span class="pulse-dot"></span>
              ANALYZING PIXELS...
            </div>

            <img src="/DSC_6510.jpg" alt="Darkroom Analysis Source" class="source-img" />

            <div class="scan-line"></div>
          </div>

          <div class="viewer-controls">
            <div class="action-buttons">
              <button class="btn-secondary">
                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                REPLACE IMAGE
              </button>
              <button class="btn-primary">
                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                GENERATE INSIGHTS
              </button>
            </div>

            <div class="meta-specs">
              <div class="spec-item">
                <span class="spec-label">RESOLUTION</span>
                <span class="spec-value">7680 × 4320</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">MODEL</span>
                <span class="spec-value">LUMEN-V2 PRO</span>
              </div>
            </div>
          </div>
        </div>

        <div class="data-column">

          <div class="insight-panel">
            <div class="data-group">
              <span class="panel-label">AI-GENERATED TITLE</span>
              <h2 class="insight-title">寂静之巅的低语</h2>
            </div>

            <div class="data-group">
              <span class="panel-label">POETIC INTERPRETATION</span>
              <p class="poetic-text">
                "当最后的微光在冷峻的岩壁上褪去，时间仿佛在此凝固。这些山脉不仅仅是岩石的堆砌，它们是大地在千万年沉寂中发出的深沉呼吸，记录着冰川与星辰的古老约定。"
              </p>
            </div>

            <div class="analysis-metrics">
              <span class="panel-label">COMPOSITION ANALYSIS</span>

              <div class="metric-item">
                <div class="metric-info">
                  <span>Atmospheric Depth</span>
                  <span>94%</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: 94%"></div>
                </div>
              </div>

              <div class="metric-item">
                <div class="metric-info">
                  <span>Emotional Weight</span>
                  <span>87%</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: 87%"></div>
                </div>
              </div>
            </div>

            <div class="color-contrast-grid">
              <div class="cc-item">
                <span class="panel-label">DOMINANT HUE</span>
                <div class="color-badge">
                  <span class="color-preview"></span>
                  <span class="font-mono">#1A2533</span>
                </div>
              </div>
              <div class="cc-item">
                <span class="panel-label">KEY CONTRAST</span>
                <div class="contrast-badge">
                  <span class="dot-white"></span>
                  <span class="font-mono">HIGH KEY</span>
                </div>
              </div>
            </div>
          </div>

          <div class="export-bar">
            <div class="export-left">
              <div class="export-icon-box">
                <svg class="export-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="export-text">
                <span class="export-title">EXPORT METADATA</span>
                <span class="export-subtitle">JSON, TXT, XMP Compatible</span>
              </div>
            </div>
            <div class="export-arrow">&gt;</div>
          </div>

        </div>

      </div>
    </main>

    <button class="floating-prev-btn">&lt;</button>

  </div>
</template>

<script setup>
// 纯静态面板展示，无需复杂逻辑处理
</script>

<style scoped>
/* ==========================================================================
   1. 基础版面结构 & 变量全局复刻
   ========================================================================== */
.darkroom-container {
  min-height: 100vh;
  background-color: #090d12;
  color: #c9d1d9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  padding: 40px 40px 40px 100px;
  position: relative;
  box-sizing: border-box;
}

.darkroom-container * {
  box-sizing: border-box;
}

/* 左侧垂直侧边栏 */
.sidebar-scroll {
  position: absolute;
  left: 32px;
  top: 120px;
  bottom: 40px;
  width: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 32px;
}

.scroll-text {
  font-size: 10px;
  letter-spacing: 0.3em;
  color: #4b5563;
  writing-mode: vertical-lr;
  transform: rotate(180deg);
  font-weight: 700;
}

.scroll-dots {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.scroll-dots .dot {
  width: 4px;
  height: 4px;
  background-color: #374151;
  border-radius: 50%;
}

.scroll-dots .dot.active {
  background-color: #22d3ee;
  box-shadow: 0 0 8px #22d3ee;
  width: 6px;
  height: 6px;
}

.section-num {
  font-size: 11px;
  font-weight: 700;
  color: #e5e7eb;
  margin-top: auto;
  font-family: monospace;
}

/* 主内容包裹层 */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
}

/* ==========================================================================
   2. 头部标题区域样式
   ========================================================================== */
.darkroom-header {
  margin-bottom: 36px;
}

.module-tag {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.25em;
  color: #22d3ee;
  margin-bottom: 8px;
}

.main-title {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px 0;
  letter-spacing: 0.05em;
}

.en-title {
  font-size: 28px;
  font-weight: 300;
  color: #4b5563;
  margin-left: 12px;
  font-family: "Times New Roman", serif;
  letter-spacing: 0.1em;
}

.subtitle {
  font-size: 13px;
  color: #8b949e;
  line-height: 1.6;
  max-width: 680px;
  margin: 0;
}

/* ==========================================================================
   3. 工作区两栏栅格
   ========================================================================== */
.workspace-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 32px;
}

@media (max-width: 1150px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}

/* ==========================================================================
   4. 左侧：图片分析主视图
   ========================================================================== */
.image-viewer {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 24px;
  overflow: hidden;
  background-color: #020617;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7);
}

.source-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 正在分析像素标签 */
.analyzing-tag {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #d1d5db;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background-color: #9ca3af;
  border-radius: 50%;
  animation: pulse-gray 2s infinite;
}

@keyframes pulse-gray {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

/* 科技感动态扫描线 */
.scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(34, 211, 238, 0) 0%, rgba(34, 211, 238, 0.4) 50%, rgba(34, 211, 238, 0) 100%);
  box-shadow: 0 0 8px rgba(34, 211, 238, 0.6);
  animation: scan 4s linear infinite;
  pointer-events: none;
}

@keyframes scan {
  0% {
    top: 10%;
  }

  50% {
    top: 90%;
  }

  100% {
    top: 10%;
  }
}

/* 底部控制器与规格 */
.viewer-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-icon {
  width: 14px;
  height: 14px;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: rgba(31, 41, 55, 0.2);
  border: 1px solid rgba(55, 65, 81, 0.5);
  border-radius: 9999px;
  color: #e5e7eb;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: rgba(31, 41, 55, 0.5);
  border-color: #4b5563;
}

.btn-primary {
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

.btn-primary:hover {
  background-color: #22d3ee;
  box-shadow: 0 0 15px rgba(34, 211, 238, 0.4);
}

.meta-specs {
  display: flex;
  gap: 24px;
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
  letter-spacing: 0.1em;
  font-weight: 700;
  margin-bottom: 2px;
}

.spec-value {
  font-size: 12px;
  color: #ffffff;
  font-weight: 600;
}

/* ==========================================================================
   5. 右侧：AI 洞察数据面板
   ========================================================================== */
.insight-panel {
  background-color: rgba(17, 22, 32, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 24px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 16px;
}

.panel-label {
  font-size: 9px;
  font-family: monospace;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: #4b5563;
  text-transform: uppercase;
  display: block;
  margin-bottom: 8px;
}

.insight-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  padding-left: 8px;
  border-left: 2px solid #22d3ee;
}

.poetic-text {
  font-size: 13px;
  color: #acb5bd;
  line-height: 1.7;
  font-style: italic;
  margin: 0;
  background-color: rgba(0, 0, 0, 0.15);
  padding: 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.02);
}

/* 进度条样式 */
.analysis-metrics {
  display: flex;
  flex-direction: column;
}

.metric-item {
  margin-top: 14px;
}

.metric-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #e5e7eb;
  margin-bottom: 6px;
}

.progress-bar-bg {
  width: 100%;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: #e5e7eb;
  border-radius: 2px;
}

/* 底部标签分布 */
.color-contrast-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 20px;
}

.color-badge,
.contrast-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 11px;
  color: #ffffff;
  width: fit-content;
}

.color-preview {
  width: 10px;
  height: 10px;
  background-color: #1A2533;
  border-radius: 50%;
  display: inline-block;
}

.dot-white {
  width: 6px;
  height: 6px;
  background-color: #ffffff;
  border-radius: 50%;
  display: inline-block;
}

.font-mono {
  font-family: monospace;
}

/* 元数据导出块 */
.export-bar {
  background-color: rgba(17, 22, 32, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.export-bar:hover {
  background-color: rgba(26, 34, 49, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

.export-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.export-icon-box {
  background-color: rgba(255, 255, 255, 0.04);
  padding: 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.export-icon {
  width: 18px;
  height: 18px;
  color: #9ca3af;
}

.export-text {
  display: flex;
  flex-direction: column;
}

.export-title {
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.05em;
}

.export-subtitle {
  font-size: 10px;
  color: #4b5563;
  margin-top: 2px;
}

.export-arrow {
  color: #4b5563;
  font-size: 14px;
  font-family: monospace;
}

/* ==========================================================================
   6. 其他浮动微动效元素
   ========================================================================== */
.floating-prev-btn {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: rgba(31, 41, 55, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #9ca3af;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.floating-prev-btn:hover {
  background-color: rgba(55, 65, 81, 0.6);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.2);
}
</style>