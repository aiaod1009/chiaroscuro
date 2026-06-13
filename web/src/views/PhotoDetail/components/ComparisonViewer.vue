<template>
  <div class="comparison-viewer">
    <img :src="versionSrc" alt="AI Version" class="image-layer" />
    <div class="badge badge-right">NEW VERSION</div>

    <div class="original-layer-wrapper"
      :style="{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }">
      <img :src="originalSrc" alt="Original Input" class="image-layer original-img" />
      <div class="badge badge-left">ORIGINAL - RAW INPUT</div>
    </div>

    <div class="slider-handle" :style="{ left: `${sliderPosition}%` }">
      <div class="handle-button">Unfold</div>
    </div>

    <input type="range" min="0" max="100" v-model="sliderPosition" class="hidden-range-input" />
  </div>
</template>

<script>
export default {
  name: 'ComparisonViewer',
  props: {
    originalSrc: { type: String, required: true },
    versionSrc: { type: String, required: true }
  },
  data() {
    return {
      sliderPosition: 53
    }
  }
}
</script>

<style scoped>
.comparison-viewer {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid #1f2937;
  background-color: #111827;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.image-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.original-layer-wrapper {
  position: absolute;
  inset: 0;
  user-select: none;
  pointer-events: none;
}

.badge {
  position: absolute;
  top: 16px;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  padding: 6px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 10px;
  letter-spacing: 0.05em;
  color: #d1d5db;
}

.badge-left {
  left: 16px;
}

.badge-right {
  right: 16px;
}

/* 拖拽中心中轴 */
.slider-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #22d3ee;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.handle-button {
  width: 48px;
  height: 48px;
  border-radius: 50px;
  background-color: #083344;
  border: 2px solid #22d3ee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.1em;
  color: #22d3ee;
  text-transform: uppercase;
  box-shadow: 0 0 15px rgba(34, 211, 238, 0.3);
}

/* 隐藏的原生拖动滑块覆盖整图 */
.hidden-range-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: ew-resize;
  z-index: 10;
  margin: 0;
}
</style>
