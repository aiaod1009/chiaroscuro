<template>
  <div class="folder-card" @click="$emit('open', work)">
    <div class="folder-cover">
      <img v-if="coverSrc" :src="coverSrc" :alt="work.name" @error="onCoverError" />
      <span v-if="!coverSrc" class="folder-empty-hint">暂无照片</span>
    </div>
    <div class="folder-info">
      <h3 class="folder-name">{{ work.name }}</h3>
      <p class="folder-meta">{{ formattedDate }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

const props = defineProps({
  work: { type: Object, required: true }
})

defineEmits(['open'])

const coverSrc = ref(props.work.coverImage || '')
const retried = ref(false)

const onCoverError = async () => {
  if (retried.value) { coverSrc.value = ''; return }
  retried.value = true
  try {
    const { data } = await axios.get(`/api/works/${props.work._id}`)
    coverSrc.value = data.success && data.data.photos?.length ? data.data.photos[0].imageUrl : ''
  } catch {
    coverSrc.value = ''
  }
}

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
