<template>
  <div class="cards-container">
    <div class="cards-section">
      <div class="collection-card" v-for="(card, index) in collections" :key="index"
        :class="{ 'is-active': index === activeIndex }" @click="$emit('select', index)">
        <img :src="card.image" :alt="card.title" class="card-img" />
        <div class="card-overlay">
          <span class="card-subtitle">{{ card.subtitle }}</span>
          <h3 class="card-title" v-html="card.title"></h3>
        </div>
      </div>
    </div>

    <div class="carousel-controls">
      <button class="control-btn" @click="$emit('prev')">&lt;</button>
      <button class="control-btn" @click="$emit('next')">&gt;</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CollectionCards',
  props: {
    collections: { type: Array, required: true },
    activeIndex: { type: Number, required: true }
  },
  emits: ['select', 'prev', 'next']
};
</script>

<style scoped>
.cards-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2rem;
  flex: 1.2;
  margin-bottom: -4rem;
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
