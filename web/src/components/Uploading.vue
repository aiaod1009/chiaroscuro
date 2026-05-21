<template>
  <div class="darkroom-bg-preview">

    <div class="modal-overlay">
      <div class="upload-modal-glass">

        <header class="modal-header">
          <div class="header-title">
            <h2 class="title-zh">上传影像</h2>
            <span class="title-en">UPLOAD IMAGES</span>
          </div>
          <button class="btn-close" @click="$emit('close')">✕</button>
        </header>

        <div class="modal-body">

          <div class="upload-left-col">
            <div class="outer-dash-bounds" :class="{ 'is-dragover': isDragOver }" @dragover.prevent="isDragOver = true"
              @dragleave.prevent="isDragOver = false" @drop.prevent="handleDrop" @click="triggerFileInput">
              <input type="file" ref="fileInputRef" multiple accept=".raw,.jpg,.jpeg,.png,.tiff"
                class="hidden-file-input" @change="handleFileChange" />

              <div class="inner-glass-card">
                <div class="upload-icon-wrapper">
                  <svg class="upload-cloud-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"
                      d="M12 16v-8m0 0l-3 3m3-3l3 3M4.033 14.77a8 8 0 1115.348-4.762" />
                  </svg>
                </div>
                <p class="dropzone-hint-main">拖拽文件到此处，或<span>点击选择</span></p>
                <p class="dropzone-hint-sub">支持 RAW / JPG / PNG / TIFF 格式</p>
              </div>
            </div>

            <div class="upload-status-bar-glass">
              <button class="btn-select-file" @click.stop="triggerFileInput">选择文件</button>
              <div class="file-summary" v-if="selectedFilesCount > 0">
                <span class="summary-text">已选择 {{ selectedFilesCount }} 个文件</span>
                <span class="summary-size">共 {{ totalFilesSize }}</span>
              </div>
              <button class="btn-continue-add" v-if="selectedFilesCount > 0" @click.stop="triggerFileInput">
                继续添加
              </button>
            </div>
          </div>

          <div class="upload-right-col">

            <div class="form-fields-stack">
              <div class="form-item">
                <label class="form-label">
                  <span class="label-zh">上传到作品集</span>
                  <span class="label-en">SELECT COLLECTION</span>
                </label>
                <div class="select-wrapper">
                  <select v-model="formData.collection">
                    <option value="秘境之巅">秘境之巅</option>
                    <option value="极地光影">极地光影</option>
                    <option value="城市漫步">城市漫步</option>
                  </select>
                  <span class="select-arrow"></span>
                </div>
              </div>

              <div class="form-item">
                <label class="form-label">
                  <span class="label-zh">拍摄地点</span>
                  <span class="label-en">LOCATION</span>
                </label>
                <input type="text" v-model="formData.location" placeholder="请输入拍摄地点" class="form-input" />
              </div>

              <div class="form-item">
                <label class="form-label">
                  <span class="label-zh">省份 / 区域</span>
                  <span class="label-en">PROVINCE / REGION</span>
                </label>
                <div class="select-wrapper">
                  <select v-model="formData.region">
                    <option value="雷克雅未克 Reykjaík">雷克雅未克 Reykjaík</option>
                    <option value="阿克雷里 Akureyri">阿克雷里 Akureyri</option>
                    <option value="维克 Vík">维克 Vík</option>
                  </select>
                  <span class="select-arrow"></span>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button class="btn-cancel" @click="$emit('close')">取消</button>
              <button class="btn-submit" :disabled="selectedFilesCount === 0" @click="handleUpload">
                开始上传
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const isDragOver = ref(false)
const fileInputRef = ref(null)

// 深度对齐设计稿的初始状态数据
const selectedFilesCount = ref(12)
const totalFilesSize = ref('68.4 MB')

const formData = reactive({
  collection: '秘境之巅',
  location: '冰岛',
  region: '雷克雅未克 Reykjaík'
})

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (event) => {
  const files = event.target.files
  if (files && files.length > 0) {
    processFiles(files)
  }
}

const handleDrop = (event) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    processFiles(files)
  }
}

const processFiles = (files) => {
  selectedFilesCount.value = files.length
  let fakeSize = (files.length * 5.7).toFixed(1)
  totalFilesSize.value = `${fakeSize} MB`
}

const handleUpload = () => {
  console.log('提交队列:', selectedFilesCount.value, { ...formData })
  alert('开始上传影像序列...')
}
</script>

<style scoped>
/* ==========================================================================
   1. 预览底衬与弹窗基础毛玻璃设置
   ========================================================================== */
.darkroom-bg-preview {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background-color: #0b0f17;
  /* 模拟后方有模糊的自然/风景大图打底，以完美展现前端的毛玻璃穿透感 */
  background-image: radial-gradient(circle at 80% 20%, rgba(147, 197, 253, 0.15), transparent 50%),
    radial-gradient(circle at 20% 80%, rgba(15, 23, 42, 0.8), transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}

.darkroom-bg-preview * {
  box-sizing: border-box;
}

.modal-overlay {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* 主面板高阶毛玻璃 */
.upload-modal-glass {
  width: 100%;
  max-width: 920px;
  background: rgba(23, 30, 43, 0.65);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  padding: 40px;
  box-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* ==========================================================================
   2. 头部标题排版
   ========================================================================== */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
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

/* ==========================================================================
   3. 双栏栅格
   ========================================================================== */
.modal-body {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 40px;
}

@media (max-width: 820px) {
  .modal-body {
    grid-template-columns: 1fr;
  }
}

/* ==========================================================================
   4. 左侧：圆角双层嵌套拖拽区
   ========================================================================== */
.upload-left-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 外层白虚线轮廓 */
.outer-dash-bounds {
  width: 100%;
  aspect-ratio: 1.42 / 1;
  border: 1.5px dashed rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.outer-dash-bounds:hover,
.outer-dash-bounds.is-dragover {
  border-color: #93c5fd;
}

/* 内层悬浮磨砂质感玻璃卡片 */
.inner-glass-card {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.outer-dash-bounds:hover .inner-glass-card {
  background-color: rgba(255, 255, 255, 0.07);
}

.upload-icon-wrapper {
  margin-bottom: 20px;
  color: #93c5fd;
  /* 切换为指定的亮蓝发光色 */
  filter: drop-shadow(0 0 10px rgba(147, 197, 253, 0.5));
}

.upload-cloud-icon {
  width: 60px;
  height: 60px;
}

.dropzone-hint-main {
  font-size: 14px;
  color: #cbd5e1;
  margin: 0 0 8px 0;
  letter-spacing: 0.02em;
}

.dropzone-hint-main span {
  color: #93c5fd;
  font-weight: 500;
}

.dropzone-hint-sub {
  font-size: 11px;
  color: #64748b;
  margin: 0;
  letter-spacing: 0.05em;
}

/* 左侧底部：整合式毛玻璃数据条 */
.upload-status-bar-glass {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(8px);
  padding: 8px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-select-file {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: all 0.2s;
}

.btn-select-file:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.file-summary {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-text {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.summary-size {
  font-size: 11px;
  color: #64748b;
  font-family: monospace;
}

.btn-continue-add {
  background: none;
  border: none;
  color: #93c5fd;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 12px;
  margin-left: auto;
  transition: opacity 0.2s;
}

.btn-continue-add:hover {
  opacity: 0.8;
}

.hidden-file-input {
  display: none;
}

/* ==========================================================================
   5. 右侧：精细表单与下拉项
   ========================================================================== */
.upload-right-col {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.form-fields-stack {
  display: flex;
  flex-direction: column;
  gap: 24px;
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

/* 输入框与选择栏的磨砂化设计 */
.form-input,
.select-wrapper select {
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

.form-input:focus,
.select-wrapper select:focus {
  border-color: rgba(147, 197, 253, 0.4);
  background: rgba(0, 0, 0, 0.35);
  box-shadow: 0 0 10px rgba(147, 197, 253, 0.15);
}

.select-wrapper {
  position: relative;
  width: 100%;
}

.select-wrapper select {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  padding-right: 40px;
}

/* 自定义右侧利落的微型三角箭头 */
.select-arrow {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-30%);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #64748b;
  pointer-events: none;
}

/* ==========================================================================
   6. 底部控制台：取消与极客蓝发光主按键
   ========================================================================== */
.form-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 14px;
  margin-top: auto;
  padding-top: 32px;
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

/* 核心高光发光按键 */
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

.btn-submit:active {
  transform: translateY(0);
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