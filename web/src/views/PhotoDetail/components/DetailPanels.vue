<template>
  <div class="grid-right-col">
    <ExifPanel :exifData="exifData" class="exif-gap" />
    <ColorPalette :colors="colors" />
    <AnalysisPanel :imageSrc="imageSrc" :photoId="photoId" :cachedAnalysis="cachedAnalysis" />
  </div>
</template>

<script>
import ExifPanel from './ExifPanel.vue'
import ColorPalette from './ColorPalette.vue'
import AnalysisPanel from './AnalysisPanel.vue'

export default {
  name: 'DetailPanels',
  components: { ExifPanel, ColorPalette, AnalysisPanel },
  props: {
    imageSrc: { type: String, required: true },
    photoId: { type: String, default: null },
    exifData: { type: Array, default: () => [] },
    colors: { type: Array, default: () => [] },
    cachedAnalysis: { type: Object, default: null }
  }
}
</script>

<style scoped>
.grid-right-col {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.exif-gap {
  margin-bottom: 16px;
}
</style>
