<template>
  <main class="footprints-page">
    <section ref="mapContainer" class="map-stage" :class="{ 'is-dragging': isDragging }" @mousedown="handleMouseDown"
      @mousemove="handleMouseMove" @mouseup="handleMouseUp" @mouseleave="handleMouseUp" @wheel.prevent="handleWheel">
      <svg class="travel-map" :viewBox="`0 0 ${svgWidth} ${svgHeight}`" role="img" aria-label="旅行足迹地图">
        <defs>
          <filter id="mapGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.96  0 0.62 0 0 0.46  0 0 0 0 0.04  0 0 0 0.9 0"
              result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="#050a15" />

        <g :transform="mapTransform">
          <g v-if="worldFeatures.length">
            <path v-for="country in countryPaths" :key="country.key" :d="country.d"
              :fill="country.visited ? visitedFill : unvisitedFill"
              :stroke="country.visited ? visitedStroke : unvisitedStroke" :stroke-width="baseStrokeWidth"
              :class="{ highlighted: country.visited }" />
          </g>

          <g v-if="chinaFeatures.length">
            <path v-for="province in provincePaths" :key="province.key" :d="province.d"
              :fill="province.visited ? visitedFill : unvisitedFill" stroke="#3a4a70"
              :stroke-width="baseChinaStrokeWidth" :class="{ highlighted: province.visited }"
              @click.stop="selectProvince(province)" />
          </g>
        </g>

        <g>
          <g v-for="marker in markerPositions" :key="marker.id" class="map-marker"
            :transform="`translate(${marker.x}, ${marker.y})`" @click.stop="selectRegion(marker.id)">
            <circle :r="marker.hovered ? 18 : 12" fill="#f59e0b" :opacity="marker.hovered ? 0.42 : 0.25" />
            <circle :r="marker.hovered ? 6.5 : 4.8" fill="#fbbf24" stroke="#fff" stroke-width="1.2" />
          </g>
        </g>
      </svg>

      <aside v-if="activeRegion" class="location-card" :style="locationCardStyle" @mousedown.stop @wheel.stop>
        <div class="card-heading">
          <h1>{{ activeRegion.name }}</h1>
          <span>{{ activeRegion.albums }} 个相册 · {{ activeRegion.photoCount }} 张</span>
        </div>
        <div class="photo-grid">
          <img v-for="photo in activeRegion.photos" :key="photo.src" :src="photo.src" :alt="photo.alt" />
        </div>
        <button class="view-all" type="button">查看全部 →</button>
      </aside>

      <div class="map-controls" @mousedown.stop @wheel.stop>
        <button type="button" @click="resetWorld">世界视图</button>
        <span></span>
        <button type="button" @click="focusChina">中国视图</button>
        <span></span>
        <p>滚轮缩放 · 拖拽移动</p>
      </div>
    </section>
  </main>
</template>

<script>
import { geoCentroid, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature as topoFeature } from 'topojson-client';

const SVG_WIDTH = 1400;
const SVG_HEIGHT = 820;
const MAP_ASPECT_RATIO = 0.6;
const EDGE_PADDING_X = 80;
const EDGE_PADDING_Y = 80;
const ZOOM_SCALE_X = 1;
const ZOOM_SCALE_Y = 1.4;
const BASE_SCALE = Math.min(
  SVG_WIDTH / (2 * Math.PI),
  SVG_HEIGHT / (2 * Math.PI * MAP_ASPECT_RATIO)
) * 0.8;

const COUNTRY_NAME_TO_CODE = {
  China: 'CN',
  Japan: 'JP',
  Iceland: 'IS',
  'United States': 'US',
  'United States of America': 'US',
  'South Korea': 'KR',
  Singapore: 'SG',
};

const MAP_CODE_TO_ADCODE = {
  'CN-11': 110000,
  'CN-12': 120000,
  'CN-13': 130000,
  'CN-14': 140000,
  'CN-15': 150000,
  'CN-21': 210000,
  'CN-22': 220000,
  'CN-23': 230000,
  'CN-31': 310000,
  'CN-32': 320000,
  'CN-33': 330000,
  'CN-34': 340000,
  'CN-35': 350000,
  'CN-36': 360000,
  'CN-37': 370000,
  'CN-41': 410000,
  'CN-42': 420000,
  'CN-43': 430000,
  'CN-44': 440000,
  'CN-45': 450000,
  'CN-46': 460000,
  'CN-50': 500000,
  'CN-51': 510000,
  'CN-52': 520000,
  'CN-53': 530000,
  'CN-54': 540000,
  'CN-61': 610000,
  'CN-62': 620000,
  'CN-63': 630000,
  'CN-64': 640000,
  'CN-65': 650000,
  'CN-HK': 810000,
  'CN-MO': 820000,
  'CN-TW': 710000,
};

export default {
  name: 'FootprintsView',
  data() {
    return {
      svgWidth: SVG_WIDTH,
      svgHeight: SVG_HEIGHT,
      worldFeatures: [],
      chinaFeatures: [],
      zoom: 1.8,
      panX: 0,
      panY: 0,
      isDragging: false,
      dragStart: { x: 0, y: 0, panX: 0, panY: 0 },
      dragFrame: null,
      pendingPan: null,
      activeRegionId: null,
      unvisitedFill: '#1a2035',
      unvisitedStroke: '#2a3555',
      visitedFill: '#f59e0b',
      visitedStroke: '#2d3a55',
      regions: [
        {
          id: 'zhejiang',
          name: '浙江',
          coordinates: [120.15, 30.27],
          mapCode: 'CN-33',
          albums: 1,
          photoCount: 21,
          photos: [
            { src: '/DSC_6174.jpg', alt: '浙江旅行照片 1' },
            { src: '/DSC_6510.jpg', alt: '浙江旅行照片 2' },
            { src: '/DSC_6760.JPG', alt: '浙江旅行照片 3' },
            { src: '/pashan.JPG', alt: '浙江旅行照片 4' },
            { src: '/DSC_6174.jpg', alt: '浙江旅行照片 5' },
            { src: '/DSC_6510.jpg', alt: '浙江旅行照片 6' },
          ],
        },
        {
          id: 'sichuan',
          name: '四川',
          coordinates: [104.06, 30.67],
          mapCode: 'CN-51',
          albums: 1,
          photoCount: 8,
          photos: [
            { src: '/DSC_6510.jpg', alt: '四川旅行照片 1' },
            { src: '/DSC_6760.JPG', alt: '四川旅行照片 2' },
            { src: '/DSC_6174.jpg', alt: '四川旅行照片 3' },
            { src: '/pashan.JPG', alt: '四川旅行照片 4' },
          ],
        },
        {
          id: 'usa',
          name: '美国',
          coordinates: [-122.42, 37.77],
          mapCode: 'US',
          albums: 1,
          photoCount: 12,
          photos: [
            { src: '/DSC_6760.JPG', alt: '美国旅行照片 1' },
            { src: '/DSC_6510.jpg', alt: '美国旅行照片 2' },
            { src: '/DSC_6174.jpg', alt: '美国旅行照片 3' },
          ],
        },
      ],
    };
  },
  computed: {
    baseProjection() {
      return geoNaturalEarth1()
        .scale(BASE_SCALE)
        .rotate([-150, 0, 0])
        .translate([SVG_WIDTH / 2, SVG_HEIGHT / 2]);
    },
    pathGenerator() {
      return geoPath().projection(this.baseProjection);
    },
    mapTransform() {
      return `translate(${SVG_WIDTH / 2 + this.panX}, ${SVG_HEIGHT / 2 + this.panY}) scale(${this.zoom}) translate(${-SVG_WIDTH / 2}, ${-SVG_HEIGHT / 2})`;
    },
    visitedCountries() {
      return new Set(this.regions.map((region) => region.mapCode).filter((code) => !code.startsWith('CN-')));
    },
    visitedProvinces() {
      return new Set(
        this.regions
          .map((region) => MAP_CODE_TO_ADCODE[region.mapCode])
          .filter(Boolean)
      );
    },
    baseStrokeWidth() {
      return 0.5;
    },
    baseChinaStrokeWidth() {
      return 1.2;
    },
    countryPaths() {
      return this.worldFeatures
        .filter((country) => country.properties?.name !== 'China')
        .map((country, index) => {
          const code = COUNTRY_NAME_TO_CODE[country.properties?.name];
          const visited = Boolean(code && this.visitedCountries.has(code));
          return {
            key: country.id || `country-${index}`,
            d: this.pathGenerator(country) || '',
            visited,
          };
        });
    },
    provincePaths() {
      return this.chinaFeatures.map((province, index) => {
        const adcode = province.properties?.adcode;
        const region = this.regions.find((item) => MAP_CODE_TO_ADCODE[item.mapCode] === adcode);
        return {
          key: adcode || `province-${index}`,
          d: this.pathGenerator(province) || '',
          visited: this.visitedProvinces.has(adcode),
          regionId: region?.id || null,
        };
      });
    },
    markerPositions() {
      return this.regions
        .map((region) => {
          let coordinates = region.coordinates;
          const adcode = MAP_CODE_TO_ADCODE[region.mapCode];
          const province = adcode
            ? this.chinaFeatures.find((feature) => feature.properties?.adcode === adcode)
            : null;

          if (province) {
            coordinates = geoCentroid(province);
          }

          const projected = this.screenProject(coordinates);
          if (!projected) {
            return null;
          }

          return {
            ...region,
            x: projected[0],
            y: projected[1],
            hovered: this.activeRegionId === region.id,
          };
        })
        .filter(Boolean);
    },
    activeRegion() {
      return this.regions.find((region) => region.id === this.activeRegionId) || null;
    },
    activeMarker() {
      return this.markerPositions.find((marker) => marker.id === this.activeRegionId) || null;
    },
    locationCardStyle() {
      if (!this.activeMarker) {
        return {};
      }

      const xPercent = (this.activeMarker.x / SVG_WIDTH) * 100;
      const yPercent = (this.activeMarker.y / SVG_HEIGHT) * 100;

      return {
        left: `clamp(20px, calc(${xPercent}% + 18px), calc(100% - 545px))`,
        top: `clamp(92px, calc(${yPercent}% - 36px), calc(100% - 470px))`,
      };
    },
  },
  async mounted() {
    const [worldTopo, chinaGeo] = await Promise.all([
      fetch('/maps/world.json').then((response) => response.json()),
      fetch('/maps/china.json').then((response) => response.json()),
    ]);

    this.worldFeatures = topoFeature(worldTopo, worldTopo.objects.countries).features;
    this.chinaFeatures = chinaGeo.features || topoFeature(chinaGeo, chinaGeo.objects.china).features;
    this.focusChina();
  },
  beforeUnmount() {
    if (this.dragFrame) {
      cancelAnimationFrame(this.dragFrame);
    }
  },
  methods: {
    calcMaxPan(mapSize, viewportSize, currentZoom, basePadding, zoomScale) {
      const effectivePadding = basePadding * currentZoom * zoomScale;
      if (mapSize <= viewportSize) {
        return (viewportSize - mapSize) / 2 + effectivePadding;
      }
      return (mapSize - viewportSize) / 2 + effectivePadding;
    },
    clampPan(px, py, z) {
      const mapWidth = BASE_SCALE * 2 * Math.PI * z;
      const mapHeight = mapWidth * MAP_ASPECT_RATIO;
      const maxPanX = this.calcMaxPan(mapWidth, SVG_WIDTH, z, EDGE_PADDING_X, ZOOM_SCALE_X);
      const maxPanY = this.calcMaxPan(mapHeight, SVG_HEIGHT, z, EDGE_PADDING_Y, ZOOM_SCALE_Y);

      return {
        x: Math.max(-maxPanX, Math.min(maxPanX, px)),
        y: Math.max(-maxPanY, Math.min(maxPanY, py)),
      };
    },
    handleMouseDown(event) {
      if (event.button !== 0) {
        return;
      }

      this.isDragging = true;
      this.dragStart = {
        x: event.clientX,
        y: event.clientY,
        panX: this.panX,
        panY: this.panY,
      };
    },
    handleMouseMove(event) {
      if (!this.isDragging) {
        return;
      }

      const dx = event.clientX - this.dragStart.x;
      const dy = event.clientY - this.dragStart.y;
      this.pendingPan = this.clampPan(this.dragStart.panX + dx, this.dragStart.panY + dy, this.zoom);

      if (this.dragFrame) {
        return;
      }

      this.dragFrame = requestAnimationFrame(() => {
        if (this.pendingPan) {
          this.panX = this.pendingPan.x;
          this.panY = this.pendingPan.y;
        }
        this.dragFrame = null;
      });
    },
    handleMouseUp() {
      this.isDragging = false;
      this.pendingPan = null;
    },
    handleWheel(event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / rect.width) * SVG_WIDTH;
      const mouseY = ((event.clientY - rect.top) / rect.height) * SVG_HEIGHT;
      const offsetX = mouseX - SVG_WIDTH / 2 - this.panX;
      const offsetY = mouseY - SVG_HEIGHT / 2 - this.panY;
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      const nextZoom = Math.max(1.5, Math.min(10, this.zoom * delta));

      if (nextZoom === this.zoom) {
        return;
      }

      const zoomRatio = nextZoom / this.zoom;
      const nextPanX = this.panX - offsetX * (zoomRatio - 1);
      const nextPanY = this.panY - offsetY * (zoomRatio - 1);
      const clamped = this.clampPan(nextPanX, nextPanY, nextZoom);

      this.zoom = nextZoom;
      this.panX = clamped.x;
      this.panY = clamped.y;
    },
    focusChina() {
      const nextZoom = 7;
      const chinaCenter = this.baseProjection([105, 35]);

      if (!chinaCenter) {
        return;
      }

      this.zoom = nextZoom;
      this.panX = (SVG_WIDTH / 2 - chinaCenter[0]) * nextZoom;
      this.panY = (SVG_HEIGHT / 2 - chinaCenter[1]) * nextZoom;
    },
    resetWorld() {
      this.zoom = 1.8;
      this.panX = 0;
      this.panY = 0;
      this.activeRegionId = null;
    },
    selectProvince(province) {
      if (!province.regionId) {
        this.activeRegionId = null;
        return;
      }

      this.activeRegionId = province.regionId;
    },
    selectRegion(regionId) {
      this.activeRegionId = regionId;
    },
    screenProject(coordinates) {
      const projected = this.baseProjection(coordinates);
      if (!projected) {
        return null;
      }

      return [
        SVG_WIDTH / 2 + this.panX + (projected[0] - SVG_WIDTH / 2) * this.zoom,
        SVG_HEIGHT / 2 + this.panY + (projected[1] - SVG_HEIGHT / 2) * this.zoom,
      ];
    },
  },
};
</script>

<style scoped>
.footprints-page {
  min-height: 100vh;
  margin-top: -5rem;
  padding-top: 5rem;
  background: #050a15;
  color: #fff;
  overflow: hidden;
}

.map-stage {
  position: relative;
  min-height: calc(100vh - 5rem);
  overflow: hidden;
  background: #050a15;
  cursor: grab;
  user-select: none;
}

.map-stage.is-dragging {
  cursor: grabbing;
}

.travel-map {
  width: 100%;
  height: calc(100vh - 5rem);
  min-height: 720px;
  display: block;
}

path {
  vector-effect: non-scaling-stroke;
}

path.highlighted {
  filter: url(#mapGlow);
}

.map-marker {
  cursor: pointer;
  filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.55));
  transition: opacity 0.2s ease;
}

.location-card {
  position: absolute;
  width: min(525px, 34vw);
  padding: 28px 30px 30px;
  border: 1px solid rgba(245, 158, 11, 0.58);
  border-radius: 12px;
  background: rgba(4, 7, 13, 0.9);
  box-shadow: 0 0 24px rgba(234, 88, 12, 0.22), 0 22px 70px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(14px);
  cursor: default;
}

.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 24px;
}

.card-heading h1 {
  margin: 0;
  font-size: 1.85rem;
  line-height: 1.1;
  letter-spacing: 0;
}

.card-heading span {
  color: #9ca7b8;
  font-size: 0.95rem;
  white-space: nowrap;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.photo-grid img {
  width: 100%;
  aspect-ratio: 1.35;
  border-radius: 8px;
  object-fit: cover;
  display: block;
}

.view-all {
  width: 100%;
  height: 38px;
  margin-top: 20px;
  border: 1px solid rgba(245, 158, 11, 0.38);
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.28);
  color: #ffc84a;
  font-weight: 700;
  cursor: pointer;
}

.map-controls {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(5, 10, 21, 0.88);
  border-top: 1px solid rgba(42, 53, 85, 0.82);
  backdrop-filter: blur(10px);
  cursor: default;
}

.map-controls button {
  border: 0;
  background: transparent;
  color: #8e98aa;
  font-size: 0.85rem;
  cursor: pointer;
}

.map-controls button:hover {
  color: #e5e7eb;
}

.map-controls span {
  width: 1px;
  height: 14px;
  background: #293247;
}

.map-controls p {
  margin: 0;
  color: #6f7a8d;
  font-size: 0.82rem;
}

@media (max-width: 1100px) {
  .travel-map {
    width: 1250px;
    max-width: none;
    transform: translateX(-250px);
    transform-origin: left center;
  }

  .location-card {
    top: auto;
    right: 20px;
    bottom: 72px;
    left: 20px;
    width: auto;
    padding: 22px;
  }
}

@media (max-width: 680px) {
  .travel-map {
    width: 1120px;
    min-height: 620px;
    transform: translateX(-420px);
  }

  .card-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }

  .photo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .map-controls {
    gap: 10px;
  }
}
</style>
