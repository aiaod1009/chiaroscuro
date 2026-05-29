<template>
  <div class="search-input-wrapper">
    <span class="search-icon">🔍</span>
    <input type="text" :placeholder="placeholder" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search...' }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.search-input-wrapper {
  position: relative;
  flex-grow: 1;
  max-width: 320px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%) scale(0.85);
  opacity: 0.4;
}

.search-input-wrapper input {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 10px 14px 10px 38px;
  font-size: 12px;
  color: #ffffff;
  outline: none;
}
</style>
