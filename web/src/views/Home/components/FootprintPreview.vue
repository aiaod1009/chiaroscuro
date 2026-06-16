<template>
  <section class="footprint-preview">
    <div class="preview-inner">
      <!-- 左侧地图 -->
      <div class="map-side" @click="$router.push('/footprints')">
        <svg :viewBox="`0 0 ${svgW} ${svgH}`" class="map-svg">
          <rect :width="svgW" :height="svgH" fill="#0f1729" />
          <g v-for="(d, i) in countryPaths" :key="i">
            <path :d="d" fill="#1c2d4a" stroke="#2e4670" stroke-width="0.3" />
          </g>
          <g v-for="(r, i) in markers" :key="r.mapCode">
            <circle :cx="r.x" :cy="r.y" r="6" fill="#f59e0b" opacity="0.15" class="marker-glow"
              :style="{ animationDelay: `${i * 0.15}s` }" />
            <circle :cx="r.x" :cy="r.y" r="2.5" fill="#fbbf24" stroke="#fff" stroke-width="0.5" />
          </g>
        </svg>
      </div>

      <!-- 右侧文字 -->
      <div class="text-side">
        <span class="preview-label">FOOTPRINTS</span>
        <h3 class="preview-title">足迹地图</h3>
        <p class="preview-desc">
          走过 <strong>{{ regionCount }}</strong> 个地区，<strong>{{ photoCount }}</strong> 张影像记录。
        </p>
        <div class="place-tags">
          <span v-for="r in topPlaces" :key="r.mapCode" class="place-tag">{{ r.name }}</span>
        </div>
        <button class="explore-link" @click="$router.push('/footprints')">
          查看完整地图 &rarr;
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature as topoFeature } from 'topojson-client'
import { fetchFootprints } from '../../../utils/photoApi'
import { mapCodeToName } from '../../../utils/dataTransform'

const svgW = 560
const svgH = 320
const regions = ref([])
const countryPaths = ref([])

const REGION_COORDS = {
  'CN-11': [116.4, 39.9], 'CN-12': [117.2, 39.1], 'CN-13': [114.5, 38.0],
  'CN-14': [112.5, 37.9], 'CN-15': [111.7, 40.8], 'CN-21': [123.4, 41.8],
  'CN-22': [126.6, 43.9], 'CN-23': [126.6, 45.8], 'CN-31': [121.5, 31.2],
  'CN-32': [118.8, 32.1], 'CN-33': [120.2, 30.3], 'CN-34': [117.3, 31.8],
  'CN-35': [119.3, 26.1], 'CN-36': [115.9, 28.7], 'CN-37': [117.0, 36.7],
  'CN-41': [113.7, 34.8], 'CN-42': [114.3, 30.6], 'CN-43': [112.9, 28.2],
  'CN-44': [113.3, 23.1], 'CN-45': [108.3, 22.8], 'CN-46': [110.3, 20.0],
  'CN-50': [106.5, 29.6], 'CN-51': [104.1, 30.6], 'CN-52': [106.7, 26.6],
  'CN-53': [102.7, 25.0], 'CN-54': [91.1, 29.6], 'CN-61': [108.9, 34.3],
  'CN-62': [103.8, 36.1], 'CN-63': [101.8, 36.6], 'CN-64': [106.3, 38.5],
  'CN-65': [87.6, 43.8], 'CN-HK': [114.2, 22.3], 'CN-MO': [113.5, 22.2],
  'CN-TW': [121.5, 25.0], 'CN': [104.0, 35.0],
  'JP': [138.0, 36.0], 'US': [-95.0, 38.0], 'KR': [127.5, 36.5],
  'SG': [103.8, 1.4], 'IS': [-19.0, 65.0], 'TH': [100.5, 13.8],
  'VN': [108.0, 16.0], 'GB': [-2.0, 54.0], 'FR': [2.0, 46.0],
  'DE': [10.0, 51.0], 'IT': [12.5, 42.5], 'ES': [-4.0, 40.0],
  'AU': [134.0, -25.0], 'NZ': [174.0, -41.0],
}

const projection = geoNaturalEarth1()
  .scale(110)
  .translate([svgW / 2, svgH / 2 + 10])

const pathGen = geoPath(projection)

const visitedCountries = computed(() => {
  const set = new Set()
  regions.value.forEach(r => {
    if (r.mapCode?.startsWith('CN')) set.add('China')
    else if (r.mapCode) {
      const name = { JP: 'Japan', US: 'United States of America', KR: 'South Korea', SG: 'Singapore', IS: 'Iceland', TH: 'Thailand', VN: 'Vietnam', GB: 'United Kingdom', FR: 'France', DE: 'Germany', IT: 'Italy', ES: 'Spain', AU: 'Australia', NZ: 'New Zealand' }
      if (name[r.mapCode]) set.add(name[r.mapCode])
    }
  })
  return set
})

const isVisited = (d) => false // 简化版不做国家高亮，靠标记点

const markers = computed(() => {
  return regions.value
    .filter(r => r.mapCode && r.mapCode !== 'CN' && REGION_COORDS[r.mapCode])
    .map(r => {
      const [lng, lat] = REGION_COORDS[r.mapCode]
      const pos = projection([lng, lat])
      return { ...r, name: mapCodeToName(r.mapCode), x: pos[0], y: pos[1] }
    })
})

const regionCount = computed(() => {
  const codes = new Set(regions.value.filter(r => r.mapCode && r.mapCode !== 'CN').map(r => r.mapCode))
  return codes.size
})

const photoCount = computed(() => regions.value.reduce((s, r) => s + (r.photoCount || 0), 0))

const topPlaces = computed(() => {
  return markers.value.slice(0, 6)
})

onMounted(async () => {
  const [worldData, footprintData] = await Promise.all([
    fetch('/maps/world.json').then(r => r.json()),
    fetchFootprints()
  ])
  regions.value = footprintData
  const countries = topoFeature(worldData, worldData.objects.countries)
  countryPaths.value = countries.features.map(f => pathGen(f))
})
</script>

<style scoped>
.footprint-preview {
  position: relative;
  z-index: 1;
  width: 95%;
  max-width: 1700px;
  margin: 0 auto;
  padding: 2rem 0 4rem;
}

.preview-inner {
  display: flex;
  align-items: center;
  gap: 48px;
}

.map-side {
  flex: 1;
  max-width: 1200px;
  cursor: pointer;
  background: #0f1729;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.map-side:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.map-svg {
  width: 100%;
  height: auto;
  display: block;
}

.text-side {
  flex: 0 0 320px;
}

.preview-label {
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  color: #64748b;
  font-weight: 500;
}

.preview-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0.4rem 0 1rem;
  letter-spacing: 0.5px;
}

.preview-desc {
  font-size: 0.95rem;
  color: #94a3b8;
  line-height: 1.7;
  margin: 0 0 1.2rem;
}

.preview-desc strong {
  color: #e2e8f0;
  font-weight: 600;
}

.place-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 1.5rem;
}

.place-tag {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  font-size: 0.8rem;
  color: #94a3b8;
}

.explore-link {
  background: none;
  border: none;
  color: #f59e0b;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.explore-link:hover {
  color: #fbbf24;
}

.marker-glow {
  animation: pulse 2.5s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.1;
  }

  50% {
    opacity: 0.35;
  }
}

@media (max-width: 900px) {
  .preview-inner {
    flex-direction: column;
    gap: 24px;
  }

  .text-side {
    flex: none;
    width: 100%;
  }
}
</style>
