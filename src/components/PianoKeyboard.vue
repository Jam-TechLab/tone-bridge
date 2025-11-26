<script setup>
import PianoKey from './PianoKey.vue'
import BlackKey from './BlackKey.vue'
import { transposeNote } from '../useAudio.js'

const props = defineProps({
  keys: Array,
  isPressedSet: Set,
  keyboardType: String,
  transposeIndex: Number,
  getLabelTop: Function, // 'getLabel'から変更
  getLabelBottom: Function, // 新しく追加
})

// どの音が押されているかを判定するロジック
const isPressed = (note) => {
  if (props.keyboardType === 'relative') {
    return props.isPressedSet.has(transposeNote(note, props.transposeIndex))
  }
  return props.isPressedSet.has(note)
}
</script>

<template>
  <template v-for="key in keys" :key="key.note">
    <PianoKey
      v-if="key.type === 'white'"
      :style="{ left: key.left + 'px', width: key.width + 'px' /* ← これを追加！ */ }"
      :data-note="key.note"
      :data-keyboard="keyboardType"
      :is-pressed="isPressed(key.note)"
      :labelTop="getLabelTop(key)"
      :labelBottom="getLabelBottom(key)"
    />
    <BlackKey
      v-if="key.type === 'black'"
      :style="{ left: key.left + 'px' }"
      :data-note="key.note"
      :data-keyboard="keyboardType"
      :is-pressed="isPressed(key.note)"
      :labelTop="getLabelTop(key)"
      :labelBottom="getLabelBottom(key)"
    />
  </template>
</template>

<style scoped>
/* このファイルにはスタイルは不要（鍵盤自体のスタイルは各コンポーネントが持っているため）*/
</style>
