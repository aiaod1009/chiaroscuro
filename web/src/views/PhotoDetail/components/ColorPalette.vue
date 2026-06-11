<template>
  <div class="color-panel-outer">
    <div class="scifi-panel color-panel">
      <div class="panel-header">
        <div class="title-group">
          <span class="panel-title-zh">色彩配置</span>
          <span class="panel-title-en">Color</span>
        </div>
      </div>
      <div class="color-list">
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
.color-panel-outer {
  position: absolute;
  right: -180px;
  top: 0;
  width: 160px;
}

.scifi-panel {
  background-color: rgba(18, 24, 36, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(31, 41, 55, 0.8);
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.color-panel {
  gap: 15px;
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

.color-list {
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
