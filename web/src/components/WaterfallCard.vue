<template>
  <div class="waterfall-card" @click="$emit('click')">
    <img :src="src" :alt="alt" class="card-img" />
    <div class="card-overlay">
      <h3 class="card-title">{{ title || alt || '未命名' }}</h3>
      <p class="card-caption">{{ caption || '暂无配文' }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  title: { type: String, default: '' },
  caption: { type: String, default: '' }
})

defineEmits(['click'])
</script>

<style scoped>
.waterfall-card {
  position: relative;
  break-inside: avoid;
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.4s;
}

.waterfall-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.card-img {
  width: 100%;
  display: block;
  transition: transform 0.4s;
}

.waterfall-card:hover .card-img {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 70%, transparent 100%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 16px 20px;
  transform: translateY(100%);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.waterfall-card:hover .card-overlay {
  transform: translateY(0);
  opacity: 1;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 6px 0;
}

.card-caption {
  font-size: 12px;
  color: #8b949e;
  margin: 0;
  line-height: 1.5;
}
</style>
