<template>
  <div class="test-page">
    <header class="test-header">
      <h1>Chiaroscuro API 测试台</h1>
      <p>覆盖全部后端接口：照片上传 / EXIF 提取 / AI 灵感生成 / 多轮迭代</p>
    </header>

    <!-- ==================== Section 1: 上传原图 ==================== -->
    <section class="test-section">
      <div class="section-title">
        <span class="step-badge">1</span>
        <h2>上传原图 <code>POST /api/photos/upload-raw</code></h2>
      </div>

      <div class="section-body">
        <div class="upload-area" @dragover.prevent @drop.prevent="onDropRaw">
          <input type="file" ref="rawFileInput" accept="image/jpeg,image/jpg" @change="onSelectRaw" hidden />
          <button class="btn-outline" @click="$refs.rawFileInput.click()">选择文件</button>
          <span class="upload-hint">或拖拽 JPEG 到此处</span>
        </div>

        <div v-if="rawState.file" class="file-info">
          <span>{{ rawState.file.name }} ({{ formatSize(rawState.file.size) }})</span>
          <button class="btn-primary" @click="uploadRaw" :disabled="rawState.loading">
            {{ rawState.loading ? '上传中...' : '开始上传' }}
          </button>
        </div>

        <div v-if="rawState.localPreview" class="preview-row">
          <img :src="rawState.localPreview" class="thumb" />
        </div>

        <div v-if="rawState.result" class="result-box">
          <h4>后端返回</h4>
          <pre>{{ JSON.stringify(rawState.result, null, 2) }}</pre>
        </div>

        <div v-if="rawState.error" class="error-box">{{ rawState.error }}</div>
      </div>
    </section>

    <!-- ==================== Section 2: 上传成片 ==================== -->
    <section class="test-section" :class="{ disabled: !rawState.result }">
      <div class="section-title">
        <span class="step-badge">2</span>
        <h2>上传成片 <code>POST /api/photos/upload-master</code></h2>
      </div>

      <div class="section-body">
        <div class="form-row">
          <label>parentId (自动填入)</label>
          <input :value="rawState.result?._id" disabled class="input-field" />
        </div>
        <div class="form-row">
          <label>versionName</label>
          <input v-model="masterState.versionName" placeholder="例如：日系青橙、复古黑白" class="input-field" />
        </div>

        <div class="upload-area" @dragover.prevent @drop.prevent="onDropMaster">
          <input type="file" ref="masterFileInput" accept="image/jpeg,image/jpg" @change="onSelectMaster" hidden />
          <button class="btn-outline" @click="$refs.masterFileInput.click()" :disabled="!rawState.result">选择文件</button>
          <span class="upload-hint">或拖拽成片 JPEG 到此处</span>
        </div>

        <div v-if="masterState.file" class="file-info">
          <span>{{ masterState.file.name }} ({{ formatSize(masterState.file.size) }})</span>
          <button class="btn-primary" @click="uploadMaster" :disabled="masterState.loading || !masterState.versionName">
            {{ masterState.loading ? '上传中...' : '开始上传' }}
          </button>
        </div>

        <div v-if="masterState.result" class="result-box">
          <h4>后端返回</h4>
          <pre>{{ JSON.stringify(masterState.result, null, 2) }}</pre>
        </div>

        <div v-if="masterState.error" class="error-box">{{ masterState.error }}</div>
      </div>
    </section>

    <!-- ==================== Section 3: AI 首轮生成 ==================== -->
    <section class="test-section">
      <div class="section-title">
        <span class="step-badge">3</span>
        <h2>AI 首轮灵感生成 <code>POST /api/ai/inspire/first-round</code></h2>
      </div>

      <div class="section-body">
        <div class="form-row">
          <label>photoId</label>
          <input v-model="firstRoundState.photoId" :placeholder="rawState.result?._id || '输入 MongoDB ObjectId'" class="input-field" />
        </div>
        <div class="form-row">
          <label>imageUrl</label>
          <input v-model="firstRoundState.imageUrl" :placeholder="rawState.result?.imageUrl || '输入图片公网 URL'" class="input-field" />
        </div>
        <div class="form-row">
          <label>style 风格</label>
          <div class="style-chips">
            <button v-for="s in styles" :key="s" class="chip" :class="{ active: firstRoundState.style === s }"
              @click="firstRoundState.style = s">{{ s }}</button>
          </div>
        </div>

        <button class="btn-primary btn-lg" @click="triggerFirstRound" :disabled="firstRoundState.loading || !firstRoundState.photoId || !firstRoundState.imageUrl">
          {{ firstRoundState.loading ? '生成中...' : '触发首轮生成' }}
        </button>

        <div v-if="firstRoundState.loading" class="loading-bar">
          <div class="loading-tips">{{ currentTip }}</div>
        </div>

        <div v-if="firstRoundState.result" class="result-box">
          <h4>后端返回 (耗时 {{ firstRoundState.duration }}s)</h4>
          <pre>{{ JSON.stringify(firstRoundState.result, null, 2) }}</pre>
        </div>

        <!-- 候选方案卡片 -->
        <div v-if="firstRoundState.candidates.length" class="candidates-grid">
          <div v-for="c in firstRoundState.candidates" :key="c.optionId" class="candidate-card">
            <div class="candidate-badge">方案 {{ c.optionId }}</div>
            <h3>{{ c.title }}</h3>
            <p>{{ c.caption }}</p>
          </div>
        </div>

        <div v-if="firstRoundState.error" class="error-box">{{ firstRoundState.error }}</div>
      </div>
    </section>

    <!-- ==================== Section 4: AI 多轮迭代 ==================== -->
    <section class="test-section" :class="{ disabled: !firstRoundState.result }">
      <div class="section-title">
        <span class="step-badge">4</span>
        <h2>AI 多轮迭代微调 <code>POST /api/ai/inspire/iterate</code></h2>
      </div>

      <div class="section-body">
        <div class="form-row">
          <label>sessionId (自动填入)</label>
          <input :value="firstRoundState.result?.sessionId" disabled class="input-field" />
        </div>

        <div class="iterate-cards">
          <div v-for="c in firstRoundState.candidates" :key="c.optionId" class="iterate-card"
            :class="{ 'is-iterating': iterateState.loadingId === c.optionId }">
            <div class="iterate-card-header">
              <span class="candidate-badge">方案 {{ c.optionId }}</span>
              <span v-if="iterateState.loadingId === c.optionId" class="iterating-tag">迭代中...</span>
            </div>
            <h4>{{ c.title }}</h4>
            <p class="caption-text">{{ c.caption }}</p>
            <div class="iterate-input-row">
              <input v-model="iterateState.feedbacks[c.optionId]" placeholder="输入修改意见..."
                @keyup.enter="handleIterate(c.optionId)" :disabled="!!iterateState.loadingId" />
              <button class="btn-primary btn-sm" @click="handleIterate(c.optionId)"
                :disabled="!!iterateState.loadingId || !iterateState.feedbacks[c.optionId]">
                调整
              </button>
            </div>
          </div>
        </div>

        <div v-if="iterateState.lastResult" class="result-box">
          <h4>最近一次迭代返回 (耗时 {{ iterateState.lastDuration }}s)</h4>
          <pre>{{ JSON.stringify(iterateState.lastResult, null, 2) }}</pre>
        </div>

        <div v-if="iterateState.error" class="error-box">{{ iterateState.error }}</div>
      </div>
    </section>

    <!-- ==================== Section 5: 会话历史 ==================== -->
    <section class="test-section" v-if="firstRoundState.result">
      <div class="section-title">
        <span class="step-badge">5</span>
        <h2>会话快照</h2>
      </div>
      <div class="section-body">
        <div class="snapshot-row">
          <div class="snapshot-item">
            <label>Session ID</label>
            <code>{{ firstRoundState.result.sessionId }}</code>
          </div>
          <div class="snapshot-item">
            <label>Chosen Style</label>
            <code>{{ firstRoundState.result.chosenStyle }}</code>
          </div>
          <div class="snapshot-item">
            <label>迭代次数</label>
            <code>{{ iterateState.iterateCount }}</code>
          </div>
        </div>

        <div v-if="iterateState.history.length" class="history-timeline">
          <div v-for="(h, i) in iterateState.history" :key="i" class="history-item">
            <span class="history-idx">#{{ i + 1 }}</span>
            <span class="history-target">方案{{ h.optionId }}</span>
            <span class="history-feedback">"{{ h.feedback }}"</span>
            <span class="history-arrow">&rarr;</span>
            <span class="history-result">{{ h.result.title }}</span>
            <span class="history-duration">{{ h.duration }}s</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE = '/api';

export default {
  name: 'TestPage',
  data() {
    return {
      styles: ['活泼', '正式', '冷酷', '文艺', '幽默'],
      currentTip: 'AI 正在深度分析图片...',
      tipTimer: null,

      // Section 1: 上传原图
      rawState: {
        file: null,
        localPreview: '',
        loading: false,
        result: null,
        error: ''
      },

      // Section 2: 上传成片
      masterState: {
        file: null,
        versionName: '',
        loading: false,
        result: null,
        error: ''
      },

      // Section 3: AI 首轮
      firstRoundState: {
        photoId: '',
        imageUrl: '',
        style: '活泼',
        loading: false,
        result: null,
        candidates: [],
        duration: 0,
        error: ''
      },

      // Section 4: AI 迭代
      iterateState: {
        feedbacks: { 1: '', 2: '', 3: '' },
        loadingId: null,
        lastResult: null,
        lastDuration: 0,
        iterateCount: 0,
        history: [],
        error: ''
      }
    };
  },

  watch: {
    // 自动回填 AI 首轮的 photoId 和 imageUrl
    'rawState.result'(val) {
      if (val) {
        if (!this.firstRoundState.photoId) this.firstRoundState.photoId = val._id;
        if (!this.firstRoundState.imageUrl) this.firstRoundState.imageUrl = val.imageUrl;
      }
    }
  },

  methods: {
    formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    },

    // ---- Section 1 ----
    onDropRaw(e) {
      const file = e.dataTransfer.files[0];
      if (file) this.prepareRawFile(file);
    },
    onSelectRaw(e) {
      const file = e.target.files[0];
      if (file) this.prepareRawFile(file);
    },
    prepareRawFile(file) {
      this.rawState.file = file;
      this.rawState.localPreview = URL.createObjectURL(file);
      this.rawState.result = null;
      this.rawState.error = '';
    },
    async uploadRaw() {
      if (!this.rawState.file) return;
      this.rawState.loading = true;
      this.rawState.error = '';
      const fd = new FormData();
      fd.append('photo', this.rawState.file);
      try {
        const res = await axios.post(`${API_BASE}/photos/upload-raw`, fd);
        this.rawState.result = res.data.data;
      } catch (err) {
        this.rawState.error = err.response?.data?.message || err.message;
      } finally {
        this.rawState.loading = false;
      }
    },

    // ---- Section 2 ----
    onDropMaster(e) {
      const file = e.dataTransfer.files[0];
      if (file) this.prepareMasterFile(file);
    },
    onSelectMaster(e) {
      const file = e.target.files[0];
      if (file) this.prepareMasterFile(file);
    },
    prepareMasterFile(file) {
      this.masterState.file = file;
      this.masterState.result = null;
      this.masterState.error = '';
    },
    async uploadMaster() {
      if (!this.masterState.file || !this.masterState.versionName) return;
      this.masterState.loading = true;
      this.masterState.error = '';
      const fd = new FormData();
      fd.append('photo', this.masterState.file);
      fd.append('parentId', this.rawState.result._id);
      fd.append('versionName', this.masterState.versionName);
      try {
        const res = await axios.post(`${API_BASE}/photos/upload-master`, fd);
        this.masterState.result = res.data.data;
      } catch (err) {
        this.masterState.error = err.response?.data?.message || err.message;
      } finally {
        this.masterState.loading = false;
      }
    },

    // ---- Section 3 ----
    startTips() {
      const tips = [
        'VLM 视觉大模型正在解析图片构图与色调...',
        '正在剥离多模态图片大包，卸载视觉算力延迟...',
        '已强控切换至专用闪电模型 glm-4.6v-flash...',
        '正在注入 temperature 精准微调指令...',
        '大模型正在神经网络中进行纯文字润色，请稍候...'
      ];
      let i = 0;
      this.currentTip = tips[0];
      this.tipTimer = setInterval(() => {
        i = (i + 1) % tips.length;
        this.currentTip = tips[i];
      }, 1800);
    },
    stopTips() {
      if (this.tipTimer) { clearInterval(this.tipTimer); this.tipTimer = null; }
    },
    async triggerFirstRound() {
      this.firstRoundState.loading = true;
      this.firstRoundState.error = '';
      this.firstRoundState.result = null;
      this.firstRoundState.candidates = [];
      this.startTips();
      const startTime = Date.now();
      try {
        const res = await axios.post(`${API_BASE}/ai/inspire/first-round`, {
          photoId: this.firstRoundState.photoId,
          imageUrl: this.firstRoundState.imageUrl,
          style: this.firstRoundState.style
        });
        this.firstRoundState.duration = ((Date.now() - startTime) / 1000).toFixed(1);
        if (res.data.success) {
          this.firstRoundState.result = res.data;
          this.firstRoundState.candidates = res.data.candidates;
          // 重置迭代状态
          this.iterateState.feedbacks = { 1: '', 2: '', 3: '' };
          this.iterateState.iterateCount = 0;
          this.iterateState.history = [];
          this.iterateState.lastResult = null;
        } else {
          this.firstRoundState.error = res.data.message;
        }
      } catch (err) {
        this.firstRoundState.duration = ((Date.now() - startTime) / 1000).toFixed(1);
        this.firstRoundState.error = err.response?.data?.message || err.message;
      } finally {
        this.firstRoundState.loading = false;
        this.stopTips();
      }
    },

    // ---- Section 4 ----
    async handleIterate(optionId) {
      const feedback = (this.iterateState.feedbacks[optionId] || '').trim();
      if (!feedback) return;
      if (!this.firstRoundState.result) return;

      const targetCard = this.firstRoundState.candidates.find(c => c.optionId === optionId);
      if (!targetCard) return;

      this.iterateState.loadingId = optionId;
      this.iterateState.error = '';
      const startTime = Date.now();

      try {
        const res = await axios.post(`${API_BASE}/ai/inspire/iterate`, {
          sessionId: this.firstRoundState.result.sessionId,
          optionId,
          currentContent: { title: targetCard.title, caption: targetCard.caption },
          userFeedback: feedback
        });
        this.iterateState.lastDuration = ((Date.now() - startTime) / 1000).toFixed(1);
        if (res.data.success) {
          const updated = res.data.updatedCandidate;
          const idx = this.firstRoundState.candidates.findIndex(c => c.optionId === optionId);
          if (idx !== -1) {
            this.firstRoundState.candidates[idx].title = updated.title;
            this.firstRoundState.candidates[idx].caption = updated.caption;
          }
          this.iterateState.lastResult = res.data;
          this.iterateState.iterateCount++;
          this.iterateState.history.push({ optionId, feedback, result: updated, duration: this.iterateState.lastDuration });
          this.iterateState.feedbacks[optionId] = '';
        } else {
          this.iterateState.error = res.data.message;
        }
      } catch (err) {
        this.iterateState.lastDuration = ((Date.now() - startTime) / 1000).toFixed(1);
        this.iterateState.error = err.response?.data?.message || err.message;
      } finally {
        this.iterateState.loadingId = null;
      }
    }
  },

  beforeUnmount() {
    this.stopTips();
  }
};
</script>

<style scoped>
* { box-sizing: border-box; }

.test-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f8f9fa;
  color: #1a1a2e;
  min-height: 100vh;
}

.test-header {
  text-align: center;
  margin-bottom: 48px;
}

.test-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 8px;
}

.test-header p {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
}

/* ---- Section ---- */
.test-section {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  margin-bottom: 28px;
  overflow: hidden;
  transition: opacity 0.3s;
}

.test-section.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #f1f3f5;
  border-bottom: 1px solid #e9ecef;
}

.section-title h2 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.section-title code {
  font-size: 0.78rem;
  background: #e9ecef;
  padding: 2px 8px;
  border-radius: 4px;
  color: #495057;
}

.step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #228be6;
  color: #fff;
  border-radius: 50%;
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
}

.section-body {
  padding: 24px;
}

/* ---- Upload Area ---- */
.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
  transition: border-color 0.2s;
}

.upload-area:hover {
  border-color: #228be6;
}

.upload-hint {
  color: #adb5bd;
  font-size: 0.85rem;
}

/* ---- Form ---- */
.form-row {
  margin-bottom: 16px;
}

.form-row label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 6px;
}

.input-field {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.88rem;
  background: #f8f9fa;
  color: #1a1a2e;
}

.input-field:disabled {
  background: #e9ecef;
  color: #868e96;
}

/* ---- Buttons ---- */
.btn-primary {
  background: #228be6;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 0.88rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #1c7ed6;
}

.btn-primary:disabled {
  background: #a5d8ff;
  cursor: not-allowed;
}

.btn-lg {
  padding: 10px 28px;
  font-size: 0.95rem;
  margin-top: 8px;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 0.82rem;
}

.btn-outline {
  background: transparent;
  color: #228be6;
  border: 1px solid #228be6;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: #228be6;
  color: #fff;
}

/* ---- File Info ---- */
.file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f1f3f5;
  padding: 10px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 0.85rem;
}

/* ---- Preview ---- */
.preview-row {
  margin-bottom: 16px;
}

.thumb {
  max-width: 240px;
  max-height: 180px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  object-fit: contain;
}

/* ---- Style Chips ---- */
.style-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  padding: 6px 16px;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.chip:hover {
  border-color: #228be6;
}

.chip.active {
  background: #228be6;
  color: #fff;
  border-color: #228be6;
}

/* ---- Loading ---- */
.loading-bar {
  margin-top: 16px;
}

.loading-tips {
  font-size: 0.82rem;
  color: #228be6;
  background: #e7f5ff;
  padding: 10px 16px;
  border-radius: 6px;
  border-left: 3px solid #228be6;
  animation: fadeIn 0.3s;
}

/* ---- Result Box ---- */
.result-box {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.result-box h4 {
  margin: 0 0 10px;
  font-size: 0.82rem;
  color: #868e96;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.result-box pre {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  color: #343a40;
}

/* ---- Error ---- */
.error-box {
  background: #fff5f5;
  color: #c92a2a;
  border: 1px solid #ffc9c9;
  border-radius: 6px;
  padding: 10px 16px;
  margin-top: 12px;
  font-size: 0.85rem;
}

/* ---- Candidates Grid ---- */
.candidates-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.candidate-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 18px;
  transition: box-shadow 0.2s;
}

.candidate-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.candidate-badge {
  display: inline-block;
  padding: 2px 10px;
  background: #e7f5ff;
  color: #228be6;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 12px;
  margin-bottom: 10px;
}

.candidate-card h3 {
  margin: 0 0 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
}

.candidate-card p {
  margin: 0;
  font-size: 0.85rem;
  color: #495057;
  line-height: 1.5;
}

/* ---- Iterate Cards ---- */
.iterate-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.iterate-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 16px;
  transition: all 0.2s;
}

.iterate-card.is-iterating {
  border-color: #228be6;
  background: #f8faff;
}

.iterate-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.iterating-tag {
  font-size: 0.72rem;
  color: #228be6;
  background: #e7f5ff;
  padding: 2px 8px;
  border-radius: 8px;
}

.iterate-card h4 {
  margin: 0 0 6px;
  font-size: 0.95rem;
  color: #1a1a2e;
}

.caption-text {
  font-size: 0.82rem;
  color: #868e96;
  line-height: 1.5;
  margin: 0 0 12px;
}

.iterate-input-row {
  display: flex;
  gap: 6px;
}

.iterate-input-row input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.82rem;
}

.iterate-input-row input:focus {
  outline: none;
  border-color: #228be6;
}

/* ---- Snapshot ---- */
.snapshot-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.snapshot-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.snapshot-item label {
  font-size: 0.75rem;
  color: #868e96;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.snapshot-item code {
  font-size: 0.85rem;
  background: #f1f3f5;
  padding: 4px 10px;
  border-radius: 4px;
  color: #c92a2a;
}

/* ---- History Timeline ---- */
.history-timeline {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  flex-wrap: wrap;
}

.history-idx {
  color: #adb5bd;
  font-weight: 600;
  min-width: 28px;
}

.history-target {
  background: #e7f5ff;
  color: #228be6;
  padding: 1px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.history-feedback {
  color: #495057;
  font-style: italic;
}

.history-arrow {
  color: #adb5bd;
}

.history-result {
  color: #1a1a2e;
  font-weight: 500;
}

.history-duration {
  color: #adb5bd;
  font-size: 0.75rem;
  margin-left: auto;
}

/* ---- Animation ---- */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .candidates-grid,
  .iterate-cards {
    grid-template-columns: 1fr;
  }
}
</style>
