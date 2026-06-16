<template>
  <div class="folder-card" @click="$emit('open', work)">
    <div class="folder-cover">
      <img v-if="coverSrc" :src="coverSrc" :alt="work.name" @error="onCoverError" />
      <span v-if="!coverSrc" class="folder-empty-hint">暂无照片</span>
    </div>
    <div class="folder-info">
      <h3 class="folder-name">{{ work.name }}</h3>
      <p class="folder-meta">{{ formattedDate }}</p>
      <button class="btn-delete" @click.stop="openConfirm" title="删除作品集">
        <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
          <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" />
        </svg>
      </button>
    </div>

    <!-- 删除确认弹窗 -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showConfirm" class="modal-overlay" @click.self="showConfirm = false">
          <div class="modal-box">
            <h4 class="modal-title">删除作品集</h4>
            <div v-if="checking" class="modal-loading">检查中...</div>
            <div v-else-if="photoCount > 0" class="modal-warn">
              <p>该作品集还有 <strong>{{ photoCount }}</strong> 张照片</p>
              <p class="warn-hint">请先清空照片再删除</p>
            </div>
            <div v-else>
              <p class="modal-desc">确定删除「{{ work.name }}」？</p>
            </div>
            <div class="modal-actions">
              <button class="modal-btn cancel" @click="showConfirm = false">
                {{ photoCount > 0 ? '知道了' : '取消' }}
              </button>
              <button v-if="photoCount === 0 && !checking" class="modal-btn confirm" @click="handleDelete">删除</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { fetchWorkDetail, deleteWork } from '../../../utils/photoApi'

const props = defineProps({
  work: { type: Object, required: true }
})

const emit = defineEmits(['open', 'deleted'])

const showConfirm = ref(false)
const photoCount = ref(0)
const checking = ref(false)

const coverSrc = ref(props.work.coverImage ? `${props.work.coverImage}!small` : '')
const retried = ref(false)

const onCoverError = async () => {
  if (retried.value) { coverSrc.value = ''; return }
  retried.value = true
  try {
    const data = await fetchWorkDetail(props.work._id)
    const url = data?.photos?.length ? data.photos[0].imageUrl : ''
    coverSrc.value = url ? `${url}!small` : ''
  } catch {
    coverSrc.value = ''
  }
}

const formattedDate = computed(() =>
  new Date(props.work.realDate || props.work.createdAt)
    .toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    .toUpperCase()
)

const openConfirm = async () => {
  checking.value = true
  showConfirm.value = true
  try {
    const data = await fetchWorkDetail(props.work._id)
    photoCount.value = data?.photos?.length || 0
  } catch {
    photoCount.value = 0
  }
  checking.value = false
}

const handleDelete = async () => {
  if (photoCount.value > 0) return
  try {
    const res = await deleteWork(props.work._id)
    if (res.success) {
      showConfirm.value = false
      emit('deleted', props.work._id)
    } else {
      alert(res.message || '删除失败')
    }
  } catch (err) {
    alert('删除失败')
  }
}
</script>

<style scoped>
.folder-card {
  position: relative;
  aspect-ratio: 1.4 / 1;
  border-radius: 16px;
  overflow: hidden;
  background-color: #161b22;
  border: 1px solid rgba(255, 255, 255, 0.03);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
  display: flex;
  flex-direction: column;
}

.folder-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.08);
}

.folder-cover {
  flex: 1;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  align-items: center;
  justify-content: center;
}

.folder-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.folder-card:hover .folder-cover img {
  transform: scale(1.02);
}

.folder-empty-hint {
  color: #3a4150;
  font-size: 13px;
}

.folder-info {
  padding: 14px 16px;
  background: linear-gradient(to top, #1a2030, #161b22);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.folder-name {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-meta {
  font-size: 10px;
  font-family: monospace;
  color: #64748b;
  margin: 0;
  letter-spacing: 0.05em;
}

.folder-info {
  position: relative;
}

.btn-delete {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  color: #4b5563;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.2s;
}

.folder-card:hover .btn-delete {
  opacity: 1;
}

.btn-delete:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
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
  width: 320px;
  text-align: center;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
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

.modal-btn.confirm {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #e5e7eb;
}

.modal-btn.confirm:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.modal-loading {
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 20px;
}

.modal-warn {
  margin-bottom: 20px;
}

.modal-warn p {
  margin: 0 0 4px;
  color: #e5e7eb;
  font-size: 14px;
}

.modal-warn strong {
  color: #f59e0b;
}

.warn-hint {
  color: #6b7280;
  font-size: 12px;
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
