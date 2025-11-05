<script setup>
import { ref, watch, computed } from 'vue'
import { useAudio, transposeNote } from './useAudio.js'
import KeySelector from './components/KeySelector.vue'
import PianoKeyboard from './components/PianoKeyboard.vue'

// --- 設定 ---
const isAbsoluteOnTop = ref(true) // true = 絶対音が上
const isAbsoluteKeyboardFixed = ref(true) // ← 名前を変更！ (初期値: 絶対音が固定)

// === 1. キー選択ロジック ===
const allKeys = [
  'C',
  'C♯ / D♭',
  'D',
  'D♯ / E♭',
  'E',
  'F',
  'F♯ / G♭',
  'G',
  'G♯ / A♭',
  'A',
  'A♯ / B♭',
  'B',
]
const currentKeyIndex = ref(0) // 0 = C
const currentKey = computed(() => allKeys[currentKeyIndex.value])

const handleChangeKey = (direction) => {
  if (direction === 'next') {
    currentKeyIndex.value = (currentKeyIndex.value + 1) % 12
  } else if (direction === 'prev') {
    currentKeyIndex.value = (currentKeyIndex.value - 1 + 12) % 12
  }
}

// === 2. 鍵盤データ ===
const keys = [
  // Octave 3
  { note: 'C3', type: 'white', left: 0 },
  { note: 'C#3', type: 'black', left: 36.75 },
  { note: 'D3', type: 'white', left: 52.5 },
  { note: 'D#3', type: 'black', left: 89.25 },
  { note: 'E3', type: 'white', left: 105 },
  { note: 'F3', type: 'white', left: 157.5 },
  { note: 'F#3', type: 'black', left: 194.25 },
  { note: 'G3', type: 'white', left: 210 },
  { note: 'G#3', type: 'black', left: 246.75 },
  { note: 'A3', type: 'white', left: 262.5 },
  { note: 'A#3', type: 'black', left: 299.25 },
  { note: 'B3', type: 'white', left: 315 },
  // Octave 4
  { note: 'C4', type: 'white', left: 367.5 },
  { note: 'C#4', type: 'black', left: 404.25 },
  { note: 'D4', type: 'white', left: 420 },
  { note: 'D#4', type: 'black', left: 456.75 },
  { note: 'E4', type: 'white', left: 472.5 },
  { note: 'F4', type: 'white', left: 525 },
  { note: 'F#4', type: 'black', left: 561.75 },
  { note: 'G4', type: 'white', left: 577.5 },
  { note: 'G#4', type: 'black', left: 614.25 },
  { note: 'A4', type: 'white', left: 630 },
  { note: 'A#4', type: 'black', left: 666.75 },
  { note: 'B4', type: 'white', left: 682.5 },
  // Octave 5
  { note: 'C5', type: 'white', left: 735 },
  { note: 'C#5', type: 'black', left: 771.75 },
  { note: 'D5', type: 'white', left: 787.5 },
  { note: 'D#5', type: 'black', left: 824.25 },
  { note: 'E5', type: 'white', left: 840 },
  { note: 'F5', type: 'white', left: 892.5 },
  { note: 'F#5', type: 'black', left: 929.25 },
  { note: 'G5', type: 'white', left: 945 },
  { note: 'G#5', type: 'black', left: 981.75 },
  { note: 'A5', type: 'white', left: 997.5 },
  { note: 'A#5', type: 'black', left: 1034.25 },
  { note: 'B5', type: 'white', left: 1050 },
]

// === 3. サウンドエンジン ===
const { playNote, stopNote } = useAudio()
const pressedKeys = ref(new Set())

// === 4. 翻訳ロジック ===
const degreeMap = ['I', 'I♯', 'II', 'II♯', 'III', 'IV', 'IV♯', 'V', 'V♯', 'VI', 'VI♯', 'VII']
const noteNameMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const relativeKeyData = computed(() => {
  return keys.map((key) => {
    const noteName = key.note.slice(0, -1)
    const noteIndex = noteNameMap.indexOf(noteName)
    // ↓↓↓ 修正点！ currentKeyIndex を削除！ ↓↓↓
    const relativeLabel = degreeMap[noteIndex] // Cは常にI, C#は常にI♯
    return { ...key, relativeLabel: relativeLabel }
  })
})

// === 5. スライドロジック ===
const WHITE_KEY_WIDTH = 52.5
const OCTAVE_WIDTH = WHITE_KEY_WIDTH * 7
const SEMITONE_WIDTH = OCTAVE_WIDTH / 12

const slideOffset = computed(() => {
  const semitoneIndex = currentKeyIndex.value
  return semitoneIndex * SEMITONE_WIDTH * -1
})

// === 6. スワイプロジック ===
const baseC4Left = keys.filter((key) => key.note === 'C4')[0].left
const swipeOffset = ref(-baseC4Left)
const touchStartX = ref(0)
const touchMoveOffset = ref(0)
const swipeMode = ref(false)

const totalSwipeOffset = computed(() => {
  return swipeOffset.value + touchMoveOffset.value
})

// --- 最終的なトランスフォーム値を計算 ---

// 上の鍵盤のトランスフォーム値
const topKeyboardTransform = computed(() => {
  let totalOffset = totalSwipeOffset.value // 1. スワイプ量は常に追加

  // 2. 「上」にいるのは「絶対音」か？
  if (isAbsoluteOnTop.value) {
    // 上は「絶対音」
    // もし「絶対音が動く」設定なら、スライド(左)
    if (!isAbsoluteKeyboardFixed.value) {
      totalOffset += slideOffset.value
    }
  } else {
    // 上は「相対音」
    // もし「相対音が動く」設定なら、スライド(右)
    if (isAbsoluteKeyboardFixed.value) {
      // (絶対音が固定 = 相対音が動く)
      totalOffset -= slideOffset.value
    }
  }

  return `translateX(${totalOffset}px)`
})

// 下の鍵盤のトランスフォーム値
const bottomKeyboardTransform = computed(() => {
  let totalOffset = totalSwipeOffset.value // 1. スワイプ量は常に追加

  // 2. 「下」にいるのは「絶対音」か？
  if (!isAbsoluteOnTop.value) {
    // 下は「絶対音」
    // もし「絶対音が動く」設定なら、スライド(左)
    if (!isAbsoluteKeyboardFixed.value) {
      totalOffset += slideOffset.value
    }
  } else {
    // 下は「相対音」
    // もし「相対音が動く」設定なら、スライド(右)
    if (isAbsoluteKeyboardFixed.value) {
      // (絶対音が固定 = 相対音が動く)
      totalOffset -= slideOffset.value
    }
  }

  return `translateX(${totalOffset}px)`
})

// === 7. タッチイベントハンドラ ===
const updatePressedKeys = (event) => {
  const newPressedKeys = new Set()
  const keyIndex = currentKeyIndex.value
  for (const touch of event.touches) {
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    if (element && element.dataset.note) {
      const note = element.dataset.note
      const keyboard = element.dataset.keyboard
      if (keyboard === 'relative') {
        const transposedNote = transposeNote(note, keyIndex)
        newPressedKeys.add(transposedNote)
      } else {
        newPressedKeys.add(note)
      }
    }
  }
  pressedKeys.value = newPressedKeys
}

const handleWrapperTouchStart = (event) => {
  const touch = event.touches[0]
  const element = document.elementFromPoint(touch.clientX, touch.clientY)
  if (element && element.dataset.note) {
    swipeMode.value = false
    updatePressedKeys(event)
  } else {
    swipeMode.value = true
    touchStartX.value = touch.clientX
    touchMoveOffset.value = 0
  }
}

const handleWrapperTouchMove = (event) => {
  if (swipeMode.value) {
    if (event.touches.length === 0) return
    const touch = event.touches[0]
    const diff = touch.clientX - touchStartX.value
    touchMoveOffset.value = diff
  } else {
    updatePressedKeys(event)
  }
}

const handleWrapperTouchEnd = (event) => {
  if (swipeMode.value) {
    swipeOffset.value = swipeOffset.value + touchMoveOffset.value
    touchMoveOffset.value = 0
  }
  updatePressedKeys(event)
  swipeMode.value = false
}

// === 8. サウンド再生の監視 ===
watch(pressedKeys, (newKeys, oldKeys) => {
  for (const note of newKeys) {
    if (!oldKeys.has(note)) {
      playNote(note)
    }
  }
  for (const note of oldKeys) {
    if (!newKeys.has(note)) {
      stopNote(note)
    }
  }
})

// === 9. ラベル計算関数 ===
// --- 縦画面用 ---
const getAbsoluteLabel = (key) => {
  const noteName = key.note.slice(0, -1)
  if (noteName.length === 1) {
    // ♯♭なし
    return noteName
  }
  return ''
}
const getRelativeLabel = (key) => {
  const isDiatonic = !['I♯', 'II♯', 'IV♯', 'V♯', 'VI♯'].includes(key.relativeLabel)
  if (isDiatonic) {
    return key.relativeLabel
  }
  return ''
}

// --- 横画面用 ---
// ↓↓↓ 2つの関数を「computed」に格上げ！ ↓↓↓

const getLandscapeAbsoluteLabel = computed(() => {
  return (key) => {
    // 関数を返す
    const transposedNote = transposeNote(key.note, currentKeyIndex.value)
    const noteName = transposedNote.slice(0, -1)
    if (noteName.length === 1) {
      // ♯♭なし
      return noteName
    }
    return ''
  }
})

// 相対音ラベル（特殊ルール適用）
const getLandscapeRelativeLabel = computed(() => {
  return (key) => {
    // 関数を返す
    // ↓↓↓ 修正点！ 移調（transpose）するのをやめる ↓↓↓
    const noteName = key.note.slice(0, -1) // 'C3' -> 'C'
    const noteIndex = noteNameMap.indexOf(noteName) // 'C' -> 0

    if (noteIndex === -1) return '' // 念のため

    // ↓↓↓ 修正点！ currentKeyIndex を使わない ↓↓↓
    const relativeIndex = noteIndex // Cは常に0, C#は常に1...
    const isDiatonic = [0, 2, 4, 5, 7, 9, 11].includes(relativeIndex)

    if (isDiatonic) {
      return degreeMap[relativeIndex] // CはI, DはII...
    }
    return ''
  }
})

// === 10. ガイドラインデータ ===
const NUM_SEMITONES_TO_DRAW = keys.length

const guideLines = computed(() => {
  const lines = []
  for (let i = 0; i < NUM_SEMITONES_TO_DRAW; i++) {
    lines.push({
      index: i,
      left: i * SEMITONE_WIDTH,
      note: transposeNote('C3', i), // C3基準
    })
  }
  return lines
})

// ハイライトされるべきラインのSet (computedでリアルタイム更新)
const highlightedLines = computed(() => {
  const highlighted = new Set()
  const fixedKeyboardPressedNotes = new Set()

  // 1. 固定鍵盤が押している「絶対音」のリストを作る (ここは変更なし)
  if (isAbsoluteKeyboardFixed.value) {
    // --- 絶対音が固定 ---
    if (isAbsoluteOnTop.value) {
      // 上が絶対音
      for (const note of pressedKeys.value) fixedKeyboardPressedNotes.add(note)
    } else {
      // 下が絶対音
      for (const note of pressedKeys.value) fixedKeyboardPressedNotes.add(note)
    }
  } else {
    // --- 相対音が固定 ---
    if (!isAbsoluteOnTop.value) {
      // 上が相対音
      for (const note of pressedKeys.value)
        fixedKeyboardPressedNotes.add(transposeNote(note, -currentKeyIndex.value))
    } else {
      // 下が相対音
      for (const note of pressedKeys.value)
        fixedKeyboardPressedNotes.add(transposeNote(note, -currentKeyIndex.value))
    }
  }

  // 2. 押された絶対音を「光らせるべき帯のインデックス」に変換する
  for (const pressedNote of fixedKeyboardPressedNotes) {
    const noteName = pressedNote.slice(0, -1)
    const octave = parseInt(pressedNote.slice(-1))
    const semitoneOffsetFromC = noteNameMap.indexOf(noteName)

    if (semitoneOffsetFromC !== -1) {
      // 押された音の「物理的なインデックス」 (C3 = 0)
      const globalSemitoneIndex = (octave - 3) * 12 + semitoneOffsetFromC

      // ↓↓↓ ここが「3度目の正直」の修正点！ ↓↓↓

      if (isAbsoluteKeyboardFixed.value) {
        // --- Case 1: 絶対音が固定 ---
        // グリッドも固定されている。
        // 押された音の物理インデックスを、そのまま光らせる。
        highlighted.add(globalSemitoneIndex)
      } else {
        // --- Case 2: 相対音が固定 ---
        // グリッドは「絶対音」と一緒に動いている。
        // 押された音(C4=12)の真下にあるべきグリッドは、
        // グリッドの移動量(keyIndex)を足した場所(12 + keyIndex)にある。
        const highlightedIndex = globalSemitoneIndex + currentKeyIndex.value
        highlighted.add(highlightedIndex)
      }
    }
  }
  return highlighted
})

// === 11. 横画面専用トランスフォーム ===
// --- 横画面専用のトランスフォーム計算 ---
const landscapeTransform = computed(() => {
  // 1. スワイプ量は常に追加
  let totalOffset = totalSwipeOffset.value

  // 2. キー切り替えのスライド量 (slideOffset) は削除！
  // totalOffset -= slideOffset.value // ← この行を削除！

  // ↓↓↓ ここを修正！ ↓↓↓
  // Y軸の中央揃えも一緒に出力する
  return `translateX(${totalOffset}px) translateY(-50%)`
})
</script>

<template>
  <div class="view portrait-view">
    <KeySelector :current-key="currentKey" @change-key="handleChangeKey" />

    <div class="settings">
      <!-- <button @click="isTopKeyboardFixed = !isTopKeyboardFixed">
        Swap Fixed ({{ isTopKeyboardFixed ? 'Top' : 'Bottom' }})
      </button> -->
      <button @click="isAbsoluteKeyboardFixed = !isAbsoluteKeyboardFixed">
        動作 ({{ isAbsoluteKeyboardFixed ? 'Relが動く' : 'Absが動く' }})
      </button>
    </div>

    <div
      class="keyboard-wrapper"
      @touchstart.prevent="handleWrapperTouchStart"
      @touchmove.prevent="handleWrapperTouchMove"
      @touchend.prevent="handleWrapperTouchEnd"
    >
      <button
        class="swap-button"
        @click="isAbsoluteOnTop = !isAbsoluteOnTop"
        @touchstart.stop
        @touchmove.stop
        @touchend.stop
      >
        ⇅
      </button>
      <div
        class="guide-lines-container"
        :style="{ transform: isAbsoluteOnTop ? topKeyboardTransform : bottomKeyboardTransform }"
        :class="{ 'is-swiping': swipeMode }"
      >
        <div
          v-for="line in guideLines"
          :key="line.index"
          class="semitone-band"
          :style="{ left: line.left + 'px' }"
          :class="{ 'is-highlighted': highlightedLines.has(line.index) }"
        ></div>
      </div>

      <div
        class="piano piano-top"
        :class="{ 'is-swiping': swipeMode }"
        :style="{ transform: topKeyboardTransform }"
      >
        <PianoKeyboard
          v-if="isAbsoluteOnTop"
          :keys="keys"
          :is-pressed-set="pressedKeys"
          keyboard-type="absolute"
          :get-label-top="getAbsoluteLabel"
          :get-label-bottom="() => ''"
        />
        <PianoKeyboard
          v-else
          :keys="relativeKeyData"
          :is-pressed-set="pressedKeys"
          keyboard-type="relative"
          :transpose-index="currentKeyIndex"
          :get-label-top="getRelativeLabel"
          :get-label-bottom="() => ''"
        />
      </div>

      <div
        class="piano piano-bottom"
        :class="{ 'is-swiping': swipeMode }"
        :style="{ transform: bottomKeyboardTransform }"
      >
        <PianoKeyboard
          v-if="!isAbsoluteOnTop"
          :keys="keys"
          :is-pressed-set="pressedKeys"
          keyboard-type="absolute"
          :get-label-top="getAbsoluteLabel"
          :get-label-bottom="() => ''"
        />
        <PianoKeyboard
          v-else
          :keys="relativeKeyData"
          :is-pressed-set="pressedKeys"
          keyboard-type="relative"
          :transpose-index="currentKeyIndex"
          :get-label-top="getRelativeLabel"
          :get-label-bottom="() => ''"
        />
      </div>
    </div>
  </div>

  <div class="view landscape-view">
    <KeySelector :current-key="currentKey" @change-key="handleChangeKey" />

    <div
      class="keyboard-wrapper-landscape"
      @touchstart.prevent="handleWrapperTouchStart"
      @touchmove.prevent="handleWrapperTouchMove"
      @touchend.prevent="handleWrapperTouchEnd"
    >
      <div
        class="piano"
        :class="{ 'is-swiping': swipeMode }"
        :style="{ transform: landscapeTransform }"
      >
        <PianoKeyboard
          :keys="keys"
          :is-pressed-set="pressedKeys"
          keyboard-type="relative"
          :transpose-index="currentKeyIndex"
          :get-label-top="isAbsoluteOnTop ? getLandscapeAbsoluteLabel : getLandscapeRelativeLabel"
          :get-label-bottom="
            isAbsoluteOnTop ? getLandscapeRelativeLabel : getLandscapeAbsoluteLabel
          "
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- 共通のスタイル --- */
.view {
  display: flex;
  flex-direction: column;
  height: 100dvh; /* 画面の高さピッタリ */
  background-color: #222;
  /* ユーザーがテキスト選択できないようにする */
  user-select: none;
  -webkit-user-select: none;
}

.piano {
  display: block;
  position: absolute;
  width: 1102.5px;
  height: 210px;
  left: 0;
  transition: transform 0.3s ease-out;
}
.piano.is-swiping {
  transition: none;
}

/* --- 1. 縦画面 (ポートレート) のスタイル --- */
.landscape-view {
  display: none; /* 普段は横画面を隠す */
}
.portrait-view .keyboard-wrapper {
  flex-grow: 1;
  min-height: 0;
  width: 100%;
  overflow: hidden;
  display: block;
  position: relative;
}
/* --- 1. 縦画面 (ポートレート) のスタイル --- */
.landscape-view {
  display: none;
}
.portrait-view .keyboard-wrapper {
  flex-grow: 1;
  min-height: 0;
  width: 100%;
  overflow: hidden;
  display: block;
  position: relative;
}

.portrait-view .swap-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;

  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background-color: #42b883;
  color: white; /* ← 色を白に変更！ */
  font-size: 1.5rem;
  line-height: 44px;
  text-align: center;
  padding: 0;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.portrait-view .swap-button:active {
  background-color: #38a070;
}

/* ↓ 新しいマージン計算 (隙間64px) */
.portrait-view .piano-top {
  top: 50%;
  margin-top: -242px; /* -(210 + 64/2) = -242px */
  z-index: 10;
}
/* ↓ 新しいマージン計算 (隙間64px) */
.portrait-view .piano-bottom {
  top: 50%;
  margin-top: 32px; /* +(64/2) = 32px */
  z-index: 10;
}

/* ↓↓↓ このブロックを丸ごと置き換えて！ ↓↓↓ */
.portrait-view .guide-lines-container {
  position: absolute;
  left: 0;
  width: 1102.5px;
  z-index: 5; /* ピアノ(10)より奥 */

  /* ↓ 修正点！ wrapper全体に広げる */
  top: 0;
  bottom: 0;
  height: 100%;
  margin-top: 0;

  overflow: hidden;
  transition: transform 0.3s ease-out;
}

.portrait-view .guide-lines-container.is-swiping {
  transition: none;
}
/* ↑↑↑ ここまで置き換え ↑↑↑ */

/* ... (semitone-band 以下のスタイルは変更なし) ... */
.portrait-view .semitone-band {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 30.625px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  background-color: transparent;
  transition: background-color 0.1s ease-out;
}
.portrait-view .semitone-band.is-highlighted {
  background-color: rgba(255, 255, 255, 0.4); /* 白 */
}

/* --- 2. 横画面 (ランドスケープ) のスタイル --- */
@media (orientation: landscape) {
  .portrait-view {
    display: none; /* 横画面になったら縦画面を隠す */
  }
  .landscape-view {
    display: flex; /* 横画面を表示 */
  }
  .landscape-view .keyboard-wrapper-landscape {
    flex-grow: 1;
    min-height: 0;
    width: 100%;
    overflow: hidden;
    display: block;
    position: relative;
  }
  .landscape-view .piano {
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
