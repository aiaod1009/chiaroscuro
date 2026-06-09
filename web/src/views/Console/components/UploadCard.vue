<template>
  <div class="upload-box-card">
    <div class="cloud-icon-circle">
      <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M12 16v-8m0 0l-3 3m3-3l3 3M4.033 14.77a8 8 0 1115.348-4.762" />
      </svg>
    </div>
    <span class="upload-title">Upload visual assets</span>
    <span class="upload-formats">JPG / PNG / RAW</span>
    <button class="btn-batch-upload" @click="$emit('upload')">Batch Upload</button>
  </div>
</template>

<script setup>
defineEmits(['upload'])
</script>

<style scoped>
.upload-box-card {
  background-color: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 24px;
}

.cloud-icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b949e;
  margin-bottom: 16px;
}

.icon-svg {
  width: 22px;
  height: 22px;
}

.upload-title {
  font-size: 13px;
  font-weight: 600;
  color: #e5e7eb;
}

.upload-formats {
  font-size: 10px;
  font-family: monospace;
  color: #4b5563;
  margin-top: 4px;
  letter-spacing: 0.05em;
}

.btn-batch-upload {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px 0;
  color: #d1d5db;
  font-size: 12px;
  font-weight: 600;
  margin-top: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-batch-upload:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}
</style>
