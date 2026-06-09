<template>
  <footer class="pagination-footer">
    <button class="page-arrow" :disabled="currentPage === 1" @click="emit('update:currentPage', currentPage - 1)">&lt;</button>
    <div class="page-numbers">
      <button v-for="p in pageRange" :key="p" class="page-num-btn"
        :class="{ active: currentPage === p, 'is-dot': p === '...' }" :disabled="p === '...'"
        @click="p !== '...' && emit('update:currentPage', p)">
        {{ p }}
      </button>
    </div>
    <button class="page-arrow" :disabled="currentPage === totalPages" @click="emit('update:currentPage', currentPage + 1)">&gt;</button>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  total: { type: Number, required: true },
  pageSize: { type: Number, default: 12 }
})

const emit = defineEmits(['update:currentPage'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

const pageRange = computed(() => {
  const total = totalPages.value
  const current = props.currentPage
  const delta = 2
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  pages.push(1)

  const start = Math.max(2, current - delta)
  const end = Math.min(total - 1, current + delta)

  if (start > 2) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push('...')

  pages.push(total)

  return pages
})
</script>

<style scoped>
.pagination-footer {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.page-arrow {
  background: transparent;
  border: none;
  color: #4b5563;
  font-size: 14px;
  cursor: pointer;
  font-family: monospace;
}

.page-arrow:disabled {
  cursor: not-allowed;
  opacity: 0.3;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-num-btn {
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #8b949e;
  font-size: 12px;
  font-family: monospace;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.page-num-btn:hover:not(:disabled) {
  color: #ffffff;
}

.page-num-btn.active {
  background-color: #ffffff;
  color: #0d0f12;
  font-weight: 700;
}

.page-num-btn.is-dot {
  color: #4b5563;
  cursor: default;
}
</style>
