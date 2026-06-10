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
          <img :src="imageSrc" alt="AI Version" class="image-layer" />
          <div class="badge badge-right">AI VERSION - CINEMATIC 04</div>

          <div class="original-layer-wrapper"
            :style="{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }">
            <img :src="imageSrc" alt="Original Input" class="image-layer original-img" />
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
                <img :src="imageSrc" />
              </div>
              <div class="card-title-zh">版本 04</div>
              <div class="card-title-en">Active Selection</div>
            </div>

            <div class="version-card">
              <div class="card-thumb grayscale-thumb">
                <img :src="imageSrc" />
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

        <!-- EXIF 面板 -->
        <ExifPanel :exifData="exifData" class="exif-gap" />

        <!-- 色彩配置 - 突出右侧 -->
        <div class="color-panel-outer">
          <div class="scifi-panel color-panel">
            <div class="panel-header">
              <div class="title-group">
                <span class="panel-title-zh">色彩配置</span>
                <span class="panel-title-en">Color</span>
              </div>
            </div>
            <ColorPalette :colors="colorPalette" />
          </div>
        </div>

        <!-- AI 构图分析 -->
        <AnalysisPanel
          :radarData="radarData"
          :analysisResult="analysisResult"
          :isAnalyzing="isAnalyzing"
          @analyze="analyzeComposition" />

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import ColorPalette from './components/ColorPalette.vue'
import ExifPanel from './components/ExifPanel.vue'
import AnalysisPanel from './components/AnalysisPanel.vue'
import { extractColors } from '../../utils/colorExtractor'

const route = useRoute()
const sliderPosition = ref(53)
const photoData = ref(null)
const analysisResult = ref('')
const isAnalyzing = ref(false)
const colorPalette = ref([])

const radarData = ref([
  { label: '黄金比例', value: 86 },
  { label: '三分构图', value: 78 },
  { label: '对称平衡', value: 64 },
  { label: '视觉引导', value: 92 },
  { label: '层次感', value: 88 },
  { label: '空间感', value: 76 }
])

const imageSrc = computed(() => photoData.value?.imageUrl || route.query.src || '/DSC_6510.jpg')

const exifData = computed(() => {
  const exif = photoData.value?.exif
  if (!exif) return [
    { label: '相机', value: '-' },
    { label: '镜头', value: '-' },
    { label: 'ISO', value: '-' },
    { label: '快门', value: '-' },
    { label: '光圈', value: '-' },
    { label: '焦距', value: '-' },
  ]
  return [
    { label: '相机', value: exif.camera || '-' },
    { label: '镜头', value: exif.lens || '-' },
    { label: 'ISO', value: exif.iso || '-' },
    { label: '快门', value: exif.shutterSpeed || '-' },
    { label: '光圈', value: exif.aperture || '-' },
    { label: '焦距', value: exif.focalLength || '-' },
  ]
})

const fetchPhoto = async () => {
  const id = route.params.id
  if (!id) return
  try {
    const { data } = await axios.get(`/api/photos/${id}`)
    if (data.success) {
      photoData.value = data.data
      // 提取图片主色
      if (data.data.imageUrl) {
        try {
          colorPalette.value = await extractColors(data.data.imageUrl)
        } catch (e) {
          console.error('提取颜色失败:', e)
        }
      }
    }
  } catch (err) {
    console.error('加载照片详情失败:', err)
  }
}

const analyzeComposition = async () => {
  if (isAnalyzing.value) return
  isAnalyzing.value = true
  analysisResult.value = ''

  try {
    const response = await fetch('/api/ai/analyze-composition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: imageSrc.value,
        photoId: photoData.value?._id
      })
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.trim() !== '')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              analysisResult.value += parsed.content
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } catch (err) {
    console.error('构图分析失败:', err)
    analysisResult.value = '分析失败，请稍后重试'
  } finally {
    isAnalyzing.value = false
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
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
  min-height: 340px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-transform: uppercase;
}

/* AI 构图分析 */
.color-panel {
  gap: 15px;
}

.color-panel-outer {
  position: absolute;
  right: -180px;
  top: 0;
  width: 160px;
}

.grid-right-col {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.exif-gap {
  margin-bottom: 16px;
}
</style>