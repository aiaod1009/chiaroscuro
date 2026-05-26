<template>
  <main class="waterfall-page">
    <header class="waterfall-header">
      <button class="btn-back" @click="$router.push('/footprints')">&larr; 足迹地图</button>
      <div class="header-info">
        <h1 class="region-title">{{ title }}</h1>
        <span class="region-count">{{ total }} 张影像</span>
      </div>
    </header>

    <div class="masonry-grid" ref="gridRef">
      <div v-for="photo in photos" :key="photo.id" class="masonry-item" @click="openLightbox(photo)">
        <img :src="photo.src" :alt="photo.alt" loading="lazy" />
        <div class="item-overlay">
          <span class="item-date">{{ formatDate(photo.createdAt) }}</span>
          <span v-if="photo.exif?.camera" class="item-camera">{{ photo.exif.camera }}</span>
        </div>
      </div>
    </div>

    <div ref="sentinelRef" class="scroll-sentinel">
      <span v-if="loading" class="loading-spinner">加载中...</span>
      <span v-else-if="!hasMore && photos.length > 0" class="no-more">到底了</span>
    </div>

    <!-- 灯箱 -->
    <Teleport to="body">
      <div v-if="lightboxPhoto" class="lightbox" @click.self="closeLightbox">
        <button class="lightbox-close" @click="closeLightbox">&times;</button>
        <img :src="lightboxPhoto.src" :alt="lightboxPhoto.alt" class="lightbox-img" />
        <div class="lightbox-info">
          <span>{{ lightboxPhoto.alt }}</span>
          <span v-if="lightboxPhoto.exif">{{ lightboxPhoto.exif.camera }} &middot; {{ lightboxPhoto.exif.focalLength }} &middot; {{ lightboxPhoto.exif.aperture }} &middot; ISO {{ lightboxPhoto.exif.iso }}</span>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()

const title = ref('')
const total = ref(0)
const photos = ref([])
const page = ref(1)
const hasMore = ref(true)
const loading = ref(false)
const gridRef = ref(null)
const sentinelRef = ref(null)

const lightboxPhoto = ref(null)

const fetchPhotos = async () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const { data } = await axios.get(`/api/photos/gallery/${route.params.mapCode}`, {
      params: { page: page.value, limit: 20 }
    })
    if (data.success) {
      title.value = data.data.title
      total.value = data.data.total
      photos.value.push(...data.data.photos)
      hasMore.value = data.data.hasMore
      page.value++
    }
  } catch (err) {
    console.error('加载瀑布流数据失败:', err)
  } finally {
    loading.value = false
  }
}

let observer = null

onMounted(() => {
  fetchPhotos()
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) fetchPhotos()
  }, { rootMargin: '400px' })
  if (sentinelRef.value) observer.observe(sentinelRef.value)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

// 路由变化时重载
watch(() => route.params.mapCode, () => {
  photos.value = []
  page.value = 1
  hasMore.value = true
  fetchPhotos()
})

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase()
}

const openLightbox = (photo) => {
  lightboxPhoto.value = photo
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxPhoto.value = null
  document.body.style.overflow = ''
}
</script>

<style scoped>
.waterfall-page {
  min-height: 100vh;
  background: #050a15;
  color: #fff;
  margin-top: -5rem;
  padding: 5rem 40px 60px;
}

@media (max-width: 768px) {
  .waterfall-page {
    padding: 5rem 16px 40px;
  }
}

/* 头部 */
.waterfall-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 36px;
}

.btn-back {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 8px 16px;
  color: #8b949e;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.header-info {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.region-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.02em;
}

.region-count {
  font-size: 13px;
  font-family: monospace;
  color: #64748b;
}

/* 瀑布流 */
.masonry-grid {
  columns: 4;
  column-gap: 16px;
}

@media (max-width: 1200px) {
  .masonry-grid { columns: 3; }
}

@media (max-width: 768px) {
  .masonry-grid { columns: 2; column-gap: 10px; }
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: 16px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  background: #0e1218;
}

@media (max-width: 768px) {
  .masonry-item { margin-bottom: 10px; }
}

.masonry-item img {
  width: 100%;
  display: block;
  transition: transform 0.4s ease;
}

.masonry-item:hover img {
  transform: scale(1.03);
}

.item-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 14px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, transparent 100%);
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.masonry-item:hover .item-overlay {
  opacity: 1;
}

.item-date {
  font-size: 10px;
  font-family: monospace;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.item-camera {
  font-size: 10px;
  font-family: monospace;
  color: #64748b;
}

/* 加载状态 */
.scroll-sentinel {
  padding: 40px 0;
  text-align: center;
}

.loading-spinner {
  font-size: 13px;
  color: #4b5563;
  font-family: monospace;
}

.no-more {
  font-size: 12px;
  color: #2a3040;
  font-family: monospace;
  letter-spacing: 0.1em;
}

/* 灯箱 */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 28px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 32px;
  cursor: pointer;
  z-index: 1;
  transition: color 0.2s;
}

.lightbox-close:hover {
  color: #fff;
}

.lightbox-img {
  max-width: 90vw;
  max-height: 82vh;
  object-fit: contain;
  border-radius: 4px;
}

.lightbox-info {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-family: monospace;
  color: #64748b;
}
</style>
