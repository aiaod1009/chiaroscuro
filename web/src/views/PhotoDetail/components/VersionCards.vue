<template>
  <div class="versions-section">
    <div class="section-title-bar">
      <div class="title-group">
        <span class="title-zh">版本记录</span>
        <span class="title-en">Versions</span>
      </div>
      <div class="carousel-arrows">
        <button class="arrow-btn">&lt;</button>
        <button class="arrow-btn">&gt;</button>
      </div>
    </div>

    <!-- 有版本时显示卡片列表 -->
    <div v-if="versions.length" class="cards-list">
      <div
        v-for="v in allVersions"
        :key="v._id"
        class="version-card"
        :class="{ 'active-card': v.isOriginal ? !activeVersionId : v._id === activeVersionId }"
        @click="$emit('select', v.isOriginal ? null : v._id)"
      >
        <div class="card-thumb">
          <img :src="v.imageUrl" />
          <button class="display-btn" :class="{ 'is-display': isDisplay(v) }"
            @click.stop="onStarClick(v)" :title="isDisplay(v) ? '当前展示版' : '设为展示版'">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path v-if="isDisplay(v)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              <path v-else d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2zm0 3.28L9.71 9.97 5.18 10.7l3.41 3.32-.81 4.68L12 16.52l4.22 2.18-.81-4.68 3.41-3.32-4.53-.73L12 5.28z" />
            </svg>
          </button>
        </div>
        <!-- 确认弹窗 -->
        <div v-if="confirmId === v._id" class="confirm-popover" @click.stop>
          <div class="confirm-text">设为主图？</div>
          <div class="confirm-hint">瀑布流和作品集将展示此版本</div>
          <div class="confirm-actions">
            <button class="confirm-btn cancel" @click.stop="confirmId = null">取消</button>
            <button class="confirm-btn ok" @click.stop="confirmDisplay(v)">确定</button>
          </div>
        </div>
        <div class="card-title-zh">{{ v.versionName }}</div>
        <div class="card-title-en">{{ (v.isOriginal ? !activeVersionId : v._id === activeVersionId) ? 'Active Selection' : 'Version' }}</div>
      </div>
    </div>

    <!-- 没有版本时显示空状态 -->
    <div v-else class="empty-versions">
      <span class="empty-text">暂无衍生版本</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VersionCards',
  props: {
    originalPhoto: { type: Object, default: null },
    versions: { type: Array, default: () => [] },
    activeVersionId: { type: String, default: null },
    displayVersionId: { type: String, default: null }
  },
  emits: ['select', 'setDisplay'],
  data() {
    return {
      confirmId: null
    }
  },
  computed: {
    allVersions() {
      if (!this.originalPhoto) return []
      return [
        { _id: this.originalPhoto._id, imageUrl: this.originalPhoto.imageUrl, versionName: this.originalPhoto.versionName || '原图', isOriginal: true },
        ...this.versions.map(v => ({ ...v, isOriginal: false }))
      ]
    }
  },
  methods: {
    isDisplay(v) {
      if (v.isOriginal) return !this.displayVersionId
      return v._id === this.displayVersionId
    },
    onStarClick(v) {
      if (this.isDisplay(v)) {
        // 已经是展示版，直接取消
        this.$emit('setDisplay', v.isOriginal ? null : v._id)
      } else {
        this.confirmId = v._id
      }
    },
    confirmDisplay(v) {
      this.$emit('setDisplay', v.isOriginal ? null : v._id)
      this.confirmId = null
    }
  },
  mounted() {
    document.addEventListener('click', () => { this.confirmId = null })
  },
  beforeUnmount() {
    document.removeEventListener('click', () => { this.confirmId = null })
  }
}
</script>

<style scoped>
.versions-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-group {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.title-zh {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}

.title-en {
  font-size: 12px;
  color: #6b7280;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-transform: uppercase;
}

.carousel-arrows {
  display: flex;
  gap: 8px;
}

.arrow-btn {
  padding: 4px 10px;
  border-radius: 9999px;
  background-color: #111827;
  border: 1px solid #1f2937;
  color: #9ca3af;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.arrow-btn:hover {
  border-color: #374151;
  color: #ffffff;
}

.cards-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 640px) {
  .cards-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.version-card {
  position: relative;
  overflow: visible;
  background-color: rgba(17, 24, 39, 0.3);
  border: 1px solid rgba(31, 41, 55, 0.8);
  padding: 8px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.version-card:hover {
  border-color: #374151;
}

.active-card {
  background-color: rgba(17, 24, 39, 0.5);
  border-color: rgba(34, 211, 238, 0.5);
  box-shadow: inset 0 0 0 1px rgba(34, 211, 238, 0.2);
}

.card-thumb {
  position: relative;
  aspect-ratio: 16 / 9;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background-color: #1f2937;
  margin-bottom: 8px;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 展示版星标按钮 */
.display-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0;
  color: #6b7280;
  z-index: 2;
}

.version-card:hover .display-btn,
.display-btn.is-display {
  opacity: 1;
}

.display-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  border-color: rgba(255, 255, 255, 0.2);
  color: #fbbf24;
}

.display-btn.is-display {
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.3);
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.2);
}

/* 确认弹窗 */
.confirm-popover {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 180px;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 14px;
  z-index: 30;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
  animation: popIn 0.15s ease;
}

@keyframes popIn {
  from { opacity: 0; transform: translateY(-6px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.confirm-text {
  font-size: 13px;
  font-weight: 600;
  color: #e5e7eb;
}

.confirm-hint {
  font-size: 10px;
  color: #6b7280;
  margin-top: 4px;
  line-height: 1.4;
}

.confirm-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.confirm-btn {
  flex: 1;
  padding: 5px 0;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}

.confirm-btn.cancel {
  background: rgba(255, 255, 255, 0.06);
  color: #9ca3af;
}

.confirm-btn.cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e5e7eb;
}

.confirm-btn.ok {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.confirm-btn.ok:hover {
  background: rgba(251, 191, 36, 0.25);
}

.card-title-zh {
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
}

.card-title-en {
  font-size: 9px;
  color: #6b7280;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-transform: uppercase;
  margin-top: 2px;
}

/* 空状态 */
.empty-versions {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  border: 1px dashed rgba(55, 65, 81, 0.6);
  border-radius: 16px;
  background-color: rgba(17, 24, 39, 0.2);
}

.empty-text {
  font-size: 12px;
  color: #6b7280;
  letter-spacing: 0.05em;
}
</style>