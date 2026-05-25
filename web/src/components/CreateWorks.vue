<template>
  <div v-if="isOpen" class="float-window" :style="windowStyle" ref="windowRef">
    <div class="create-modal-glass">

      <header class="modal-header" @mousedown="startDrag">
        <div class="header-title">
          <h2 class="title-zh">创建作品集</h2>
          <span class="title-en">CREATE WORKS</span>
        </div>
        <button class="btn-close" @click="isOpen = false">✕</button>
      </header>

      <div class="modal-body">
        <div class="form-fields-stack">

          <div class="form-item">
            <label class="form-label">
              <span class="label-zh">作品集名称</span>
              <span class="label-en">WORKS NAME</span>
            </label>
            <input type="text" v-model="form.name" class="form-input" placeholder="例如：冰岛极光之旅" />
          </div>

          <div class="form-item">
            <label class="form-label">
              <span class="label-zh">描述</span>
              <span class="label-en">DESCRIPTION</span>
            </label>
            <textarea v-model="form.description" class="form-textarea" placeholder="记录这组作品的故事..." rows="3"></textarea>
          </div>

          <div class="form-item">
            <label class="form-label">
              <span class="label-zh">真实拍摄时间</span>
              <span class="label-en">REAL DATE</span>
            </label>
            <input type="month" v-model="form.realDate" class="form-input" />
          </div>

          <div class="form-item">
            <label class="form-label">
              <span class="label-zh">封面图 URL</span>
              <span class="label-en">COVER IMAGE</span>
            </label>
            <input type="text" v-model="form.coverImage" class="form-input" placeholder="https://..." />
          </div>

        </div>

        <div class="form-actions">
          <button class="btn-cancel" @click="isOpen = false">取消</button>
          <button class="btn-submit" :disabled="!form.name || !form.realDate || isSubmitting" @click="handleSubmit">
            {{ isSubmitting ? '创建中...' : '创建作品集' }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import axios from 'axios'

const isOpen = ref(false)
defineExpose({ isOpen })

const isSubmitting = ref(false)
const windowRef = ref(null)

const form = reactive({
  name: '',
  description: '',
  realDate: '',
  coverImage: '',
})

// 拖拽
const position = ref({ x: -1, y: -1 })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

const windowStyle = computed(() => {
  if (position.value.x === -1) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  return { top: position.value.y + 'px', left: position.value.x + 'px', transform: 'none' }
})

const startDrag = (e) => {
  if (e.target.closest('.btn-close')) return
  isDragging.value = true
  const rect = windowRef.value.getBoundingClientRect()
  dragOffset.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  const onMove = (ev) => {
    if (!isDragging.value) return
    position.value = { x: ev.clientX - dragOffset.value.x, y: ev.clientY - dragOffset.value.y }
  }
  const onUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

const resetForm = () => {
  form.name = ''
  form.description = ''
  form.realDate = ''
  form.coverImage = ''
}

const handleSubmit = async () => {
  if (!form.name || !form.realDate) return
  isSubmitting.value = true
  try {
    await axios.post('/api/works', { ...form })
    resetForm()
    isOpen.value = false
    window.dispatchEvent(new CustomEvent('works-complete'))
  } catch (err) {
    console.error('创建作品集失败:', err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.float-window {
  position: fixed;
  z-index: 1000;
  width: 520px;
  max-width: 92vw;
  user-select: none;
}

.float-window * {
  box-sizing: border-box;
}

.create-modal-glass {
  width: 100%;
  background: rgba(23, 30, 43, 0.85);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  padding: 40px;
  box-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  cursor: move;
}

.header-title {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title-zh {
  font-size: 22px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  letter-spacing: 0.04em;
}

.title-en {
  font-size: 11px;
  font-family: monospace;
  color: #64748b;
  letter-spacing: 0.18em;
  font-weight: 700;
}

.btn-close {
  background: none;
  border: none;
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s;
  padding: 4px;
}

.btn-close:hover {
  color: #ffffff;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-fields-stack {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.label-zh {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  letter-spacing: 0.02em;
}

.label-en {
  font-size: 9px;
  font-family: monospace;
  color: #475569;
  letter-spacing: 0.12em;
  font-weight: 700;
}

.form-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 13px;
  color: #f1f5f9;
  outline: none;
  transition: all 0.25s ease;
}

.form-input:focus {
  border-color: rgba(147, 197, 253, 0.4);
  background: rgba(0, 0, 0, 0.35);
  box-shadow: 0 0 10px rgba(147, 197, 253, 0.15);
}

.form-textarea {
  width: 100%;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 13px;
  color: #f1f5f9;
  outline: none;
  resize: none;
  font-family: inherit;
  transition: all 0.25s ease;
}

.form-textarea:focus {
  border-color: rgba(147, 197, 253, 0.4);
  background: rgba(0, 0, 0, 0.35);
  box-shadow: 0 0 10px rgba(147, 197, 253, 0.15);
}

.toggle-btn {
  padding: 8px 20px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.25);
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: rgba(147, 197, 253, 0.15);
  border-color: rgba(147, 197, 253, 0.4);
  color: #93c5fd;
}

.form-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 14px;
}

.btn-cancel {
  padding: 14px 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.btn-submit {
  padding: 14px 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%);
  border: none;
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
  box-shadow: 0 8px 24px -6px rgba(147, 197, 253, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px -4px rgba(147, 197, 253, 0.65);
  filter: brightness(1.05);
}

.btn-submit:disabled {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.02);
  color: #475569;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
  filter: none;
}
</style>
