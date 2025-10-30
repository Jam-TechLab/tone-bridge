<script setup>
defineProps({
  isPressed: Boolean,
  labelTop: String, // 'label'から'labelTop'に変更
  labelBottom: String, // 'labelBottom'を新しく追加
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
  width: 52.5px;
  height: 210px;
  background-color: white;
  border: 1px solid #333;
  box-sizing: border-box;

  /* ラベルを下部に集める */
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* 下揃え */
  align-items: center;
  padding-bottom: 5px; /* 下の余白を少し詰める */
}

div.pressed {
  background-color: #e0e0e0;
}

.label {
  font-family: 'Menlo', 'Monaco', monospace;
  color: #333;
  user-select: none;
  line-height: 1.1; /* 行の高さを少し詰めて上下の間隔を調整 */
  text-align: center;
  width: 100%;
}
.label-top {
  font-size: 0.9rem; /* さらに少し小さく */
  opacity: 0.7;
  margin-bottom: 2px; /* 下のラベルとの間に少し隙間 */
}
.label-bottom {
  font-size: 1.1rem; /* 少し小さめ */
  font-weight: bold;
}
</style>
