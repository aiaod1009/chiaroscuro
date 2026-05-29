<template>
  <div class="asset-card" @click="$emit('click')">
    <div class="card-top-overlay">
      <div class="status-indicator" :class="{ completed: isCompleted }">
        {{ isCompleted ? '✓' : '○' }}
      </div>

      <div class="menu-wrapper" @click.stop>
        <button class="menu-trigger" @click.stop="menuOpen = !menuOpen">⋯</button>
        <div v-if="menuOpen" class="menu-dropdown">
          <div class="menu-item" @click.stop="showMoveList = !showMoveList; deleteConfirm = false">
            移动到…
          </div>
          <div v-if="showMoveList" class="move-sublist">
            <div v-for="work in works" :key="work._id" class="move-option"
              @click.stop="$emit('move', work._id); closeMenu()">
              {{ work.name }}
            </div>
            <div v-if="!works.length" class="move-empty">无其他作品集</div>
          </div>
          <div class="menu-divider"></div>
          <div class="menu-item menu-item-delete" @click.stop="deleteConfirm = !deleteConfirm; showMoveList = false">
            删除
          </div>
          <div v-if="deleteConfirm" class="delete-confirm">
            <span class="confirm-text">确认删除？</span>
            <button class="confirm-btn" @click.stop="$emit('delete'); closeMenu()">确认</button>
          </div>
        </div>
      </div>
    </div>

    <img :src="imageUrl" :alt="fileName" class="asset-img" />

    <div class="card-bottom-glass">
      <h3 class="asset-title">{{ title || fileName }}</h3>
      <p class="asset-meta">{{ caption || '未写配文' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  fileName: { type: String, default: '' },
  caption: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  isCompleted: { type: Boolean, default: false },
  works: { type: Array, default: () => [] }
})

defineEmits(['click', 'delete', 'move'])

const menuOpen = ref(false)
const showMoveList = ref(false)
const deleteConfirm = ref(false)

const closeMenu = () => {
  menuOpen.value = false
  showMoveList.value = false
  deleteConfirm.value = false
}

// 点击卡片外部关闭菜单
const handleDocClick = () => { if (menuOpen.value) closeMenu() }
import { onMounted, onUnmounted } from 'vue'
onMounted(() => document.addEventListener('click', handleDocClick))
onUnmounted(() => document.removeEventListener('click', handleDocClick))
</script>

<style scoped>
.asset-card {
  position: relative;
  aspect-ratio: 3 / 2;
  border-radius: 16px;
  overflow: hidden;
  background-color: #161b22;
  cursor: pointer;
}

.asset-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.asset-card:hover .asset-img {
  transform: scale(1.02);
}

.card-top-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 3;
}

.status-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #f0ad4e;
}

.status-indicator.completed {
  border-color: #5cb85c;
  color: #5cb85c;
}

/* 三点菜单 */
.menu-wrapper {
  position: relative;
}

.menu-trigger {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.asset-card:hover .menu-trigger {
  opacity: 1;
}

.menu-trigger:hover {
  background-color: rgba(0, 0, 0, 0.6);
  border-color: rgba(255, 255, 255, 0.4);
}

.menu-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 160px;
  background: rgba(10, 14, 22, 0.8);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  z-index: 10;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #e2e8f0;
  cursor: pointer;
  transition: background 0.15s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.menu-item-delete {
  color: #f87171;
}

.menu-item-delete:hover {
  background: rgba(248, 113, 113, 0.12);
}

.menu-icon {
  font-size: 13px;
}

.menu-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 4px 0;
}

.move-sublist {
  padding: 4px 0 4px 12px;
}

.move-option {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  color: #93c5fd;
  cursor: pointer;
  transition: background 0.15s;
}

.move-option:hover {
  background: rgba(147, 197, 253, 0.12);
}

.move-empty {
  padding: 6px 12px;
  font-size: 11px;
  color: #4b5563;
}

.delete-confirm {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
}

.confirm-text {
  font-size: 11px;
  color: #f87171;
}

.confirm-btn {
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(248, 113, 113, 0.2);
  border: 1px solid rgba(248, 113, 113, 0.4);
  color: #f87171;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.confirm-btn:hover {
  background: rgba(248, 113, 113, 0.35);
}

.card-bottom-glass {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 70%, transparent 100%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 2;
  transform: translateY(100%);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.asset-card:hover .card-bottom-glass {
  transform: translateY(0);
  opacity: 1;
}

.asset-title {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 6px 0;
}

.asset-meta {
  font-size: 12px;
  color: #8b949e;
  margin: 0;
}
</style>
