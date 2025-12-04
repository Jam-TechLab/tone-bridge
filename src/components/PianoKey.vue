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
  /* width: 52.5px; */ /* ← この行を削除またはコメントアウト！ */
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
  /* font-family: 'Menlo', 'Monaco', monospace; */
  color: #333;
  user-select: none;
  line-height: 1.1; /* 行の高さを少し詰めて上下の間隔を調整 */
  text-align: center;
  width: 100%;
}
.label-top {
  font-size: 1rem;
  font-weight: normal; /* 変更: 太字をやめる */
  opacity: 0.8;
  margin-bottom: 2px;
}
.label-bottom {
  font-size: 1rem;
  font-weight: normal; /* 変更: 太字をやめる */
  opacity: 0.8;
  margin-bottom: 2px;
}
</style>
