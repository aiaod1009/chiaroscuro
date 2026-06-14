<template>
  <div class="archive-page page-bg">
    <div class="archive-wrapper">
      <!-- 头部标题区 -->
      <div class="header-section">
        <div class="header-left">
          <h1 class="page-title">时光档案</h1>
          <div class="page-subtitle">VISUAL ARCHIVE PORTFOLIO</div>
        </div>
        <div class="header-right">
          捕捉那些转瞬即逝的真实时刻。从人像到风景，我致力于创<br>造能够引起深层共鸣的视觉影像。
        </div>
      </div>

      <!-- 画廊 手风琴区 -->
      <AccordionGallery :images="gallery" :active-index="activeGallery" @update:activeIndex="activeGallery = $event" />

      <!-- 博客 & 时间轴 -->
      <BlogTimeline :blogs="blogs" :timeLabels="timelinePoints" />
    </div>
  </div>
</template>

<script>
import AccordionGallery from './components/AccordionGallery.vue';
import BlogTimeline from './components/BlogTimeline.vue';
import { fetchWorks } from '../../utils/photoApi';

export default {
  name: 'ArchiveView',
  components: { AccordionGallery, BlogTimeline },
  data() {
    return {
      activeGallery: 0,
      gallery: [],
      timelinePoints: [],
      blogs: []
    }
  },
  async mounted() {
    try {
      const works = await fetchWorks();
      if (works.length) {
        this.gallery = works
          .filter(w => w.coverImage)
          .map(w => ({ id: w._id, url: w.coverImage }));
        this.timelinePoints = works.map(w => {
          const d = new Date(w.realDate || w.createdAt);
          return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }).toUpperCase();
        });
        this.blogs = works.map(w => ({
          id: w._id,
          date: new Date(w.realDate || w.createdAt).toISOString().split('T')[0],
          category: 'Photography',
          title: w.name,
          desc: w.description || '',
          image: w.coverImage || ''
        }));
      }
    } catch (err) {
      console.error('[Archive] 加载失败:', err);
    }
  }
}
</script>

<style scoped>
.archive-page {
  margin-top: -5rem;
  padding-top: 8rem;
  padding-bottom: 5rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.archive-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 头部样式 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 3rem;
  font-style: italic;
  font-weight: 900;
  margin: 0 0 0.5rem;
  letter-spacing: 2px;
}

.page-subtitle {
  color: #8c9baf;
  font-size: 0.85rem;
  letter-spacing: 2px;
  font-weight: 600;
}

.header-right {
  text-align: right;
  color: #cbd5e0;
  font-size: 0.9rem;
  line-height: 1.8;
  max-width: 400px;
}

@media (max-width: 1024px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .header-right {
    text-align: left;
  }
}
</style>
