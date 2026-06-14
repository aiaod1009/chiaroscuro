<template>
  <section class="postcard-section" aria-label="Photo postcards">
    <div class="postcard-scene" :class="{ 'is-ready': isReady }">
      <div class="letterbox" aria-hidden="true">
        <div class="letterbox-slot"></div>
        <div class="letterbox-title">Travel postcards</div>
      </div>

      <div class="postcard-stack">
        <article v-for="(card, index) in postcards" :key="card.id" class="postcard" :class="{
          'is-active': index === activeIndex,
          'is-next': index === nextIndex,
          'is-tall': index % 3 === 2
        }">
          <div class="photo-window">
            <img :src="card.image" :alt="card.title" />
          </div>

          <div class="message-panel">
            <div class="stamp-box">
              <span>STAMP</span>
            </div>
            <div class="ticket" aria-hidden="true">
              <span></span>
            </div>
            <p class="scribble">To make each day count.</p>
            <h3>{{ card.title }}</h3>
            <p class="caption">{{ card.caption }}</p>
            <div class="postmark" aria-hidden="true">STAMP<br />HERE</div>
            <div class="address-grid" aria-hidden="true">
              <i v-for="n in 6" :key="n"></i>
            </div>
          </div>
        </article>
      </div>

      <div class="counter">{{ activeIndex + 1 }}/{{ postcards.length }}</div>
    </div>
  </section>
</template>

<script>
import { fetchPhotoPostcards } from '../../../utils/photoApi';

const fallbackPostcards = [
  {
    id: 'forest',
    title: '秘境之森',
    caption: '探寻林间的微光与翠意，感受自然最原始的呼吸与宁静。',
    image: '/DSC_6510.jpg'
  },
  {
    id: 'light',
    title: '光影之间',
    caption: '穿行于城市与旷野之间，用镜头收藏那些转瞬即逝的真实。',
    image: '/DSC_6174.jpg'
  },
  {
    id: 'ice',
    title: '极寒构造',
    caption: '在冰雪巨构中，捕捉极致冰棱刻线与冷静的物理美学。',
    image: '/DSC_6760.JPG'
  }
];

export default {
  name: 'MailboxPostcards',
  data() {
    return {
      activeIndex: 0,
      postcards: fallbackPostcards,
      timer: null,
      isReady: false
    };
  },
  computed: {
    nextIndex() {
      return (this.activeIndex + 1) % this.postcards.length;
    }
  },
  async mounted() {
    await this.loadPostcards();
    requestAnimationFrame(() => {
      this.isReady = true;
    });
    this.timer = window.setInterval(this.showNext, 7200);
  },
  beforeUnmount() {
    window.clearInterval(this.timer);
  },
  methods: {
    async loadPostcards() {
      try {
        const photos = await fetchPhotoPostcards(11);
        const mapped = photos
          .filter((photo) => photo.imageUrl)
          .map((photo) => ({
            id: photo.id,
            title: photo.title || photo.locationName || '未命名',
            caption: photo.caption || '这张影像还在等待一段合适的叙述。',
            image: photo.imageUrl
          }));

        if (mapped.length) {
          this.postcards = mapped;
        }
      } catch {
        this.postcards = fallbackPostcards;
      }
    },
    showNext() {
      this.activeIndex = (this.activeIndex + 1) % this.postcards.length;
    }
  }
};
</script>

<style scoped>
.postcard-section {
  min-height: 100vh;
  background: #000;
  color: #fff;
  overflow: hidden;
}

.postcard-scene {
  position: relative;
  width: min(100%, 1200px);
  min-height: 100vh;
  margin: 0 auto;
  padding: 5.5rem 1.5rem 4rem;
}

.postcard-scene::before {
  content: '';
  position: absolute;
  z-index: 6;
  top: 0;
  left: 0;
  right: 0;
  height: calc(5.5rem + 8px);
  background: #000;
}

.letterbox {
  position: relative;
  width: min(82vw, 760px);
  height: 210px;
  margin: 0 auto;
  padding: 34px 38px 30px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 40%),
    #7d1808;
  border: 1px solid rgba(255, 195, 157, 0.3);
  box-shadow:
    inset 0 0 0 12px rgba(72, 11, 3, 0.68),
    inset 0 -20px 36px rgba(40, 5, 0, 0.54),
    0 28px 50px rgba(0, 0, 0, 0.55);
}

.letterbox::before {
  content: '';
  position: absolute;
  inset: 24px;
  border: 3px solid rgba(65, 10, 2, 0.75);
  box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.42);
}

.letterbox::after {
  content: '';
  position: absolute;
  z-index: 6;
  top: 0;
  left: 0;
  right: 0;
  height: 81px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 42%),
    #7d1808;
  box-shadow:
    inset 0 0 0 12px rgba(72, 11, 3, 0.68),
    inset 0 16px 24px rgba(40, 5, 0, 0.44);
}

.letterbox-slot {
  position: relative;
  z-index: 8;
  height: 12px;
  margin: 36px auto 24px;
  border-radius: 12px;
  background: #030303;
  box-shadow:
    inset 0 10px 16px rgba(0, 0, 0, 0.92),
    0 2px 0 rgba(255, 180, 143, 0.12);
}

.letterbox-title {
  position: relative;
  z-index: 3;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 4vw, 3.25rem);
  line-height: 1;
  letter-spacing: 0.08em;
  color: #fff6ee;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.45);
}

.postcard-stack {
  position: relative;
  z-index: 5;
  width: min(74vw, 720px);
  height: 560px;
  margin: -106px auto 0;
}

.postcard {
  position: absolute;
  left: 50%;
  top: 0;
  z-index: 1;
  width: min(72vw, 640px);
  aspect-ratio: 1.82;
  display: grid;
  grid-template-columns: 0.92fr 1.08fr;
  gap: 18px;
  padding: 18px 22px;
  background: #fff9ee;
  color: #27211d;
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.5);
  opacity: 0;
  transform: translate(-50%, -340px) scale(1);
  transform-origin: 50% 0;
  transition:
    opacity 0.55s ease,
    transform 1.2s ease;
  pointer-events: none;
}

.postcard.is-active {
  z-index: 3;
  opacity: 1;
  transform: translate(-50%, 132px) scale(1);
}

.postcard-scene.is-ready .postcard.is-active {
  animation: deliverPostcard 7.2s ease-in-out infinite;
}

.postcard.is-next {
  z-index: 2;
  opacity: 0;
  transform: translate(-50%, 72px) scale(0.8);
}

.postcard.is-tall {
  width: min(72vw, 600px);
  aspect-ratio: 1.16;
  grid-template-columns: 0.78fr 1fr;
}

.photo-window {
  overflow: hidden;
  background: #ddd4c6;
}

.photo-window img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.message-panel {
  position: relative;
  min-width: 0;
  padding: 20px 10px 8px 22px;
  text-align: left;
  border-left: 1px solid rgba(39, 33, 29, 0.16);
}

.stamp-box {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 72px;
  height: 82px;
  border: 2px solid rgba(39, 33, 29, 0.48);
  display: grid;
  place-items: center;
  color: rgba(39, 33, 29, 0.34);
  font-size: 0.56rem;
  letter-spacing: 0.16em;
  transform: rotate(2deg);
}

.ticket {
  position: absolute;
  top: 102px;
  right: 20px;
  width: 90px;
  height: 34px;
  border: 1px dashed rgba(39, 33, 29, 0.5);
  display: grid;
  place-items: center;
  transform: rotate(-7deg);
}

.ticket span {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(39, 33, 29, 0.42);
}

.scribble {
  max-width: 190px;
  margin: 0 0 26px;
  color: rgba(39, 33, 29, 0.22);
  font-family: 'Brush Script MT', 'Segoe Script', cursive;
  font-size: 1.35rem;
  line-height: 1.1;
  transform: rotate(-5deg);
}

.message-panel h3 {
  max-width: calc(100% - 112px);
  margin: 0 0 0.9rem;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.15rem, 2.2vw, 2rem);
  line-height: 1.2;
}

.caption {
  max-width: calc(100% - 88px);
  margin: 0;
  color: rgba(39, 33, 29, 0.72);
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: clamp(1rem, 1.7vw, 1.35rem);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.postmark {
  position: absolute;
  right: 76px;
  bottom: 46px;
  width: 64px;
  height: 64px;
  border: 2px solid rgba(39, 33, 29, 0.48);
  border-radius: 50%;
  color: rgba(39, 33, 29, 0.48);
  display: grid;
  place-items: center;
  text-align: center;
  font-size: 0.58rem;
  line-height: 1.15;
}

.postmark::after {
  content: '';
  position: absolute;
  left: 54px;
  top: 32px;
  width: 78px;
  height: 24px;
  background:
    repeating-linear-gradient(0deg,
      transparent 0 5px,
      rgba(39, 33, 29, 0.44) 5px 6px,
      transparent 6px 9px);
}

.address-grid {
  position: absolute;
  right: 12px;
  bottom: 8px;
  display: grid;
  grid-template-columns: repeat(6, 28px);
  gap: 5px;
}

.address-grid i {
  display: block;
  aspect-ratio: 1;
  border: 2px solid rgba(39, 33, 29, 0.48);
}

.counter {
  position: absolute;
  z-index: 9;
  top: 20px;
  right: 26px;
  min-width: 62px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(120, 126, 134, 0.78);
  color: #fff;
  font-weight: 800;
  font-size: 1.05rem;
  line-height: 1;
}

@keyframes deliverPostcard {
  0% {
    opacity: 0;
    transform: translate(-50%, -340px) scale(1);
  }

  8% {
    opacity: 1;
    transform: translate(-50%, -340px) scale(1);
  }

  70% {
    opacity: 1;
    transform: translate(-50%, 132px) scale(1);
  }

  100% {
    opacity: 1;
    transform: translate(-50%, 132px) scale(1.04);
  }
}

@media (prefers-reduced-motion: reduce) {

  .postcard,
  .postcard-scene.is-ready .postcard.is-active {
    animation: none;
    transition: none;
  }
}

@media (max-width: 760px) {
  .postcard-scene {
    padding: 5rem 1rem 3rem;
  }

  .postcard-scene::before {
    height: calc(5rem + 8px);
  }

  .letterbox {
    width: min(94vw, 520px);
    height: 166px;
    padding: 24px;
    box-shadow:
      inset 0 0 0 9px rgba(72, 11, 3, 0.68),
      inset 0 -18px 30px rgba(40, 5, 0, 0.54),
      0 24px 46px rgba(0, 0, 0, 0.55);
  }

  .letterbox-slot {
    height: 44px;
    margin: 14px auto 18px;
  }

  .letterbox::after {
    height: 92px;
    box-shadow:
      inset 0 0 0 9px rgba(72, 11, 3, 0.68),
      inset 0 14px 22px rgba(40, 5, 0, 0.44);
  }

  .postcard-stack {
    width: 100%;
    height: 650px;
    margin-top: -76px;
  }

  .postcard,
  .postcard.is-tall {
    width: min(88vw, 430px);
    min-height: 520px;
    aspect-ratio: auto;
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 14px;
  }

  .postcard.is-active {
    transform: translate(-50%, 126px) scale(1);
  }

  .photo-window {
    min-height: 240px;
  }

  .message-panel {
    min-height: 236px;
    padding: 14px 8px 52px 8px;
    border-left: 0;
    border-top: 1px solid rgba(39, 33, 29, 0.16);
  }

  .scribble {
    margin-bottom: 18px;
  }

  .caption,
  .message-panel h3 {
    max-width: calc(100% - 96px);
  }

  .address-grid {
    grid-template-columns: repeat(6, 22px);
  }

  @keyframes deliverPostcard {
    0% {
      opacity: 0;
      transform: translate(-50%, -472px) scale(1);
    }

    8% {
      opacity: 1;
      transform: translate(-50%, -472px) scale(1);
    }

    70% {
      opacity: 1;
      transform: translate(-50%, 126px) scale(1);
    }

    100% {
      opacity: 1;
      transform: translate(-50%, 126px) scale(1.04);
    }
  }
}
</style>
