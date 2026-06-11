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

        <ComparisonViewer :originalSrc="originalSrc" :versionSrc="activeVersionSrc" />

        <VersionCards
          :originalPhoto="originalPhoto"
          :versions="versions"
          :activeVersionId="activeVersionId"
          @select="activeVersionId = $event"
        />

      </div>

      <DetailPanels
        :imageSrc="originalSrc"
        :photoId="photoData?._id"
        :exifData="exifData"
        :colors="colorPalette"
        :cachedAnalysis="photoData?.analysis"
      />

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import ComparisonViewer from './components/ComparisonViewer.vue'
import VersionCards from './components/VersionCards.vue'
import DetailPanels from './components/DetailPanels.vue'
import { extractColors } from '../../utils/colorExtractor'

const route = useRoute()
const photoData = ref(null)
const colorPalette = ref([])
const originalPhoto = ref(null)
const versions = ref([])
const activeVersionId = ref(null)

// 原图地址
const originalSrc = computed(() => originalPhoto.value?.imageUrl || photoData.value?.imageUrl || '/DSC_6510.jpg')

// 当前选中的版本地址，没选就用原图
const activeVersionSrc = computed(() => {
  if (!activeVersionId.value) return originalSrc.value
  const v = versions.value.find(v => v._id === activeVersionId.value)
  return v?.imageUrl || originalSrc.value
})

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
      // 加载版本列表
      fetchVersions(id)
    }
  } catch (err) {
    console.error('加载照片详情失败:', err)
  }
}

const fetchVersions = async (id) => {
  try {
    const { data } = await axios.get(`/api/photos/${id}/versions`)
    if (data.success) {
      originalPhoto.value = data.data.original
      versions.value = data.data.versions
      // 默认选中当前正在看的版本，如果当前是原图则不选
      const currentIsOriginal = !photoData.value?.parentId
      activeVersionId.value = currentIsOriginal ? null : id
    }
  } catch (err) {
    console.error('加载版本列表失败:', err)
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
  padding-top: 6rem;
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
</style>