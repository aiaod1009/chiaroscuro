<template>
  <div class="work-detail-page page-bg">
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
        <button class="select-toggle" :class="{ active: selectMode }" @click="toggleSelectMode">
          {{ selectMode ? '取消选择' : '批量操作' }}
        </button>
      </header>

      <!-- 批量操作栏 -->
      <transition name="batch-bar">
        <div v-if="selectedIds.size > 0" class="batch-bar">
          <span class="batch-count">已选 {{ selectedIds.size }} 张</span>
          <button class="batch-btn" @click="showMoveModal = true">移动到...</button>
          <button class="batch-btn danger" @click="showDeleteModal = true">删除</button>
        </div>
      </transition>

      <div class="assets-grid-flow">
        <div v-for="item in filteredPhotos" :key="item._id" class="photo-wrapper"
          :class="{ selected: selectedIds.has(item._id) }">
          <button v-if="selectMode" class="select-check" @click.stop="toggleSelect(item._id)"
            :class="{ checked: selectedIds.has(item._id) }">
            <svg v-if="selectedIds.has(item._id)" viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
              <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
            </svg>
          </button>
          <PhotoCard :title="item.title" :file-name="item.fileName"
            :caption="item.caption" :image-url="item.imageUrl" :is-completed="isCompleted(item)"
            :works="otherWorks" :album-count="(item.albumIds || []).length"
            @click="selectMode ? toggleSelect(item._id) : goToPhotoDetail(item)" @delete="handleDelete(item._id)"
            @move="(targetId) => handleMove(item._id, targetId)"
            @copy="(targetId) => handleCopy(item._id, targetId)"
            @removeAlbum="handleRemoveAlbum(item._id, route.params.id)"
            @setCover="handleSetCover(item.imageUrl)" />
        </div>
      </div>

      <!-- 移动弹窗 -->
      <transition name="modal">
        <div v-if="showMoveModal" class="modal-overlay" @click.self="showMoveModal = false">
          <div class="modal-box">
            <h4 class="modal-title">移动到作品集</h4>
            <div class="modal-work-list">
              <button v-for="w in otherWorks" :key="w._id" class="modal-work-item"
                @click="batchMove(w._id)">
                {{ w.name }}
              </button>
            </div>
            <button class="modal-btn cancel" @click="showMoveModal = false">取消</button>
          </div>
        </div>
      </transition>

      <!-- 删除确认弹窗 -->
      <transition name="modal">
        <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
          <div class="modal-box">
            <div class="modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h4 class="modal-title">批量删除</h4>
            <p class="modal-desc">确定删除选中的 {{ selectedIds.size }} 张照片？此操作不可撤销。</p>
            <div class="modal-actions">
              <button class="modal-btn cancel" @click="showDeleteModal = false">取消</button>
              <button class="modal-btn danger" @click="batchDelete">删除</button>
            </div>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchWorks as apiFetchWorks, fetchWorkDetail as apiFetchWorkDetail, deletePhoto, removePhotoFromAlbum, movePhoto, copyPhoto, updateWork } from '../../utils/photoApi'
import SearchInput from '../../components/SearchInput.vue'
import PhotoCard from './components/PhotoCard.vue'

const route = useRoute()
const router = useRouter()

const currentCategory = ref('all')
const searchQuery = ref('')
const workInfo = ref({})
const photos = ref([])
const allWorks = ref([])

const selectMode = ref(false)
const selectedIds = ref(new Set())
const showMoveModal = ref(false)
const showDeleteModal = ref(false)

const toggleSelectMode = () => {
  selectMode.value = !selectMode.value
  if (!selectMode.value) selectedIds.value = new Set()
}

const toggleSelect = (id) => {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

const batchDelete = async () => {
  const ids = [...selectedIds.value]
  showDeleteModal.value = false
  try {
    await Promise.all(ids.map(id => deletePhoto(id)))
    photos.value = photos.value.filter(p => !selectedIds.value.has(p._id))
    selectedIds.value = new Set()
    selectMode.value = false
  } catch {
    alert('部分删除失败')
  }
}

const batchMove = async (targetAlbumId) => {
  const ids = [...selectedIds.value]
  showMoveModal.value = false
  try {
    await Promise.all(ids.map(id => movePhoto(id, targetAlbumId)))
    photos.value = photos.value.filter(p => !selectedIds.value.has(p._id))
    selectedIds.value = new Set()
    selectMode.value = false
  } catch {
    alert('部分移动失败')
  }
}

const isCompleted = (photo) => {
  return !!(photo.title && photo.title.trim() && photo.caption && photo.caption.trim())
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

const otherWorks = computed(() => allWorks.value.filter(w => w._id !== route.params.id))

const fetchAllWorks = async () => {
  try {
    allWorks.value = await apiFetchWorks()
  } catch { }
}

const fetchWorkDetail = async () => {
  const id = route.params.id
  if (!id) return
  try {
    const data = await apiFetchWorkDetail(id)
    if (data) {
      const { photos: workPhotos, ...workMeta } = data
      workInfo.value = workMeta || {}
      photos.value = workPhotos || []
    }
  } catch (err) {
    console.error('加载作品集详情失败:', err)
  }
}

const handleDelete = async (photoId) => {
  try {
    await deletePhoto(photoId)
    photos.value = photos.value.filter(p => p._id !== photoId)
  } catch {
    alert('删除失败')
  }
}

const handleRemoveAlbum = async (photoId, albumId) => {
  try {
    await removePhotoFromAlbum(photoId, albumId)
    photos.value = photos.value.filter(p => p._id !== photoId)
  } catch {
    alert('移除失败')
  }
}

const handleMove = async (photoId, targetAlbumId) => {
  try {
    await movePhoto(photoId, targetAlbumId)
    photos.value = photos.value.filter(p => p._id !== photoId)
  } catch {
    alert('移动失败')
  }
}

const handleCopy = async (photoId, targetAlbumId) => {
  try {
    await copyPhoto(photoId, targetAlbumId)
  } catch {
    alert('复制失败')
  }
}

const handleSetCover = async (imageUrl) => {
  try {
    const workId = route.params.id
    await updateWork(workId, { coverImage: imageUrl })
    alert('封面设置成功')
  } catch {
    alert('封面设置失败')
  }
}

const goToPhotoDetail = (item) => {
  router.push({ path: '/notes', query: { photoId: item._id, imageUrl: item.imageUrl } })
}

onMounted(() => {
  fetchWorkDetail()
  fetchAllWorks()
})
watch(() => route.params.id, fetchWorkDetail)
</script>

<style scoped>
.work-detail-page {
  min-height: 100vh;
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
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  align-items: start;
}

.select-toggle {
  margin-left: auto;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.select-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.select-toggle.active {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  color: #e5e7eb;
}

/* 批量操作栏 */
.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  margin-bottom: 20px;
}

.batch-count {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

.batch-btn {
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.batch-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.batch-btn.danger {
  border-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.batch-btn.danger:hover {
  background: rgba(239, 68, 68, 0.08);
}

.batch-bar-enter-active,
.batch-bar-leave-active {
  transition: all 0.2s ease;
}

.batch-bar-enter-from,
.batch-bar-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 照片包装器 */
.photo-wrapper {
  position: relative;
}

.select-check {
  position: absolute;
  bottom: 8px;
  right: 8px;
  z-index: 10;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: all 0.15s;
}

.select-check:hover {
  border-color: rgba(255, 255, 255, 0.5);
}

.select-check.checked {
  background: #e5e7eb;
  border-color: #e5e7eb;
  color: #111;
}

.photo-wrapper.selected {
  outline: 2px solid rgba(255, 255, 255, 0.3);
  outline-offset: 2px;
  border-radius: 16px;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-box {
  background: #1a2235;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 28px;
  width: 340px;
  max-height: 60vh;
  text-align: center;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
}

.modal-icon {
  color: #f87171;
  margin-bottom: 12px;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #e5e7eb;
  margin: 0 0 8px;
}

.modal-desc {
  font-size: 13px;
  color: #9ca3af;
  margin: 0 0 20px;
  line-height: 1.5;
}

.modal-work-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.modal-work-item {
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  color: #9ca3af;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}

.modal-work-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #e5e7eb;
  border-color: rgba(255, 255, 255, 0.12);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-btn {
  padding: 8px 24px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.modal-btn.cancel {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #9ca3af;
}

.modal-btn.cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e5e7eb;
}

.modal-btn.danger {
  background: #dc2626;
  color: #fff;
}

.modal-btn.danger:hover {
  background: #ef4444;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.95);
}

</style>
