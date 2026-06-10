<template>
  <div class="meta-section">
    <div class="meta-left">
      <div class="volume-label">CHRONICLE VOLUME</div>
      <h1 class="gallery-title">{{ title }}</h1>
      <p class="gallery-desc">{{ description }}</p>
    </div>

    <div class="meta-center">
      <PlayerControls :isPlaying="isPlaying" @prev="$emit('prev')" @next="$emit('next')" @togglePlay="$emit('togglePlay')" />
    </div>

    <div class="meta-right">
      <div class="meta-block" v-if="exifPrimary">
        <div class="m-label">EXIF DATA</div>
        <div class="m-val-primary">{{ exifPrimary }}</div>
        <div class="m-val-sec">{{ exifSecondary }}</div>
      </div>
      <div class="meta-block" v-if="locationDate">
        <div class="m-label">LOCATION</div>
        <div class="m-val-primary">{{ locationDate }}</div>
        <div class="m-val-sec">{{ locationName }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import PlayerControls from './PlayerControls.vue';

export default {
  name: 'MetaSection',
  components: { PlayerControls },
  props: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    isPlaying: { type: Boolean, default: false },
    exifPrimary: { type: String, default: '' },
    exifSecondary: { type: String, default: '' },
    locationDate: { type: String, default: '' },
    locationName: { type: String, default: '' }
  },
  emits: ['prev', 'next', 'togglePlay']
}
</script>

<style scoped>
.meta-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: start;
  gap: 2rem;
  margin-top: 4rem;
  padding-bottom: 5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.meta-left {
  max-width: 100%;
}

.meta-center {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 2rem;
}

.meta-right {
  display: flex;
  justify-content: flex-end;
  gap: 3rem;
  padding-top: 2rem;
}

.volume-label {
  color: #00e0c6;
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 2px;
  margin-bottom: 1rem;
  text-transform: uppercase;
}

.gallery-title {
  font-size: 2.5rem;
  margin: 0 0 1rem;
  font-weight: bold;
  letter-spacing: 2px;
}

.gallery-desc {
  color: #a0aec0;
  line-height: 1.8;
  margin-bottom: 2.5rem;
  font-size: 0.95rem;
}

.meta-block {
  border-left: 1px solid #1e293b;
  padding-left: 1.5rem;
}

.m-label {
  font-size: 0.65rem;
  color: #64748b;
  letter-spacing: 1px;
  margin-bottom: 0.8rem;
}

.m-val-primary {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.4rem;
}

.m-val-sec {
  font-size: 0.85rem;
  color: #94a3b8;
}

@media (max-width: 1024px) {
  .meta-section {
    flex-direction: column;
    gap: 2rem;
  }

  .meta-right {
    justify-content: flex-start;
  }
}
</style>
