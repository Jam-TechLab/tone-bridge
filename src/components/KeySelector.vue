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

  /* ↓↓↓ flex から grid に変更！ ↓↓↓ */
  display: grid;
  grid-template-columns: 40px 1fr 40px; /* ボタン(40px), ラベル(残り全部), ボタン(40px) */
  align-items: center;
  gap: 10px; /* 隙間 */

  max-width: 300px;
  margin: 0 auto;
}

.current-key {
  margin: 0;
  color: #42b883;
  font-size: 1.4rem;
  font-family: 'Menlo', 'Monaco', monospace;

  /* flex-grow: 1; ← gridにしたので不要 */
  text-align: center;
  /* padding: 0 10px; ← gridのgapが代わりになるので不要 */
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
</style>
