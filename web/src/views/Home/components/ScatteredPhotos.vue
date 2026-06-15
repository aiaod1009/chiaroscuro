<template>
  <section class="scattered-section">
    <h2 class="section-title">散落的回忆</h2>
    <div class="photo-desk" ref="desk">
      <div v-for="(photo, index) in photos" :key="photo.id" class="scattered-photo" :style="photo.style"
        @mouseenter="hoverIndex = index" @mouseleave="hoverIndex = -1"
        @click="$router.push(`/photo-detail/${photo.id}`)">
        <div class="photo-card" :class="{ 'is-hovered': hoverIndex === index }">
          <div class="photo-front">
            <img :src="photo.src" :alt="photo.title" />
            <div class="photo-tape" :class="photo.tapeClass"></div>
          </div>
          <div class="photo-back">
            <p class="photo-title">{{ photo.title }}</p>
            <p class="photo-date">{{ photo.date }}</p>
            <p class="photo-caption">{{ photo.caption }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { fetchPhotosByRegion } from '../../../utils/photoApi';

export default {
  name: 'ScatteredPhotos',
  data() {
    return {
      photos: [],
      hoverIndex: -1
    };
  },
  async mounted() {
    await this.loadPhotos();
  },
  methods: {
    async loadPhotos() {
      try {
        const res = await fetchPhotosByRegion('CN', 1, 50);
        const all = res?.photos || [];
        const valid = all.filter(p => p.src && p.title).sort(() => Math.random() - 0.5).slice(0, 12);

        const tapeStyles = ['tape-yellow', 'tape-white', 'tape-pink', 'tape-blue'];
        const cols = 4;
        const cellW = 100 / cols;

        this.photos = valid.map((p, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const baseX = col * cellW + cellW / 2;
          const baseY = row * 320 + 140;
          const offsetX = (Math.random() - 0.5) * 40;
          const offsetY = (Math.random() - 0.5) * 30;
          const rotate = (Math.random() - 0.5) * 16;

          return {
            ...p,
            title: p.title,
            caption: p.caption || '',
            date: p.createdAt ? new Date(p.createdAt).toLocaleDateString('zh-CN') : '',
            tapeClass: tapeStyles[Math.floor(Math.random() * tapeStyles.length)],
            style: {
              left: `calc(${baseX}% + ${offsetX}px)`,
              top: `${baseY + offsetY}px`,
              '--rotate': `${rotate}deg`,
              zIndex: i,
              animationDelay: `${i * 0.08}s`
            }
          };
        });
      } catch {
        this.photos = [];
      }
    }
  }
};
</script>

<style scoped>
.scattered-section {
  padding: 4rem 2rem 6rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 4px;
  margin-bottom: 4rem;
  font-weight: 400;
}

.photo-desk {
  position: relative;
  height: 900px;
}

/* 单张照片容器 */
.scattered-photo {
  position: absolute;
  width: 200px;
  transform: translate(-50%, -50%) rotate(var(--rotate));
  cursor: pointer;
  animation: photo-appear 0.6s ease both;
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), z-index 0s;
}

@keyframes photo-appear {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--rotate)) scale(0.7);
  }

  to {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(var(--rotate)) scale(1);
  }
}

.scattered-photo:hover {
  z-index: 999 !important;
  transform: translate(-50%, -50%) rotate(0deg) scale(1.15);
}

/* 照片卡片（正反面） */
.photo-card {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  transition: transform 0.5s;
  transform-style: preserve-3d;
}

.photo-card.is-hovered {
  transform: rotateY(180deg);
}

.photo-front,
.photo-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 2px;
  overflow: hidden;
}

.photo-front {
  background: #fffdf5;
  padding: 8px 8px 28px;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.1);
}

.photo-front img {
  width: 100%;
  height: calc(100% - 20px);
  object-fit: cover;
  display: block;
}

.photo-back {
  background: #fffdf5;
  transform: rotateY(180deg);
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.1);
}

.photo-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.1rem;
  color: #2d2d2d;
  margin: 0 0 12px;
  line-height: 1.3;
}

.photo-date {
  font-size: 0.75rem;
  color: #999;
  margin: 0 0 16px;
  font-family: monospace;
}

.photo-caption {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.7;
  margin: 0;
  font-family: 'KaiTi', 'STKaiti', serif;
}

/* 胶带效果 */
.photo-tape {
  position: absolute;
  width: 60px;
  height: 20px;
  opacity: 0.7;
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(-2deg);
}

.tape-yellow {
  background: linear-gradient(180deg, rgba(255, 235, 150, 0.8), rgba(255, 220, 100, 0.6));
}

.tape-white {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(240, 240, 240, 0.5));
}

.tape-pink {
  background: linear-gradient(180deg, rgba(255, 200, 200, 0.7), rgba(255, 180, 180, 0.5));
}

.tape-blue {
  background: linear-gradient(180deg, rgba(200, 220, 255, 0.7), rgba(180, 200, 255, 0.5));
}

@media (max-width: 760px) {
  .scattered-photo {
    width: 140px;
  }

  .photo-desk {
    height: 700px;
  }
}
</style>
