<template>
  <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" style="overflow: visible">
    <!-- 背景网格 -->
    <g v-for="(level, i) in 5" :key="'grid-'+i">
      <polygon
        :points="getGridPoints(level)"
        fill="none"
        :stroke="gridColor"
        stroke-width="0.5"
        :opacity="0.5"
      />
    </g>

    <!-- 轴线 -->
    <line
      v-for="(item, i) in data"
      :key="'axis-'+i"
      :x1="center"
      :y1="center"
      :x2="getPoint(i, 1).x"
      :y2="getPoint(i, 1).y"
      :stroke="gridColor"
      stroke-width="0.5"
      :opacity="0.5"
    />

    <!-- 数据区域 -->
    <polygon
      :points="dataPoints"
      :fill="areaColor"
      :fill-opacity="0.35"
      :stroke="lineColor"
      stroke-width="2"
    />

    <!-- 数据点 -->
    <circle
      v-for="(item, i) in data"
      :key="'dot-'+i"
      :cx="getPoint(i, item.value / 100).x"
      :cy="getPoint(i, item.value / 100).y"
      r="3"
      :fill="lineColor"
    />

    <!-- 标签 -->
    <text
      v-for="(item, i) in data"
      :key="'label-'+i"
      :x="getLabelPos(i).x"
      :y="getLabelPos(i).y"
      text-anchor="middle"
      dominant-baseline="middle"
      :fill="textColor"
      font-size="10"
    >
      {{ item.label }}
    </text>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
  size: { type: Number, default: 200 },
  lineColor: { type: String, default: '#3ec1d3' },
  areaColor: { type: String, default: '#3ec1d3' },
  gridColor: { type: String, default: '#4a5568' },
  textColor: { type: String, default: '#a0aec0' }
})

const center = computed(() => props.size / 2)
const radius = computed(() => (props.size / 2) - 20)

const angleStep = computed(() => (2 * Math.PI) / props.data.length)

const getPoint = (index, ratio) => {
  const angle = index * angleStep.value - Math.PI / 2
  return {
    x: center.value + radius.value * ratio * Math.cos(angle),
    y: center.value + radius.value * ratio * Math.sin(angle)
  }
}

const getGridPoints = (level) => {
  const ratio = level / 5
  return props.data.map((_, i) => {
    const p = getPoint(i, ratio)
    return `${p.x},${p.y}`
  }).join(' ')
}

const dataPoints = computed(() => {
  return props.data.map((item, i) => {
    const p = getPoint(i, item.value / 100)
    return `${p.x},${p.y}`
  }).join(' ')
})

const getLabelPos = (index) => {
  const p = getPoint(index, 1.2)
  return p
}
</script>
