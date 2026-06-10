<template>
  <div class="gallery-detail-page">
    <div class="content-wrapper">

      <!-- 翻页 + 歌词区 -->
      <div class="hero-section" v-if="images.length">
        <div class="hero-left">
          <FlipBook ref="flipBook" :images="images" @flip="currentIndex = $event" />
        </div>
        <div class="hero-right">
          <div class="lyrics-scroll" ref="lyricsScroll">
            <div v-for="(img, idx) in waterfallImages" :key="img.id || idx" :ref="el => { if (el) lyricRefs[idx] = el }"
              class="lyric-item" :class="{ active: currentIndex === idx }">
              <div class="lyric-title">{{ img.title || '未命名' }}</div>
              <div class="lyric-caption">{{ img.caption || '' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间信息与控制器 -->
      <div class="meta-section" v-if="images.length">
        <div class="meta-left">
          <div class="volume-label">CHRONICLE VOLUME</div>
          <h1 class="gallery-title">{{ galleryTitle }}</h1>
          <p class="gallery-desc">{{ galleryDesc }}</p>
        </div>

        <div class="meta-center">
          <PlayerControls :isPlaying="isPlaying" @prev="prev" @next="next" @togglePlay="togglePlay" />
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
        </div>

        <div class="masonry-grid">
          <WaterfallCard v-for="(img, idx) in waterfallImages" :key="img.id || idx" :src="img.src" :alt="img.alt"
            :title="img.title" :caption="img.caption"
            @click="$router.push({ path: `/photo-detail/${img.id || idx}`, query: { src: img.src } })" />
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios';
import WaterfallCard from '../../components/WaterfallCard.vue';
import FlipBook from './components/FlipBook.vue';
import PlayerControls from './components/PlayerControls.vue';

export default {
  name: 'GalleryDetail',
  components: { WaterfallCard, FlipBook, PlayerControls },
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
      lyricRefs: {},
    }
  },
  watch: {
    currentIndex(idx) {
      this.$nextTick(() => {
        const el = this.lyricRefs[idx];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  },
  async mounted() {
    const id = this.$route.params.id;
    try {
      const { data } = await axios.get(`/api/works/${id}`);
      if (data.success) {
        const photos = (data.data.photos || []).map(p => ({
          id: p._id,
          src: p.imageUrl,
          alt: p.fileName || '',
          title: p.title,
          caption: p.caption,
          exif: p.exif,
          createdAt: p.createdAt
        }));

        if (photos.length) {
          this.images = photos.map(p => p.src);
          this.waterfallImages = photos.map(p => ({ id: p.id, src: p.src, alt: p.alt || p.fileName, title: p.title, caption: p.caption }));
          this.galleryTitle = data.data.name;

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
          this.locationName = data.data.name;
        }
      }
    } catch (err) {
      console.error('[GalleryDetail] 加载失败:', err.message);
    }
  },
  methods: {
    next() {
      this.$refs.flipBook?.next();
    },

    prev() {
      this.$refs.flipBook?.prev();
    },

    togglePlay() {
      this.isPlaying = !this.isPlaying;
      if (this.isPlaying) {
        this.next();
        this.autoPlayTimer = setInterval(() => {
          const flipBook = this.$refs.flipBook;
          if (!flipBook) return;
          const cur = flipBook.getCurrentPageIndex();
          const maxPage = (this.images.length - 1) * 2;
          if (cur >= maxPage) {
            flipBook.flip(0);
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
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 3rem;
}

/* 翻页 + 歌词区 */
.hero-section {
  display: flex;
  gap: 3rem;
  margin-bottom: 4rem;
  align-items: center;
}

.hero-left {
  flex: 0 0 58%;
}

.hero-right {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.lyrics-scroll {
  max-height: 55vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 1rem;
  width: 100%;
}

.lyrics-scroll::-webkit-scrollbar {
  width: 4px;
}

.lyrics-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}

.lyric-item {
  padding: 1rem 0;
  padding-left: 1.2rem;
  transition: all 0.4s ease;
  opacity: 0.4;
  transform: scale(0.9);
  transform-origin: center center;
}

.lyric-item.active {
  opacity: 1;
  transform: scale(1.15);
}

.lyric-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #e2e8f0;
}

.lyric-item.active .lyric-title {
  font-size: 1.4rem;
  color: #fff;
}

.lyric-caption {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.5;
}

.lyric-item.active .lyric-caption {
  font-size: 1rem;
  color: #e2e8f0;
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


/* 瀑布流 Grid */
.masonry-grid {
  column-count: 3;
  column-gap: 20px;
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
