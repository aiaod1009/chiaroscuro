<template>
  <div class="scifi-panel analysis-panel">
    <div class="panel-header">
      <div class="title-group">
        <span class="panel-title-zh">AI 构图分析</span>
        <span class="panel-title-en">Analysis</span>
      </div>
    </div>

    <div class="radar-section">
      <RadarChart :data="radarData" :size="180" />
    </div>

    <div class="analysis-result" v-if="analysisResult">
      <div class="analysis-text">{{ analysisResult }}</div>
    </div>

    <div class="analysis-loading" v-if="isAnalyzing">
      <div class="spinner"></div>
      <span>AI 正在分析构图...</span>
    </div>

    <button class="btn-reanalyze" @click="$emit('analyze')" :disabled="isAnalyzing">
      {{ isAnalyzing ? '分析中...' : '分析构图' }}
    </button>
  </div>
</template>

<script>
import RadarChart from './RadarChart.vue'

export default {
  name: 'AnalysisPanel',
  components: { RadarChart },
  props: {
    radarData: { type: Array, default: () => [] },
    analysisResult: { type: String, default: '' },
    isAnalyzing: { type: Boolean, default: false }
  },
  emits: ['analyze']
}
</script>

<style scoped>
.analysis-panel {
  background-color: rgba(18, 24, 36, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(31, 41, 55, 0.8);
  border-radius: 24px;
  padding: 16px;
  gap: 12px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-group {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.panel-title-zh {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.05em;
}

.panel-title-en {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
}

.radar-section {
  display: flex;
  justify-content: center;
}

.analysis-result {
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(31, 41, 55, 0.6);
}

.analysis-result::-webkit-scrollbar {
  width: 4px;
}

.analysis-result::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}

.analysis-text {
  font-size: 13px;
  line-height: 1.8;
  color: #d1d5db;
  white-space: pre-wrap;
}

.analysis-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  color: #6b7280;
  font-size: 12px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #4b5563;
  border-top-color: #22d3ee;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-reanalyze {
  width: 100%;
  padding: 10px;
  border-radius: 12px;
  background-color: rgba(17, 24, 39, 0.8);
  border: 1px solid #1f2937;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reanalyze:hover {
  background-color: #1a2232;
  border-color: #374151;
  color: #ffffff;
}

.btn-reanalyze:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
