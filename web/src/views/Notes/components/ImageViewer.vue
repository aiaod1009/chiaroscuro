<template>
  <div class="image-viewer">
    <div class="tags-row">
      <div class="viewer-tag tag-analyzing">
        <span class="pulse-dot"></span>
        {{ isGenerating ? 'NEURAL FIRING...' : 'ANALYZING PIXELS...' }}
      </div>
      <div class="viewer-tag tag-synced">
        <span class="sync-icon">◎</span>
        LATENT SPACE SYNCED
      </div>
    </div>

    <img :src="imageSrc" alt="Visual Notes Source" class="source-img" />

    <div v-if="isGenerating" class="generating-overlay">
      <div class="neural-spinner"></div>
      <span class="generating-text">DECODE VISUAL TOKENS...</span>
    </div>

    <div class="scan-line"></div>
  </div>
</template>

<script>
export default {
  name: 'ImageViewer',
  props: {
    imageSrc: { type: String, default: '/DSC_6510.jpg' },
    isGenerating: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.image-viewer {
  position: relative;
  width: 100%;
  max-height: 60vh;
  border-radius: 20px;
  overflow: hidden;
  background-color: #020617;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.source-img {
  width: 100%;
  display: block;
  object-fit: contain;
  max-height: 60vh;
}

.tags-row {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
  z-index: 2;
}

.viewer-tag {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #9ca3af;
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  gap: 6px;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background-color: #22d3ee;
  border-radius: 50%;
  box-shadow: 0 0 8px #22d3ee;
  animation: ripple 1.8s infinite ease-in-out;
}

@keyframes ripple {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.sync-icon {
  font-size: 11px;
  color: #6b7280;
}

.scan-line {
  position: absolute;
  bottom: 12%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(34, 211, 238, 0) 0%, rgba(34, 211, 238, 0.3) 50%, rgba(34, 211, 238, 0) 100%);
  box-shadow: 0 0 6px rgba(34, 211, 238, 0.4);
}

.generating-overlay {
  position: absolute;
  inset: 0;
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  z-index: 5;
}

.neural-spinner {
  width: 36px;
  height: 36px;
  border: 2px solid rgba(34, 211, 238, 0.15);
  border-top-color: #22d3ee;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.generating-text {
  font-size: 10px;
  font-family: monospace;
  letter-spacing: 0.15em;
  color: #22d3ee;
  animation: blink 1.4s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
</style>
