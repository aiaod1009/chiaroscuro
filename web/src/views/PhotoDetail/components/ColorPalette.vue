<template>
  <div class="color-palette">
    <div
      v-for="(color, index) in colors"
      :key="index"
      class="color-item"
    >
      <div class="swatch" :style="{ backgroundColor: color.hex }"></div>
      <span class="color-name">{{ color.name }}</span>
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
  transition: transform 0.2s;
}

.swatch:hover {
  transform: scale(1.1);
}

.color-name {
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
}
</style>
