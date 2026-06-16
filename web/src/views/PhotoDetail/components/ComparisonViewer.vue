<template>
  <div class="comparison-viewer" @click.self="openLeft = openRight = false">
    <img :src="rightSrc" alt="Right Version" class="image-layer" />

    <div class="original-layer-wrapper"
      :style="{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }">
      <img :src="leftSrc" alt="Left Version" class="image-layer original-img" />
    </div>

    <!-- 左侧选择器 -->
    <div class="selector selector-left" @click.stop>
      <button class="selector-btn" @click="openLeft = !openLeft; openRight = false">
        <span class="selector-label">{{ leftLabel }}</span>
        <svg class="selector-arrow" :class="{ open: openLeft }" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 11L3 6h10z" />
        </svg>
      </button>
      <transition name="dropdown">
        <div v-if="openLeft" class="dropdown-menu">
          <div v-for="v in allVersions" :key="v._id" class="dropdown-item"
            :class="{ active: leftId === v._id }">
            <button class="item-select" @click="leftId = v._id; openLeft = false">
              <span class="item-dot" :class="{ active: leftId === v._id }"></span>
              <template v-if="renamingId === v._id">
                <input class="rename-input" v-model="renameText" @keyup.enter="confirmRename(v._id)"
                  @keyup.escape="cancelRename" @click.stop ref="renameInput" />
              </template>
              <template v-else>{{ v.label }}</template>
            </button>
            <button v-if="v._id !== '__original__'" class="item-action" @click.stop="startRename(v)" title="重命名">
              <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path d="M12.146.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-9.5 9.5a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l9.5-9.5z"/></svg>
            </button>
            <button v-if="v._id !== '__original__'" class="item-action danger" @click.stop="confirmDelete(v._id, v.label)" title="删除">
              <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1z"/></svg>
            </button>
          </div>
        </div>
      </transition>
    </div>

    <!-- 右侧选择器 -->
    <div class="selector selector-right" @click.stop>
      <button class="selector-btn" @click="openRight = !openRight; openLeft = false">
        <span class="selector-label">{{ rightLabel }}</span>
        <svg class="selector-arrow" :class="{ open: openRight }" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 11L3 6h10z" />
        </svg>
      </button>
      <transition name="dropdown">
        <div v-if="openRight" class="dropdown-menu">
          <div v-for="v in allVersions" :key="v._id" class="dropdown-item"
            :class="{ active: rightId === v._id }">
            <button class="item-select" @click="rightId = v._id; openRight = false">
              <span class="item-dot" :class="{ active: rightId === v._id }"></span>
              <template v-if="renamingId === v._id">
                <input class="rename-input" v-model="renameText" @keyup.enter="confirmRename(v._id)"
                  @keyup.escape="cancelRename" @click.stop ref="renameInput" />
              </template>
              <template v-else>{{ v.label }}</template>
            </button>
            <button v-if="v._id !== '__original__'" class="item-action" @click.stop="startRename(v)" title="重命名">
              <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path d="M12.146.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-9.5 9.5a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l9.5-9.5z"/></svg>
            </button>
            <button v-if="v._id !== '__original__'" class="item-action danger" @click.stop="confirmDelete(v._id, v.label)" title="删除">
              <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1z"/></svg>
            </button>
          </div>
        </div>
      </transition>
    </div>

    <div class="slider-handle" :style="{ left: `${sliderPosition}%` }">
      <div class="handle-button">Unfold</div>
    </div>

    <input type="range" min="0" max="100" v-model="sliderPosition" class="hidden-range-input" />

    <!-- 删除确认弹窗 -->
    <transition name="modal">
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="modal-box">
          <div class="modal-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="32" height="32">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h4 class="modal-title">删除版本</h4>
          <p class="modal-desc">确定删除「{{ deleteTarget.label }}」？此操作不可撤销。</p>
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="deleteTarget = null">取消</button>
            <button class="modal-btn danger" @click="doDelete">删除</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'ComparisonViewer',
  props: {
    originalSrc: { type: String, required: true },
    versions: { type: Array, default: () => [] },
    activeVersionId: { type: String, default: null }
  },
  data() {
    return {
      sliderPosition: 53,
      leftId: '__original__',
      rightId: '__original__',
      openLeft: false,
      openRight: false,
      renamingId: null,
      renameText: '',
      deleteTarget: null
    }
  },
  computed: {
    allVersions() {
      const list = [{ _id: '__original__', label: 'ORIGINAL', imageUrl: this.originalSrc }]
      for (const v of this.versions) {
        list.push({ _id: v._id, label: v.versionName || ('V' + v._id.slice(-4)), imageUrl: v.imageUrl })
      }
      return list
    },
    leftLabel() {
      return this.allVersions.find(v => v._id === this.leftId)?.label || 'ORIGINAL'
    },
    rightLabel() {
      return this.allVersions.find(v => v._id === this.rightId)?.label || 'ORIGINAL'
    },
    leftSrc() {
      return this.allVersions.find(v => v._id === this.leftId)?.imageUrl || this.originalSrc
    },
    rightSrc() {
      return this.allVersions.find(v => v._id === this.rightId)?.imageUrl || this.originalSrc
    }
  },
  methods: {
    startRename(v) {
      this.renamingId = v._id
      this.renameText = v.label
      this.$nextTick(() => {
        const input = this.$refs.renameInput
        if (input) (Array.isArray(input) ? input[0] : input).focus()
      })
    },
    cancelRename() {
      this.renamingId = null
      this.renameText = ''
    },
    async confirmRename(id) {
      if (!this.renameText.trim()) return
      this.$emit('rename-version', { id, versionName: this.renameText.trim() })
      this.cancelRename()
    },
    confirmDelete(id, label) {
      this.deleteTarget = { id, label }
      this.openLeft = false
      this.openRight = false
    },
    doDelete() {
      if (this.deleteTarget) {
        this.$emit('delete-version', this.deleteTarget.id)
        this.deleteTarget = null
      }
    }
  },
  watch: {
    activeVersionId: {
      immediate: true,
      handler(id) {
        if (id) this.rightId = id
      }
    }
  },
  mounted() {
    document.addEventListener('click', () => {
      this.openLeft = false
      this.openRight = false
    })
  },
  beforeUnmount() {
    document.removeEventListener('click', () => {
      this.openLeft = false
      this.openRight = false
    })
  }
}
</script>

<style scoped>
.comparison-viewer {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid #1f2937;
  background-color: #111827;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.image-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.original-layer-wrapper {
  position: absolute;
  inset: 0;
  user-select: none;
  pointer-events: none;
}

/* 选择器 */
.selector {
  position: absolute;
  top: 16px;
  z-index: 20;
}

.selector-left {
  left: 16px;
}

.selector-right {
  right: 16px;
}

.selector-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
  color: #e5e7eb;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.selector-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  border-color: rgba(255, 255, 255, 0.25);
}

.selector-arrow {
  width: 10px;
  height: 10px;
  color: #6b7280;
  transition: transform 0.2s;
}

.selector-arrow.open {
  transform: rotate(180deg);
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 160px;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 6px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  z-index: 30;
}

.selector-right .dropdown-menu {
  left: auto;
  right: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 4px 6px;
  background: transparent;
  border-radius: 10px;
  transition: background 0.15s;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.item-select {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  padding: 6px 8px;
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: color 0.15s;
  text-align: left;
  min-width: 0;
}

.item-select:hover {
  color: #e5e7eb;
}

.dropdown-item.active .item-select {
  color: #22d3ee;
}

.item-action {
  flex-shrink: 0;
  padding: 4px;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
  display: flex;
  align-items: center;
}

.item-action:hover {
  color: #e5e7eb;
  background: rgba(255, 255, 255, 0.08);
}

.item-action.danger:hover {
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}

.rename-input {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid #22d3ee;
  border-radius: 4px;
  color: #e5e7eb;
  font-size: 12px;
  padding: 2px 6px;
  width: 100px;
  outline: none;
}

/* 删除确认弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-box {
  background: #1a2235;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 32px;
  width: 320px;
  text-align: center;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
}

.modal-icon {
  color: #f87171;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #e5e7eb;
  margin: 0 0 8px;
}

.modal-desc {
  font-size: 13px;
  color: #9ca3af;
  margin: 0 0 24px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-btn {
  padding: 8px 24px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.modal-btn.cancel {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #9ca3af;
}

.modal-btn.cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e5e7eb;
}

.modal-btn.danger {
  background: #dc2626;
  color: #fff;
}

.modal-btn.danger:hover {
  background: #ef4444;
}

/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-box {
  transform: scale(0.95);
}

.modal-leave-to .modal-box {
  transform: scale(0.95);
}

.item-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #374151;
  flex-shrink: 0;
  transition: background 0.15s;
}

.item-dot.active {
  background: #22d3ee;
  box-shadow: 0 0 6px rgba(34, 211, 238, 0.5);
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* 拖拽中心中轴 */
.slider-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #22d3ee;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.handle-button {
  width: 48px;
  height: 48px;
  border-radius: 50px;
  background-color: #083344;
  border: 2px solid #22d3ee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.1em;
  color: #22d3ee;
  text-transform: uppercase;
  box-shadow: 0 0 15px rgba(34, 211, 238, 0.3);
}

/* 隐藏的原生拖动滑块覆盖整图 */
.hidden-range-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: ew-resize;
  z-index: 10;
  margin: 0;
}
</style>