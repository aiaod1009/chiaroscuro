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

      <!-- 作品集信息 -->
      <div class="work-info-section">
        <div class="info-row">
          <span class="info-label">名称</span>
          <span class="info-value">{{ workInfo.name || '-' }}</span>
          <button class="btn-edit-info" @click="openEditModal">
            <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
              <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z" />
            </svg>
          </button>
        </div>
        <div class="info-row">
          <span class="info-label">描述</span>
          <span class="info-value desc">{{ workInfo.description || '暂无描述' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">时间</span>
          <span class="info-value">{{ formattedDate }}</span>
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

      <!-- 编辑作品集信息弹窗 -->
      <transition name="modal">
        <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
          <div class="modal-box">
            <h4 class="modal-title">编辑作品集信息</h4>
            <div class="edit-form">
              <label class="form-label">名称</label>
              <input v-model="editName" class="form-input" placeholder="作品集名称" />
              <label class="form-label">描述</label>
              <textarea v-model="editDesc" class="form-textarea" placeholder="描述（可选）" rows="4"></textarea>
              <label class="form-label">时间</label>
              <input v-model="editDate" type="month" class="form-input" />
            </div>
            <div class="modal-actions">
              <button class="modal-btn cancel" @click="showEditModal = false">取消</button>
              <button class="modal-btn primary" @click="saveEdit">保存</button>
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
const showEditModal = ref(false)
const editName = ref('')
const editDesc = ref('')
const editDate = ref('')

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

const formattedDate = computed(() => {
  if (!workInfo.value.realDate) return '-'
  return new Date(workInfo.value.realDate).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long'
  })
})

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

const openEditModal = () => {
  editName.value = workInfo.value.name || ''
  editDesc.value = workInfo.value.description || ''
  editDate.value = workInfo.value.realDate ? workInfo.value.realDate.slice(0, 10) : ''
  showEditModal.value = true
}

const saveEdit = async () => {
  try {
    await updateWork(route.params.id, {
      name: editName.value,
      description: editDesc.value,
      realDate: editDate.value || undefined
    })
    workInfo.value.name = editName.value
    workInfo.value.description = editDesc.value
    workInfo.value.realDate = editDate.value
    showEditModal.value = false
  } catch {
    alert('保存失败')
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

/* 作品集信息 */
.work-info-section {
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 11px;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  min-width: 32px;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-value {
  font-size: 13px;
  color: #e5e7eb;
  flex: 1;
  line-height: 1.4;
}

.info-value.desc {
  color: #8b949e;
  font-size: 12px;
}

.btn-edit-info {
  background: transparent;
  border: none;
  color: #4b5563;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-edit-info:hover {
  color: #e5e7eb;
  background: rgba(255, 255, 255, 0.06);
}

/* 编辑表单 */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  text-align: left;
}

.form-label {
  font-size: 11px;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.form-input,
.form-textarea {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px 12px;
  color: #e5e7eb;
  font-size: 13px;
  font-family: inherit;
  transition: all 0.2s;
  resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
}

.modal-btn.primary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #e5e7eb;
}

.modal-btn.primary:hover {
  background: rgba(255, 255, 255, 0.15);
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

/* 移动端适配 */
@media (max-width: 1024px) {
  .work-detail-page {
    grid-template-columns: 1fr;
    padding: 5rem 24px 0 24px;
  }
  .sidebar-panel {
    display: none;
  }
}
@media (max-width: 768px) {
  .work-detail-page {
    padding: 5rem 16px 0 16px;
  }
  .content-main {
    padding: 20px 0;
  }
  .assets-grid-flow {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .top-filter-bar {
    flex-wrap: wrap;
    gap: 10px;
  }
  .modal-box {
    width: min(90vw, 340px);
  }
}
@media (max-width: 480px) {
  .assets-grid-flow {
    grid-template-columns: 1fr;
  }
}

</style>
