<template>
  <section class="color-spectrum" v-if="colors.length">
    <div class="spectrum-header">
      <span class="spectrum-label">COLOR SPECTRUM</span>
      <h2 class="spectrum-title">作品色谱</h2>
      <p class="spectrum-desc">从所有照片中提取的主色调分布</p>
    </div>

    <div class="color-grid">
      <div v-for="(color, i) in colors" :key="color.hex" class="color-card"
        :style="{ animationDelay: `${i * 0.08}s` }">
        <div class="color-swatch" :style="{ background: color.hex }"></div>
        <div class="color-info">
          <span class="color-name">{{ color.name }}</span>
          <span class="color-hex">{{ color.hex }}</span>
          <span class="color-percent">{{ color.percent }}%</span>
        </div>
        <div class="color-bar" :style="{ width: `${color.percent}%`, background: color.hex }"></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchColorStats } from '../../../utils/photoApi'

const colors = ref([])

onMounted(async () => {
  colors.value = await fetchColorStats()
})
</script>

<style scoped>
.color-spectrum {
  position: relative;
  z-index: 1;
  width: 95%;
  max-width: 1700px;
  margin: 0 auto;
  padding: 4rem 0 2rem;
}

.spectrum-header {
  margin-bottom: 2.5rem;
}

.spectrum-label {
  font-size: 0.75rem;
  letter-spacing: 0.3em;
  color: #64748b;
  font-weight: 500;
}

.spectrum-title {
  font-size: 2.5rem;
  font-weight: 600;
  margin: 0.5rem 0 0.8rem;
  letter-spacing: 1px;
}

.spectrum-desc {
  font-size: 0.95rem;
  color: #94a3b8;
  margin: 0;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.color-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: cardUp 0.5s ease both;
}

@keyframes cardUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.color-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.color-swatch {
  height: 100px;
  transition: transform 0.3s ease;
}

.color-card:hover .color-swatch {
  transform: scale(1.05);
}

.color-info {
  padding: 14px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.color-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #e2e8f0;
}

.color-hex {
  font-size: 0.75rem;
  font-family: monospace;
  color: #64748b;
  text-transform: uppercase;
}

.color-percent {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 2px;
}

.color-bar {
  height: 3px;
  margin: 0 16px 14px;
  border-radius: 2px;
  opacity: 0.6;
  max-width: calc(100% - 32px);
}

@media (max-width: 768px) {
  .color-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
  }

  .color-swatch {
    height: 80px;
  }

  .spectrum-title {
    font-size: 1.8rem;
  }
}
</style>
