<template>
  <main class="footprints-page">
    <section class="map-stage" aria-label="旅行足迹地图">
      <svg class="travel-map" :viewBox="`0 0 ${mapWidth} ${mapHeight}`" role="img">
        <defs>
          <filter id="regionGlow" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 1  0 0.56 0 0 0.52  0 0 0 0 0  0 0 0 0.85 0"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="pinGlow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="7" result="pinBlur" />
            <feMerge>
              <feMergeNode in="pinBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g v-if="countryPaths.length" class="world-layer">
          <path
            v-for="country in countryPaths"
            :key="country.key"
            :d="country.d"
            :class="{ 'is-highlighted': highlightedCountryIds.has(country.id) }"
          />
        </g>

        <g v-if="provincePaths.length" class="china-layer">
          <path
            v-for="province in provincePaths"
            :key="province.key"
            :d="province.d"
            :class="{ 'is-highlighted': highlightedProvinceNames.has(province.name) }"
          />
        </g>

        <g class="marker-layer">
          <g
            v-for="spot in travelSpots"
            :key="spot.name"
            class="map-marker"
            :transform="`translate(${project(spot.coords)[0]} ${project(spot.coords)[1]})`"
          >
            <circle class="marker-halo" r="16" />
            <circle class="marker-dot" r="7" />
            <circle class="marker-core" r="4" />
          </g>
        </g>
      </svg>

      <aside class="location-card">
        <div class="card-heading">
          <h1>浙江</h1>
          <span>1 个相册 · 21 张</span>
        </div>
        <div class="photo-grid">
          <img v-for="photo in zhejiangPhotos" :key="photo.src" :src="photo.src" :alt="photo.alt" />
        </div>
        <button class="view-all" type="button">查看全部 →</button>
      </aside>
    </section>
  </main>
</template>

<script>
const MAP_WIDTH = 1440;
const MAP_HEIGHT = 820;

export default {
  name: 'FootprintsView',
  data() {
    return {
      mapWidth: MAP_WIDTH,
      mapHeight: MAP_HEIGHT,
      countryPaths: [],
      provincePaths: [],
      highlightedCountryIds: new Set(['156', '840']),
      highlightedProvinceNames: new Set(['浙江省', '四川省', '重庆市']),
      travelSpots: [
        { name: '浙江', coords: [120.15, 30.27] },
        { name: '上海', coords: [121.47, 31.23] },
        { name: '北京', coords: [116.4, 39.9] },
        { name: '重庆', coords: [106.55, 29.56] },
        { name: '成都', coords: [104.06, 30.67] },
        { name: '曼谷', coords: [100.5, 13.76] },
        { name: '旧金山', coords: [-122.42, 37.77] },
      ],
      zhejiangPhotos: [
        { src: '/DSC_6174.jpg', alt: '浙江旅行照片 1' },
        { src: '/DSC_6510.jpg', alt: '浙江旅行照片 2' },
        { src: '/DSC_6760.JPG', alt: '浙江旅行照片 3' },
        { src: '/pashan.JPG', alt: '浙江旅行照片 4' },
        { src: '/DSC_6174.jpg', alt: '浙江旅行照片 5' },
        { src: '/DSC_6510.jpg', alt: '浙江旅行照片 6' },
      ],
    };
  },
  async mounted() {
    const [world, china] = await Promise.all([
      fetch('/maps/world.json').then((response) => response.json()),
      fetch('/maps/china.json').then((response) => response.json()),
    ]);

    this.countryPaths = this.topologyToFeatures(world, 'countries')
      .filter((feature) => feature.properties?.name !== 'Antarctica')
      .map((feature, index) => ({
        key: `${feature.id || 'country'}-${index}`,
        id: String(feature.id || ''),
        d: this.featureToPath(feature),
      }));

    this.provincePaths = china.features.map((feature, index) => ({
      key: `${feature.properties?.adcode || 'province'}-${index}`,
      name: feature.properties?.name || '',
      d: this.featureToPath(feature),
    }));
  },
  methods: {
    project([longitude, latitude]) {
      const x = ((longitude + 180) / 360) * this.mapWidth;
      const y = ((90 - latitude) / 180) * this.mapHeight;
      return [x, y];
    },
    featureToPath(feature) {
      const geometry = feature.geometry;

      if (!geometry) {
        return '';
      }

      const polygons = geometry.type === 'Polygon'
        ? [geometry.coordinates]
        : geometry.coordinates;

      return polygons
        .map((polygon) => polygon
          .map((ring) => this.ringToPath(ring))
          .join(' '))
        .join(' ');
    },
    ringToPath(ring) {
      if (!ring?.length) {
        return '';
      }

      return ring
        .map((point, index) => {
          const [x, y] = this.project(point);
          return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(' ')
        .concat(' Z');
    },
    topologyToFeatures(topology, objectName) {
      const transform = topology.transform;
      const arcs = topology.arcs.map((arc) => {
        let x = 0;
        let y = 0;

        return arc.map(([dx, dy]) => {
          x += dx;
          y += dy;
          return [
            x * transform.scale[0] + transform.translate[0],
            y * transform.scale[1] + transform.translate[1],
          ];
        });
      });

      return topology.objects[objectName].geometries.map((geometry) => ({
        type: 'Feature',
        id: geometry.id,
        properties: geometry.properties,
        geometry: {
          type: geometry.type,
          coordinates: this.arcsToCoordinates(geometry.arcs, geometry.type, arcs),
        },
      }));
    },
    arcsToCoordinates(sourceArcs, type, arcs) {
      if (type === 'Polygon') {
        return sourceArcs.map((ring) => this.joinArcs(ring, arcs));
      }

      return sourceArcs.map((polygon) => polygon.map((ring) => this.joinArcs(ring, arcs)));
    },
    joinArcs(ring, arcs) {
      return ring.flatMap((arcIndex, index) => {
        const arc = arcIndex >= 0 ? arcs[arcIndex] : [...arcs[-arcIndex - 1]].reverse();
        return index === 0 ? arc : arc.slice(1);
      });
    },
  },
};
</script>

<style scoped>
.footprints-page {
  min-height: 100vh;
  margin-top: -5rem;
  padding-top: 5rem;
  background: #050a14;
  color: #fff;
  overflow: hidden;
}

.map-stage {
  position: relative;
  min-height: calc(100vh - 5rem);
  overflow: hidden;
  background:
    radial-gradient(circle at 70% 36%, rgba(245, 158, 11, 0.08), transparent 18rem),
    #050a14;
}

.travel-map {
  width: 100%;
  height: calc(100vh - 5rem);
  min-height: 620px;
  display: block;
}

.world-layer path {
  fill: #1b2439;
  stroke: #2d3d63;
  stroke-width: 1.1;
  vector-effect: non-scaling-stroke;
  transition: fill 0.25s ease, filter 0.25s ease;
}

.world-layer path.is-highlighted,
.china-layer path.is-highlighted {
  fill: #f7a20b;
  stroke: #ffbd32;
  filter: url(#regionGlow);
}

.china-layer path {
  fill: transparent;
  stroke: #34476f;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
  pointer-events: none;
}

.marker-layer {
  pointer-events: none;
}

.marker-halo {
  fill: rgba(247, 162, 11, 0.28);
  filter: url(#pinGlow);
}

.marker-dot {
  fill: #f5a012;
  stroke: rgba(255, 255, 255, 0.9);
  stroke-width: 1.5;
}

.marker-core {
  fill: #fff4c7;
}

.location-card {
  position: absolute;
  right: 4.2vw;
  top: 28%;
  width: min(525px, 36vw);
  padding: 28px 30px 30px;
  border: 1px solid rgba(247, 162, 11, 0.7);
  border-radius: 12px;
  background: rgba(3, 7, 14, 0.9);
  box-shadow: 0 22px 70px rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(12px);
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
  font-size: 1.8rem;
  line-height: 1.1;
  letter-spacing: 0;
}

.card-heading span {
  color: #9ba9c0;
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
  border: 1px solid rgba(247, 162, 11, 0.48);
  border-radius: 8px;
  background: rgba(247, 162, 11, 0.28);
  color: #ffc84a;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.view-all:hover {
  background: rgba(247, 162, 11, 0.38);
  transform: translateY(-1px);
}

@media (max-width: 1100px) {
  .travel-map {
    width: 1320px;
    max-width: none;
    transform: translateX(-260px);
    transform-origin: left center;
  }

  .location-card {
    top: auto;
    right: 20px;
    bottom: 24px;
    left: 20px;
    width: auto;
    padding: 22px;
  }
}

@media (max-width: 680px) {
  .map-stage {
    min-height: 100vh;
  }

  .travel-map {
    width: 1120px;
    min-height: 560px;
    transform: translateX(-400px);
  }

  .location-card {
    padding: 18px;
  }

  .card-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }

  .card-heading h1 {
    font-size: 1.45rem;
  }

  .photo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
}
</style>
