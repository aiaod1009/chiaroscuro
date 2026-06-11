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
    activeVersionId: { type: String, default: null }
  },
  emits: ['select'],
  computed: {
    allVersions() {
      if (!this.originalPhoto) return []
      return [
        { _id: this.originalPhoto._id, imageUrl: this.originalPhoto.imageUrl, versionName: this.originalPhoto.versionName || '原图', isOriginal: true },
        ...this.versions.map(v => ({ ...v, isOriginal: false }))
      ]
    }
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
