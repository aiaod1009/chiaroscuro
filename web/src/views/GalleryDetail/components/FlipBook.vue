<template>
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
</template>

<script>
import { PageFlip } from 'page-flip';

export default {
  name: 'FlipBook',
  props: {
    images: { type: Array, required: true }
  },
  emits: ['flip'],
  data() {
    return {
      flipBook: null,
    }
  },
  mounted() {
    if (this.images.length) {
      this.$nextTick(() => this.initFlipBook());
    }
    window.addEventListener('resize', this.onResize);
  },
  watch: {
    images: {
      handler(val) {
        if (val.length) {
          if (this.flipBook) {
            this.flipBook.destroy();
            this.flipBook = null;
          }
          this.$nextTick(() => this.initFlipBook());
        }
      },
    },
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
        this.$emit('flip', Math.floor(e.data / 2));
      });
    },

    onResize() {
      if (!this.flipBook || !this.$refs.flipBook) return;
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

    getCurrentPageIndex() {
      return this.flipBook ? this.flipBook.getCurrentPageIndex() : 0;
    },

    flip(pageIndex) {
      if (this.flipBook) this.flipBook.flip(pageIndex);
    },
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.onResize);
    if (this.flipBook) this.flipBook.destroy();
  },
}
</script>

<style scoped>
.hero-viewer {
  width: 100%;
  aspect-ratio: 3 / 2;
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
  background-size: cover;
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
</style>
