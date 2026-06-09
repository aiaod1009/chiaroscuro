<template>
  <div class="drafts-dashboard">
    <aside class="sidebar-panel">
      <div class="brand-header">
        <h1 class="main-title-zh">控制台</h1>
        <div class="brand-sub">
          <span class="sub-en">CONSOLE</span>
          <span class="sub-count">Albums <span class="highlight-num">{{ String(worksList.length).padStart(2, '0')
              }}</span></span>
        </div>
      </div>

      <p class="panel-desc">
        Manage your photographic narratives and unprocessed visual footprints.
      </p>

      <UploadCard @upload="openUpload()" />


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
        <TimeFilter v-model="selectedTime" :works="worksList" />

        <SearchInput v-model="searchQuery" placeholder="Search visual chronicles..." />

        <div class="view-toggle-btns">
          <button class="view-btn active">
            <svg class="v-icon" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
            </svg>
          </button>
          <button class="view-btn">
            <svg class="v-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <div class="assets-grid-flow">

        <AlbumPlaceholder :album-count="filteredWorks.length" @create="openCreateWorks" />

        <WorkCard v-for="work in pagedWorks" :key="work._id" :work="work"
          @open="openWork" />

      </div>

      <Pagination :current-page="currentPage" :total="filteredWorks.length" :page-size="pageSize"
        @update:currentPage="currentPage = $event" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import WorkCard from './components/WorkCard.vue'
import AlbumPlaceholder from './components/AlbumPlaceholder.vue'
import Pagination from './components/Pagination.vue'
import UploadCard from './components/UploadCard.vue'
import TimeFilter from './components/TimeFilter.vue'
import SearchInput from '../../components/SearchInput.vue'

const router = useRouter()

const openUpload = inject('openUpload')
const openCreateWorks = inject('openCreateWorks')
const currentCategory = ref('all')
const searchQuery = ref('')
const selectedTime = ref(null)
const currentPage = ref(1)
const pageSize = 12

const drafts = ref([])
const worksList = ref([])

const filteredWorks = computed(() => {
  let result = worksList.value
  if (selectedTime.value) {
    result = result.filter(w => {
      const d = new Date(w.realDate || w.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      return key === selectedTime.value
    })
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(w => w.name && w.name.toLowerCase().includes(q))
  }
  return result
})

const pagedWorks = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredWorks.value.slice(start, start + pageSize)
})

watch(() => filteredWorks.value.length, (len) => {
  const maxPage = Math.max(1, Math.ceil(len / pageSize))
  if (currentPage.value > maxPage) currentPage.value = maxPage
})

watch(searchQuery, () => { currentPage.value = 1 })
watch(selectedTime, () => { currentPage.value = 1 })

const fetchDrafts = async () => {
  try {
    const { data } = await axios.get('/api/photos/drafts')
    if (data.success) drafts.value = data.data
  } catch (err) {
    console.error('加载草稿失败:', err)
  }
}

const fetchWorks = async () => {
  try {
    const { data } = await axios.get('/api/works')
    if (data.success) worksList.value = data.data.filter(w => !w.locationCode)
  } catch (err) {
    console.error('加载作品集失败:', err)
  }
}

const openWork = (work) => {
  router.push(`/console/work/${work._id}`)
}

const onUploadComplete = () => { fetchWorks(); fetchDrafts() }

onMounted(() => {
  fetchWorks()
  fetchDrafts()
  window.addEventListener('upload-complete', onUploadComplete)
  window.addEventListener('works-complete', fetchWorks)
})
onUnmounted(() => {
  window.removeEventListener('upload-complete', onUploadComplete)
  window.removeEventListener('works-complete', fetchWorks)
})

// 左侧分类过滤器源
const filterNavs = ref([
  { id: 'all', name: 'All Drafts', count: 24, dotColor: '#ffffff' },
  { id: 'processing', name: 'Processing', count: '08', dotColor: '#64748b' },
  { id: 'ready', name: 'Ready', count: 13, dotColor: '#475569' }
])
</script>

<style scoped>
/* ==========================================================================
   1. 页面大框架基座 Layout
   ========================================================================== */
.drafts-dashboard {
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

.drafts-dashboard * {
  box-sizing: border-box;
}

@media (max-width: 1024px) {
  .drafts-dashboard {
    grid-template-columns: 1fr;
  }
}

/* ==========================================================================
   2. 左侧控制面板样式栏 (Sidebar Panel)
   ========================================================================== */
.sidebar-panel {
  padding: 40px 24px;
  border-right: 1px solid rgba(255, 255, 255, 0.03);
  display: flex;
  flex-direction: column;
}

.brand-header {
  margin-bottom: 12px;
}

.main-title-zh {
  font-size: 34px;
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

.panel-desc {
  font-size: 12px;
  line-height: 1.6;
  color: #57606a;
  margin: 0 0 32px 0;
}

/* AI 队列条 */
.ai-queue-card {
  background-color: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 32px;
}

.queue-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.queue-left {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: monospace;
}

.sparkle-icon {
  font-size: 11px;
  color: #8b949e;
}

.queue-label {
  font-size: 10px;
  font-weight: 700;
  color: #4b5563;
  letter-spacing: 0.1em;
}

.queue-value {
  font-size: 11px;
  color: #8b949e;
  font-weight: 500;
}

.queue-progress-track {
  width: 100%;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.04);
  border-radius: 2px;
}

.queue-progress-bar {
  height: 100%;
  background-color: #57606a;
  border-radius: 2px;
}

/* 左侧分类过滤器组 */
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

/* ==========================================================================
   3. 右侧：工作流面板主内容区 (Main Panel)
   ========================================================================== */
.content-main {
  padding: 40px;
  display: flex;
  flex-direction: column;
}

/* 顶部过滤器行 */
.top-filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

/* 视图切换键 */
.view-toggle-btns {
  display: flex;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 3px;
  border-radius: 8px;
}

.view-btn {
  background: transparent;
  border: none;
  padding: 6px;
  border-radius: 6px;
  color: #4b5563;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.view-btn.active {
  background-color: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

.v-icon {
  width: 14px;
  height: 14px;
}

/* ==========================================================================
   4. 图片内容流列表 (Assets Flow Grid)
   ========================================================================== */
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

/* 卡片顶部绝对层：多选单选框与扩展按键 */
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

.checkbox-hollow {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  cursor: pointer;
}

.btn-more-actions {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 卡片底部：毛玻璃技术层 */
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

/* RAW/JPG 格式胶囊角标 */
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

/* 返回栏 */
.work-header-bar {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 8px;
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
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.work-title {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.work-count {
  font-size: 12px;
  font-family: monospace;
  color: #64748b;
}

</style>