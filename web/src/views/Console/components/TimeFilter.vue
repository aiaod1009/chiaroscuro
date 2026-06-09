<template>
  <div class="time-filter" ref="filterRef">
    <button class="filter-trigger" @click="open = !open">
      <span>{{ selectedLabel }}</span>
      <span class="arrow-down" :class="{ rotated: open }">▼</span>
    </button>
    <div class="filter-dropdown" v-if="open">
      <button class="filter-option" :class="{ active: !modelValue }" @click="select(null)">All Time</button>
      <template v-for="group in groups" :key="group.year">
        <div class="filter-year">{{ group.year }}</div>
        <button v-for="m in group.months" :key="m.key" class="filter-option"
          :class="{ active: modelValue === m.key }" @click="select(m.key)">
          {{ m.label }} <span class="month-count">{{ m.count }}</span>
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: null },
  works: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const filterRef = ref(null)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const groups = computed(() => {
  const map = {}
  props.works.forEach(w => {
    const d = new Date(w.realDate || w.createdAt)
    const year = d.getFullYear()
    const month = d.getMonth()
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    if (!map[key]) map[key] = { year, month, key, count: 0 }
    map[key].count++
  })

  const sorted = Object.values(map).sort((a, b) => b.key.localeCompare(a.key))
  const result = []
  let currentYear = null
  for (const item of sorted) {
    if (item.year !== currentYear) {
      currentYear = item.year
      result.push({ year: item.year, months: [] })
    }
    result[result.length - 1].months.push({ ...item, label: MONTHS[item.month] })
  }
  return result
})

const selectedLabel = computed(() => {
  if (!props.modelValue) return 'Time'
  const [y, m] = props.modelValue.split('-')
  return `${MONTHS[parseInt(m) - 1]} ${y}`
})

const select = (key) => {
  emit('update:modelValue', key)
  open.value = false
}

const onClickOutside = (e) => {
  if (filterRef.value && !filterRef.value.contains(e.target)) open.value = false
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.time-filter {
  position: relative;
}

.filter-trigger {
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 12px;
  color: #8b949e;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.filter-trigger:hover {
  border-color: rgba(255, 255, 255, 0.1);
}

.arrow-down {
  font-size: 8px;
  color: #4b5563;
  transform: scale(0.8);
  transition: transform 0.2s;
}

.arrow-down.rotated {
  transform: scale(0.8) rotate(180deg);
}

.filter-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 180px;
  background-color: #161b22;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 6px;
  z-index: 100;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

.filter-year {
  font-size: 10px;
  font-family: monospace;
  font-weight: 700;
  color: #4b5563;
  letter-spacing: 0.08em;
  padding: 8px 10px 4px;
}

.filter-option {
  width: 100%;
  background: transparent;
  border: none;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 12px;
  color: #8b949e;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.15s;
}

.filter-option:hover {
  background-color: rgba(255, 255, 255, 0.04);
  color: #ffffff;
}

.filter-option.active {
  background-color: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  font-weight: 600;
}

.month-count {
  font-size: 10px;
  font-family: monospace;
  color: #4b5563;
}
</style>
