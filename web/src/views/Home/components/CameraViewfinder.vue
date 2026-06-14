<template>
  <section class="viewfinder-section">
    <div class="viewfinder" :class="{ 'is-shooting': isShooting }">
      <!-- 外框 -->
      <div class="vf-body">
        <!-- 照片区 -->
        <div class="vf-screen">
          <transition name="vf-fade">
            <img v-if="currentPhoto" :key="currentPhoto.id" :src="currentPhoto.src" :alt="currentPhoto.title" class="vf-image" />
          </transition>

          <!-- 取景器叠加层 -->
          <div class="vf-overlay">
            <!-- 九宫格 -->
            <div class="vf-grid">
              <div class="vf-grid-line vh"></div>
              <div class="vf-grid-line vh" style="left: 66.66%"></div>
              <div class="vf-grid-line hh"></div>
              <div class="vf-grid-line hh" style="top: 66.66%"></div>
            </div>

            <!-- 对焦点 -->
            <div class="vf-focus-point">
              <div class="vf-focus-corner tl"></div>
              <div class="vf-focus-corner tr"></div>
              <div class="vf-focus-corner bl"></div>
              <div class="vf-focus-corner br"></div>
            </div>

            <!-- 角落标记 -->
            <div class="vf-corner-mark tl">┌</div>
            <div class="vf-corner-mark tr">┐</div>
            <div class="vf-corner-mark bl">└</div>
            <div class="vf-corner-mark br">┘</div>
          </div>

          <!-- EXIF 信息 -->
          <div class="vf-info-top">
            <span class="vf-dot"></span>
            <span>{{ currentPhoto ? currentPhoto.title : '' }}</span>
          </div>
          <div class="vf-info-bottom">
            <span>{{ exifText }}</span>
            <span class="vf-counter">{{ currentIndex + 1 }}/{{ photos.length }}</span>
          </div>
        </div>

        <!-- 快门按钮 -->
        <button class="vf-shutter" @click="shoot" :disabled="isShooting">
          <div class="vf-shutter-ring">
            <div class="vf-shutter-btn"></div>
          </div>
        </button>
      </div>

      <!-- 侧面拨轮 -->
      <div class="vf-dial">
        <div class="vf-dial-notch" v-for="n in 8" :key="n"></div>
      </div>
    </div>
  </section>
</template>

<script>
import { fetchPhotosByRegion } from '../../../utils/photoApi';

export default {
  name: 'CameraViewfinder',
  data() {
    return {
      photos: [],
      currentIndex: 0,
      isShooting: false,
      timer: null
    };
  },
  computed: {
    currentPhoto() {
      return this.photos[this.currentIndex] || null;
    },
    exifText() {
      if (!this.currentPhoto?.exif) return '';
      const e = this.currentPhoto.exif;
      const parts = [];
      if (e.aperture && e.aperture !== 'f/0.0') parts.push(e.aperture);
      if (e.shutterSpeed && e.shutterSpeed !== 'Unknown') parts.push(e.shutterSpeed);
      if (e.iso && e.iso !== '0') parts.push(`ISO${e.iso}`);
      if (e.focalLength && e.focalLength !== 'Unknown') parts.push(e.focalLength);
      return parts.join(' · ') || '';
    }
  },
  async mounted() {
    await this.loadPhotos();
    this.timer = setInterval(this.nextPhoto, 4000);
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  methods: {
    async loadPhotos() {
      try {
        const res = await fetchPhotosByRegion('CN', 1, 50);
        const all = res?.photos || [];
        this.photos = all.filter(p => p.src).sort(() => Math.random() - 0.5).slice(0, 20);
      } catch {
        this.photos = [];
      }
    },
    nextPhoto() {
      if (!this.photos.length) return;
      this.currentIndex = (this.currentIndex + 1) % this.photos.length;
    },
    shoot() {
      if (this.isShooting || !this.currentPhoto) return;
      this.isShooting = true;

      // 快门动画后跳转
      setTimeout(() => {
        this.isShooting = false;
        this.$router.push(`/photo-detail/${this.currentPhoto.id}`);
      }, 600);
    }
  }
};
</script>

<style scoped>
.viewfinder-section {
  display: flex;
  justify-content: center;
  padding: 6rem 2rem 4rem;
}

.viewfinder {
  display: flex;
  align-items: center;
  gap: 0;
}

.vf-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

/* 取景器屏幕 */
.vf-screen {
  position: relative;
  width: min(72vw, 640px);
  aspect-ratio: 3/2;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #2a2a2a;
  box-shadow:
    inset 0 0 30px rgba(0, 0, 0, 0.5),
    0 8px 32px rgba(0, 0, 0, 0.4);
}

.vf-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 切换动画 */
.vf-fade-enter-active,
.vf-fade-leave-active {
  transition: opacity 0.8s ease;
}
.vf-fade-enter-from,
.vf-fade-leave-to {
  opacity: 0;
}
.vf-fade-leave-active {
  position: absolute;
  inset: 0;
}

/* 取景器叠加层 */
.vf-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* 九宫格 */
.vf-grid-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.12);
}
.vf-grid-line.vh {
  top: 0;
  bottom: 0;
  left: 33.33%;
  width: 1px;
}
.vf-grid-line.hh {
  left: 0;
  right: 0;
  top: 33.33%;
  height: 1px;
}

/* 对焦点 */
.vf-focus-point {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
}

.vf-focus-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  border-color: rgba(255, 255, 255, 0.7);
  border-style: solid;
  border-width: 0;
}
.vf-focus-corner.tl { top: 0; left: 0; border-top-width: 2px; border-left-width: 2px; }
.vf-focus-corner.tr { top: 0; right: 0; border-top-width: 2px; border-right-width: 2px; }
.vf-focus-corner.bl { bottom: 0; left: 0; border-bottom-width: 2px; border-left-width: 2px; }
.vf-focus-corner.br { bottom: 0; right: 0; border-bottom-width: 2px; border-right-width: 2px; }

/* 角落标记 */
.vf-corner-mark {
  position: absolute;
  color: rgba(255, 255, 255, 0.2);
  font-size: 1.5rem;
  font-family: monospace;
  line-height: 1;
}
.vf-corner-mark.tl { top: 8px; left: 10px; }
.vf-corner-mark.tr { top: 8px; right: 10px; }
.vf-corner-mark.bl { bottom: 8px; left: 10px; }
.vf-corner-mark.br { bottom: 8px; right: 10px; }

/* 信息文字 */
.vf-info-top,
.vf-info-bottom {
  position: absolute;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.5px;
  pointer-events: none;
}
.vf-info-top {
  top: 12px;
}
.vf-info-bottom {
  bottom: 12px;
}

.vf-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e53e3e;
  margin-right: 8px;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.vf-counter {
  color: rgba(255, 255, 255, 0.4);
}

/* 快门按钮 */
.vf-shutter {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: transform 0.1s;
}
.vf-shutter:active {
  transform: scale(0.92);
}
.vf-shutter:disabled {
  cursor: not-allowed;
}

.vf-shutter-ring {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 3px solid #555;
  display: grid;
  place-items: center;
  transition: border-color 0.2s;
}
.vf-shutter:hover .vf-shutter-ring {
  border-color: #999;
}

.vf-shutter-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(145deg, #666, #444);
  border: 2px solid #555;
  transition: background 0.2s;
}
.vf-shutter:hover .vf-shutter-btn {
  background: linear-gradient(145deg, #777, #555);
}

/* 快门动画 */
.is-shooting .vf-screen {
  animation: shutter-flash 0.6s ease;
}

@keyframes shutter-flash {
  0% { filter: brightness(1); }
  15% { filter: brightness(0.1); }
  30% { filter: brightness(1.2); }
  100% { filter: brightness(1); }
}

/* 侧面拨轮 */
.vf-dial {
  width: 28px;
  height: 80px;
  background: linear-gradient(180deg, #4a4a4a, #333, #4a4a4a);
  border-radius: 4px;
  margin-left: -2px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  border: 1px solid #555;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
}

.vf-dial-notch {
  width: 18px;
  height: 2px;
  background: #666;
  border-radius: 1px;
}

@media (max-width: 760px) {
  .vf-screen {
    width: min(92vw, 400px);
  }
}
</style>
