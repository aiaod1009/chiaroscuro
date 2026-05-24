<template>
  <div class="gallery-detail-page">
    <div class="content-wrapper">

      <!-- 英雄图: 书本翻页效果容器 -->
      <div class="hero-viewer" ref="threeContainer" v-if="images.length">
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
import * as THREE from 'three';
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
      isFlipping: false,
      flipProgress: 0,
      targetIndex: 0,
      targetAngle: 0,
      animationFrameId: null,
      lastFrameTime: 0
    }
  },
  async mounted() {
    const mapCode = this.$route.params.id;
    try {
      const { data } = await axios.get(`/api/photos/gallery/${mapCode}`);
      if (data.success && data.data.photos.length) {
        const photos = data.data.photos;
        this.images = photos.map(p => p.src);
        this.waterfallImages = photos.map(p => ({ id: p.id, src: p.src, alt: p.alt }));
        this.galleryTitle = data.data.title;

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
        this.locationName = data.data.title;
      }
    } catch (err) {
      console.error('[GalleryDetail] 加载失败:', err.message);
    }

    if (this.images.length) {
      await this.$nextTick();
      this.initThree();
    }
    window.addEventListener('resize', this.onResize);
  },
  methods: {
    initThree() {
      const container = this.$refs.threeContainer;
      if (!container) return;

      this.scene = new THREE.Scene();

      const aspect = container.clientWidth / container.clientHeight;
      this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
      this.camera.position.z = 13;

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(this.renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      this.scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
      dirLight.position.set(5, 5, 10);
      this.scene.add(dirLight);

      // Preload textures
      const loader = new THREE.TextureLoader();
      this.textures = this.images.map(url => {
        const tex = loader.load(url, () => {
          if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
          }
        });
        tex.colorSpace = THREE.SRGBColorSpace;

        // Clone independently for left and right pages
        const texLeft = tex.clone();
        const texRight = tex.clone();

        texLeft.needsUpdate = true;
        texRight.needsUpdate = true;

        texLeft.repeat.set(0.5, 1);
        texLeft.offset.set(0, 0);

        texRight.repeat.set(0.5, 1);
        texRight.offset.set(0.5, 0);

        return { left: texLeft, right: texRight };
      });

      // Book geometry and materials
      const pageHeight = 6.2;
      const pageWidth = 4.4;
      const pageGeometry = new THREE.PlaneGeometry(pageWidth, pageHeight);
      const flipGeometry = new THREE.PlaneGeometry(pageWidth, pageHeight);
      flipGeometry.translate(pageWidth / 2, 0, 0);

      this.matStaticLeft = new THREE.MeshStandardMaterial({
        map: this.textures[this.currentIndex].left,
        side: THREE.DoubleSide
      });
      this.matStaticRight = new THREE.MeshStandardMaterial({
        map: this.textures[this.currentIndex].right,
        side: THREE.DoubleSide
      });
      this.matFlipFront = new THREE.MeshStandardMaterial({
        map: this.textures[this.currentIndex].right,
        side: THREE.DoubleSide
      });
      this.matFlipBack = new THREE.MeshStandardMaterial({
        map: this.textures[this.currentIndex].left,
        side: THREE.DoubleSide
      });

      this.staticLeftMesh = new THREE.Mesh(pageGeometry, this.matStaticLeft);
      this.staticRightMesh = new THREE.Mesh(pageGeometry, this.matStaticRight);
      this.staticLeftMesh.position.x = -pageWidth / 2;
      this.staticRightMesh.position.x = pageWidth / 2;
      this.scene.add(this.staticLeftMesh);
      this.scene.add(this.staticRightMesh);

      this.flippingGroup = new THREE.Group();
      this.flipFrontMesh = new THREE.Mesh(flipGeometry, this.matFlipFront);
      this.flipBackMesh = new THREE.Mesh(flipGeometry, this.matFlipBack);
      this.flipBackMesh.rotation.y = Math.PI;
      this.flippingGroup.add(this.flipFrontMesh);
      this.flippingGroup.add(this.flipBackMesh);
      this.flippingGroup.visible = false;
      this.scene.add(this.flippingGroup);

      this.animate = this.animate.bind(this);
      this.lastFrameTime = performance.now();
      this.animate();
    },
    animate(now) {
      if (!this.renderer || !this.scene || !this.camera) return;
      this.animationFrameId = requestAnimationFrame(this.animate);

      const currentTime = typeof now === 'number' ? now : performance.now();
      const delta = Math.min((currentTime - this.lastFrameTime) / 1000, 0.05);
      this.lastFrameTime = currentTime;

      if (this.isFlipping) {
        this.flipProgress = Math.min(this.flipProgress + delta * 1.2, 1);

        // Cubic ease-out
        const ease = 1 - Math.pow(1 - this.flipProgress, 3);

        if (this.targetAngle === -Math.PI) {
          // Flipping Right -> Left
          this.flippingGroup.rotation.y = -Math.PI * ease;
        } else {
          // Flipping Left -> Right
          this.flippingGroup.rotation.y = -Math.PI * (1 - ease);
        }

        if (this.flipProgress >= 1) {
          this.flipProgress = 1;
          this.isFlipping = false;
          this.currentIndex = this.targetIndex;
          this.flippingGroup.rotation.y = this.targetAngle;
          this.flippingGroup.visible = false;
          this.matStaticLeft.map = this.textures[this.currentIndex].left;
          this.matStaticRight.map = this.textures[this.currentIndex].right;
        }
      }

      this.renderer.render(this.scene, this.camera);
    },
    onResize() {
      const container = this.$refs.threeContainer;
      if (!container || !this.renderer || !this.camera) return;
      const aspect = container.clientWidth / container.clientHeight;
      this.camera.aspect = aspect;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    },
    getDirection(curr, next) {
      const len = this.images.length;
      if (next === (curr + 1) % len) return 'next';
      if (next === (curr - 1 + len) % len) return 'prev';
      return next > curr ? 'next' : 'prev';
    },
    goToIndex(nextIndex) {
      if (this.isFlipping || nextIndex === this.currentIndex) return;

      this.targetIndex = nextIndex;
      const isNext = this.getDirection(this.currentIndex, nextIndex) === 'next';

      const currentTex = this.textures[this.currentIndex];
      const nextTex = this.textures[nextIndex];

      this.flippingGroup.visible = true;

      // Adjust textures based on direction
      if (isNext) {
        this.matStaticLeft.map = currentTex.left;
        this.matStaticRight.map = nextTex.right;

        this.flippingGroup.rotation.y = 0;
        this.matFlipFront.map = currentTex.right;
        this.matFlipBack.map = nextTex.left;

        this.targetAngle = -Math.PI;
      } else {
        this.matStaticLeft.map = nextTex.left;
        this.matStaticRight.map = currentTex.right;

        this.flippingGroup.rotation.y = -Math.PI;
        this.matFlipBack.map = currentTex.left;
        this.matFlipFront.map = nextTex.right;

        this.targetAngle = 0;
      }

      this.flipProgress = 0;
      this.isFlipping = true;
    },
    next() {
      this.goToIndex((this.currentIndex + 1) % this.images.length);
    },
    prev() {
      this.goToIndex((this.currentIndex - 1 + this.images.length) % this.images.length);
    },
    setIndex(idx) {
      this.goToIndex(idx % this.images.length);
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
    window.removeEventListener('resize', this.onResize);

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.scene) {
      this.scene.clear();
    }
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
