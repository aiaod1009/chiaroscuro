<template>
  <div class="scifi-panel analysis-panel">
    <div class="panel-header">
      <div class="title-group">
        <span class="panel-title-zh">AI 构图分析</span>
        <span class="panel-title-en">Analysis</span>
      </div>
    </div>

    <div class="radar-section">
      <RadarChart :data="radarData" :size="200" />
    </div>

    <div class="analysis-result" v-if="analysisResult">
      <div class="analysis-text">{{ analysisResult }}</div>
    </div>

    <div class="analysis-loading" v-if="isAnalyzing">
      <div class="spinner"></div>
      <span>AI 正在分析构图...</span>
    </div>

    <button class="btn-reanalyze" @click="analyze" :disabled="isAnalyzing">
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
    imageSrc: { type: String, required: true },
    photoId: { type: String, default: null },
    cachedAnalysis: { type: Object, default: null }
  },
  data() {
    return {
      isAnalyzing: false,
      analysisResult: '',
      radarData: [
        { label: '构图平衡', value: 0 },
        { label: '三分法则', value: 0 },
        { label: '引导线', value: 0 },
        { label: '主体突出', value: 0 },
        { label: '景深层次', value: 0 },
        { label: '色彩光影', value: 0 }
      ]
    }
  },
  watch: {
    cachedAnalysis: {
      immediate: true,
      handler(val) {
        if (val?.result) {
          this.analysisResult = val.result
        }
        if (val?.radar?.length) {
          this.radarData = val.radar
        }
      }
    }
  },
  methods: {
    async analyze() {
      if (this.isAnalyzing) return
      this.isAnalyzing = true
      this.analysisResult = ''
      this.radarData = this.radarData.map(d => ({ ...d, value: 0 }))

      try {
        const response = await fetch('/api/ai/analyze-composition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: this.imageSrc, photoId: this.photoId })
        })

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let fullContent = ''
        let scoresParsed = false

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n').filter(line => line.trim() !== '')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  fullContent += parsed.content

                  if (!scoresParsed && fullContent.includes('---')) {
                    const parts = fullContent.split('---')
                    const jsonPart = parts[0].trim()
                    try {
                      const scoreData = JSON.parse(jsonPart)
                      if (scoreData.radar) {
                        this.radarData = Object.entries(scoreData.radar).map(([label, value]) => ({ label, value }))
                        scoresParsed = true
                      }
                    } catch (e) {
                      // JSON 还没完整，继续累积
                    }
                    this.analysisResult = parts.slice(1).join('---').trim()
                  } else if (scoresParsed) {
                    this.analysisResult = fullContent.split('---').slice(1).join('---').trim()
                  }
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      } catch (err) {
        console.error('构图分析失败:', err)
        this.analysisResult = '分析失败，请稍后重试'
      } finally {
        this.isAnalyzing = false
      }
    }
  }
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
  margin-bottom: 8px;
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
