<script setup>
defineProps({
  currentKey: String,
})
// ↓ 'toggle-fixed' を追加！
const emit = defineEmits(['change-key', 'toggle-fixed'])
</script>

<template>
  <header class="header">
    <div class="key-display">
      <button class="key-btn" @click="emit('change-key', 'prev')">&lt;</button>
      <strong class="current-key">{{ currentKey }}</strong>
      <button class="key-btn" @click="emit('change-key', 'next')">&gt;</button>
    </div>

    <button class="key-btn settings-btn" @click="emit('toggle-fixed')">⚙️</button>
  </header>
</template>

<style scoped>
.header {
  width: 100%;
  padding: 16px;
  background-color: #1a1a1a;
  color: white;
  box-sizing: border-box;
  text-align: center;
  flex-shrink: 0;
  user-select: none;
  -webkit-user-select: none;

  position: relative; /* This is the new parent anchor */
}

.key-display {
  display: grid;
  /* Back to 3 columns */
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  gap: 10px;
  /* Back to 300px */
  max-width: 300px;
  margin: 0 auto;
}

.current-key {
  margin: 0;
  color: #42b883;
  font-size: 1.4rem;
  font-family: 'Menlo', 'Monaco', monospace;
  flex-grow: 1;
  text-align: center;
  padding: 0 10px;
}

.key-btn {
  font-size: 1.5rem;
  background: none;
  border: 1px solid #444;
  color: white;
  width: 40px; /* gridの列幅と一致 */
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  line-height: 1;
  flex-shrink: 0; /* gridなので不要だが、念のため残してもOK */
}
.key-btn:active {
  background-color: #333;
}

.settings-btn {
  position: absolute;
  top: 50%; /* Vertically center */
  transform: translateY(-50%);
  right: 16px; /* Align with header's padding */

  /* Copied from key-btn */
  font-size: 1.5rem;
  background: none;
  border: 1px solid #444;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  line-height: 1;
}
.settings-btn:active {
  background-color: #333;
}
</style>
