<template>
  <div class="archive-page">
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
      <AccordionGallery :images="gallery" :active-index="activeGallery"
        @update:activeIndex="activeGallery = $event" />

      <!-- 博客 & 时间轴 -->
      <div class="timeline-section">
        <div class="timeline-header">
          <h2 class="section-title">Blogs & Timeline</h2>
          <span class="latest-entries">LATEST ENTRIES</span>
        </div>

        <div class="timeline-container">
          <!-- 绝对定位的垂直轨迹线 -->
          <div class="vertical-line"></div>

          <div class="timeline-item" v-for="(blog, index) in blogs" :key="index">
            <!-- 左侧：时间点 -->
            <div class="timeline-left">
              <span class="time-label" :class="{ active: index === 0 }">{{ timelinePoints[index] }}</span>
              <div class="dot" :class="{ active: index === 0 }"></div>
            </div>

            <!-- 右侧：博客卡片 -->
            <div class="timeline-right">
              <img :src="blog.image" alt="blog cover" class="blog-img" />
              <div class="blog-content">
                <div class="blog-meta">
                  <span class="date">{{ blog.date }}</span>
                  <span class="separator">•</span>
                  <span class="category">{{ blog.category }}</span>
                </div>
                <h3 class="blog-title">{{ blog.title }}</h3>
                <p class="blog-desc">{{ blog.desc }}</p>
                <!-- 改为 router-link 跳转详情页 -->
                <router-link :to="`/gallery-detail/${index + 1}`" class="view-entry">View Entry &rarr;</router-link>
              </div>
            </div>
          </div>
        </div>

        <div class="load-more">
          <button class="load-btn">LOAD OLDER ARCHIVES</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AccordionGallery from './components/AccordionGallery.vue';

export default {
  name: 'ArchiveView',
  components: { AccordionGallery },
  data() {
    return {
      activeGallery: 0,
      gallery: [
        '/DSC_6174.jpg',
        '/DSC_6510.jpg',
        '/DSC_6760.JPG',
        '/DSC_6174.jpg',
        '/DSC_6510.jpg',
        '/DSC_6760.JPG',
        '/DSC_6174.jpg',
        '/DSC_6510.jpg'
      ],
      timelinePoints: ['Jun 2025', 'Mar 2025', 'Oct 2024', 'Sep 2024', 'Feb 2024'],
      blogs: [
        {
          date: '2024-07-09',
          category: 'Photography',
          title: 'Beyond Light and Shadow',
          desc: 'In an era where technology rapidly reshapes the way we capture the world, photography stands at a fascinating crossroads. Beyond the advances in equipment and software lie...',
          image: '/DSC_6174.jpg'
        },
        {
          date: '2024-05-22',
          category: 'Personal',
          title: 'Photography and Self-Expression',
          desc: 'Finding your own perspective in a world saturated with images. It\'s not about what you see, but how you feel it. Exploring the internal landscapes through external triggers.',
          image: '/DSC_6510.jpg'
        },
        {
          date: '2024-03-15',
          category: 'Travel',
          title: 'The Nordic Silence',
          desc: 'Measuring the world through the lens. From the busy streets of Tokyo to the silent plains of Iceland, every journey is a frame waiting to be captured.',
          image: '/DSC_6760.JPG'
        },
        {
          date: '2024-01-05',
          category: 'Process',
          title: 'From Shutter to Post-Process',
          desc: 'The beauty of the entire photography process. Why post-processing is the second half of the creative act, not just fixing mistakes.',
          image: '/DSC_6174.jpg'
        }
      ]
    }
  }
}
</script>

<style scoped>
.archive-page {
  background-color: #0b101e;
  min-height: 100vh;
  margin-top: -5rem;
  /* 抵消上层可能的 padding */
  padding-top: 8rem;
  padding-bottom: 5rem;
  color: #fff;
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

/* 时间轴与博客列表 */
.timeline-section {
  margin-top: 4rem;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1.5rem;
  margin-bottom: 4rem;
  margin-left: 160px;
  /* 对齐右侧的主体内容 */
}

.section-title {
  font-size: 2.2rem;
  font-style: italic;
  font-weight: bold;
  margin: 0;
  color: #fff;
}

.latest-entries {
  font-size: 0.75rem;
  letter-spacing: 1px;
  color: #a0aec0;
  font-weight: bold;
}

.timeline-container {
  display: flex;
  flex-direction: column;
  gap: 4rem;
  position: relative;
}

/* 中央时间轴刻度线 */
.vertical-line {
  position: absolute;
  left: 60px;
  /* 占 120px 宽度的一半 */
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  z-index: 0;
}

.timeline-item {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.timeline-left {
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.time-label {
  font-size: 0.75rem;
  font-weight: bold;
  color: #64748b;
  margin-bottom: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.time-label.active {
  color: #e2e8f0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #64748b;
}

.dot.active {
  background-color: #e2e8f0;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
}

.timeline-right {
  flex: 1;
  display: flex;
  gap: 2.5rem;
  align-items: center;
  margin-left: 40px;
}

.blog-img {
  width: 320px;
  height: 200px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
  filter: grayscale(0.6);
  transition: all 0.4s ease;
  cursor: pointer;
}

.timeline-item:hover .blog-img {
  filter: grayscale(0);
  transform: translateY(-5px);
}

.blog-content {
  flex: 1;
}

.blog-meta {
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 1rem;
  letter-spacing: 0.5px;
}

.blog-meta .date {
  color: #f6ad55;
  /* 橙黄色 */
}

.blog-meta .separator {
  color: #4a5568;
  margin: 0 0.5rem;
}

.blog-meta .category {
  color: #63b3ed;
  /* 浅蓝色 */
}

.blog-title {
  font-size: 1.6rem;
  font-weight: bold;
  margin: 0 0 1rem;
  color: #fff;
}

.blog-desc {
  color: #a0aec0;
  font-size: 0.95rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.view-entry {
  color: #e2e8f0;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  transition: color 0.3s;
}

.view-entry:hover {
  color: #f6ad55;
}

.load-more {
  text-align: center;
  margin-top: 6rem;
}

.load-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #a0aec0;
  padding: 1rem 3rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: all 0.3s;
}

.load-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
  color: #fff;
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

  .timeline-header {
    margin-left: 0;
  }

  .timeline-right {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .blog-img {
    width: 100%;
    height: auto;
    aspect-ratio: 16/9;
  }
}
</style>
