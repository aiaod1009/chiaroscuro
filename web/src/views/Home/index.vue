<template>
  <div class="home-page page-bg">
    <div class="home-container">
      <!-- 全屏背景遮罩与图片 (带淡入淡出过渡动画) -->
      <transition name="bg-fade">
        <div class="hero-bg" :key="activeCollection.image" :style="{ backgroundImage: `url(${activeCollection.image})` }">
        </div>
      </transition>

      <div class="hero-content">
        <!-- 左侧文字区域 -->
        <transition name="text-fade" mode="out-in">
          <div class="text-section" :key="activeIndex">
            <div class="pre-title">PHOTOGRAPHY / STORY / TIME</div>
            <h1 class="main-title" v-html="activeCollection.title"></h1>
            <p class="desc" v-html="activeCollection.desc"></p>
            <button class="explore-btn" @click="$router.push('/archive')">EXPLORE MY WORK &rarr;</button>
          </div>
        </transition>

        <!-- 右侧精选集卡片区域 -->
        <CollectionCards :collections="collections" :active-index="activeIndex"
          @select="selectCard" @prev="prevCard" @next="nextCard" />
      </div>
    </div>
    <CameraViewfinder />
    <ColorSpectrum />
  </div>
</template>

<script>
import CollectionCards from './components/CollectionCards.vue';
import CameraViewfinder from './components/CameraViewfinder.vue';
import ColorSpectrum from './components/ColorSpectrum.vue';

export default {
  name: 'HomeView',
  components: { CollectionCards, CameraViewfinder, ColorSpectrum },
  data() {
    return {
      activeIndex: 0,
      collections: [
        { subtitle: 'COLLECTION 01', title: '秘境之森<br>凝视万物生灵', desc: '探寻林间的微光与翠意，<br>感受大自然最原始的呼吸与宁静。', image: '/DSC_6510.jpg' },
        { subtitle: 'COLLECTION 02', title: '光影之间<br>记录世界的呼吸', desc: '十年光阴，穿行于城市与旷野之间，<br>用镜头收藏那些转瞬即逝的真实。', image: '/DSC_6174.jpg' },
        { subtitle: 'COLLECTION 03', title: '极寒构造<br>冰雪中的物理美学', desc: '在零下三十度的冰雪巨构中，<br>捕捉极致的冰棱刻线与冷酷之美。', image: '/DSC_6760.JPG' },
      ]
    };
  },
  computed: {
    activeCollection() {
      return this.collections[this.activeIndex];
    }
  },
  methods: {
    selectCard(index) {
      if (this.activeIndex !== index) {
        this.activeIndex = index;
      }
    },
    prevCard() {
      this.activeIndex = (this.activeIndex - 1 + this.collections.length) % this.collections.length;
    },
    nextCard() {
      this.activeIndex = (this.activeIndex + 1) % this.collections.length;
    }
  }
};
</script>

<style scoped>
.home-container {
  position: relative;
  min-height: 100vh;
  margin-top: -5rem;
  padding-top: 5rem;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to right, rgba(11, 16, 30, 0.95) 0%, rgba(11, 16, 30, 0.4) 50%, transparent 100%),
    linear-gradient(to bottom, transparent 60%, rgba(11, 16, 30, 0.9) 90%, #0b101e 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  width: 95%;
  max-width: 1700px;
  margin: 0 auto;
  padding: 8rem 0 2rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5%;
  min-height: 80vh;
}

.text-section {
  flex: 1;
  max-width: 600px;
  margin-top: -3rem;
}

.pre-title {
  font-size: 0.875rem;
  letter-spacing: 0.3em;
  color: #a0aec0;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.main-title {
  font-size: 4.5rem;
  line-height: 1.2;
  font-weight: 600;
  margin-bottom: 2rem;
  letter-spacing: 2px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.desc {
  font-size: 1.15rem;
  line-height: 1.9;
  color: #cbd5e0;
  margin-bottom: 3rem;
}

.explore-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 1.2rem 2.5rem;
  border-radius: 999px;
  font-size: 0.875rem;
  letter-spacing: 1px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.explore-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
  border-color: rgba(255, 255, 255, 0.4);
}

.bg-fade-enter-active,
.bg-fade-leave-active {
  transition: opacity 1s ease-in-out;
}

.bg-fade-enter-from,
.bg-fade-leave-to {
  opacity: 0;
}

.bg-fade-leave-active {
  position: absolute;
  z-index: -1;
}

.text-fade-enter-active,
.text-fade-leave-active {
  transition: all 0.5s ease;
}

.text-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.text-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1200px) {
  .hero-content {
    flex-direction: column;
    align-items: flex-start;
    padding-top: 4rem;
  }
}
</style>
