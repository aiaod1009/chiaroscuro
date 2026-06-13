<template>
  <div class="comparison-viewer">
    <img :src="rightSrc" alt="Right Version" class="image-layer" />
    <div class="badge badge-right">
      <select v-model="rightId" class="version-select">
        <option v-for="v in allVersions" :key="v._id" :value="v._id">{{ v.label }}</option>
      </select>
    </div>

    <div class="original-layer-wrapper"
      :style="{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }">
      <img :src="leftSrc" alt="Left Version" class="image-layer original-img" />
      <div class="badge badge-left">
        <select v-model="leftId" class="version-select">
          <option v-for="v in allVersions" :key="v._id" :value="v._id">{{ v.label }}</option>
        </select>
      </div>
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
    originalId: { type: String, default: '__original__' },
    versions: { type: Array, default: () => [] },
    activeVersionId: { type: String, default: null }
  },
  data() {
    return {
      sliderPosition: 53,
      leftId: '__original__',
      rightId: '__original__'
    }
  },
  computed: {
    allVersions() {
      const list = [{ _id: '__original__', label: 'ORIGINAL', imageUrl: this.originalSrc }]
      for (const v of this.versions) {
        list.push({ _id: v._id, label: v.name || v._id.slice(-6), imageUrl: v.imageUrl })
      }
      return list
    },
    leftSrc() {
      const v = this.allVersions.find(v => v._id === this.leftId)
      return v?.imageUrl || this.originalSrc
    },
    rightSrc() {
      const v = this.allVersions.find(v => v._id === this.rightId)
      return v?.imageUrl || this.originalSrc
    }
  },
  watch: {
    activeVersionId: {
      immediate: true,
      handler(id) {
        if (id) this.rightId = id
      }
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
  z-index: 20;
  pointer-events: auto;
}

.badge-left {
  left: 16px;
}

.badge-right {
  right: 16px;
}

.version-select {
  background: transparent;
  border: none;
  color: #d1d5db;
  font-size: 10px;
  letter-spacing: 0.05em;
  cursor: pointer;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  padding-right: 12px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' fill='%23d1d5db' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right center;
}

.version-select option {
  background-color: #111827;
  color: #d1d5db;
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