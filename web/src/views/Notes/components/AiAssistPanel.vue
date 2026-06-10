<template>
  <div class="panel-fade-in">
    <div class="perspective-section">
      <span class="panel-label">SELECT PERSPECTIVE</span>
      <div class="perspective-buttons">
        <button v-for="p in perspectives" :key="p.id" class="p-btn"
          :class="{ active: activePerspective === p.id }" @click="$emit('update:activePerspective', p.id)">
          {{ p.name }}
        </button>
      </div>
    </div>

    <div v-if="candidates.length" class="candidate-tabs">
      <button v-for="(c, i) in candidates" :key="c.optionId" class="candidate-tab"
        :class="{ active: activeCandidateIndex === i }" @click="$emit('selectCandidate', i)">
        方案{{ c.optionId }}
      </button>
    </div>

    <div v-if="noHistory && !candidates.length && !isGenerating" class="no-history-hint">
      该风格暂无历史记录，点击 AI GENERATE 开始生成
    </div>

    <div v-if="activeCandidate.title" class="output-narrative" :class="{ iterating: isIterating }">
      <h2 class="narrative-title">{{ activeCandidate.title }}</h2>
      <p class="narrative-body">
        "{{ activeCandidate.caption }}"
      </p>
      <div v-if="isIterating" class="iterating-bar">
        <div class="iterating-spinner"></div>
        <span>AI REWRITING...</span>
      </div>
    </div>

    <div v-if="candidates.length" class="select-action">
      <button class="btn-apply" :disabled="isSaving"
        @click="$emit('apply', activeCandidate.title, activeCandidate.caption)">
        {{ isSaving ? 'SAVING...' : 'APPLY TO PHOTO' }}
      </button>
      <span v-if="saveSuccess" class="save-hint">已保存</span>
    </div>

    <div class="optimize-section">
      <div class="optimize-header">
        <span class="panel-label">DISS/OPTIMIZE GENERATION?</span>
        <span class="btn-redraft" @click="$emit('optimize')">
          <svg class="mini-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H19" />
          </svg>
          {{ isIterating ? 'RE-DRAFTING...' : 'RE-DRAFT' }}
        </span>
      </div>
      <div class="input-wrapper">
        <input type="text" :value="aiPrompt" @input="$emit('update:aiPrompt', $event.target.value)"
          :disabled="isIterating" placeholder="例如：再冷酷一点，减少抒情..." @keyup.enter="$emit('optimize')" />
        <button class="send-btn" :disabled="isIterating" @click="$emit('optimize')">➔</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AiAssistPanel',
  props: {
    perspectives: { type: Array, default: () => [] },
    activePerspective: { type: String, default: 'poetic' },
    candidates: { type: Array, default: () => [] },
    activeCandidateIndex: { type: Number, default: 0 },
    activeCandidate: { type: Object, default: () => ({ title: '', caption: '' }) },
    noHistory: { type: Boolean, default: false },
    isGenerating: { type: Boolean, default: false },
    isIterating: { type: Boolean, default: false },
    isSaving: { type: Boolean, default: false },
    saveSuccess: { type: Boolean, default: false },
    aiPrompt: { type: String, default: '' }
  },
  emits: ['update:activePerspective', 'update:aiPrompt', 'selectCandidate', 'apply', 'optimize']
}
</script>

<style scoped>
.panel-fade-in {
  animation: fadeIn 0.35s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.panel-label {
  font-size: 9px;
  font-family: monospace;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #4b5563;
  display: block;
  margin-bottom: 12px;
}

.perspective-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.p-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  font-family: monospace;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
}

.p-btn.active {
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.02);
}

.candidate-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.candidate-tab {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 5px 14px;
  border-radius: 8px;
  font-size: 10px;
  font-family: monospace;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.candidate-tab.active {
  border-color: #22d3ee;
  color: #22d3ee;
  background-color: rgba(34, 211, 238, 0.06);
}

.candidate-tab:hover:not(.active) {
  border-color: rgba(255, 255, 255, 0.15);
  color: #9ca3af;
}

.no-history-hint {
  font-size: 12px;
  color: #4b5563;
  text-align: center;
  padding: 24px 0;
  font-family: monospace;
}

.output-narrative {
  margin-bottom: 24px;
  position: relative;
}

.output-narrative.iterating {
  opacity: 0.45;
}

.narrative-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
  border-left: 2px solid #22d3ee;
  padding-left: 10px;
}

.narrative-body {
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.7;
  margin: 0;
}

.iterating-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  font-size: 10px;
  font-family: monospace;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #22d3ee;
}

.iterating-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(34, 211, 238, 0.2);
  border-top-color: #22d3ee;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.select-action {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.btn-apply {
  padding: 8px 18px;
  background: rgba(34, 211, 238, 0.1);
  border: 1px solid rgba(34, 211, 238, 0.35);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #22d3ee;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-apply:hover:not(:disabled) {
  background: rgba(34, 211, 238, 0.2);
  border-color: #22d3ee;
}

.btn-apply:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.save-hint {
  font-size: 11px;
  font-weight: 600;
  color: #34d399;
  animation: fadeIn 0.3s ease;
}

.optimize-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-redraft {
  font-size: 10px;
  font-family: monospace;
  font-weight: 700;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.mini-icon {
  width: 12px;
  height: 12px;
}

.input-wrapper {
  position: relative;
  width: 100%;
  margin-top: 6px;
}

.input-wrapper input {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px 40px 12px 14px;
  font-size: 12px;
  color: #ffffff;
  outline: none;
}

.input-wrapper input:focus {
  border-color: rgba(34, 211, 238, 0.3);
}

.send-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
}

.send-btn:hover {
  color: #22d3ee;
}
</style>
