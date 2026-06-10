<template>
  <div class="meta-spec-bar">
    <div class="specs-group">
      <div v-if="exif.camera" class="spec-item">
        <span class="spec-label">CAMERA</span>
        <span class="spec-value">{{ cleanCamera(exif.camera) }}</span>
      </div>
      <div v-if="exif.aperture" class="spec-item">
        <span class="spec-label">APERTURE</span>
        <span class="spec-value">{{ exif.aperture }}</span>
      </div>
      <div v-if="exif.shutterSpeed" class="spec-item">
        <span class="spec-label">SHUTTER</span>
        <span class="spec-value">{{ exif.shutterSpeed }}</span>
      </div>
      <div v-if="exif.iso && exif.iso !== '0'" class="spec-item">
        <span class="spec-label">ISO</span>
        <span class="spec-value">{{ exif.iso }}</span>
      </div>
      <div v-if="exif.focalLength" class="spec-item">
        <span class="spec-label">FOCAL</span>
        <span class="spec-value">{{ exif.focalLength }}</span>
      </div>
      <div v-if="exif.dateTimeOriginal" class="spec-item">
        <span class="spec-label">DATE</span>
        <span class="spec-value">{{ formatDate(exif.dateTimeOriginal) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MetaSpecBar',
  props: {
    exif: { type: Object, default: () => ({}) }
  },
  methods: {
    cleanCamera(name) {
      if (!name) return ''
      let clean = name
        .replace(/^NIKON CORPORATION\s*/i, '')
        .replace(/^Canon\s*/i, '')
        .replace(/^SONY\s*/i, '')
        .replace(/^FUJIFILM\s*/i, '')
        .replace(/^PENTAX\s*/i, '')
        .replace(/^OLYMPUS\s*/i, '')
        .trim()
      clean = clean.replace(/([A-Z])\s+(\d)/g, '$1$2')
      return clean
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style scoped>
.meta-spec-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
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
</style>
