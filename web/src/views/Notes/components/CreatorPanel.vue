<template>
  <div class="panel-fade-in">
    <div class="perspective-section">
      <span class="panel-label">CREATOR LOGBOOK</span>
      <div class="creator-meta-hint">手动记录光影灵感与现场手记</div>
    </div>

    <div class="manual-editor-box">
      <input type="text" :value="manualTitle" @input="$emit('update:manualTitle', $event.target.value)"
        class="manual-title-input" placeholder="在此输入手记标题..." />
      <textarea :value="manualContent" @input="$emit('update:manualContent', $event.target.value)"
        class="manual-textarea" placeholder="光影变幻的瞬间，写下你的主观直觉与艺术思考..."></textarea>
    </div>

    <div class="word-count-badge">
      字数: {{ manualContent.length }}
    </div>

    <div class="select-action">
      <button class="btn-apply" :disabled="isSaving || (!manualTitle && !manualContent)"
        @click="$emit('apply', manualTitle, manualContent)">
        {{ isSaving ? 'SAVING...' : 'APPLY TO PHOTO' }}
      </button>
      <span v-if="saveSuccess" class="save-hint">已保存</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreatorPanel',
  props: {
    manualTitle: { type: String, default: '' },
    manualContent: { type: String, default: '' },
    isSaving: { type: Boolean, default: false },
    saveSuccess: { type: Boolean, default: false }
  },
  emits: ['update:manualTitle', 'update:manualContent', 'apply']
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

.creator-meta-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: -6px;
  margin-bottom: 16px;
}

.manual-editor-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 16px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.manual-title-input {
  background: none;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  outline: none;
}

.manual-textarea {
  background: none;
  border: none;
  resize: none;
  height: 140px;
  font-size: 13px;
  line-height: 1.7;
  color: #d1d5db;
  outline: none;
}

.word-count-badge {
  text-align: right;
  font-size: 10px;
  color: #4b5563;
  font-family: monospace;
  margin-top: 6px;
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
</style>
