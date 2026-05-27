<template>
  <div class="scifi-container">
    <header class="scifi-header">
      <div class="header-left">
        <span class="section-tag">Section 03</span>
        <div class="divider-line"></div>
      </div>
      <button class="upload-btn">
        <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span>上传图片 UPLOAD RAW</span>
      </button>
    </header>

    <div class="scifi-grid">

      <div class="grid-left-col">

        <div class="comparison-viewer">
          <img :src="imageSrc"
            alt="AI Version" class="image-layer" />
          <div class="badge badge-right">AI VERSION - CINEMATIC 04</div>

          <div class="original-layer-wrapper"
            :style="{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }">
            <img :src="imageSrc"
              alt="Original Input" class="image-layer original-img" />
            <div class="badge badge-left">ORIGINAL - RAW INPUT</div>
          </div>

          <div class="slider-handle" :style="{ left: `${sliderPosition}%` }">
            <div class="handle-button">Unfold</div>
          </div>

          <input type="range" min="0" max="100" v-model="sliderPosition" class="hidden-range-input" />
        </div>

        <div class="versions-section">
          <div class="section-title-bar">
            <div class="title-group">
              <span class="title-zh">版本记录</span>
              <span class="title-en">Versions</span>
            </div>
            <div class="carousel-arrows">
              <button class="arrow-btn">&lt;</button>
              <button class="arrow-btn">&gt;</button>
            </div>
          </div>

          <div class="cards-list">
            <div class="version-card active-card">
              <div class="card-thumb empty-thumb">RAW THUMB</div>
              <div class="card-title-zh">原图</div>
              <div class="card-title-en">Original Raw</div>
            </div>

            <div class="version-card">
              <div class="card-thumb">
                <img
                  :src="imageSrc" />
              </div>
              <div class="card-title-zh">版本 04</div>
              <div class="card-title-en">Active Selection</div>
            </div>

            <div class="version-card">
              <div class="card-thumb grayscale-thumb">
                <img
                  :src="imageSrc" />
              </div>
              <div class="card-title-zh">版本 03</div>
              <div class="card-title-en">Cinematic Noir</div>
            </div>

            <div class="version-card rendering-card">
              <div class="card-thumb loading-thumb">
                <div class="spinner"></div>
                <span class="spinner-text">Rendering</span>
              </div>
              <div class="card-title-zh">版本 05</div>
              <div class="card-title-en">AI Generating...</div>
            </div>
          </div>
        </div>

      </div>

      <div class="grid-right-col">

        <div class="scifi-panel exif-panel">
          <div class="panel-main-content">
            <div class="panel-header">
              <div class="title-group">
                <span class="panel-title-zh">EXIF 信息</span>
                <span class="panel-title-en">Exif Data</span>
              </div>
              <span class="info-icon">ⓘ</span>
            </div>

            <div class="exif-list">
              <div v-for="item in exifData" :key="item.label" class="exif-item">
                <span class="exif-label">{{ item.label }}</span>
                <span class="exif-value">{{ item.value }}</span>
              </div>
            </div>
          </div>

          <div class="panel-actions">
            <button class="btn-reset">Reset</button>
            <button class="btn-export">Export</button>
          </div>
        </div>

        <div class="scifi-panel analysis-panel">
          <div class="panel-header">
            <div class="title-group">
              <span class="panel-title-zh">AI 构图分析</span>
              <span class="panel-title-en">Analysis</span>
            </div>
            <svg class="analysis-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div class="composition-grid-box">
            <div class="grid-lines-bg">
              <div v-for="n in 16" :key="n" class="grid-cell"></div>
            </div>
            <div class="golden-ratio-box"></div>

            <div class="focus-dot dot-primary"></div>
            <div class="focus-dot dot-secondary"></div>

            <span class="grid-data-tag">Golden Ratio Optimized</span>
          </div>

          <button class="btn-reanalyze">重新分析构图</button>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const sliderPosition = ref(53)
const photoData = ref(null)

const imageSrc = computed(() => photoData.value?.imageUrl || route.query.src || '/DSC_6510.jpg')

const exifData = computed(() => {
  const exif = photoData.value?.exif
  if (!exif) return [
    { label: 'Camera', value: '-' },
    { label: 'Lens', value: '-' },
    { label: 'ISO', value: '-' },
    { label: 'Shutter', value: '-' },
    { label: 'Aperture', value: '-' },
    { label: 'Focal Length', value: '-' },
  ]
  return [
    { label: 'Camera', value: exif.camera || '-' },
    { label: 'Lens', value: exif.lens || '-' },
    { label: 'ISO', value: exif.iso || '-' },
    { label: 'Shutter', value: exif.shutterSpeed || '-' },
    { label: 'Aperture', value: exif.aperture || '-' },
    { label: 'Focal Length', value: exif.focalLength || '-' },
  ]
})

const fetchPhoto = async () => {
  const id = route.params.id
  if (!id) return
  try {
    const { data } = await axios.get(`/api/photos/${id}`)
    if (data.success) photoData.value = data.data
  } catch (err) {
    console.error('加载照片详情失败:', err)
  }
}

onMounted(fetchPhoto)
watch(() => route.params.id, fetchPhoto)
</script>

<style scoped>
/* ==========================================================================
   1. 基础版面样式 (Base & Layout)
   ========================================================================== */
.scifi-container {
  min-height: 100vh;
  background-color: #0d1117;
  color: #adb5bd;
  margin-top: -5rem;
  padding-top: 8rem;
  padding-bottom: 5rem;
  padding-left: 32px;
  padding-right: 32px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-sizing: border-box;
}

.scifi-container * {
  box-sizing: border-box;
}

.scifi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.section-tag {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: #22d3ee;
  text-transform: uppercase;
}

.divider-line {
  height: 1px;
  width: 48px;
  background-color: #374151;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: rgba(31, 41, 55, 0.5);
  border: 1px solid rgba(55, 65, 81, 0.5);
  border-radius: 9999px;
  color: #e5e7eb;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.upload-btn:hover {
  background-color: #1f2937;
  border-color: #4b5563;
}

.upload-icon {
  width: 16px;
  height: 16px;
  color: #22d3ee;
}

/* 栅格网格 */
.scifi-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .scifi-grid {
    grid-template-columns: 1fr;
  }
}

.grid-left-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ==========================================================================
   2. 图片对比核心组件样式 (Comparison Split Viewer)
   ========================================================================== */
.comparison-viewer {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid #1f2937;
  background-color: #111827;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.image-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.original-layer-wrapper {
  position: absolute;
  inset: 0;
  user-select: none;
  pointer-events: none;
}

.original-img {
  filter: grayscale(100%) brightness(70%);
}

.badge {
  position: absolute;
  top: 16px;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  padding: 6px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 10px;
  letter-spacing: 0.05em;
  color: #d1d5db;
}

.badge-left {
  left: 16px;
}

.badge-right {
  right: 16px;
}

/* 拖拽中心中轴 */
.slider-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #22d3ee;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.handle-button {
  width: 48px;
  height: 48px;
  border-radius: 50px;
  background-color: #083344;
  border: 2px solid #22d3ee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.1em;
  color: #22d3ee;
  text-transform: uppercase;
  transform: translateX(-50%);
  box-shadow: 0 0 15px rgba(34, 211, 238, 0.3);
}

/* 隐藏的原生拖动滑块覆盖整张图 */
.hidden-range-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: ew-resize;
  z-index: 10;
  margin: 0;
}

/* ==========================================================================
   3. 版本历史卡片 (Versions Carousel)
   ========================================================================== */
.versions-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-group {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.title-zh {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}

.title-en {
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
  text-transform: uppercase;
}

.carousel-arrows {
  display: flex;
  gap: 8px;
}

.arrow-btn {
  padding: 4px 10px;
  border-radius: 9999px;
  background-color: #111827;
  border: 1px solid #1f2937;
  color: #9ca3af;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.arrow-btn:hover {
  border-color: #374151;
  color: #ffffff;
}

.cards-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 640px) {
  .cards-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.version-card {
  background-color: rgba(17, 24, 39, 0.3);
  border: 1px solid rgba(31, 41, 55, 0.8);
  padding: 8px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.version-card:hover {
  border-color: #374151;
}

/* 激活选中的原图卡片样式 */
.active-card {
  background-color: rgba(17, 24, 39, 0.5);
  border-color: rgba(34, 211, 238, 0.5);
  box-shadow: inset 0 0 0 1px rgba(34, 211, 238, 0.2);
}

.card-thumb {
  aspect-ratio: 16 / 9;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background-color: #1f2937;
  margin-bottom: 8px;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-thumb {
  background: linear-gradient(135deg, #374151, #111827);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #4b5563;
}

.grayscale-thumb img {
  filter: saturate(50%);
}

.card-title-zh {
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
}

.card-title-en {
  font-size: 9px;
  color: #6b7280;
  font-family: monospace;
  text-transform: uppercase;
  margin-top: 2px;
}

/* 渲染状态卡片 */
.rendering-card {
  opacity: 0.6;
}

.loading-thumb {
  background-color: #030712;
  border: 1px solid #1f2937;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #4b5563;
  border-top-color: #22d3ee;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-text {
  font-size: 8px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transform: scale(0.9);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ==========================================================================
   4. 右侧科幻面板样式 (Panels & EXIF & Analysis)
   ========================================================================== */
.scifi-panel {
  background-color: rgba(18, 24, 36, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(31, 41, 55, 0.8);
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.exif-panel {
  justify-content: space-between;
  min-height: 380px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.panel-title-zh {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.05em;
}

.panel-title-en {
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
  text-transform: uppercase;
}

.info-icon {
  color: #6b7280;
  cursor: pointer;
  font-size: 12px;
}

.info-icon:hover {
  color: #d1d5db;
}

/* EXIF 数据明细 */
.exif-list {
  display: flex;
  flex-direction: column;
  font-family: monospace;
  font-size: 12px;
}

.exif-item {
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid rgba(31, 41, 55, 0.6);
}

.exif-item:last-child {
  border-bottom: none;
}

.exif-label {
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 11px;
}

.exif-value {
  color: #e5e7eb;
  font-weight: 500;
}

/* 按钮组 */
.panel-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
  margin-top: 24px;
}

.btn-reset {
  padding: 12px;
  border-radius: 12px;
  background: transparent;
  border: 1px solid #1f2937;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset:hover {
  border-color: #4b5563;
  color: #ffffff;
}

.btn-export {
  padding: 12px;
  border-radius: 12px;
  background: linear-gradient(to right, #67e8f9, #a7f3d0);
  border: none;
  color: #000000;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 10px 15px -3px rgba(34, 211, 238, 0.1);
}

.btn-export:hover {
  background: linear-gradient(to right, #22d3ee, #6ee7b7);
}

/* AI 构图分析 */
.analysis-panel {
  gap: 20px;
}

.analysis-icon {
  width: 16px;
  height: 16px;
  color: #22d3ee;
}

.composition-grid-box {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  background-color: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(17, 24, 39, 0.6);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 4x4 网格背景线 */
.grid-lines-bg {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  opacity: 0.2;
  pointer-events: none;
}

.grid-cell {
  border: 0.5px solid #4b5563;
}

/* 核心黄金分割矩形框 */
.golden-ratio-box {
  position: absolute;
  width: 50%;
  height: 50%;
  border: 1px dashed rgba(34, 211, 238, 0.2);
  pointer-events: none;
}

/* 构图焦点 */
.focus-dot {
  position: absolute;
  border-radius: 50%;
}

.dot-primary {
  top: 35%;
  left: 40%;
  width: 12px;
  height: 12px;
  background-color: #22d3ee;
  box-shadow: 0 0 15px #22d3ee;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.dot-secondary {
  top: 55%;
  left: 55%;
  width: 8px;
  height: 8px;
  background-color: #9ca3af;
  opacity: 0.6;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: .5;
    transform: scale(1.1);
  }
}

.grid-data-tag {
  position: absolute;
  bottom: 16px;
  font-family: monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #22d3ee;
  background-color: rgba(8, 51, 68, 0.4);
  backdrop-filter: blur(4px);
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid rgba(34, 211, 238, 0.2);
}

.btn-reanalyze {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  background-color: rgba(17, 24, 39, 0.8);
  border: 1px solid #1f2937;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reanalyze:hover {
  background-color: #1a2232;
  border-color: #374151;
  color: #ffffff;
}

</style>