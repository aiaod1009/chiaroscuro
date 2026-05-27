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
        <button class="btn-save" @click="handleSave">
          <svg class="save-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span>保存 SAVE</span>
        </button>
      </div>
    </header>

    <div class="notes-grid">

      <div class="workspace-column">
        <div class="image-viewer">
          <div class="tags-row">
            <div class="viewer-tag tag-analyzing">
              <span class="pulse-dot"></span>
              {{ isGenerating ? 'NEURAL FIRING...' : 'ANALYZING PIXELS...' }}
            </div>
            <div class="viewer-tag tag-synced">
              <span class="sync-icon">◎</span>
              LATENT SPACE SYNCED
            </div>
          </div>

          <img :src="currentPhoto.imageUrl || '/DSC_6510.jpg'" alt="Visual Notes Source" class="source-img" />

          <div v-if="isGenerating" class="generating-overlay">
            <div class="neural-spinner"></div>
            <span class="generating-text">DECODE VISUAL TOKENS...</span>
          </div>

          <div class="scan-line"></div>
        </div>

        <div class="meta-spec-bar">
          <button class="btn-ai-generate" :disabled="isGenerating" @click="handleAiGenerate">
            <svg class="sparkle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {{ isGenerating ? 'GENERATING...' : 'AI GENERATE' }}
          </button>

          <div class="specs-group">
            <div v-if="photoExif.camera" class="spec-item">
              <span class="spec-label">CAMERA</span>
              <span class="spec-value">{{ cleanCamera(photoExif.camera) }}</span>
            </div>
            <div v-if="photoExif.aperture" class="spec-item">
              <span class="spec-label">APERTURE</span>
              <span class="spec-value">{{ photoExif.aperture }}</span>
            </div>
            <div v-if="photoExif.shutterSpeed" class="spec-item">
              <span class="spec-label">SHUTTER</span>
              <span class="spec-value">{{ photoExif.shutterSpeed }}</span>
            </div>
            <div v-if="photoExif.iso && photoExif.iso !== '0'" class="spec-item">
              <span class="spec-label">ISO</span>
              <span class="spec-value">{{ photoExif.iso }}</span>
            </div>
            <div v-if="photoExif.focalLength" class="spec-item">
              <span class="spec-label">FOCAL</span>
              <span class="spec-value">{{ photoExif.focalLength }}</span>
            </div>
            <div v-if="photoExif.dateTimeOriginal" class="spec-item">
              <span class="spec-label">DATE</span>
              <span class="spec-value">{{ new Date(photoExif.dateTimeOriginal).toLocaleDateString('zh-CN') }}</span>
            </div>
          </div>
        </div>

        <transition name="toast">
          <div v-if="toastMessage" class="toast-bar">
            <span class="toast-icon">⚡</span>
            <span>{{ toastMessage }}</span>
          </div>
        </transition>
      </div>

      <div class="control-column">

        <div class="mode-tabs-track">
          <button class="tab-btn" :class="{ active: currentMode === 'creator' }" @click="currentMode = 'creator'">
            CREATOR
          </button>
          <button class="tab-btn" :class="{ active: currentMode === 'ai' }" @click="currentMode = 'ai'">
            AI ASSIST
          </button>

          <div class="tab-slider" :class="`slide-${currentMode}`"></div>
        </div>

        <div class="interactive-panel">

          <div v-if="currentMode === 'ai'" class="panel-fade-in">
            <div class="perspective-section">
              <span class="panel-label">SELECT PERSPECTIVE</span>
              <div class="perspective-buttons">
                <button v-for="p in perspectives" :key="p.id" class="p-btn"
                  :class="{ active: activePerspective === p.id }" @click="activePerspective = p.id">
                  {{ p.name }}
                </button>
              </div>
            </div>

            <div v-if="candidates.length" class="candidate-tabs">
              <button v-for="(c, i) in candidates" :key="c.optionId" class="candidate-tab"
                :class="{ active: activeCandidateIndex === i }" @click="selectCandidate(i)">
                方案{{ c.optionId }}
              </button>
            </div>

            <div v-if="activeCandidate.title" class="output-narrative" :class="{ iterating: isIterating }">
              <h2 class="narrative-title">{{ activeCandidate.title }}</h2>
              <p class="narrative-body">
                "{{ activeCandidate.caption }}"
              </p>
              <div v-if="isIterating" class="iterating-bar">
                <div class="iterating-spinner"></div>
                <span>AI REWRITING...</span>
              </div>
            </div>

            <div v-if="candidates.length" class="select-action">
              <button class="btn-apply" :disabled="isSaving" @click="applyToPhoto(activeCandidate.title, activeCandidate.caption)">
                {{ isSaving ? 'SAVING...' : 'APPLY TO PHOTO' }}
              </button>
              <span v-if="saveSuccess" class="save-hint">已保存</span>
            </div>

            <div class="optimize-section">
              <div class="optimize-header">
                <span class="panel-label">DISS/OPTIMIZE GENERATION?</span>
                <span class="btn-redraft" @click="handleOptimize">
                  <svg class="mini-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H19" />
                  </svg>
                  {{ isIterating ? 'RE-DRAFTING...' : 'RE-DRAFT' }}
                </span>
              </div>
              <div class="input-wrapper">
                <input type="text" v-model="aiPrompt" :disabled="isIterating" placeholder="例如：再冷酷一点，减少抒情..."
                  @keyup.enter="handleOptimize" />
                <button class="send-btn" :disabled="isIterating" @click="handleOptimize">➔</button>
              </div>
            </div>
          </div>

          <div v-else class="panel-fade-in">
            <div class="perspective-section">
              <span class="panel-label">CREATOR LOGBOOK</span>
              <div class="creator-meta-hint">手动记录光影灵感与现场手记</div>
            </div>

            <div class="manual-editor-box">
              <input type="text" v-model="manualTitle" class="manual-title-input" placeholder="在此输入手记标题..." />
              <textarea v-model="manualContent" class="manual-textarea"
                placeholder="光影变幻的瞬间，写下你的主观直觉与艺术思考..."></textarea>
            </div>

            <div class="word-count-badge">
              字数: {{ manualContent.length }}
            </div>

            <div class="select-action">
              <button class="btn-apply" :disabled="isSaving || (!manualTitle && !manualContent)" @click="applyToPhoto(manualTitle, manualContent)">
                {{ isSaving ? 'SAVING...' : 'APPLY TO PHOTO' }}
              </button>
              <span v-if="saveSuccess" class="save-hint">已保存</span>
            </div>
          </div>


        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

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
    fetchPhotoDetail(currentPhoto.id)
    restoreSession()
  }
})

// 去掉厂商前缀，压缩型号空格（如 "NIKON CORPORATION NIKON Z 30" → "NIKON Z30"）
const cleanCamera = (name) => {
  if (!name) return ''
  // 去掉常见厂商前缀
  let clean = name
    .replace(/^NIKON CORPORATION\s*/i, '')
    .replace(/^Canon\s*/i, '')
    .replace(/^SONY\s*/i, '')
    .replace(/^FUJIFILM\s*/i, '')
    .replace(/^PENTAX\s*/i, '')
    .replace(/^OLYMPUS\s*/i, '')
    .trim()
  // 压缩型号中间多余空格（"Z 30" → "Z30"，"D 850" → "D850"）
  clean = clean.replace(/([A-Z])\s+(\d)/g, '$1$2')
  return clean
}

// 拉取照片详情（含 EXIF）
const fetchPhotoDetail = async (id) => {
  try {
    const { data } = await axios.get(`/api/photos/${id}`)
    if (data.success) {
      const p = data.data
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
  try {
    const style = STYLE_MAP[activePerspective.value]
    const { data } = await axios.post('/api/ai/inspire/first-round', {
      photoId: currentPhoto.id,
      imageUrl: currentPhoto.imageUrl,
      style
    })
    if (data.success && data.candidates.length) applyCandidates(data)
  } catch {
    // 静默失败，用户可以手动点击 AI GENERATE
  }
}

// AI GENERATE：首次触发生成
const handleAiGenerate = async () => {
  if (isGenerating.value) return
  isGenerating.value = true

  try {
    const style = STYLE_MAP[activePerspective.value]
    const { data } = await axios.post('/api/ai/inspire/first-round', {
      photoId: currentPhoto.id,
      imageUrl: currentPhoto.imageUrl,
      style
    })

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
    const { data } = await axios.post('/api/ai/inspire/iterate', {
      sessionId: sessionId.value,
      optionId: currentOption.optionId,
      currentContent: {
        title: activeCandidate.value.title,
        caption: activeCandidate.value.caption
      },
      userFeedback: aiPrompt.value.trim()
    })

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
    await axios.patch(`/api/photos/${currentPhoto.id}`, { title, caption })
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

/* 右上角保存按钮样式 */
.btn-save {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: rgba(31, 41, 55, 0.4);
  border: 1px solid rgba(55, 65, 81, 0.6);
  border-radius: 9999px;
  color: #e5e7eb;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.btn-save:hover {
  background-color: #1f2937;
  border-color: #22d3ee;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.2);
}

.save-icon {
  width: 14px;
  height: 14px;
  color: #22d3ee;
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

/* ==========================================================================
   3. 左侧组件布局 (Image Platform)
   ========================================================================== */
.image-viewer {
  position: relative;
  width: 100%;
  max-height: 60vh;
  border-radius: 20px;
  overflow: hidden;
  background-color: #020617;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.source-img {
  width: 100%;
  display: block;
  object-fit: contain;
  max-height: 60vh;
}

.tags-row {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
  z-index: 2;
}

.viewer-tag {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #9ca3af;
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  gap: 6px;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background-color: #22d3ee;
  border-radius: 50%;
  box-shadow: 0 0 8px #22d3ee;
  animation: ripple 1.8s infinite ease-in-out;
}

@keyframes ripple {

  0%,
  100% {
    opacity: 0.4;
  }

  50% {
    opacity: 1;
  }
}

.sync-icon {
  font-size: 11px;
  color: #6b7280;
}

.scan-line {
  position: absolute;
  bottom: 12%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(34, 211, 238, 0) 0%, rgba(34, 211, 238, 0.3) 50%, rgba(34, 211, 238, 0) 100%);
  box-shadow: 0 0 6px rgba(34, 211, 238, 0.4);
}

/* 加载遮罩 */
.generating-overlay {
  position: absolute;
  inset: 0;
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  z-index: 5;
}

.neural-spinner {
  width: 36px;
  height: 36px;
  border: 2px solid rgba(34, 211, 238, 0.15);
  border-top-color: #22d3ee;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.generating-text {
  font-size: 10px;
  font-family: monospace;
  letter-spacing: 0.15em;
  color: #22d3ee;
  animation: blink 1.4s ease-in-out infinite;
}

@keyframes blink {

  0%,
  100% {
    opacity: 0.4;
  }

  50% {
    opacity: 1;
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
.meta-spec-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.btn-ai-generate {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
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

.specs-group {
  display: flex;
  gap: 28px;
  font-family: monospace;
}

.spec-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.spec-label {
  font-size: 9px;
  color: #4b5563;
  font-weight: 700;
  margin-bottom: 2px;
}

.spec-value {
  font-size: 11px;
  color: #ffffff;
  font-weight: 600;
}

/* ==========================================================================
   4. 右侧控制列 (CREATOR / AI ASSIST 联动切换轨道)
   ========================================================================== */
.mode-tabs-track {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background-color: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 4px;
  border-radius: 9999px;
  margin-bottom: 20px;
  z-index: 1;
}

.tab-btn {
  position: relative;
  background: none;
  border: none;
  padding: 10px 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #6b7280;
  cursor: pointer;
  z-index: 3;
  transition: color 0.25s ease;
}

.tab-btn.active {
  color: #083344;
}

/* 滑块动画控制 */
.tab-slider {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: calc(50% - 4px);
  background-color: #e0f7fa;
  border-radius: 9999px;
  z-index: 2;
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.slide-creator {
  transform: translateX(0%);
}

.slide-ai {
  transform: translateX(100%);
  background-color: #e0f7fa;
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

.panel-fade-in {
  animation: fadeIn 0.35s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-label {
  font-size: 9px;
  font-family: monospace;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #4b5563;
  display: block;
  margin-bottom: 12px;
}

/* ==========================================================================
   5. AI 模式专属子版面
   ========================================================================== */
.perspective-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.p-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  font-family: monospace;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
}

.p-btn.active {
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.02);
}

.candidate-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.candidate-tab {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 5px 14px;
  border-radius: 8px;
  font-size: 10px;
  font-family: monospace;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.candidate-tab.active {
  border-color: #22d3ee;
  color: #22d3ee;
  background-color: rgba(34, 211, 238, 0.06);
}

.candidate-tab:hover:not(.active) {
  border-color: rgba(255, 255, 255, 0.15);
  color: #9ca3af;
}

.output-narrative {
  margin-bottom: 24px;
  position: relative;
}

.output-narrative.iterating {
  opacity: 0.45;
}

.narrative-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
  border-left: 2px solid #22d3ee;
  padding-left: 10px;
}

.narrative-body {
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.7;
  margin: 0;
}

.iterating-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  font-size: 10px;
  font-family: monospace;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #22d3ee;
}

.iterating-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(34, 211, 238, 0.2);
  border-top-color: #22d3ee;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.select-action {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.btn-apply {
  padding: 8px 18px;
  background: rgba(34, 211, 238, 0.1);
  border: 1px solid rgba(34, 211, 238, 0.35);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #22d3ee;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-apply:hover:not(:disabled) {
  background: rgba(34, 211, 238, 0.2);
  border-color: #22d3ee;
}

.btn-apply:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.save-hint {
  font-size: 11px;
  font-weight: 600;
  color: #34d399;
  animation: fadeIn 0.3s ease;
}

/* 指令优化底栏 */
.optimize-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-redraft {
  font-size: 10px;
  font-family: monospace;
  font-weight: 700;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.mini-icon {
  width: 12px;
  height: 12px;
}

.input-wrapper {
  position: relative;
  width: 100%;
  margin-top: 6px;
}

.input-wrapper input {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px 40px 12px 14px;
  font-size: 12px;
  color: #ffffff;
  outline: none;
}

.input-wrapper input:focus {
  border-color: rgba(34, 211, 238, 0.3);
}

.send-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
}

.send-btn:hover {
  color: #22d3ee;
}

/* ==========================================================================
   6. CREATOR 手写模式专属子版面
   ========================================================================== */
.creator-meta-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: -6px;
  margin-bottom: 16px;
}

.manual-editor-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.manual-title-input {
  background: none;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  outline: none;
}

.manual-textarea {
  background: none;
  border: none;
  resize: none;
  height: 140px;
  font-size: 13px;
  line-height: 1.7;
  color: #d1d5db;
  outline: none;
}

.word-count-badge {
  text-align: right;
  font-size: 10px;
  color: #4b5563;
  font-family: monospace;
  margin-top: 6px;
}

/* ==========================================================================
   7. 底部色彩标签公共区域
   ========================================================================== */
.panel-footer-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 20px;
  margin-top: 24px;
}

.badge-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 8px 12px;
  border-radius: 8px;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.mono-text {
  font-size: 11px;
  font-family: monospace;
  color: #ffffff;
  font-weight: 600;
}
</style>