<template>
  <div class="asset-card" @click="$emit('click')">
    <div class="card-top-overlay">
      <div class="status-indicator" :class="{ completed: isCompleted }">
        {{ isCompleted ? '✓' : '○' }}
      </div>
    </div>

    <img :src="imageUrl" :alt="fileName" class="asset-img" />

    <div class="card-bottom-glass">
      <div class="info-left">
        <h3 class="asset-title">{{ title || fileName }}</h3>
        <p class="asset-meta">{{ caption || '未写配文' }}</p>
      </div>
      <span class="format-badge" :class="{ completed: isCompleted }">
        {{ isCompleted ? 'DONE' : 'DRAFT' }}
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  fileName: { type: String, default: '' },
  caption: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  isCompleted: { type: Boolean, default: false }
})

defineEmits(['click'])
</script>

<style scoped>
.asset-card {
  position: relative;
  aspect-ratio: 1.4 / 1;
  border-radius: 16px;
  overflow: hidden;
  background-color: #161b22;
  border: 1px solid rgba(255, 255, 255, 0.03);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.asset-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.asset-card:hover .asset-img {
  transform: scale(1.02);
}

.card-top-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 3;
}

.status-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #f0ad4e;
}

.status-indicator.completed {
  border-color: #5cb85c;
  color: #5cb85c;
}

.card-bottom-glass {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.1) 100%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  z-index: 2;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
}

.asset-title {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px 0;
  font-family: monospace;
}

.asset-meta {
  font-size: 9px;
  font-family: monospace;
  color: #8b949e;
  margin: 0;
  letter-spacing: 0.02em;
}

.format-badge {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-family: monospace;
  font-size: 9px;
  font-weight: 700;
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 6px;
}

.format-badge.completed {
  background-color: rgba(92, 184, 92, 0.2);
  border-color: rgba(92, 184, 92, 0.4);
  color: #5cb85c;
}
</style>
