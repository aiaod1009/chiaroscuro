<template>
  <footer class="app-footer">
    <div class="footer-container">
      <!-- 列 1：品牌信息 -->
      <div class="footer-col brand-col">
        <h2 class="brand-name">光影纪 LUMEN CHRONICLES</h2>
        <p class="brand-desc">
          记录光影随时间流逝的痕迹，在数字与现实的边缘探索<br />
          摄影的无限可能。
        </p>
        <div class="social-icons">
          <a href="#" aria-label="Instagram" class="icon-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a href="#" aria-label="Twitter" class="icon-link">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22 4.01c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C17.9 2.5 16.8 2 15.6 2c-2.34 0-4.24 1.9-4.24 4.24 0 .33.04.66.11.97-3.52-.18-6.65-1.87-8.74-4.43-.37.63-.58 1.37-.58 2.14 0 1.47.75 2.77 1.89 3.53-.7-.02-1.36-.21-1.93-.53v.05c0 2.07 1.47 3.79 3.42 4.19-.36.1-.73.15-1.11.15-.27 0-.54-.03-.8-.08.54 1.7 2.12 2.93 3.99 2.96-1.46 1.15-3.3 1.83-5.3 1.83-.34 0-.68-.02-1.01-.06C3.9 19.83 6.13 21 8.5 21c10.2 0 15.77-8.45 15.77-15.77 0-.24-.01-.48-.02-.72.81-.59 1.52-1.32 2.08-2.14z" />
            </svg>
          </a>
        </div>
      </div>

      <!-- 列 2：导航链接 -->
      <div class="footer-col links-col">
        <h3 class="col-title">NAVIGATE</h3>
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/archive">Archive</router-link></li>
          <li><router-link to="/footprints">Footprints</router-link></li>
        </ul>
      </div>

      <!-- 列 3：社交外链 -->
      <div class="footer-col links-col">
        <h3 class="col-title">CONNECT</h3>
        <ul>
          <li><a href="https://github.com/aiaod1009" target="_blank">GitHub</a></li>
          <li><a href="https://aiaod.cn" target="_blank">Blog</a></li>
        </ul>
      </div>

      <!-- 列 4：联系与版权 -->
      <div class="footer-col contact-col">
        <h3 class="col-title">LET'S WORK TOGETHER</h3>
        <a href="mailto:3449508132@qq.com" class="contact-btn">CONTACT ME</a>
        <p class="copyright">© 2026 Chiaroscuro. Captured in Light.</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
};
</script>

<style scoped>
.app-footer {
  background-color: #0b101e;
  /* 设计稿的深蓝/深灰色底 */
  color: #ffffff;
  padding: 4rem 2rem 2rem 2rem;
  font-family: inherit;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 2rem;
  align-items: start;
}

.footer-col {
  display: flex;
  flex-direction: column;
}

/* 列 1 样式 */
.brand-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  letter-spacing: 1px;
}

.brand-desc {
  font-size: 0.85rem;
  color: #a0aec0;
  /* 灰白色文本 */
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

.social-icons {
  display: flex;
  gap: 1rem;
}

.icon-link {
  color: #ffffff;
  width: 20px;
  height: 20px;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.icon-link:hover {
  opacity: 1;
}

/* 列 2 & 列 3 样式 */
.col-title {
  font-size: 0.75rem;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 1.5rem 0;
  font-weight: 500;
}

.links-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.links-col a {
  color: #ffffff;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.3s;
}

.links-col a:hover {
  color: #dce3ff;
}

/* 列 4 样式 */
.contact-col {
  align-items: flex-start;
}

.contact-btn {
  background-color: #dce3ff;
  /* 浅紫蓝色 */
  color: #1a202c;
  border: none;
  border-radius: 999px;
  /* 胶囊形状 */
  padding: 0.875rem 2.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(220, 227, 255, 0.15);
  /* 发光效果 */
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 2rem;
}

.contact-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 25px rgba(220, 227, 255, 0.3);
}

.copyright {
  font-size: 0.75rem;
  color: #718096;
  margin: 0;
}

/* 响应式调整 */
@media (max-width: 900px) {
  .footer-container {
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }
}

@media (max-width: 600px) {
  .footer-container {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
}
</style>
