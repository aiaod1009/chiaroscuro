<template>
  <div class="player-controls">
    <div class="player-box">
      <button class="icon-btn" @click="$emit('prev')">&lt;</button>
      <button class="play-btn" @click="$emit('togglePlay')" :class="{ playing: isPlaying }">
        <span class="play-icon">{{ isPlaying ? '||' : '▶' }}</span>
      </button>
      <button class="icon-btn" @click="$emit('next')">&gt;</button>

      <div class="player-text">
        <div class="p-title">GALLERY AUTOPLAY</div>
        <div class="p-status">{{ isPlaying ? 'Playing...' : 'Ready to browse' }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerControls',
  props: {
    isPlaying: { type: Boolean, default: false }
  },
  emits: ['prev', 'next', 'togglePlay']
}
</script>

<style scoped>
.player-controls {
  display: inline-block;
}

.player-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  display: flex;
  align-items: center;
  padding: 0.5rem 1.5rem 0.5rem 0.5rem;
  backdrop-filter: blur(10px);
}

.icon-btn {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.3s;
}

.icon-btn:hover {
  opacity: 0.7;
}

.play-btn {
  background: #d4f4f0;
  color: #000;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  font-size: 0.9rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0.5rem;
  cursor: pointer;
  box-shadow: 0 0 15px rgba(0, 224, 198, 0.4);
  transition: all 0.3s;
}

.play-btn:hover {
  box-shadow: 0 0 25px rgba(0, 224, 198, 0.8);
  transform: scale(1.05);
}

.play-icon {
  margin-left: 2px;
}

.player-text {
  margin-left: 1.5rem;
  display: flex;
  flex-direction: column;
}

.p-title {
  font-size: 0.65rem;
  color: #8c9baf;
  letter-spacing: 1.5px;
  font-weight: bold;
}

.p-status {
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 0.2rem;
  color: #e2e8f0;
}
</style>
