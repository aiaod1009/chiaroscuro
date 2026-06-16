<template>
  <div class="drafts-dashboard page-bg">
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
          @open="openWork" @deleted="handleWorkDeleted" />

      </div>

      <Pagination :current-page="currentPage" :total="filteredWorks.length" :page-size="pageSize"
        @update:currentPage="currentPage = $event" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchDrafts as apiFetchDrafts, fetchWorks as apiFetchWorks } from '../../utils/photoApi'
import WorkCard from './components/WorkCard.vue'
import AlbumPlaceholder from './components/AlbumPlaceholder.vue'
import Pagination from './components/Pagination.vue'
import UploadCard from './components/UploadCard.vue'
import TimeFilter from './components/TimeFilter.vue'
import SearchInput from '../../components/SearchInput.vue'

const router = useRouter()

const openUpload = inject('openUpload')
const openCreateWorks = inject('openCreateWorks')
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
    drafts.value = await apiFetchDrafts()
  } catch (err) {
    console.error('加载草稿失败:', err)
  }
}

const fetchWorks = async () => {
  try {
    const data = await apiFetchWorks()
    worksList.value = data.filter(w => !w.locationCode)
  } catch (err) {
    console.error('加载作品集失败:', err)
  }
}

const openWork = (work) => {
  router.push(`/console/work/${work._id}`)
}

const handleWorkDeleted = (workId) => {
  works.value = works.value.filter(w => w._id !== workId)
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

</script>

<style scoped>
/* ==========================================================================
   1. 页面大框架基座 Layout
   ========================================================================== */
.drafts-dashboard {
  min-height: 100vh;
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
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  align-items: start;
}

</style>