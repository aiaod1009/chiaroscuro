<template>
  <div class="scifi-panel exif-panel">
    <div class="panel-header">
      <div class="title-group">
        <span class="panel-title-zh">EXIF 信息</span>
        <span class="panel-title-en">Exif Data</span>
      </div>
    </div>

    <div class="exif-list">
      <div v-for="item in exifData" :key="item.label" class="exif-item">
        <span class="exif-label">{{ item.label }}</span>
        <span class="exif-value">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExifPanel',
  props: {
    exifData: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.scifi-panel {
  background-color: rgba(18, 24, 36, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(31, 41, 55, 0.8);
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.exif-panel {
  justify-content: space-between;
  min-height: 340px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-group {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.panel-title-zh {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.05em;
}

.panel-title-en {
  font-size: 12px;
  color: #6b7280;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-transform: uppercase;
}

.exif-list {
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 12px;
}

.exif-item {
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid rgba(31, 41, 55, 0.6);
}

.exif-item:last-child {
  border-bottom: none;
}

.exif-label {
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 12px;
}

.exif-value {
  color: #e5e7eb;
  font-weight: 500;
}
</style>
