<template>
  <div class="lyrics-scroll" ref="lyricsScroll">
    <div v-for="(img, idx) in images" :key="img.id || idx" :ref="el => { if (el) lyricRefs[idx] = el }"
      class="lyric-item" :class="{ active: currentIndex === idx }" @click="$emit('goToPage', idx)">
      <div class="lyric-title">{{ img.title || '未命名' }}</div>
      <div class="lyric-caption">{{ img.caption || '' }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LyricsPanel',
  props: {
    images: { type: Array, required: true },
    currentIndex: { type: Number, default: 0 }
  },
  emits: ['goToPage'],
  data() {
    return {
      lyricRefs: {}
    }
  },
  watch: {
    currentIndex(idx) {
      this.$nextTick(() => {
        const el = this.lyricRefs[idx];
        const container = this.$refs.lyricsScroll;
        if (el && container) {
          const elTop = el.offsetTop - container.offsetTop;
          const elHeight = el.offsetHeight;
          const containerHeight = container.clientHeight;
          const targetScroll = elTop - (containerHeight - elHeight) / 2;
          container.scrollTo({ top: targetScroll, behavior: 'smooth' });
        }
      });
    }
  }
}
</script>

<style scoped>
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
  cursor: pointer;
}

.lyric-item.active {
  opacity: 1;
  transform: scale(1.05);
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
</style>
