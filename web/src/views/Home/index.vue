<template>
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
          <button class="explore-btn">EXPLORE MY WORK &rarr;</button>
        </div>
      </transition>

      <!-- 右侧精选集卡片区域 -->
      <div class="cards-container">
        <div class="cards-section">
          <div class="collection-card" v-for="(card, index) in collections" :key="index"
            :class="{ 'is-active': index === activeIndex }" @click="selectCard(index)">
            <img :src="card.image" :alt="card.title" class="card-img" />
            <div class="card-overlay">
              <span class="card-subtitle">{{ card.subtitle }}</span>
              <h3 class="card-title" v-html="card.title"></h3>
            </div>
          </div>
        </div>

        <!-- 轮播控制按钮 -->
        <div class="carousel-controls">
          <button class="control-btn" @click="prevCard">&lt;</button>
          <button class="control-btn" @click="nextCard">&gt;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
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
  background-color: #0b101e;
  color: #fff;
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

.cards-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2rem;
  flex: 1.2;
  margin-bottom: -4rem;
  /* 向下推 */
  align-self: flex-end;
}

.cards-section {
  display: flex;
  gap: 2.5rem;
  justify-content: flex-end;
}

.collection-card {
  position: relative;
  width: 260px;
  height: 380px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  filter: brightness(0.6);
  transform: scale(0.95);
  animation: fadeLeft 1s ease forwards;
  background-color: #0b101e;
}

.collection-card:nth-child(1) {
  animation-delay: 0.2s;
}

.collection-card:nth-child(2) {
  animation-delay: 0.4s;
}

.collection-card:nth-child(3) {
  animation-delay: 0.6s;
}

.collection-card.is-active,
.collection-card:hover {
  filter: brightness(1);
  transform: scale(1) translateY(-15px);
}

.collection-card.is-active {
  box-shadow: 0 10px 40px rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.6);
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.collection-card:hover .card-img,
.collection-card.is-active .card-img {
  transform: scale(1.08);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 60%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.5rem;
  pointer-events: none;
}

.card-subtitle {
  font-size: 0.7rem;
  letter-spacing: 1px;
  color: #a0aec0;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0;
  color: #fff;
}

.carousel-controls {
  display: flex;
  gap: 1rem;
  margin-right: 1rem;
  margin-bottom: 1rem;
}

.control-btn {
  width: 44px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: #fff;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.8);
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

@keyframes fadeLeft {
  from {
    opacity: 0;
    transform: translateX(30px) scale(0.95);
    filter: brightness(0.6);
  }

  to {
    opacity: 1;
    transform: translateX(0) scale(0.95);
    filter: brightness(0.6);
  }
}

@media (max-width: 1200px) {
  .hero-content {
    flex-direction: column;
    align-items: flex-start;
    padding-top: 4rem;
  }

  .cards-container {
    width: 100%;
    align-items: center;
    margin-bottom: 0;
  }

  .cards-section {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 2rem;
    justify-content: flex-start;
  }
}
</style>
