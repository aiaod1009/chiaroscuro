<template>
  <div class="mode-tabs-track">
    <button class="tab-btn" :class="{ active: modelValue === 'creator' }" @click="$emit('update:modelValue', 'creator')">
      CREATOR
    </button>
    <button class="tab-btn" :class="{ active: modelValue === 'ai' }" @click="$emit('update:modelValue', 'ai')">
      AI ASSIST
    </button>
    <div class="tab-slider" :class="`slide-${modelValue}`"></div>
  </div>
</template>

<script>
export default {
  name: 'ModeTabs',
  props: {
    modelValue: { type: String, default: 'ai' }
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
.mode-tabs-track {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background-color: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 4px;
  border-radius: 9999px;
  margin-bottom: 20px;
  z-index: 1;
}

.tab-btn {
  position: relative;
  background: none;
  border: none;
  padding: 10px 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #6b7280;
  cursor: pointer;
  z-index: 3;
  transition: color 0.25s ease;
}

.tab-btn.active {
  color: #083344;
}

.tab-slider {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: calc(50% - 4px);
  background-color: #e0f7fa;
  border-radius: 9999px;
  z-index: 2;
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.slide-creator {
  transform: translateX(0%);
}

.slide-ai {
  transform: translateX(100%);
}
</style>
