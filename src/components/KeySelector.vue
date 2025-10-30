<script setup>
defineProps({
  currentKey: String,
})

// このコンポーネントが親に送信するイベントを定義する
const emit = defineEmits(['change-key'])
</script>

<template>
  <header class="header">
    <div class="key-display">
      <button class="key-btn" @click="emit('change-key', 'prev')">&lt;</button>

      <div class="key-name">
        <span>Key:</span>
        <strong class="current-key">{{ currentKey }}</strong>
      </div>

      <button class="key-btn" @click="emit('change-key', 'next')">&gt;</button>
    </div>
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
}

.key-display {
  font-size: 1.2rem;
  line-height: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 300px;
  margin: 0 auto;
}

.current-key {
  margin-left: 10px;
  color: #42b883;
  font-size: 1.4rem;
  font-family: 'Menlo', 'Monaco', monospace;
}

.key-btn {
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
.key-btn:active {
  background-color: #333;
}
</style>
