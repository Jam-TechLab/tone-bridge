<script setup>
defineProps({
  isPressed: Boolean,
  labelTop: String,
  labelBottom: String,
})
</script>

<template>
  <div :class="{ pressed: isPressed }">
    <span class="label label-top">{{ labelTop }}</span>
    <span class="label label-bottom">{{ labelBottom }}</span>
  </div>
</template>

<style scoped>
div {
  position: absolute;
  top: 0;
  width: 31.5px;
  height: 131.25px;
  background-color: #333;
  border: 1px solid black;
  box-sizing: border-box;
  z-index: 10;

  /* ラベルを下部に集める */
  display: flex; /* ← これがないとラベルが並ばない！ */
  flex-direction: column;
  justify-content: flex-end; /* 下揃え */
  align-items: center;
  padding-bottom: 4px; /* 黒鍵用に詰める */
  overflow: hidden;
}

div.pressed {
  background-color: #555;
}

.label {
  font-family: 'Menlo', 'Monaco', monospace;
  color: white; /* 白文字 */
  user-select: none;
  line-height: 1.1;
  text-align: center;
  width: 100%;
}
.label-top {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-bottom: 1px;
}
.label-bottom {
  font-size: 0.9rem;
  font-weight: bold;
}
</style>
