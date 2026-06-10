<template>
  <div class="gallery-detail-page">
    <div class="content-wrapper">

      <!-- 翻页 + 歌词区 -->
      <div class="hero-section" v-if="images.length">
        <div class="hero-left">
          <FlipBook ref="flipBook" :images="images" @flip="currentIndex = $event" />
        </div>
        <div class="hero-right">
          <LyricsPanel :images="waterfallImages" :currentIndex="currentIndex" @goToPage="goToPage" />
        </div>
      </div>

      <!-- 中间信息与控制器 -->
      <MetaSection v-if="images.length"
        :title="galleryTitle"
        :description="galleryDesc"
        :isPlaying="isPlaying"
        :exifPrimary="exifPrimary"
        :exifSecondary="exifSecondary"
        :locationDate="locationDate"
        :locationName="locationName"
        @prev="prev"
        @next="next"
        @togglePlay="togglePlay" />

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
import MetaSection from './components/MetaSection.vue';
import LyricsPanel from './components/LyricsPanel.vue';

export default {
  name: 'GalleryDetail',
  components: { WaterfallCard, FlipBook, MetaSection, LyricsPanel },
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

    goToPage(idx) {
      this.currentIndex = idx;
      this.$refs.flipBook?.flip(idx * 2);
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
