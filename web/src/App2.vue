<template>
  <div class="dark-room">
    <h2>chiaroscuro // 数字暗房</h2>

    <div class="workbench">
      <div class="card" v-if="!rawPhotoData">
        <h3>第一步：置入微单原图占坑</h3>
        <input type="file" @change="uploadRaw" accept="image/jpeg,image/jpg" />
        <p class="tip">拖入或选择相机直接导出的原始大图，用于剥离硬件参数</p>
      </div>

      <div v-if="rawPhotoData" class="workspace">
        <div class="preview-panel">
          <div class="img-box">
            <h4>当前显示：{{ currentView === 'raw' ? '本地原图基底' : '云端调色成片' }}</h4>
            <img :src="currentView === 'raw' ? localRawUrl : latestMasterUrl" />
          </div>

          <div class="bi-buttons" v-if="latestMasterUrl">
            <button @click="currentView = 'raw'" :class="{ active: currentView === 'raw' }">看原图对比</button>
            <button @click="currentView = 'master'" :class="{ active: currentView === 'master' }">看成片效果</button>
          </div>
        </div>

        <div class="control-panel">
          <div class="exif-badge">
            <h4>📷 相机硬件参数（已由母体记录）</h4>
            <ul>
              <li><strong>机型:</strong> {{ rawPhotoData.cameraModel }}</li>
              <li><strong>光圈:</strong> f/{{ rawPhotoData.fNumber }}</li>
              <li><strong>快门:</strong> {{ rawPhotoData.shutterSpeed }}</li>
              <li><strong>ISO:</strong> {{ rawPhotoData.iso }}</li>
            </ul>
          </div>

          <div class="card master-uploader">
            <h3>第二步：追加此原图的调色/二构版本</h3>
            <div class="input-group">
              <label>版本风格标签：</label>
              <input v-model="versionName" placeholder="例如：日系青橙、复古黑白、16:9裁剪" />
            </div>
            <input type="file" @change="uploadMaster" accept="image/jpeg,image/jpg" />
            <span v-if="uploadingMaster" class="loading-text">正在上传新版本...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

// 状态控制
const rawPhotoData = ref(null); // 存储后端返回的母体原图 JSON
const localRawUrl = ref('');    // 本地内存预览链接（秒开的关键）
const latestMasterUrl = ref(''); // 最新上传的成片云端链接
const currentView = ref('raw');  // 当前看板看哪张图：raw 还是 master

const versionName = ref('');     // 调色版本名
const uploadingMaster = ref(false);

// 1. 上传原图
const uploadRaw = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 💡 降维打击：不等网络响应，直接用内存生成本地预览链接，画面瞬间在屏幕上绽放！
  localRawUrl.value = URL.createObjectURL(file);
  rawPhotoData.value = { cameraModel: '正在剥离参数...', fNumber: '?', shutterSpeed: '?', iso: '?' };

  const fd = new FormData();
  fd.append('photo', file);

  try {
    const res = await axios.post('http://localhost:3000/api/photos/upload-raw', fd);
    if (res.data.success) {
      // 后端瞬间返回落盘的母体记录（包含抠出来的真实相机参数）
      rawPhotoData.value = res.data.data;
    }
  } catch (err) {
    alert('原图占坑失败');
    rawPhotoData.value = null;
  }
};

// 2. 追加绑定成片
const uploadMaster = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!versionName.value) {
    alert('请先给这次的调色起个版本名字（比如：复古风）');
    return;
  }

  uploadingMaster.value = true;
  const fd = new FormData();
  fd.append('photo', file);
  fd.append('parentId', rawPhotoData.value._id); // 把妈妈的 ID 捎带过去
  fd.append('versionName', versionName.value);   // 把风格标签捎带过去

  try {
    const res = await axios.post('http://localhost:3000/api/photos/upload-master', fd);
    if (res.data.success) {
      alert(`版本【${versionName.value}】绑定成功！`);
      latestMasterUrl.value = res.data.data.imageUrl; // 拿到成片的腾讯云链接
      currentView.value = 'master'; // 自动切换到成片视角看效果
      versionName.value = ''; // 清空输入框
    }
  } catch (err) {
    alert('成片追加失败');
  } finally {
    uploadingMaster.value = false;
  }
};
</script>

<style scoped>
.dark-room {
  padding: 30px;
  background: #121214;
  min-height: 100vh;
  color: #e4e4e7;
  font-family: sans-serif;
}

h2 {
  font-weight: 300;
  letter-spacing: 2px;
  border-bottom: 1px solid #27272a;
  padding-bottom: 15px;
}

.workbench {
  margin-top: 30px;
}

.card {
  background: #18181b;
  border: 1px dashed #3f3f46;
  padding: 30px;
  border-radius: 8px;
  text-align: center;
}

.tip {
  font-size: 12px;
  color: #71717a;
  margin-top: 10px;
}

.workspace {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 30px;
  margin-top: 20px;
}

.preview-panel {
  background: #09090b;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.img-box img {
  max-width: 100%;
  max-height: 500px;
  border-radius: 4px;
  object-fit: contain;
  margin-top: 10px;
}

.bi-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

button {
  background: #27272a;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

button.active {
  background: #3b82f6;
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.exif-badge {
  background: #18181b;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #27272a;
}

.exif-badge ul {
  list-style: none;
  padding: 0;
  margin: 15px 0 0 0;
}

.exif-badge li {
  margin-bottom: 8px;
  font-size: 14px;
}

.input-group {
  display: flex;
  flex-direction: column;
  text-align: left;
  margin-bottom: 15px;
  gap: 5px;
}

.input-group input {
  background: #09090b;
  border: 1px solid #3f3f46;
  color: #fff;
  padding: 8px;
  border-radius: 4px;
}

.loading-text {
  display: block;
  margin-top: 10px;
  color: #f59e0b;
  font-size: 13px;
}
</style>