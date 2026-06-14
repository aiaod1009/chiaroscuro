<template>
  <article class="postcard" :class="{
    'is-active': isActive,
    'is-next': isNext,
    'is-delivering': isActive && isDelivering
  }">
    <div class="photo-window">
      <div class="corner-grid" aria-hidden="true">
        <i v-for="n in 6" :key="n"></i>
      </div>
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
</template>

<script>
export default {
  name: 'PostcardItem',
  props: {
    card: { type: Object, required: true },
    isActive: { type: Boolean, default: false },
    isNext: { type: Boolean, default: false },
    isDelivering: { type: Boolean, default: false }
  }
};
</script>

<style scoped>
.postcard {
  position: absolute;
  left: 50%;
  top: 0;
  z-index: 1;
  width: min(80vw, 780px);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  padding: 22px 26px;
  background: #fff9ee;
  color: #27211d;
  box-shadow: 0 26px 68px rgba(0, 0, 0, 0.5);
  opacity: 0;
  transform: translate(-50%, -440px) scale(1);
  transform-origin: 50% 0;
  transition:
    opacity 0.55s ease,
    transform 1.2s ease;
  pointer-events: none;
}

.postcard.is-active {
  z-index: 3;
  opacity: 1;
  transform: translate(-50%, 200px) scale(1);
}

.postcard.is-active.is-delivering {
  animation: deliverPostcard 4.5s ease-in-out forwards;
}

.postcard.is-next {
  z-index: 2;
  opacity: 0;
  transform: translate(-50%, 72px) scale(0.8);
}

.photo-window {
  position: relative;
  overflow: hidden;
  aspect-ratio: 3/4;
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
  padding: 24px 12px 10px 26px;
  text-align: left;
  border-left: 1px solid rgba(39, 33, 29, 0.16);
}

.stamp-box {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 84px;
  height: 96px;
  border: 2px solid rgba(39, 33, 29, 0.48);
  display: grid;
  place-items: center;
  color: rgba(39, 33, 29, 0.34);
  font-size: 0.65rem;
  letter-spacing: 0.16em;
  transform: rotate(2deg);
}

.ticket {
  position: absolute;
  top: 118px;
  right: 24px;
  width: 100px;
  height: 38px;
  border: 1px dashed rgba(39, 33, 29, 0.5);
  display: grid;
  place-items: center;
  transform: rotate(-7deg);
}

.ticket span {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(39, 33, 29, 0.42);
}

.scribble {
  max-width: 220px;
  margin: 0 0 30px;
  color: rgba(39, 33, 29, 0.22);
  font-family: 'Brush Script MT', 'Segoe Script', cursive;
  font-size: 1.6rem;
  line-height: 1.1;
  transform: rotate(-5deg);
}

.message-panel h3 {
  max-width: calc(100% - 130px);
  margin: 0 0 1.1rem;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.4rem, 2.5vw, 2.4rem);
  line-height: 1.2;
}

.caption {
  max-width: calc(100% - 100px);
  margin: 0;
  color: rgba(39, 33, 29, 0.72);
  font-family: 'KaiTi', 'STKaiti', serif;
  font-size: clamp(1.15rem, 1.9vw, 1.6rem);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.postmark {
  position: absolute;
  right: 88px;
  bottom: 52px;
  width: 74px;
  height: 74px;
  border: 2px solid rgba(39, 33, 29, 0.48);
  border-radius: 50%;
  color: rgba(39, 33, 29, 0.48);
  display: grid;
  place-items: center;
  text-align: center;
  font-size: 0.68rem;
  line-height: 1.15;
}

.postmark::after {
  content: '';
  position: absolute;
  left: 62px;
  top: 36px;
  width: 88px;
  height: 28px;
  background:
    repeating-linear-gradient(0deg,
      transparent 0 5px,
      rgba(39, 33, 29, 0.44) 5px 6px,
      transparent 6px 9px);
}

.corner-grid {
  position: absolute;
  left: 10px;
  top: 10px;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(6, 32px);
  gap: 6px;
}

.corner-grid i {
  display: block;
  aspect-ratio: 1;
  border: 2px solid rgba(39, 33, 29, 0.48);
}

.address-grid {
  position: absolute;
  right: 14px;
  bottom: 10px;
  display: grid;
  grid-template-columns: repeat(6, 32px);
  gap: 6px;
}

.address-grid i {
  display: block;
  aspect-ratio: 1;
  border: 2px solid rgba(39, 33, 29, 0.48);
}

@keyframes deliverPostcard {
  0% {
    opacity: 0;
    transform: translate(-50%, -440px) scale(1);
  }

  8% {
    opacity: 1;
    transform: translate(-50%, -440px) scale(1);
  }

  70% {
    opacity: 1;
    transform: translate(-50%, 200px) scale(1);
  }

  100% {
    opacity: 1;
    transform: translate(-50%, 200px) scale(1.04);
  }
}

@media (prefers-reduced-motion: reduce) {

  .postcard,
  .postcard.is-active {
    animation: none;
    transition: none;
  }
}
</style>
