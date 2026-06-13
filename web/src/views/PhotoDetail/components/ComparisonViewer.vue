<template>
  <div class="comparison-viewer" @click.self="openLeft = openRight = false">
    <img :src="rightSrc" alt="Right Version" class="image-layer" />

    <div class="original-layer-wrapper"
      :style="{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }">
      <img :src="leftSrc" alt="Left Version" class="image-layer original-img" />
    </div>

    <!-- 左侧选择器 -->
    <div class="selector selector-left" @click.stop>
      <button class="selector-btn" @click="openLeft = !openLeft; openRight = false">
        <span class="selector-label">{{ leftLabel }}</span>
        <svg class="selector-arrow" :class="{ open: openLeft }" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 11L3 6h10z" />
        </svg>
      </button>
      <transition name="dropdown">
        <div v-if="openLeft" class="dropdown-menu">
          <button v-for="v in allVersions" :key="v._id" class="dropdown-item"
            :class="{ active: leftId === v._id }" @click="leftId = v._id; openLeft = false">
            <span class="item-dot" :class="{ active: leftId === v._id }"></span>
            {{ v.label }}
          </button>
        </div>
      </transition>
    </div>

    <!-- 右侧选择器 -->
    <div class="selector selector-right" @click.stop>
      <button class="selector-btn" @click="openRight = !openRight; openLeft = false">
        <span class="selector-label">{{ rightLabel }}</span>
        <svg class="selector-arrow" :class="{ open: openRight }" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 11L3 6h10z" />
        </svg>
      </button>
      <transition name="dropdown">
        <div v-if="openRight" class="dropdown-menu">
          <button v-for="v in allVersions" :key="v._id" class="dropdown-item"
            :class="{ active: rightId === v._id }" @click="rightId = v._id; openRight = false">
            <span class="item-dot" :class="{ active: rightId === v._id }"></span>
            {{ v.label }}
          </button>
        </div>
      </transition>
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
    versions: { type: Array, default: () => [] },
    activeVersionId: { type: String, default: null }
  },
  data() {
    return {
      sliderPosition: 53,
      leftId: '__original__',
      rightId: '__original__',
      openLeft: false,
      openRight: false
    }
  },
  computed: {
    allVersions() {
      const list = [{ _id: '__original__', label: 'ORIGINAL', imageUrl: this.originalSrc }]
      for (const v of this.versions) {
        list.push({ _id: v._id, label: v.versionName || ('V' + v._id.slice(-4)), imageUrl: v.imageUrl })
      }
      return list
    },
    leftLabel() {
      return this.allVersions.find(v => v._id === this.leftId)?.label || 'ORIGINAL'
    },
    rightLabel() {
      return this.allVersions.find(v => v._id === this.rightId)?.label || 'ORIGINAL'
    },
    leftSrc() {
      return this.allVersions.find(v => v._id === this.leftId)?.imageUrl || this.originalSrc
    },
    rightSrc() {
      return this.allVersions.find(v => v._id === this.rightId)?.imageUrl || this.originalSrc
    }
  },
  watch: {
    activeVersionId: {
      immediate: true,
      handler(id) {
        if (id) this.rightId = id
      }
    }
  },
  mounted() {
    document.addEventListener('click', () => {
      this.openLeft = false
      this.openRight = false
    })
  },
  beforeUnmount() {
    document.removeEventListener('click', () => {
      this.openLeft = false
      this.openRight = false
    })
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

/* 选择器 */
.selector {
  position: absolute;
  top: 16px;
  z-index: 20;
}

.selector-left {
  left: 16px;
}

.selector-right {
  right: 16px;
}

.selector-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
  color: #e5e7eb;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.selector-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  border-color: rgba(255, 255, 255, 0.25);
}

.selector-arrow {
  width: 10px;
  height: 10px;
  color: #6b7280;
  transition: transform 0.2s;
}

.selector-arrow.open {
  transform: rotate(180deg);
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 160px;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 6px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  z-index: 30;
}

.selector-right .dropdown-menu {
  left: auto;
  right: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #e5e7eb;
}

.dropdown-item.active {
  color: #22d3ee;
}

.item-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #374151;
  flex-shrink: 0;
  transition: background 0.15s;
}

.item-dot.active {
  background: #22d3ee;
  box-shadow: 0 0 6px rgba(34, 211, 238, 0.5);
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
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