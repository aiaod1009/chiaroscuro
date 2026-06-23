<template>
  <div class="timeline-section">
    <div class="timeline-header">
      <h2 class="section-title">Blogs & Timeline</h2>
      <span class="latest-entries">LATEST ENTRIES</span>
    </div>

    <div class="timeline-container">
      <div class="vertical-line"></div>

      <div class="timeline-item" v-for="(blog, index) in blogs" :key="blog.id || index">
        <div class="timeline-left">
          <span class="time-label">{{ timeLabels[index] }}</span>
          <div class="dot"></div>
        </div>

        <div class="timeline-right">
          <router-link v-if="blog.image" :to="`/gallery-detail/${blog.id}`">
            <img :src="blog.image" alt="blog cover" class="blog-img" loading="lazy" />
          </router-link>
          <div v-else class="blog-img-placeholder">暂无图片</div>
          <div class="blog-content">
            <div class="blog-meta">
              <span class="date">{{ blog.date }}</span>
              <span class="separator">•</span>
              <span class="category">{{ blog.category }}</span>
            </div>
            <h3 class="blog-title">{{ blog.title }}</h3>
            <p class="blog-desc">{{ blog.desc }}</p>
            <router-link :to="`/gallery-detail/${blog.id}`" class="view-entry">View Entry &rarr;</router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="load-more" v-if="showLoadMore">
      <button class="load-btn" @click="$emit('loadMore')">LOAD OLDER ARCHIVES</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BlogTimeline',
  props: {
    blogs: { type: Array, required: true },
    timeLabels: { type: Array, default: () => [] },
    showLoadMore: { type: Boolean, default: true }
  },
  emits: ['loadMore']
}
</script>

<style scoped>
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

.vertical-line {
  position: absolute;
  left: 60px;
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

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #64748b;
}

.timeline-item:hover .dot {
  background-color: #e2e8f0;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
}

.timeline-item:hover .time-label {
  color: #e2e8f0;
}

.timeline-right {
  flex: 1;
  display: flex;
  gap: 2.5rem;
  align-items: center;
  margin-left: 40px;
}

.blog-img-placeholder {
  width: 320px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  color: #64748b;
  font-size: 0.9rem;
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
}

.blog-meta .separator {
  color: #4a5568;
  margin: 0 0.5rem;
}

.blog-meta .category {
  color: #63b3ed;
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
  .timeline-header {
    margin-left: 0;
  }

  .timeline-right {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .blog-img,
  .blog-img-placeholder {
    width: 100%;
    height: auto;
    aspect-ratio: 16/9;
  }
}
</style>
