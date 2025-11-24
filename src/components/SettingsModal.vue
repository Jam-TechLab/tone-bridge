<script setup>
defineProps({
  isViewFollowingRelative: Boolean,
  isLandscapeRelative: Boolean,
  isDeviceLandscape: Boolean,
})

const emit = defineEmits(['update:isViewFollowingRelative', 'update:isLandscapeRelative', 'close'])
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>設定</h2>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>

      <div class="modal-body">
        <div v-if="!isDeviceLandscape" class="setting-item">
          <div class="setting-label">
            <span class="setting-title">画面を相対キーボードと一緒に動かす</span>
            <span class="setting-desc">
              ONにすると、相対キーボードが固定され、<br />
              絶対キーボードが動きます。
            </span>
          </div>
          <label class="toggle-switch">
            <input
              type="checkbox"
              :checked="isViewFollowingRelative"
              @change="emit('update:isViewFollowingRelative', $event.target.checked)"
            />
            <span class="slider"></span>
          </label>
        </div>

        <div v-if="isDeviceLandscape" class="setting-item">
          <div class="setting-label">
            <span class="setting-title">相対音キーボードにする</span>
            <span class="setting-desc">
              ON: キーに合わせて音が移調されます(移動ド)<br />
              OFF: 鍵盤の音は固定され、ラベルが動きます(固定ド)
            </span>
          </div>
          <label class="toggle-switch">
            <input
              type="checkbox"
              :checked="isLandscapeRelative"
              @change="emit('update:isLandscapeRelative', $event.target.checked)"
            />
            <span class="slider"></span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}
.modal-content {
  background-color: #222;
  color: white;
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  border: 1px solid #444;
  overflow: hidden;
}
.modal-header {
  padding: 16px;
  background-color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
}
.close-btn {
  background: none;
  border: none;
  color: #ccc;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 8px;
}
.modal-body {
  padding: 20px;
}
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #333;
}
.setting-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.setting-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.setting-title {
  font-weight: bold;
  font-size: 1rem;
}
.setting-desc {
  font-size: 0.8rem;
  color: #aaa;
}
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
  flex-shrink: 0;
}
.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #555;
  transition: 0.4s;
  border-radius: 28px;
}
.slider:before {
  position: absolute;
  content: '';
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: #42b883;
}
input:checked + .slider:before {
  transform: translateX(22px);
}
</style>
