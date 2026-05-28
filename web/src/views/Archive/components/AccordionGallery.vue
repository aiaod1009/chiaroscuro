<template>
  <div class="accordion-gallery">
    <div v-for="(img, index) in images" :key="index"
      class="gallery-item"
      :class="{ active: activeIndex === index }"
      @mouseenter="$emit('update:activeIndex', index)"
      @click="$router.push(`/gallery-detail/${index + 1}`)"
      :style="{ backgroundImage: 'url(' + img + ')' }">
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccordionGallery',
  props: {
    images: { type: Array, required: true },
    activeIndex: { type: Number, required: true }
  },
  emits: ['update:activeIndex']
};
</script>

<style scoped>
.accordion-gallery {
  display: flex;
  gap: 1rem;
  height: 480px;
  margin-bottom: 6rem;
}

.gallery-item {
  flex: 1;
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);
  filter: grayscale(0.8) brightness(0.7);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.gallery-item.active {
  flex: 3.5;
  filter: grayscale(0) brightness(1);
}

.gallery-item:hover {
  filter: grayscale(0.3) brightness(0.9);
}
</style>
