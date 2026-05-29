<template>
  <div class="placeholder-card">
    <div class="placeholder-content">
      <div class="folder-icon">📂</div>
      <span class="placeholder-main">{{ albumCount }} 个作品集</span>
      <div class="placeholder-actions">
        <button class="btn-p-action" @click="$emit('create')">Create Album</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  albumCount: { type: Number, default: 0 }
})

defineEmits(['create'])
</script>

<style scoped>
.placeholder-card {
  aspect-ratio: 1.4 / 1;
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.04);
  background-color: rgba(255, 255, 255, 0.005);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.folder-icon {
  font-size: 24px;
  color: #21262d;
  margin-bottom: 12px;
  opacity: 0.6;
}

.placeholder-main {
  font-size: 18px;
  color: #485260;
  margin-bottom: 16px;
}

.placeholder-actions {
  display: flex;
  gap: 8px;
}

.btn-p-action {
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 15px;
  font-weight: 700;
  font-family: monospace;
  color: #485260;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-p-action:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #8b949e;
}
</style>
