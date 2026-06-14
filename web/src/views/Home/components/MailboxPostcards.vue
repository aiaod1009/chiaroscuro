<template>
  <section class="postcard-section" aria-label="Photo postcards">
    <div class="postcard-scene" :class="{ 'is-ready': isReady }">
      <div class="letterbox">
        <div class="letterbox-slot"></div>
        <div class="letterbox-title">Travel postcards</div>
        <div class="lever" :class="{ 'is-pulled': isPulled }" @click="pullLever">
          <div class="lever-track"></div>
          <div class="lever-knob"></div>
        </div>
      </div>

      <div class="postcard-stack">
        <PostcardItem
          v-for="(card, index) in postcards"
          :key="card.id"
          :card="card"
          :is-active="index === activeIndex"
          :is-next="index === nextIndex"
          :is-delivering="index === activeIndex && isDelivering"
        />
      </div>

      <div class="counter">{{ activeIndex + 1 }}/{{ postcards.length }}</div>
    </div>
  </section>
</template>

<script>
import { fetchPhotosByRegion } from '../../../utils/photoApi';
import PostcardItem from './PostcardItem.vue';

export default {
  name: 'MailboxPostcards',
  components: { PostcardItem },
  data() {
    return {
      activeIndex: 0,
      postcards: [],
      timer: null,
      isReady: false,
      isPulled: false,
      isDelivering: false
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
  },
  beforeUnmount() {
    window.clearInterval(this.timer);
  },
  methods: {
    async loadPostcards() {
      try {
        const res = await fetchPhotosByRegion('CN', 1, 50);
        const photos = res?.photos || [];
        const hasTitle = photos.filter((p) => p.src && p.title);
        const shuffled = hasTitle.sort(() => Math.random() - 0.5).slice(0, 11);

        if (shuffled.length) {
          this.postcards = shuffled.map((photo) => ({
            id: photo.id,
            title: photo.title,
            caption: photo.caption || '这张影像还在等待一段合适的叙述。',
            image: photo.src
          }));
        }
      } catch {
        this.postcards = [];
      }
    },
    showNext() {
      this.activeIndex = (this.activeIndex + 1) % this.postcards.length;
    },
    pullLever() {
      if (this.isPulled) return;
      this.isPulled = true;
      this.isDelivering = false;
      this.showNext();
      this.$nextTick(() => {
        this.isDelivering = true;
      });
      setTimeout(() => {
        this.isPulled = false;
      }, 800);
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
  width: min(100%, 1400px);
  min-height: 100vh;
  margin: 0 auto;
  padding: 6rem 2rem 5rem;
}

.postcard-scene::before {
  content: '';
  position: absolute;
  z-index: 6;
  top: 0;
  left: 0;
  right: 0;
  height: calc(6rem + 8px);
  background: #000;
}

.letterbox {
  position: relative;
  width: min(88vw, 900px);
  height: 280px;
  margin: 0 auto;
  padding: 44px 48px 38px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 40%),
    #7d1808;
  border: 1px solid rgba(255, 195, 157, 0.3);
  box-shadow:
    inset 0 0 0 14px rgba(72, 11, 3, 0.68),
    inset 0 -24px 42px rgba(40, 5, 0, 0.54),
    0 32px 56px rgba(0, 0, 0, 0.55);
  overflow: visible;
}

.letterbox::before {
  content: '';
  position: absolute;
  inset: 30px;
  border: 3px solid rgba(65, 10, 2, 0.75);
  box-shadow: inset 0 0 22px rgba(0, 0, 0, 0.42);
}

.letterbox::after {
  content: '';
  position: absolute;
  z-index: 6;
  top: 0;
  left: 0;
  right: 0;
  height: 110px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 42%),
    #7d1808;
  box-shadow:
    inset 0 0 0 14px rgba(72, 11, 3, 0.68),
    inset 0 18px 28px rgba(40, 5, 0, 0.44);
}

.letterbox-slot {
  position: relative;
  z-index: 8;
  height: 16px;
  margin: 48px auto 30px;
  border-radius: 14px;
  background: #030303;
  box-shadow:
    inset 0 12px 18px rgba(0, 0, 0, 0.92),
    0 2px 0 rgba(255, 180, 143, 0.12);
}

.letterbox-title {
  position: relative;
  z-index: 3;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1;
  letter-spacing: 0.08em;
  color: #fff6ee;
  text-shadow: 0 2px 0 rgba(0, 0, 0, 0.45);
}

.postcard-stack {
  position: relative;
  z-index: 5;
  width: min(82vw, 860px);
  height: 680px;
  margin: -190px auto 0;
}

.counter {
  position: absolute;
  z-index: 9;
  top: 24px;
  right: 30px;
  min-width: 70px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(120, 126, 134, 0.78);
  color: #fff;
  font-weight: 800;
  font-size: 1.2rem;
  line-height: 1;
}

.lever {
  position: absolute;
  z-index: 25;
  right: -56px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 160px;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.lever-track {
  position: absolute;
  left: 50%;
  top: 12px;
  bottom: 12px;
  width: 10px;
  transform: translateX(-50%);
  background: linear-gradient(180deg, #4a3a2a, #2a1a0a);
  border-radius: 5px;
  box-shadow:
    inset 1px 0 0 rgba(255, 255, 255, 0.12),
    inset -1px 0 0 rgba(0, 0, 0, 0.3);
}

.lever-knob {
  position: absolute;
  left: 50%;
  top: 12px;
  width: 36px;
  height: 36px;
  transform: translate(-50%, 0);
  background:
    radial-gradient(circle at 38% 35%, #d4a056, #8a5a2a 60%, #5a3a1a);
  border-radius: 50%;
  border: 2px solid #3a2a1a;
  box-shadow:
    0 3px 8px rgba(0, 0, 0, 0.5),
    inset 0 1px 3px rgba(255, 220, 160, 0.4);
  transition: top 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.lever.is-pulled .lever-knob {
  top: 110px;
}

.lever:hover .lever-knob {
  background:
    radial-gradient(circle at 38% 35%, #e4b066, #9a6a3a 60%, #6a4a2a);
}

.lever:active .lever-knob {
  top: 80px;
}

</style>
