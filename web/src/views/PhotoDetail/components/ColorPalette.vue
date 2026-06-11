<template>
  <div class="color-palette">
    <div v-for="(color, index) in colors" :key="index" class="color-item">
      <div class="swatch" :style="{ backgroundColor: color.hex }" :title="'点击复制 ' + color.hex"
        @click="copyHex(color.hex, index)">
        <span v-if="copiedIndex === index" class="copied-tip">Copied!</span>
      </div>
      <div class="color-info">
        <span class="color-name">{{ color.name }}</span>
        <span class="color-hex">{{ color.hex }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorPalette',
  props: {
    colors: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      copiedIndex: -1
    }
  },
  methods: {
    copyHex(hex, index) {
      navigator.clipboard.writeText(hex).then(() => {
        this.copiedIndex = index
        setTimeout(() => { this.copiedIndex = -1 }, 1000)
      }).catch(() => { })
    }
  }
}
</script>

<style scoped>
.color-palette {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
}

.swatch:hover {
  transform: scale(1.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.copied-tip {
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  color: #22d3ee;
  white-space: nowrap;
  pointer-events: none;
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.color-name {
  font-size: 11px;
  color: #e5e7eb;
  white-space: nowrap;
}

.color-hex {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  letter-spacing: 0.03em;
}
</style>
