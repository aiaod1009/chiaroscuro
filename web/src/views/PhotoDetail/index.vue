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

        <ComparisonViewer :imageSrc="imageSrc" />

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
        <ColorPalette :colors="colorPalette" />

        <!-- AI 构图分析 -->
        <AnalysisPanel :imageSrc="imageSrc" />

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import ComparisonViewer from './components/ComparisonViewer.vue'
import ColorPalette from './components/ColorPalette.vue'
import ExifPanel from './components/ExifPanel.vue'
import AnalysisPanel from './components/AnalysisPanel.vue'
import { extractColors } from '../../utils/colorExtractor'

const route = useRoute()
const photoData = ref(null)
const colorPalette = ref([])

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
      // 优先用数据库缓存的颜色，没有才提取
      if (data.data.colors?.length) {
        colorPalette.value = data.data.colors
      } else if (data.data.imageUrl) {
        try {
          const extracted = await extractColors(data.data.imageUrl)
          colorPalette.value = extracted
          // 存回数据库，下次就不用再提取了
          axios.patch(`/api/photos/${id}/colors`, { colors: extracted }).catch(() => { })
        } catch (e) {
          console.error('提取颜色失败:', e)
        }
      }
    }
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

/* 右侧栏布局 */
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