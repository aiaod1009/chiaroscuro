<template>
  <div class="gallery-detail-page">
    <div class="content-wrapper">

      <!-- 英雄图: 书本翻页效果容器 -->
      <div class="hero-viewer">
        <!-- 通过绑定 :name 实现根据前后点击的不同应用不同的 3D 翻页方向 -->
        <transition :name="flipDirection">
          <div class="image-slide" :key="currentIndex">
            <img :src="images[currentIndex]" alt="Gallery Hero" class="hero-img" />
          </div>
        </transition>
      </div>

      <!-- 中间信息与控制器 -->
      <div class="meta-section">
        <div class="meta-left">
          <div class="volume-label">CHRONICLE VOLUME 04</div>
          <h1 class="gallery-title">极境之蓝</h1>
          <p class="gallery-desc">在极地之缘，光影以一种近乎神圣的方式流淌。每一粒冰晶都折射着时间的厚度。</p>
        </div>

        <div class="meta-center">
          <!-- 播放器式控件 -->
          <div class="player-controls">
            <div class="player-box">
              <button class="icon-btn" @click="prev">&lt;</button>
              <button class="play-btn" @click="togglePlay" :class="{ playing: isPlaying }">
                <span class="play-icon">{{ isPlaying ? '||' : '▶' }}</span>
              </button>
              <button class="icon-btn" @click="next">&gt;</button>

              <div class="player-text">
                <div class="p-title">GALLERY AUTOPLAY</div>
                <div class="p-status">{{ isPlaying ? 'Playing...' : 'Ready to browse' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="meta-right">
          <div class="meta-block">
            <div class="m-label">EXIF DATA</div>
            <div class="m-val-primary">35mm f/1.4G</div>
            <div class="m-val-sec">ISO 100 | 1/500s</div>
          </div>
          <div class="meta-block">
            <div class="m-label">LOCATION</div>
            <div class="m-val-primary">Dec 14, 2023</div>
            <div class="m-val-sec">Vatnajökull, ISL</div>
          </div>
        </div>
      </div>

      <!-- 瀑布流画廊长廊 -->
      <div class="waterfall-section">
        <div class="w-header">
          <div class="w-text">
            <h2>影像长廊</h2>
            <p>片段式捕捉，串联起旅途中的视觉诗篇。每一张影像都是时空坐标上的一次精准锚定。</p>
          </div>
          <div class="w-actions">
            <button class="pill-btn">Filters</button>
            <button class="pill-btn active">Grid View</button>
          </div>
        </div>

        <div class="masonry-grid">
          <div class="masonry-item" v-for="(img, idx) in waterfallImages" :key="idx"
            @click="$router.push({ path: `/photo-detail/${idx + 1}`, query: { src: img } })">
            <img :src="img" alt="Waterfall Image" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'GalleryDetail',
  data() {
    return {
      currentIndex: 0,
      isPlaying: false,
      autoPlayTimer: null,
      flipDirection: 'page-next',
      images: [
        '/DSC_6174.jpg',
        '/DSC_6510.jpg',
        '/DSC_6760.JPG'
      ],
      // 为了让瀑布流展示出效果，用现有图片打乱顺序模拟稍长的列表
      waterfallImages: [
        '/DSC_6174.jpg',
        '/DSC_6510.jpg',
        '/DSC_6760.JPG',
        '/DSC_6510.jpg',
        '/DSC_6760.JPG',
        '/DSC_6174.jpg'
      ]
    }
  },
  methods: {
    next() {
      this.flipDirection = 'page-next';
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    },
    prev() {
      this.flipDirection = 'page-prev';
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    },
    setIndex(idx) {
      if (idx === this.currentIndex) return;
      this.flipDirection = idx > this.currentIndex ? 'page-next' : 'page-prev';
      this.currentIndex = idx % this.images.length;
      // 选取底部的长廊图片时自动滚动回顶部查看翻倒动画
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    togglePlay() {
      this.isPlaying = !this.isPlaying;
      if (this.isPlaying) {
        this.next(); // 先跳转下一张再开启计时器
        this.autoPlayTimer = setInterval(this.next, 3000);
      } else {
        clearInterval(this.autoPlayTimer);
      }
    }
  },
  unmounted() {
    if (this.autoPlayTimer) clearInterval(this.autoPlayTimer);
  }
}
</script>

<style scoped>
.gallery-detail-page {
  background-color: #0b101e;
  min-height: 100vh;
  margin-top: -5rem;
  padding-top: 8rem;
  padding-bottom: 5rem;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 书本 3D 容器 */
.hero-viewer {
  width: 100%;
  height: 60vh;
  min-height: 500px;
  position: relative;
  perspective: 2500px;
  border-radius: 24px;
}

/* 单张被当做跨页书页的图 */
.image-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5), 0 30px 60px rgba(0, 0, 0, 0.8);
  background-color: #1a202c;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 伪造的书本中缝和阴影 */
.image-slide::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 60px;
  transform: translateX(-50%);
  background: linear-gradient(to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(0, 0, 0, 0.3) 40%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(0, 0, 0, 0.3) 60%,
      rgba(255, 255, 255, 0) 100%);
  z-index: 10;
  pointer-events: none;
}

/* 翻页动画：中心轴旋转模拟翻书 */
.page-next-enter-active,
.page-next-leave-active {
  transition: all 1.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.page-next-enter-from {
  transform: rotateY(90deg) scale(0.92);
  transform-origin: 50% 50%;
  opacity: 0;
}

.page-next-leave-to {
  transform: rotateY(-90deg) scale(0.92);
  transform-origin: 50% 50%;
  opacity: 0;
}

.page-prev-enter-active,
.page-prev-leave-active {
  transition: all 1.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.page-prev-enter-from {
  transform: rotateY(-90deg) scale(0.92);
  transform-origin: 50% 50%;
  opacity: 0;
}

.page-prev-leave-to {
  transform: rotateY(90deg) scale(0.92);
  transform-origin: 50% 50%;
  opacity: 0;
}

/* 元数据与播放器区 */
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
  /* 向下微调以居中对齐左侧排版 */
}

/* 右侧 Meta */
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

/* 播放控件 */
.player-controls {
  display: inline-block;
}

.player-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  display: flex;
  align-items: center;
  padding: 0.5rem 1.5rem 0.5rem 0.5rem;
  backdrop-filter: blur(10px);
}

.icon-btn {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.3s;
}

.icon-btn:hover {
  opacity: 0.7;
}

.play-btn {
  background: #d4f4f0;
  color: #000;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  font-size: 0.9rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0.5rem;
  cursor: pointer;
  box-shadow: 0 0 15px rgba(0, 224, 198, 0.4);
  transition: all 0.3s;
}

.play-btn:hover {
  box-shadow: 0 0 25px rgba(0, 224, 198, 0.8);
  transform: scale(1.05);
}

.play-icon {
  margin-left: 2px;
}

.player-text {
  margin-left: 1.5rem;
  display: flex;
  flex-direction: column;
}

.p-title {
  font-size: 0.65rem;
  color: #8c9baf;
  letter-spacing: 1.5px;
  font-weight: bold;
}

.p-status {
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 0.2rem;
  color: #e2e8f0;
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

/* 瀑布流长廊 */
.waterfall-section {
  margin-top: 5rem;
}

.w-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 3rem;
}

.w-text h2 {
  font-size: 1.8rem;
  margin: 0 0 0.5rem;
}

.w-text p {
  color: #a0aec0;
  font-size: 0.95rem;
  max-width: 500px;
  line-height: 1.6;
}

.w-actions {
  display: flex;
  gap: 1rem;
}

.pill-btn {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e0;
  padding: 0.6rem 2rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.pill-btn:hover,
.pill-btn.active {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
  color: #fff;
}

/* 瀑布流 Grid */
.masonry-grid {
  column-count: 3;
  column-gap: 20px;
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.4s;
}

.masonry-item img {
  width: 100%;
  display: block;
  transition: transform 0.4s;
}

.masonry-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.masonry-item:hover img {
  transform: scale(1.05);
}

@media (max-width: 1024px) {
  .meta-section {
    flex-direction: column;
    gap: 2rem;
  }

  .meta-right {
    justify-content: flex-start;
  }

  .w-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .masonry-grid {
    column-count: 2;
  }
}

@media (max-width: 600px) {
  .masonry-grid {
    column-count: 1;
  }
}
</style>
