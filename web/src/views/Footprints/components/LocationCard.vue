<template>
  <aside class="location-card" :style="cardStyle" @mousedown.stop @wheel.stop>
    <button class="close-btn" type="button" @click="$emit('close')" aria-label="关闭">&times;</button>
    <div class="card-heading">
      <h1>{{ name }}</h1>
      <span>{{ albums }} 个相册 · {{ photoCount }} 张</span>
    </div>
    <div class="photo-grid">
      <img v-for="photo in photos" :key="photo.src" :src="photo.src" :alt="photo.alt" @error="onImgError" />
    </div>
    <button class="view-all" type="button" @click="$emit('view-all')">查看全部 →</button>
  </aside>
</template>

<script>
export default {
  name: 'LocationCard',
  props: {
    name: { type: String, required: true },
    albums: { type: Number, default: 0 },
    photoCount: { type: Number, default: 0 },
    photos: { type: Array, default: () => [] },
    cardStyle: { type: Object, default: () => ({}) },
  },
  emits: ['close', 'view-all'],
  methods: {
    onImgError(e) {
      e.target.src = 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 148"><rect fill="#1a2035" width="200" height="148" rx="8"/><text x="100" y="78" text-anchor="middle" fill="#4a5568" font-size="14">图片加载失败</text></svg>'
      );
      e.target.style.objectFit = 'contain';
    },
  },
};
</script>

<style scoped>
.location-card {
  position: absolute;
  width: min(525px, 34vw);
  padding: 28px 30px 30px;
  border: 1px solid rgba(245, 158, 11, 0.58);
  border-radius: 12px;
  background: rgba(4, 7, 13, 0.9);
  box-shadow: 0 0 24px rgba(234, 88, 12, 0.22), 0 22px 70px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(14px);
  cursor: default;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 14px;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: #9ca7b8;
  font-size: 1.3rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 24px;
}

.card-heading h1 {
  margin: 0;
  font-size: 1.85rem;
  line-height: 1.1;
  letter-spacing: 0;
}

.card-heading span {
  color: #9ca7b8;
  font-size: 0.95rem;
  white-space: nowrap;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.photo-grid img {
  width: 100%;
  aspect-ratio: 1.35;
  border-radius: 8px;
  object-fit: cover;
  display: block;
}

.view-all {
  width: 100%;
  height: 38px;
  margin-top: 20px;
  border: 1px solid rgba(245, 158, 11, 0.38);
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.28);
  color: #ffc84a;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 1100px) {
  .location-card {
    top: auto;
    right: 20px;
    bottom: 72px;
    left: 20px;
    width: auto;
    padding: 22px;
  }
}

@media (max-width: 680px) {
  .card-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }

  .photo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
}
</style>
