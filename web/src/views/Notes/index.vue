<template>
  <div class="visual-notes-container">

    <header class="notes-header">
      <div class="header-left">
        <div class="module-tag">EXPERIMENTAL MODULE</div>
        <h1 class="main-title">
          影像叙事 <span class="en-title">VISUAL NOTES</span>
        </h1>
        <p class="subtitle">
          利用神经网络深度解析每一寸光影，将瞬时感官转化为永恒的叙事文字。
        </p>
      </div>

      <div class="header-right">
        <button class="btn-ai-generate" :disabled="isGenerating" @click="handleAiGenerate">
          <svg class="sparkle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {{ isGenerating ? 'GENERATING...' : 'AI GENERATE' }}
        </button>
        <span v-if="candidates.length" class="analyzed-hint">已分析</span>
      </div>
    </header>

    <div class="notes-grid">

      <div class="workspace-column">
        <ImageViewer :imageSrc="currentPhoto.imageUrl || '/DSC_6510.jpg'" :isGenerating="isGenerating" />

        <MetaSpecBar :exif="photoExif" />

        <transition name="toast">
          <div v-if="toastMessage" class="toast-bar">
            <span class="toast-icon">⚡</span>
            <span>{{ toastMessage }}</span>
          </div>
        </transition>
      </div>

      <div class="control-column">
        <ModeTabs v-model="currentMode" />

        <div class="interactive-panel">
          <AiAssistPanel v-if="currentMode === 'ai'"
            :perspectives="perspectives"
            :activePerspective="activePerspective"
            :candidates="candidates"
            :activeCandidateIndex="activeCandidateIndex"
            :activeCandidate="activeCandidate"
            :noHistory="noHistory"
            :isGenerating="isGenerating"
            :isIterating="isIterating"
            :isSaving="isSaving"
            :saveSuccess="saveSuccess"
            :aiPrompt="aiPrompt"
            @update:activePerspective="activePerspective = $event"
            @update:aiPrompt="aiPrompt = $event"
            @selectCandidate="selectCandidate"
            @apply="applyToPhoto"
            @optimize="handleOptimize" />

          <CreatorPanel v-else
            :manualTitle="manualTitle"
            :manualContent="manualContent"
            :isSaving="isSaving"
            :saveSuccess="saveSuccess"
            @update:manualTitle="manualTitle = $event"
            @update:manualContent="manualContent = $event"
            @apply="applyToPhoto" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchPhotoDetail as apiFetchPhotoDetail, updatePhoto, generateFirstRound, iterateGeneration, fetchAISession } from '../../utils/photoApi'
import ImageViewer from './components/ImageViewer.vue'
import MetaSpecBar from './components/MetaSpecBar.vue'
import ModeTabs from './components/ModeTabs.vue'
import AiAssistPanel from './components/AiAssistPanel.vue'
import CreatorPanel from './components/CreatorPanel.vue'

const route = useRoute()

// 核心状态：'creator' (手写) 或 'ai' (AI智能)
const currentMode = ref('ai')

// AI 模式相关状态
const activePerspective = ref('poetic')
const aiPrompt = ref('')
const perspectives = [
  { id: 'poetic', name: '诗意' },
  { id: 'narrative', name: '叙事' },
  { id: 'minimal', name: '极简' }
]

const STYLE_MAP = {
  poetic: '诗意',
  narrative: '叙事',
  minimal: '极简'
}

// AI 生成状态
const isGenerating = ref(false)
const isIterating = ref(false)
const sessionId = ref(null)
const candidates = ref([])
const activeCandidateIndex = ref(0)
const toastMessage = ref('')
let toastTimer = null
const isSaving = ref(false)
const saveSuccess = ref(false)
const noHistory = ref(false)

const showToast = (msg, duration = 5000) => {
  toastMessage.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMessage.value = '' }, duration)
}

const activeCandidate = ref({
  title: '',
  caption: ''
})

// 手写模式相关状态
const manualTitle = ref('')
const manualContent = ref('')

// 当前照片信息（从 Console 页跳转携带）
const currentPhoto = reactive({
  id: null,
  imageUrl: ''
})

const photoExif = reactive({
  camera: '',
  aperture: '',
  iso: '',
  shutterSpeed: '',
  focalLength: '',
  dateTimeOriginal: null
})

onMounted(async () => {
  if (route.query.photoId) currentPhoto.id = route.query.photoId
  if (route.query.imageUrl) currentPhoto.imageUrl = route.query.imageUrl
  if (currentPhoto.id) {
    await fetchPhotoDetail(currentPhoto.id)
    // 尝试从数据库恢复已有 AI 会话
    restoreSession()
  }
})

// 拉取照片详情（含 EXIF）
const fetchPhotoDetail = async (id) => {
  try {
    const p = await apiFetchPhotoDetail(id)
    if (p) {
      if (p.imageUrl) currentPhoto.imageUrl = p.imageUrl
      if (p.exif) {
        photoExif.camera = p.exif.camera || ''
        photoExif.aperture = p.exif.aperture || ''
        photoExif.iso = p.exif.iso || ''
        photoExif.shutterSpeed = p.exif.shutterSpeed || ''
        photoExif.focalLength = p.exif.focalLength || ''
        photoExif.dateTimeOriginal = p.exif.dateTimeOriginal || p.createdAt
      }
    }
  } catch (e) {
    console.error('获取照片详情失败:', e)
  }
}

// 将接口返回的 candidates 同步到前端状态
const applyCandidates = (data) => {
  sessionId.value = data.sessionId
  candidates.value = data.candidates
  activeCandidateIndex.value = 0
  activeCandidate.value = {
    title: data.candidates[0].title,
    caption: data.candidates[0].caption
  }
}

// 页面加载时尝试从数据库恢复已有会话（静默，不显示 loading）
const restoreSession = async () => {
  if (!currentPhoto.id) return
  // 先清空当前候选，避免切换风格时残留旧数据
  candidates.value = []
  activeCandidate.value = { title: '', caption: '' }
  sessionId.value = null
  noHistory.value = false
  try {
    const style = STYLE_MAP[activePerspective.value]
    const data = await fetchAISession(currentPhoto.id, style)
    if (data.success && data.candidates.length) {
      applyCandidates(data)
      noHistory.value = false
    } else {
      noHistory.value = true
    }
  } catch {
    noHistory.value = true
  }
}

// 切换风格时自动恢复该风格的历史会话
watch(activePerspective, () => {
  if (currentPhoto.id) restoreSession()
})

// AI GENERATE：首次触发生成
const handleAiGenerate = async () => {
  if (isGenerating.value) return
  if (candidates.value.length) {
    showToast('已分析过，正在重新生成...')
  }
  isGenerating.value = true

  try {
    const style = STYLE_MAP[activePerspective.value]
    const data = await generateFirstRound(currentPhoto.id, currentPhoto.imageUrl, style)

    if (data.success) applyCandidates(data)
  } catch (error) {
    console.error('AI 生成失败:', error)
    const status = error.response?.status
    if (status === 429) {
      showToast('【灵感中枢繁忙】请稍等 5 秒后再次敲击...')
    } else {
      showToast('生成失败，请稍后重试')
    }
  } finally {
    isGenerating.value = false
  }
}

// 切换候选方案
const selectCandidate = (index) => {
  if (index < 0 || index >= candidates.value.length) return
  activeCandidateIndex.value = index
  activeCandidate.value = {
    title: candidates.value[index].title,
    caption: candidates.value[index].caption
  }
}

// RE-DRAFT：多轮迭代优化
const handleOptimize = async () => {
  if (!aiPrompt.value.trim() || !sessionId.value || isIterating.value) return
  isIterating.value = true

  try {
    const currentOption = candidates.value[activeCandidateIndex.value]
    const data = await iterateGeneration(
      sessionId.value,
      currentOption.optionId,
      aiPrompt.value.trim(),
      {
        title: activeCandidate.value.title,
        caption: activeCandidate.value.caption
      }
    )

    if (data.success) {
      const updated = data.updatedCandidate
      activeCandidate.value = {
        title: updated.title,
        caption: updated.caption
      }
      // 同步更新 candidates 列表
      const idx = candidates.value.findIndex(c => c.optionId === updated.optionId)
      if (idx !== -1) {
        candidates.value[idx].title = updated.title
        candidates.value[idx].caption = updated.caption
      }
    }
  } catch (error) {
    console.error('迭代优化失败:', error)
    const status = error.response?.status
    if (status === 429) {
      showToast('【灵感中枢繁忙】请稍等 5 秒后再次敲击...')
    } else {
      showToast('优化失败，请稍后重试')
    }
  } finally {
    isIterating.value = false
    aiPrompt.value = ''
  }
}

// 将当前内容写入 Photo 的 title/caption（AI / 手写共用）
const applyToPhoto = async (title, caption) => {
  if (!currentPhoto.id || isSaving.value) return
  isSaving.value = true
  saveSuccess.value = false
  try {
    await updatePhoto(currentPhoto.id, { title, caption })
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e) {
    showToast('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}


// 触发保存操作
const handleSave = async () => {
  const title = currentMode.value === 'ai' ? activeCandidate.value.title : manualTitle.value
  const caption = currentMode.value === 'ai' ? activeCandidate.value.caption : manualContent.value
  if (!title && !caption) {
    showToast('请先输入标题或配文')
    return
  }
  await applyToPhoto(title, caption)
}
</script>

<style scoped>
/* ==========================================================================
   1. 全局排版及页面容器
   ========================================================================== */
.visual-notes-container {
  min-height: 100vh;
  background-color: #090d12;
  color: #c9d1d9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  margin-top: -5rem;
  padding: 6.5rem 200px 40px 200px;
  box-sizing: border-box;
}

.visual-notes-container * {
  box-sizing: border-box;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}

.analyzed-hint {
  font-size: 11px;
  color: #34d399;
  font-weight: 600;
}

.module-tag {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.25em;
  color: #4b5563;
  margin-bottom: 6px;
}

.main-title {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
  letter-spacing: 0.05em;
}

.en-title {
  font-size: 28px;
  font-weight: 300;
  color: #4b5563;
  margin-left: 10px;
  font-family: "Times New Roman", serif;
  letter-spacing: 0.1em;
}

.subtitle {
  font-size: 13px;
  font-weight: 500;
  color: #8b949e;
  margin: 0;
}

/* ==========================================================================
   2. 双栏网格架构
   ========================================================================== */
.notes-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 32px;
}

@media (max-width: 1150px) {
  .notes-grid {
    grid-template-columns: 1fr;
  }
}

/* Toast 提示条 */
.toast-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding: 14px 20px;
  background: rgba(234, 88, 12, 0.08);
  border: 1px solid rgba(234, 88, 12, 0.3);
  border-radius: 12px;
  font-size: 13px;
  color: #fb923c;
}

.toast-icon {
  font-size: 14px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.35s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 规格底栏 */
.btn-ai-generate {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #e0f7fa;
  border: none;
  border-radius: 9999px;
  color: #083344;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ai-generate:hover {
  background-color: #22d3ee;
  box-shadow: 0 0 15px rgba(34, 211, 238, 0.3);
}

.btn-ai-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.sparkle-icon {
  width: 14px;
  height: 14px;
}

/* 面板卡片底框 */
.interactive-panel {
  background-color: rgba(17, 22, 32, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 24px;
  padding: 28px;
  min-height: 440px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>