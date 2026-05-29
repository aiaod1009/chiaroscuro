<template>
  <div class="asset-card" @click="$emit('click')">
    <div class="card-top-overlay">
      <div class="status-indicator" :class="{ completed: isCompleted }">
        {{ isCompleted ? '✓' : '○' }}
      </div>

      <div class="menu-wrapper" @click.stop>
        <button class="menu-trigger" @click.stop="menuOpen = !menuOpen">⋯</button>
        <div v-if="menuOpen" class="menu-dropdown">
          <div class="menu-item" @click.stop="showMoveList = !showMoveList; showCopyList = false">
            移动到…
          </div>
          <div v-if="showMoveList" class="move-sublist">
            <div v-for="work in works" :key="work._id" class="move-option"
              @click.stop="$emit('move', work._id); closeMenu()">
              {{ work.name }}
            </div>
            <div v-if="!works.length" class="move-empty">无其他作品集</div>
          </div>
          <div class="menu-item" @click.stop="showCopyList = !showCopyList; showMoveList = false">
            复制到…
          </div>
          <div v-if="showCopyList" class="move-sublist">
            <div v-for="work in works" :key="work._id" class="move-option"
              @click.stop="$emit('copy', work._id); closeMenu()">
              {{ work.name }}
            </div>
            <div v-if="!works.length" class="move-empty">无其他作品集</div>
          </div>
          <div class="menu-divider"></div>
          <div class="menu-item menu-item-delete" @click.stop="showDeleteModal = true; closeMenu()">
            删除
          </div>
        </div>
      </div>
    </div>

    <img :src="imageUrl" :alt="fileName" class="asset-img" />

    <div class="card-bottom-glass">
      <h3 class="asset-title">{{ title || fileName }}</h3>
      <p class="asset-meta">{{ caption || '未写配文' }}</p>
    </div>

    <!-- 删除确认弹窗 -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal-box">
          <h3 class="modal-title">删除照片</h3>
          <p class="modal-desc">「{{ title || fileName }}」当前存在于 {{ albumCount }} 个作品集中</p>
          <div class="modal-actions">
            <button class="modal-btn modal-btn-remove" @click="$emit('removeAlbum'); showDeleteModal = false">
              仅从当前作品集移除
            </button>
            <button class="modal-btn modal-btn-delete" @click="$emit('delete'); showDeleteModal = false">
              从所有作品集删除
            </button>
          </div>
          <button class="modal-cancel" @click="showDeleteModal = false">取消</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  fileName: { type: String, default: '' },
  caption: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  isCompleted: { type: Boolean, default: false },
  works: { type: Array, default: () => [] },
  albumCount: { type: Number, default: 1 }
})

defineEmits(['click', 'delete', 'move', 'copy', 'removeAlbum'])

const menuOpen = ref(false)
const showMoveList = ref(false)
const showCopyList = ref(false)
const showDeleteModal = ref(false)

const closeMenu = () => {
  menuOpen.value = false
  showMoveList.value = false
  showCopyList.value = false
}

const handleDocClick = () => { if (menuOpen.value) closeMenu() }
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

/* 删除弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background: rgba(17, 22, 32, 0.95);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 32px;
  width: 360px;
  text-align: center;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
}

.modal-desc {
  font-size: 13px;
  color: #9ca3af;
  margin: 0 0 28px 0;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.modal-btn {
  padding: 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.modal-btn-remove {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.modal-btn-remove:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

.modal-btn-delete {
  background: rgba(248, 113, 113, 0.15);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #f87171;
}

.modal-btn-delete:hover {
  background: rgba(248, 113, 113, 0.25);
  border-color: rgba(248, 113, 113, 0.5);
}

.modal-cancel {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  padding: 4px;
  transition: color 0.15s;
}

.modal-cancel:hover {
  color: #9ca3af;
}

/* 卡片底部信息 */
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
