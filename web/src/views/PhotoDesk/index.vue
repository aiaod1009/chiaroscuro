<template>
  <main class="photo-desk-page page-bg">
    <header class="photo-desk-header">
      <button class="btn-back" @click="$router.push('/footprints')">&larr; 足迹地图</button>
      <div class="header-info">
        <h1 class="region-title">{{ title }}</h1>
        <span class="region-count">{{ total }} 张影像</span>
      </div>
    </header>

    <section class="photo-desk" ref="desk">
      <div v-for="(photo, index) in photos" :key="photo.id" class="scattered-photo" :style="photo.style"
        @mouseenter="hoverIndex = index" @mouseleave="hoverIndex = -1"
        @click="$router.push(`/photo-detail/${photo.id}`)">
        <div class="photo-card" :class="{ 'is-hovered': hoverIndex === index }">
          <div class="photo-front">
            <img :src="photo.src" :alt="photo.alt" />
            <div class="photo-tape" :class="photo.tapeClass"></div>
          </div>
          <div class="photo-back">
            <p class="photo-title">{{ photo.title }}</p>
            <p class="photo-date">{{ photo.date }}</p>
            <p class="photo-caption">{{ photo.caption }}</p>
          </div>
        </div>
      </div>
    </section>

    <div v-if="loading" class="loading-hint">加载中...</div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchPhotosByRegion } from '../../utils/photoApi'

const route = useRoute()

const title = ref('')
const total = ref(0)
const photos = ref([])
const loading = ref(false)
const hoverIndex = ref(-1)

const tapeStyles = ['tape-yellow', 'tape-white', 'tape-pink', 'tape-blue']

// 预加载图片获取原始尺寸
const loadImageSize = (src) => new Promise((resolve) => {
  const img = new Image()
  img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
  img.onerror = () => resolve({ w: 3, h: 4 })
  img.src = src
})

const loadPhotos = async () => {
  loading.value = true
  try {
    const data = await fetchPhotosByRegion(route.params.mapCode, 1, 50)
    if (!data) return
    title.value = data.title
    total.value = data.total

    const valid = (data.photos || []).filter(p => p.src)

    // 预加载所有图片尺寸
    const sizes = await Promise.all(valid.map(p => loadImageSize(p.src)))

    const CARD_H = 260
    const cols = 4
    const cellW = 100 / cols

    photos.value = valid.map((p, i) => {
      const { w, h } = sizes[i]
      const ratio = w / h < 1 ? 4 / 5 : w / h
      const cardW = CARD_H * ratio
      const cardH = CARD_H

      const col = i % cols
      const row = Math.floor(i / cols)
      const baseX = col * cellW + cellW / 2
      const baseY = row * 400 + 60
      const offsetX = (Math.random() - 0.5) * 40
      const offsetY = (Math.random() - 0.5) * 30
      const rotate = (Math.random() - 0.5) * 16

      return {
        ...p,
        title: p.title || p.alt || '',
        caption: p.caption || '',
        date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('zh-CN') : '',
        tapeClass: tapeStyles[Math.floor(Math.random() * tapeStyles.length)],
        style: {
          left: `calc(${baseX}% + ${offsetX}px)`,
          top: `${baseY + offsetY}px`,
          width: `${cardW}px`,
          '--card-h': `${cardH}px`,
          '--rotate': `${rotate}deg`,
          zIndex: i,
          animationDelay: `${i * 0.06}s`
        }
      }
    })

    // 动态撑开容器高度
    const rows = Math.ceil(valid.length / cols)
    if (desk.value) {
      desk.value.style.height = `${rows * 400 + 120}px`
    }
  } catch (err) {
    console.error('加载照片失败:', err)
  } finally {
    loading.value = false
  }
}

const desk = ref(null)

onMounted(loadPhotos)
watch(() => route.params.mapCode, loadPhotos)
</script>

<style scoped>
.photo-desk-page {
  min-height: 100vh;
  margin-top: -5rem;
  padding: 5rem 40px 60px;
}

@media (max-width: 768px) {
  .photo-desk-page {
    padding: 5rem 16px 40px;
  }
}

/* 头部 */
.photo-desk-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
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

/* 散落照片区域 */
.photo-desk {
  position: relative;
  min-height: 600px;
  max-width: 1200px;
  margin: 100px auto;
}

/* 单张照片容器 */
.scattered-photo {
  position: absolute;
  transform: translate(-50%, -50%) rotate(var(--rotate));
  cursor: pointer;
  animation: photo-appear 0.6s ease both;
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), z-index 0s;
}

@keyframes photo-appear {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--rotate)) scale(0.7);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(var(--rotate)) scale(1);
  }
}

.scattered-photo:hover {
  z-index: 999 !important;
  transform: translate(-50%, -50%) rotate(0deg) scale(1.15);
}

/* 照片卡片（正反面） */
.photo-card {
  position: relative;
  width: 100%;
  transition: transform 0.5s;
  transform-style: preserve-3d;
}

.photo-card.is-hovered {
  transform: rotateY(180deg);
}

.photo-front {
  position: relative;
  backface-visibility: hidden;
  border-radius: 2px;
  overflow: hidden;
  background: #fffdf5;
  padding: 8px 8px 48px;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.1);
}

.photo-front img {
  width: 100%;
  height: var(--card-h, 260px);
  object-fit: cover;
  display: block;
}

.photo-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 2px;
  overflow: hidden;
  background: #fffdf5;
  transform: rotateY(180deg);
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.1);
}

.photo-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.1rem;
  color: #2d2d2d;
  margin: 0 0 12px;
  line-height: 1.3;
}

.photo-date {
  font-size: 0.75rem;
  color: #999;
  margin: 0 0 16px;
  font-family: monospace;
}

.photo-caption {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.7;
  margin: 0;
  font-family: 'KaiTi', 'STKaiti', serif;
}

/* 胶带效果 */
.photo-tape {
  position: absolute;
  width: 60px;
  height: 20px;
  opacity: 0.7;
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(-2deg);
}

.tape-yellow {
  background: linear-gradient(180deg, rgba(255, 235, 150, 0.8), rgba(255, 220, 100, 0.6));
}

.tape-white {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(240, 240, 240, 0.5));
}

.tape-pink {
  background: linear-gradient(180deg, rgba(255, 200, 200, 0.7), rgba(255, 180, 180, 0.5));
}

.tape-blue {
  background: linear-gradient(180deg, rgba(200, 220, 255, 0.7), rgba(180, 200, 255, 0.5));
}

/* 加载提示 */
.loading-hint {
  text-align: center;
  padding: 40px 0;
  font-size: 13px;
  color: #4b5563;
  font-family: monospace;
}

@media (max-width: 760px) {
  .scattered-photo {
    max-width: 160px;
  }
}
</style>
