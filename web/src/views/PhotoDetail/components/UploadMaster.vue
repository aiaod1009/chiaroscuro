<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-glass">

      <header class="modal-header">
        <div class="header-title">
          <h2 class="title-zh">上传成片</h2>
          <span class="title-en">UPLOAD MASTER VERSION</span>
        </div>
        <button class="btn-close" @click="close">✕</button>
      </header>

      <div class="modal-body">

        <!-- 拖拽/选择文件区 -->
        <div class="drop-zone" :class="{ 'is-dragover': isDragOver, 'has-file': !!selectedFile }"
          @dragover.prevent="isDragOver = true" @dragleave.prevent="isDragOver = false" @drop.prevent="handleDrop"
          @click="triggerFileInput">
          <input type="file" ref="fileInput" class="hidden-input" accept=".jpg,.jpeg,.png,.webp,.tiff"
            @change="handleFileChange" />

          <template v-if="selectedFile">
            <div class="file-preview">
              <img v-if="previewUrl" :src="previewUrl" class="preview-thumb" />
              <div class="file-info">
                <span class="file-name">{{ selectedFile.name }}</span>
                <span class="file-size">{{ formatSize(selectedFile.size) }}</span>
              </div>
              <button class="btn-remove" @click.stop="removeFile">✕</button>
            </div>
          </template>
          <template v-else>
            <div class="drop-hint">
              <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"
                  d="M12 16v-8m0 0l-3 3m3-3l3 3M4.033 14.77a8 8 0 1115.348-4.762" />
              </svg>
              <p class="drop-text">拖拽文件到此处，或<span>点击选择</span></p>
              <p class="drop-sub">JPG / PNG / WebP / TIFF</p>
            </div>
          </template>
        </div>

        <!-- 版本名字 -->
        <div class="form-item">
          <label class="form-label">
            <span class="label-zh">版本名称</span>
            <span class="label-en">VERSION NAME</span>
          </label>
          <input type="text" v-model="versionName" class="form-input" placeholder="如：调色版、黑白版、日系清新..." />
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <!-- 提交 -->
        <div class="form-actions">
          <button class="btn-cancel" @click="close">取消</button>
          <button class="btn-submit" :disabled="!selectedFile || isUploading" @click="handleUpload">
            {{ isUploading ? uploadText : '上传成片' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { formatFileSize, createFilePreview, revokeFilePreview } from '../../../utils/fileHandler'
import { uploadMasterVersion } from '../../../utils/photoApi'

const props = defineProps({
  parentId: { type: String, default: null }
})

const emit = defineEmits(['uploaded'])

const isOpen = ref(false)
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadText = ref('上传中...')

const selectedFile = ref(null)
const previewUrl = ref('')
const versionName = ref('')
const fileInput = ref(null)

const open = () => {
  isOpen.value = true
  selectedFile.value = null
  previewUrl.value = ''
  versionName.value = ''
  errorMsg.value = ''
}

const close = () => {
  if (isUploading.value) return
  isOpen.value = false
}

const triggerFileInput = () => {
  if (selectedFile.value) return
  fileInput.value?.click()
}

const handleFileChange = (e) => {
  const file = e.target.files?.[0]
  if (file) setFile(file)
}

const handleDrop = (e) => {
  isDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) setFile(file)
}

const setFile = (file) => {
  selectedFile.value = file
  previewUrl.value = createFilePreview(file)
}

const removeFile = () => {
  revokeFilePreview(previewUrl.value)
  selectedFile.value = null
  previewUrl.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

const formatSize = formatFileSize

const errorMsg = ref('')

const handleUpload = async () => {
  if (!selectedFile.value) return
  if (!props.parentId) {
    errorMsg.value = '原图数据未加载，请稍后再试'
    return
  }
  errorMsg.value = ''
  isUploading.value = true
  uploadText.value = '正在上传...'

  try {
    const data = await uploadMasterVersion(selectedFile.value, props.parentId, versionName.value || '未命名调色版')

    if (data.success) {
      emit('uploaded', data.data)
      isOpen.value = false
    } else {
      uploadText.value = '上传失败'
      errorMsg.value = data.message || '服务器返回失败'
    }
  } catch (err) {
    console.error('上传成片失败:', err)
    uploadText.value = '上传失败'
    errorMsg.value = err.response?.data?.message || err.message || '网络错误'
  } finally {
    setTimeout(() => { isUploading.value = false; uploadText.value = '上传中...' }, 1500)
  }
}

defineExpose({ open })
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-glass {
  width: 440px;
  max-width: 92vw;
  background: rgba(23, 30, 43, 0.92);
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
  margin-bottom: 24px;
}

.header-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  gap: 20px;
}

/* 拖拽区 */
.drop-zone {
  border: 1.5px dashed rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone:hover,
.drop-zone.is-dragover {
  border-color: #93c5fd;
}

.drop-zone.has-file {
  cursor: default;
  border-color: rgba(255, 255, 255, 0.1);
}

.drop-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
}

.drop-icon {
  width: 40px;
  height: 40px;
  color: #93c5fd;
  filter: drop-shadow(0 0 8px rgba(147, 197, 253, 0.4));
}

.drop-text {
  font-size: 13px;
  color: #cbd5e1;
  margin: 0;
}

.drop-text span {
  color: #93c5fd;
  font-weight: 500;
}

.drop-sub {
  font-size: 10px;
  color: #64748b;
  margin: 0;
  letter-spacing: 0.05em;
}

.hidden-input {
  display: none;
}

/* 文件预览 */
.file-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.preview-thumb {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 13px;
  color: #e2e8f0;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 11px;
  color: #64748b;
  font-family: monospace;
}

.btn-remove {
  background: rgba(255, 255, 255, 0.06);
  border: none;
  color: #94a3b8;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-remove:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* 表单 */
.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  box-shadow: 0 0 10px rgba(147, 197, 253, 0.12);
}

.form-input::placeholder {
  color: #475569;
}

.error-msg {
  margin: 0;
  font-size: 12px;
  color: #f87171;
  letter-spacing: 0.02em;
}

/* 按钮 */
.form-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
  padding-top: 4px;
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
  box-shadow: 0 8px 24px -6px rgba(147, 197, 253, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px -4px rgba(147, 197, 253, 0.55);
  filter: brightness(1.05);
}

.btn-submit:active {
  transform: translateY(0);
}

.btn-submit:disabled {
  background: rgba(255, 255, 255, 0.03);
  color: #475569;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
  filter: none;
}
</style>
