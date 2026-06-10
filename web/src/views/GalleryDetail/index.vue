<template>
  <div class="gallery-detail-page">
    <div class="content-wrapper">

      <!-- 书本翻页效果容器 -->
      <div class="hero-viewer" v-if="images.length">
        <div class="flip-book" ref="flipBook">
          <template v-for="(url, idx) in images" :key="idx">
            <div class="flip-page">
              <div class="page-half page-left" :style="{ backgroundImage: `url(${url})` }"></div>
            </div>
            <div class="flip-page">
              <div class="page-half page-right" :style="{ backgroundImage: `url(${url})` }"></div>
            </div>
          </template>
        </div>
      </div>
      <div v-else class="hero-empty">
        <p>暂无影像数据</p>
      </div>

      <!-- 中间信息与控制器 -->
      <div class="meta-section" v-if="images.length">
        <div class="meta-left">
          <div class="volume-label">CHRONICLE VOLUME</div>
          <h1 class="gallery-title">{{ galleryTitle }}</h1>
          <p class="gallery-desc">{{ galleryDesc }}</p>
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
          <div class="masonry-item" v-for="(img, idx) in waterfallImages" :key="img.id || idx"
            @click="$router.push({ path: `/photo-detail/${img.id || idx}`, query: { src: img.src } })">
            <img :src="img.src" :alt="img.alt" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { PageFlip } from 'page-flip';
import axios from 'axios';

export default {
  name: 'GalleryDetail',
  data() {
    return {
      currentIndex: 0,
      isPlaying: false,
      autoPlayTimer: null,
      images: [],
      waterfallImages: [],
      galleryTitle: '',
      galleryDesc: '',
      exifPrimary: '',
      exifSecondary: '',
      locationDate: '',
      locationName: '',
    }
  },
  async mounted() {
    const id = this.$route.params.id;
    try {
      // 判断是作品集ID（24位十六进制）还是地区代码
      const isWorkId = /^[0-9a-fA-F]{24}$/.test(id);
      let photos, title;

      if (isWorkId) {
        // 按作品集ID获取
        const { data } = await axios.get(`/api/works/${id}`);
        if (data.success) {
          photos = data.data.photos || [];
          title = data.data.name;
          photos = photos.map(p => ({
            id: p._id,
            src: p.imageUrl,
            alt: p.fileName || '',
            exif: p.exif,
            createdAt: p.createdAt
          }));
        }
      } else {
        // 按地区代码获取
        const { data } = await axios.get(`/api/photos/gallery/${id}`);
        if (data.success) {
          photos = data.data.photos;
          title = data.data.title;
        }
      }

      if (photos && photos.length) {
        this.images = photos.map(p => p.src);
        this.waterfallImages = photos.map(p => ({ id: p.id, src: p.src, alt: p.alt }));
        this.galleryTitle = title;

        const first = photos[0];
        if (first.exif) {
          this.exifPrimary = first.exif.focalLength && first.exif.aperture
            ? `${first.exif.focalLength} ${first.exif.aperture}`
            : '';
          this.exifSecondary = [first.exif.iso && `ISO ${first.exif.iso}`, first.exif.shutterSpeed].filter(Boolean).join(' | ');
        }
        if (first.createdAt) {
          this.locationDate = new Date(first.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: '2-digit'
          });
        }
        this.locationName = title;
      }
    } catch (err) {
      console.error('[GalleryDetail] 加载失败:', err.message);
    }

    if (this.images.length) {
      await this.$nextTick();
      this.initFlipBook();
    }
    window.addEventListener('resize', this.onResize);
  },
  methods: {
    initFlipBook() {
      const container = this.$refs.flipBook;
      if (!container) return;

      const W = container.clientWidth;
      const pageW = Math.floor(W / 2);
      const pageH = container.clientHeight;

      this.flipBook = new PageFlip(container, {
        width: pageW,
        height: pageH,
        size: 'fixed',
        maxShadowOpacity: 0.5,
        showCover: false,
        mobileScrollSupport: true,
        clickEventForward: false,
        useMouseEvents: true,
        swipeDistance: 30,
        flippingTime: 800,
      });

      this.flipBook.loadFromHTML(container.querySelectorAll('.flip-page'));

      this.flipBook.on('flip', (e) => {
        this.currentIndex = Math.floor(e.data / 2);
      });
    },

    onResize() {
      if (!this.flipBook || !this.$refs.flipBook) return;
      const W = this.$refs.flipBook.clientWidth;
      const pageW = Math.floor(W / 2);
      const pageH = this.$refs.flipBook.clientHeight;
      this.flipBook.updateFromHtml(this.$refs.flipBook.querySelectorAll('.flip-page'));
    },

    next() {
      if (!this.flipBook) return;
      const cur = this.flipBook.getCurrentPageIndex();
      const target = cur + 2;
      if (target < this.images.length * 2) this.flipBook.flip(target);
    },

    prev() {
      if (!this.flipBook) return;
      const cur = this.flipBook.getCurrentPageIndex();
      const target = cur - 2;
      if (target >= 0) this.flipBook.flip(target);
    },

    togglePlay() {
      this.isPlaying = !this.isPlaying;
      if (this.isPlaying) {
        this.next();
        this.autoPlayTimer = setInterval(() => {
          const cur = this.flipBook.getCurrentPageIndex();
          const maxPage = (this.images.length - 1) * 2;
          if (cur >= maxPage) {
            this.flipBook.flip(0);
          } else {
            this.next();
          }
        }, 3000);
      } else {
        clearInterval(this.autoPlayTimer);
      }
    },
  },

  beforeUnmount() {
    if (this.autoPlayTimer) clearInterval(this.autoPlayTimer);
    window.removeEventListener('resize', this.onResize);
    if (this.flipBook) this.flipBook.destroy();
  },
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

/* 3D 图片查看器 */
.hero-viewer {
  width: 100%;
  height: 72vh;
  min-height: 520px;
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: #080d18;
}

.flip-book {
  width: 100%;
  height: 100%;
}

.flip-page {
  background: #080d18;
  overflow: hidden;
}

.flip-page img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
  user-select: none;
}

.page-half {
  width: 100%;
  height: 100%;
  background-size: 200% 100%;
  background-repeat: no-repeat;
  pointer-events: none;
  user-select: none;
}

.page-left {
  background-position: left center;
}

.page-right {
  background-position: right center;
}

.hero-empty {
  width: 100%;
  height: 40vh;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 1.1rem;
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
