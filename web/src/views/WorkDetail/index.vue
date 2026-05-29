<template>
  <div class="work-detail-page">
    <aside class="sidebar-panel">
      <div class="brand-header">
        <button class="btn-back" @click="router.push('/console')">&larr; 返回控制台</button>
        <h1 class="main-title-zh">{{ workInfo.name }}</h1>
        <div class="brand-sub">
          <span class="sub-en">WORK DETAIL</span>
          <span class="sub-count">Photos <span class="highlight-num">{{ String(filteredPhotos.length).padStart(2, '0') }}</span></span>
        </div>
      </div>

      <nav class="filter-navigation">
        <button v-for="nav in filterNavs" :key="nav.id" class="nav-item" :class="{ active: currentCategory === nav.id }"
          @click="currentCategory = nav.id">
          <div class="nav-left">
            <span class="status-dot" :style="{ backgroundColor: nav.dotColor }"></span>
            <span class="nav-name">{{ nav.name }}</span>
          </div>
          <span class="nav-count">{{ nav.count }}</span>
        </button>
      </nav>
    </aside>

    <main class="content-main">
      <header class="top-filter-bar">
        <SearchInput v-model="searchQuery" placeholder="Search photos..." />
      </header>

      <div class="assets-grid-flow">
        <div v-for="item in filteredPhotos" :key="item._id" class="asset-card" @click="goToPhotoDetail(item)">
          <div class="card-top-overlay">
            <div class="status-indicator" :class="{ completed: isCompleted(item) }">
              {{ isCompleted(item) ? '✓' : '○' }}
            </div>
          </div>

          <img :src="item.imageUrl" :alt="item.fileName" class="asset-img" />

          <div class="card-bottom-glass">
            <div class="info-left">
              <h3 class="asset-title">{{ item.title || item.fileName }}</h3>
              <p class="asset-meta">{{ item.caption || '未写配文' }}</p>
            </div>
            <span class="format-badge" :class="{ completed: isCompleted(item) }">
              {{ isCompleted(item) ? 'DONE' : 'DRAFT' }}
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import SearchInput from '../../components/SearchInput.vue'

const route = useRoute()
const router = useRouter()

const currentCategory = ref('all')
const searchQuery = ref('')
const workInfo = ref({})
const photos = ref([])

const isCompleted = (photo) => {
  return photo.title && photo.title.trim() && photo.caption && photo.caption.trim()
}

const completedCount = computed(() => photos.value.filter(p => isCompleted(p)).length)
const uncompletedCount = computed(() => photos.value.filter(p => !isCompleted(p)).length)

const filterNavs = computed(() => [
  { id: 'all', name: 'ALL', count: String(photos.value.length).padStart(2, '0'), dotColor: '#ffffff' },
  { id: 'completed', name: '已完成', count: String(completedCount.value).padStart(2, '0'), dotColor: '#5cb85c' },
  { id: 'uncompleted', name: '未完成', count: String(uncompletedCount.value).padStart(2, '0'), dotColor: '#f0ad4e' }
])

const filteredPhotos = computed(() => {
  let result = photos.value
  if (currentCategory.value === 'completed') {
    result = result.filter(p => isCompleted(p))
  } else if (currentCategory.value === 'uncompleted') {
    result = result.filter(p => !isCompleted(p))
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.fileName && p.fileName.toLowerCase().includes(q)) ||
      (p.caption && p.caption.toLowerCase().includes(q))
    )
  }
  return result
})

const fetchWorkDetail = async () => {
  const id = route.params.id
  if (!id) return
  try {
    const { data } = await axios.get(`/api/works/${id}`)
    if (data.success) {
      const { photos: workPhotos, ...workMeta } = data.data
      workInfo.value = workMeta || {}
      photos.value = workPhotos || []
    }
  } catch (err) {
    console.error('加载作品集详情失败:', err)
  }
}

const goToPhotoDetail = (item) => {
  router.push({ path: '/notes', query: { photoId: item._id, imageUrl: item.imageUrl } })
}

onMounted(fetchWorkDetail)
watch(() => route.params.id, fetchWorkDetail)
</script>

<style scoped>
.work-detail-page {
  min-height: 100vh;
  background-color: #0d0f12;
  color: #c9d1d9;
  display: grid;
  grid-template-columns: 280px 1fr;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-sizing: border-box;
  margin-top: -5rem;
  padding: 5rem 60px 0 60px;
}

.work-detail-page * {
  box-sizing: border-box;
}

.sidebar-panel {
  padding: 40px 24px;
  border-right: 1px solid rgba(255, 255, 255, 0.03);
  display: flex;
  flex-direction: column;
}

.brand-header {
  margin-bottom: 32px;
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
  margin-bottom: 16px;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.main-title-zh {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: 0.04em;
}

.brand-sub {
  display: flex;
  gap: 10px;
  margin-top: 4px;
  font-family: monospace;
  font-size: 13px;
}

.sub-en {
  color: #4b5563;
  letter-spacing: 0.1em;
}

.sub-count {
  color: #8b949e;
}

.highlight-num {
  font-weight: 700;
  color: #ffffff;
}

.filter-navigation {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  width: 100%;
  background: transparent;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.nav-name {
  font-size: 13px;
  color: #8b949e;
}

.nav-count {
  font-size: 12px;
  font-family: monospace;
  color: #4b5563;
}

.nav-item.active {
  background-color: rgba(255, 255, 255, 0.04);
}

.nav-item.active .nav-name {
  color: #ffffff;
  font-weight: 500;
}

.nav-item.active .nav-count {
  color: #8b949e;
}

.content-main {
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.top-filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}


.assets-grid-flow {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  flex-grow: 1;
}

.asset-card {
  position: relative;
  aspect-ratio: 1.4 / 1;
  border-radius: 16px;
  overflow: hidden;
  background-color: #161b22;
  border: 1px solid rgba(255, 255, 255, 0.03);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.asset-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.asset-card:hover .asset-img {
  transform: scale(1.02);
}

.card-top-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 3;
}

.status-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #f0ad4e;
}

.status-indicator.completed {
  border-color: #5cb85c;
  color: #5cb85c;
}

.card-bottom-glass {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.1) 100%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  z-index: 2;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
}

.asset-title {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px 0;
  font-family: monospace;
}

.asset-meta {
  font-size: 9px;
  font-family: monospace;
  color: #8b949e;
  margin: 0;
  letter-spacing: 0.02em;
}

.format-badge {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-family: monospace;
  font-size: 9px;
  font-weight: 700;
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 6px;
}

.format-badge.completed {
  background-color: rgba(92, 184, 92, 0.2);
  border-color: rgba(92, 184, 92, 0.4);
  color: #5cb85c;
}
</style>
