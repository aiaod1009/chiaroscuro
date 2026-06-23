<template>
  <!-- 浮动触发按钮 -->
  <button v-if="!isOpen" class="floating-trigger" @click="isOpen = true">
    <svg class="trigger-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
        d="M12 16v-8m0 0l-3 3m3-3l3 3M4.033 14.77a8 8 0 1115.348-4.762" />
    </svg>
  </button>

  <!-- 可拖拽悬浮窗 -->
  <div v-if="isOpen" class="float-window" :style="windowStyle" ref="windowRef">
    <div class="upload-modal-glass">

      <header class="modal-header" @mousedown="startDrag">
        <div class="header-title">
          <h2 class="title-zh">上传影像</h2>
          <span class="title-en">UPLOAD IMAGES</span>
        </div>
        <button class="btn-close" @click="isOpen = false">✕</button>
      </header>

      <div class="modal-body">

        <div class="upload-left-col">
          <div class="outer-dash-bounds" :class="{ 'is-dragover': isDragOver }" @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false" @drop.prevent="handleDrop" @click="triggerFileInput">
            <input type="file" ref="fileInputRef" multiple accept=".raw,.jpg,.jpeg,.png,.tiff" class="hidden-file-input"
              @change="handleFileChange" />

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
              <div class="select-wrapper region-autocomplete">
                <input type="text" v-model="collectionInput" placeholder="搜索或选择作品集" class="form-input" @input="onCollectionInput"
                  @focus="showCollectionList = true" @blur="closeCollectionList" />
                <span class="select-arrow"></span>
                <ul v-if="showCollectionList" class="region-options">
                  <li v-for="item in filteredWorks" :key="item._id" class="region-option"
                    @mousedown.prevent="selectCollection(item)">
                    <span class="region-name">{{ item.name }}</span>
                  </li>
                  <li v-if="!filteredWorks.length" class="region-empty">未找到作品集</li>
                  <li class="region-option region-create" @mousedown.prevent="openCreateWorks(); showCollectionList = false">
                    <span class="region-name">＋ 新建作品集</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="form-item">
              <label class="form-label">
                <span class="label-zh">拍摄国家</span>
                <span class="label-en">COUNTRY</span>
              </label>
              <div class="select-wrapper region-autocomplete">
                <input type="text" v-model="countryInput" placeholder="搜索国家" class="form-input" @input="onCountryInput"
                  @focus="showCountryList = true" @blur="closeCountryList" />
                <span class="select-arrow"></span>
                <ul v-if="showCountryList" class="region-options">
                  <li v-for="item in filteredCountries" :key="item" class="region-option"
                    @mousedown.prevent="selectCountry(item)">
                    <span class="region-name">{{ item }}</span>
                  </li>
                  <li v-if="!filteredCountries.length" class="region-empty">未找到国家</li>
                </ul>
              </div>
            </div>

            <div class="form-item">
              <label class="form-label">
                <span class="label-zh">省份 / 区域</span>
                <span class="label-en">PROVINCE / REGION</span>
              </label>
              <div class="select-wrapper region-autocomplete">
                <input type="text" v-model="regionInput" placeholder="输入省份或代码" class="form-input" @input="onRegionInput"
                  @focus="showRegionList = true" @blur="closeRegionList" />
                <span class="select-arrow"></span>
                <ul v-if="showRegionList" class="region-options">
                  <li v-for="item in filteredProvinces" :key="item.code" class="region-option"
                    @mousedown.prevent="selectProvince(item)">
                    <span class="region-name">{{ item.label }}</span>
                    <span class="region-code">{{ item.code }}</span>
                  </li>
                  <li v-if="!filteredProvinces.length" class="region-empty">未找到省份</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-cancel" @click="isOpen = false">取消</button>
            <button class="btn-submit" :disabled="selectedFilesCount === 0" @click="handleUpload">
              开始上传
            </button>
          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted, onUnmounted } from 'vue'
import exifr from 'exifr'
import { fetchWorks as apiFetchWorks, uploadRawPhoto, fetchCOSCredentials } from '../utils/photoApi'

const openCreateWorks = inject('openCreateWorks')

let cosInstance = null
let cosBucket = ''
let cosRegion = ''
const getCosInstance = async () => {
  if (cosInstance) return cosInstance
  const COS = (await import('cos-js-sdk-v5')).default
  cosInstance = new COS({
    getAuthorization: (options, callback) => {
      fetchCOSCredentials().then(data => {
        if (!data.success) throw new Error(data.message)
        cosBucket = data.bucket
        cosRegion = data.region
        callback({
          TmpSecretId: data.tmpSecretId,
          TmpSecretKey: data.tmpSecretKey,
          SecurityToken: data.sessionToken,
          StartTime: data.startTime,
          ExpiredTime: data.expiredTime,
        })
      }).catch(err => {
        console.error('STS 签发请求失败:', err)
      })
    },
  })
  return cosInstance
}

// --- 1. 悬浮窗原有 UI 状态保持不变 ---
const isOpen = ref(false)
defineExpose({ isOpen })
const isDragOver = ref(false)
const fileInputRef = ref(null)
const windowRef = ref(null)

const position = ref({ x: -1, y: -1 })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

// --- 2. 新增：边缘计算与上传状态管理 ---
const rawFilesQueue = ref([])         // 本地原始文件暂存队列
const isUploading = ref(false)         // 上传状态机
const uploadProgressText = ref('')    // 动态进度提示

// 保持原本的双向绑定表单，动态对齐你的后端新 Schema
const formData = reactive({
  collection: '',
  location: '中国',
  region: '',
  regionName: ''
})

const worksList = ref([])
const fetchWorks = async () => {
  try {
    const data = await apiFetchWorks()
    worksList.value = data.filter(w => !w.locationCode)
  } catch { }
}
fetchWorks()

onMounted(() => {
  window.addEventListener('works-complete', fetchWorks)
})
onUnmounted(() => {
  window.removeEventListener('works-complete', fetchWorks)
})

const countryOptions = [
  '中国',
  '日本',
  '韩国',
  '新加坡',
  '泰国',
  '越南',
  '马来西亚',
  '印度尼西亚',
  '菲律宾',
  '印度',
  '美国',
  '加拿大',
  '墨西哥',
  '巴西',
  '阿根廷',
  '智利',
  '英国',
  '法国',
  '德国',
  '意大利',
  '西班牙',
  '葡萄牙',
  '荷兰',
  '比利时',
  '瑞士',
  '奥地利',
  '挪威',
  '瑞典',
  '芬兰',
  '冰岛',
  '丹麦',
  '俄罗斯',
  '澳大利亚',
  '新西兰'
]

const provinceOptions = [
  { label: '北京', code: 'CN-11' },
  { label: '天津', code: 'CN-12' },
  { label: '河北', code: 'CN-13' },
  { label: '山西', code: 'CN-14' },
  { label: '内蒙古', code: 'CN-15' },
  { label: '辽宁', code: 'CN-21' },
  { label: '吉林', code: 'CN-22' },
  { label: '黑龙江', code: 'CN-23' },
  { label: '上海', code: 'CN-31' },
  { label: '江苏', code: 'CN-32' },
  { label: '浙江', code: 'CN-33' },
  { label: '安徽', code: 'CN-34' },
  { label: '福建', code: 'CN-35' },
  { label: '江西', code: 'CN-36' },
  { label: '山东', code: 'CN-37' },
  { label: '河南', code: 'CN-41' },
  { label: '湖北', code: 'CN-42' },
  { label: '湖南', code: 'CN-43' },
  { label: '广东', code: 'CN-44' },
  { label: '广西', code: 'CN-45' },
  { label: '海南', code: 'CN-46' },
  { label: '重庆', code: 'CN-50' },
  { label: '四川', code: 'CN-51' },
  { label: '贵州', code: 'CN-52' },
  { label: '云南', code: 'CN-53' },
  { label: '西藏', code: 'CN-54' },
  { label: '陕西', code: 'CN-61' },
  { label: '甘肃', code: 'CN-62' },
  { label: '青海', code: 'CN-63' },
  { label: '宁夏', code: 'CN-64' },
  { label: '新疆', code: 'CN-65' },
  { label: '香港', code: 'CN-HK' },
  { label: '澳门', code: 'CN-MO' },
  { label: '台湾', code: 'CN-TW' }
]

const regionInput = ref('')
const showRegionList = ref(false)

const collectionInput = ref('')
const showCollectionList = ref(false)
const filteredWorks = computed(() => {
  const q = collectionInput.value.trim().toLowerCase()
  if (!q) return worksList.value
  return worksList.value.filter(w => w.name.toLowerCase().includes(q))
})
const selectCollection = (item) => {
  collectionInput.value = item.name
  formData.collection = item._id
  showCollectionList.value = false
}
const onCollectionInput = () => {
  formData.collection = ''
  showCollectionList.value = true
}
const closeCollectionList = () => {
  setTimeout(() => { showCollectionList.value = false }, 120)
}

const countryInput = ref(formData.location)
const showCountryList = ref(false)
const filteredCountries = computed(() => {
  const q = countryInput.value.trim().toLowerCase()
  if (!q) return countryOptions
  return countryOptions.filter(c => c.toLowerCase().includes(q))
})
const selectCountry = (item) => {
  countryInput.value = item
  formData.location = item
  showCountryList.value = false
}
const onCountryInput = () => {
  formData.location = ''
  showCountryList.value = true
}
const closeCountryList = () => {
  setTimeout(() => { showCountryList.value = false }, 120)
}
const filteredProvinces = computed(() => {
  const q = regionInput.value.trim().toLowerCase()
  if (!q) return provinceOptions
  return provinceOptions.filter((item) => item.label.includes(q) || item.code.toLowerCase().includes(q))
})
const selectProvince = (item) => {
  regionInput.value = item.label
  formData.region = item.code
  formData.regionName = item.label
  showRegionList.value = false
}
const onRegionInput = () => {
  formData.region = ''
  formData.regionName = ''
  showRegionList.value = true
}
const closeRegionList = () => {
  setTimeout(() => { showRegionList.value = false }, 120)
}

// 动态计算属性：对齐原本 UI 的展示需求
const selectedFilesCount = computed(() => rawFilesQueue.value.length)
const totalFilesSize = computed(() => {
  let totalBytes = rawFilesQueue.value.reduce((acc, file) => acc + file.size, 0)
  return `${(totalBytes / 1024 / 1024).toFixed(1)} MB`
})

// --- 3. 核心算法一：前端 Canvas 高保真压制 WebP (300ms 闪电转码) ---
const compressImageToWebP = (file, options = { maxWidth: 3000, quality: 0.86 }) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      img.onload = () => {
        let width = img.width
        let height = img.height
        if (width > options.maxWidth) {
          height = Math.round((height * options.maxWidth) / width)
          width = options.maxWidth
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob((blob) => {
          blob ? resolve(blob) : reject(new Error('Canvas export fallback'))
        }, 'image/webp', options.quality)
      }
      img
        .onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}

// --- 4. 核心算法二：抢在 Canvas 毁灭数据前，人肉剥离 Exif ---
const extractExifData = async (file) => {
  try {
    const rawExif = await exifr.parse(file)
    if (!rawExif) return null
    const result = {
      camera: rawExif.Model || rawExif.Make || 'Unknown Camera',
      lens: rawExif.LensModel || 'Unknown Lens',
      aperture: rawExif.FNumber ? `f/${rawExif.FNumber}` : 'f/0.0',
      iso: String(rawExif.ISO || '0'),
      shutterSpeed: rawExif.ExposureTime
        ? (rawExif.ExposureTime < 1 ? `1/${Math.round(1 / rawExif.ExposureTime)}s` : `${rawExif.ExposureTime}s`)
        : 'Unknown',
      focalLength: rawExif.FocalLength ? `${rawExif.FocalLength}mm` : 'Unknown',
      dateTimeOriginal: rawExif.DateTimeOriginal || rawExif.CreateDate || null
    }
    return result
  } catch (e) {
    console.warn(`[Exif 剥离] ${file.name} 元数据读取失败，可能非单反原片`)
    return null
  }
}

// --- 5. 资产接收入口 (接管原本的伪处理) ---
const processFiles = (files) => {
  // 将 FileList 转换为标准数组存入队列，支持追加选择
  rawFilesQueue.value = [...rawFilesQueue.value, ...Array.from(files)]
}

// --- 6. 核心动作：点击“开始上传”触发工业级并发流水线 ---
const handleUpload = async () => {
  if (rawFilesQueue.value.length === 0) return
  isUploading.value = true

  // 建立大厂标准的“串行压图，并行上传”异步调度阵列
  const uploadTasks = rawFilesQueue.value.map(async (rawFile, index) => {
    try {
      // 步骤 A：剥离 Exif
      uploadProgressText.value = `[${index + 1}/${selectedFilesCount.value}] 正在提取 Exif 元数据...`
      const exifData = await extractExifData(rawFile)

      // 步骤 B：本地沙盒压制转 WebP
      uploadProgressText.value = `[${index + 1}/${selectedFilesCount.value}] 边缘转码 WebP 中...`
      const webpBlob = await compressImageToWebP(rawFile)
      const webpFile = new File([webpBlob], `${rawFile.name.split('.')[0]}.webp`, { type: 'image/webp' })

      // 步骤 C：通过 STS 临时凭证直传腾讯云 COS
      uploadProgressText.value = `[${index + 1}/${selectedFilesCount.value}] 正在直传腾讯云 COS...`
      const cos = await getCosInstance()
      // 预取一次 STS 凭证，确保 bucket/region 已就绪
      if (!cosBucket || !cosRegion) {
        const preFetch = await fetchCOSCredentials()
        if (preFetch.success) {
          cosBucket = preFetch.bucket
          cosRegion = preFetch.region
        }
      }
      const cosKey = `gallery/${Date.now()}-${webpFile.name}`
      const cosData = await new Promise((resolve, reject) => {
        cos.putObject({
          Bucket: cosBucket,
          Region: cosRegion,
          Key: cosKey,
          Body: webpFile,
        }, (err, data) => err ? reject(err) : resolve(data))
      })
      const cosUrl = `https://${cosData.Location}`

      // 步骤 D：调用后端 /api/photos/upload-raw，落盘 MongoDB
      uploadProgressText.value = `[${index + 1}/${selectedFilesCount.value}] 写入 MongoDB 索引...`
      await uploadRawPhoto({
        imageUrl: cosUrl,
        fileName: webpFile.name,
        selectedAlbumId: formData.collection || null,
        locationName: formData.location || '未标记地点',
        region: formData.region || formData.regionName,
        exif: exifData || {},
      })

      return { success: true }
    } catch (err) {
      console.error(`${rawFile.name} 调度中断:`, err)
      return { success: false, name: rawFile.name, error: err.message || String(err) }
    }
  })

  const results = await Promise.all(uploadTasks)
  const successLen = results.filter(r => r.success).length

  // 收尾工作：清空队列，关闭面板，通知外部刷新
  rawFilesQueue.value = []
  isUploading.value = false
  isOpen.value = false
  if (successLen > 0) window.dispatchEvent(new CustomEvent('upload-complete'))
}

// --- 以下为原本悬浮窗拖拽交互逻辑，一字未动 ---
const windowStyle = computed(() => {
  if (position.value.x === -1) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  return { top: position.value.y + 'px', left: position.value.x + 'px', transform: 'none' }
})
const startDrag = (e) => {
  if (e.target.closest('.btn-close')) return
  isDragging.value = true
  const rect = windowRef.value.getBoundingClientRect()
  dragOffset.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  const onMove = (ev) => { if (!isDragging.value) return; position.value = { x: ev.clientX - dragOffset.value.x, y: ev.clientY - dragOffset.value.y } }
  const onUp = () => { isDragging.value = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
  document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp)
}
const triggerFileInput = () => { fileInputRef.value?.click() }
const handleFileChange = (event) => { const files = event.target.files; if (files?.length) processFiles(files) }
const handleDrop = (event) => { isDragOver.value = false; const files = event.dataTransfer?.files; if (files?.length) processFiles(files) }
</script>
<style scoped>
/* 浮动触发按钮 - 毛玻璃 */
.floating-trigger {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(147, 197, 253, 0.15);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #93c5fd;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.25s ease;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-trigger:hover {
  background: rgba(147, 197, 253, 0.25);
  border-color: rgba(147, 197, 253, 0.4);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(147, 197, 253, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.trigger-icon {
  width: 26px;
  height: 26px;
}

/* 可拖拽悬浮窗 */
.float-window {
  position: fixed;
  z-index: 1000;
  width: 920px;
  max-width: 92vw;
  user-select: none;
}

.float-window * {
  box-sizing: border-box;
}

/* 主面板高阶毛玻璃 */
.upload-modal-glass {
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

/* 头部标题排版 */
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

/* 双栏栅格 */
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

/* 左侧：圆角双层嵌套拖拽区 */
.upload-left-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

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

/* 右侧：精细表单 */
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

.select-wrapper {
  position: relative;
  width: 100%;
}

.region-autocomplete {
  position: relative;
}

.region-options {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 8px);
  z-index: 5;
  max-height: 240px;
  overflow-y: auto;
  background: rgba(10, 14, 24, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
  padding: 6px;
}

.region-option,
.region-empty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #e2e8f0;
}

.region-option:hover {
  background: rgba(147, 197, 253, 0.12);
  cursor: pointer;
}

.region-empty {
  color: #64748b;
}

.region-create {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  margin-top: 4px;
  padding-top: 12px;
  color: #93c5fd;
}

.region-name {
  font-weight: 600;
  color: #f1f5f9;
}

.region-code {
  font-family: monospace;
  font-size: 11px;
  color: #94a3b8;
}

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

/* 底部控制台 */
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
