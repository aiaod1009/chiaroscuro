<template>
  <div class="folder-card" @click="$emit('open', work)">
    <div class="folder-cover">
      <img v-if="work.coverImage" :src="work.coverImage" :alt="work.name" @error="$emit('cover-error', work)" />
      <span v-if="!work.coverImage" class="folder-empty-hint">暂无照片</span>
    </div>
    <div class="folder-info">
      <h3 class="folder-name">{{ work.name }}</h3>
      <p class="folder-meta">{{ formattedDate }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  work: { type: Object, required: true }
})

defineEmits(['open', 'cover-error'])

const formattedDate = computed(() =>
  new Date(props.work.realDate || props.work.createdAt)
    .toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    .toUpperCase()
)
</script>

<style scoped>
.folder-card {
  position: relative;
  aspect-ratio: 1.4 / 1;
  border-radius: 16px;
  overflow: hidden;
  background-color: #161b22;
  border: 1px solid rgba(255, 255, 255, 0.03);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
  display: flex;
  flex-direction: column;
}

.folder-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.08);
}

.folder-cover {
  flex: 1;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  align-items: center;
  justify-content: center;
}

.folder-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.folder-card:hover .folder-cover img {
  transform: scale(1.02);
}

.folder-empty-hint {
  color: #3a4150;
  font-size: 13px;
}

.folder-info {
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(255, 255, 255, 0.03);
}

.folder-name {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-meta {
  font-size: 10px;
  font-family: monospace;
  color: #64748b;
  margin: 0;
  letter-spacing: 0.05em;
}
</style>
