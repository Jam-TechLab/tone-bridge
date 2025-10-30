<script setup>
import { ref, watch, computed } from 'vue'
import { useAudio, transposeNote } from './useAudio.js'
import KeySelector from './components/KeySelector.vue'
import PianoKeyboard from './components/PianoKeyboard.vue'

// --- 設定 ---
const isAbsoluteOnTop = ref(true) // true = 絶対音が上
const isTopKeyboardFixed = ref(false) // true = 上が固定, false = 下が固定

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
  // Octave 3 (白鍵のleftは 52.5 ずつ増える)
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
  // Octave 4 (367.5からスタート)
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
  // Octave 5 (735からスタート)
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
    const relativeLabel = degreeMap[noteIndex]
    return { ...key, relativeLabel: relativeLabel }
  })
})

// === 5. スライドロジック ===
// 1. 定数を定義
const WHITE_KEY_WIDTH = 52.5 // 基準となる白鍵の幅
const OCTAVE_WIDTH = WHITE_KEY_WIDTH * 7 // 1オクターブの合計幅 (7白鍵)
const SEMITONE_WIDTH = OCTAVE_WIDTH / 12 // 1半音あたりのピクセル幅 (30.625px)

// 2. キー切り替え専用のスライド量を計算
const slideOffset = computed(() => {
  // currentKeyIndex (0=C, 1=C♯...) を取得
  const semitoneIndex = currentKeyIndex.value

  // 1半音あたりの幅(30.625px) * インデックス数 で、
  // 常に一定の幅でスライドするように計算する
  // (C - G) のロジック (左に動かす) なので、マイナスを付ける
  return semitoneIndex * SEMITONE_WIDTH * -1
})

// === ガイドラインデータ ===
// const OCTAVE_OFFSET = 367.5; // ← この一行を丸ごと削除！
const NUM_SEMITONES_TO_DRAW = keys.length // 描画する半音の総数 (3オクターブ分)

// ガイドラインの位置データを生成
const guideLines = computed(() => {
  const lines = []
  for (let i = 0; i < NUM_SEMITONES_TO_DRAW; i++) {
    lines.push({
      index: i,
      left: i * SEMITONE_WIDTH,
      // オクターブと半音名を取得 (例: C4, C#4, D4...)
      note: transposeNote('C4', i), // C4を基準にi半音移調した音名
    })
  }
  return lines
})

// ハイライトされるべきラインのSet (computedでリアルタイム更新)
const highlightedLines = computed(() => {
  const highlighted = new Set()

  // 固定されている鍵盤が押されている音名を取得
  const fixedKeyboardPressedNotes = new Set()

  // 上の鍵盤が固定の場合
  if (isTopKeyboardFixed.value) {
    if (isAbsoluteOnTop.value) {
      // 上が絶対音で固定されている
      for (const note of pressedKeys.value) {
        fixedKeyboardPressedNotes.add(note) // 押された音をそのまま使う
      }
    } else {
      // 上が相対音で固定されている
      for (const note of pressedKeys.value) {
        // 押された音を絶対音に戻す (逆移調)
        fixedKeyboardPressedNotes.add(transposeNote(note, -currentKeyIndex.value))
      }
    }
  }
  // 下の鍵盤が固定の場合 (isTopKeyboardFixed.valueがfalse)
  else {
    if (!isAbsoluteOnTop.value) {
      // 下が絶対音で固定されている
      for (const note of pressedKeys.value) {
        fixedKeyboardPressedNotes.add(note)
      }
    } else {
      // 下が相対音で固定されている
      for (const note of pressedKeys.value) {
        fixedKeyboardPressedNotes.add(transposeNote(note, -currentKeyIndex.value))
      }
    }
  }

  // 取得した固定鍵盤の押された音名に基づいて、ガイドラインをハイライト
  for (const pressedNote of fixedKeyboardPressedNotes) {
    const noteName = pressedNote.slice(0, -1) // 'C4' -> 'C'
    const octave = parseInt(pressedNote.slice(-1)) // 'C4' -> 4

    // 'C'のインデックスは0、'C#'は1...
    const semitoneOffsetFromC = noteNameMap.indexOf(noteName)
    if (semitoneOffsetFromC !== -1) {
      // 全体の半音インデックスを計算 (例: C3は0+12=12, C4は12+12=24, C5は24+12=36)
      // keys配列はC3から始まるので、C3=0, C#3=1, ..., B5=35 となる
      const globalSemitoneIndex = (octave - 3) * 12 + semitoneOffsetFromC
      highlighted.add(globalSemitoneIndex)
    }
  }

  return highlighted
})

// === 6. スワイプロジック ===
// ↓ baseC4Leftの定義が消えたので、swipeOffsetの初期値も修正！
const baseC4Left = keys.filter((key) => key.note === 'C4')[0].left // C4の初期位置だけは取得
const swipeOffset = ref(-baseC4Left) // 確定したスワイプ量 (初期位置をC4に)
const touchStartX = ref(0)
const touchMoveOffset = ref(0)
const swipeMode = ref(false)

// スワイプだけの合計オフセット（これは両方の鍵盤で共通！）
const totalSwipeOffset = computed(() => {
  return swipeOffset.value + touchMoveOffset.value
})

// --- 最終的なトランスフォーム値を計算 ---

// 上の鍵盤のトランスフォーム値
const topKeyboardTransform = computed(() => {
  let totalOffset = totalSwipeOffset.value // 1. スワイプ量は常に追加

  const isTopKeyboardMoving = !isTopKeyboardFixed.value
  const isTopKeyboardAbsolute = isAbsoluteOnTop.value

  // 2. もし「上の鍵盤が動く」設定なら
  if (isTopKeyboardMoving) {
    if (isTopKeyboardAbsolute) {
      // 動くのが絶対音なら、左にスライド (C - G)
      totalOffset += slideOffset.value
    } else {
      // 動くのが相対音なら、右にスライド -(C - G) = (G - C)
      totalOffset -= slideOffset.value
    }
  }

  return `translateX(${totalOffset}px)`
})

// 下の鍵盤のトランスフォーム値
const bottomKeyboardTransform = computed(() => {
  let totalOffset = totalSwipeOffset.value // 1. スワイプ量は常に追加

  const isBottomKeyboardMoving = isTopKeyboardFixed.value // 上が固定なら下が動く
  const isBottomKeyboardAbsolute = !isAbsoluteOnTop.value // 上が絶対音でなければ、下が絶対音

  // 2. もし「下の鍵盤が動く」設定なら
  if (isBottomKeyboardMoving) {
    if (isBottomKeyboardAbsolute) {
      // 動くのが絶対音なら、左にスライド (C - G)
      totalOffset += slideOffset.value
    } else {
      // 動くのが相対音なら、右にスライド -(C - G) = (G - C)
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
const getAbsoluteLabel = (key) => key.note.slice(0, -1)
const getRelativeLabel = (key) => key.relativeLabel

// --- 横画面用 ---
// 絶対音ラベル（特殊ルール適用）
const getLandscapeAbsoluteLabel = (key) => {
  const noteName = key.note.slice(0, -1)
  // ♯♭が付かない音名 ['C', 'D', 'E', 'F', 'G', 'A', 'B'] だけラベルを返す
  if (noteName.length === 1 && noteName >= 'A' && noteName <= 'G') {
    return noteName
  }
  return '' // ♯♭が付く音の場合は空文字
}

// 相対音ラベル（特殊ルール適用）
// 相対音ラベル（特殊ルール適用）
const getLandscapeRelativeLabel = (key) => {
  // 鍵盤の音名 ('C3' -> 'C') を取り出す
  const noteName = key.note.slice(0, -1)
  // その音名のインデックス (0〜11) を見つける
  const noteIndex = noteNameMap.indexOf(noteName)

  // 翻訳ロジック！
  const relativeIndex = (noteIndex - currentKeyIndex.value + 12) % 12

  // ♯♭が付かない音階 ('I', 'II', 'III', 'IV', 'V', 'VI', 'VII') かどうかチェック
  const isDiatonic = [0, 2, 4, 5, 7, 9, 11].includes(relativeIndex)

  if (isDiatonic) {
    // 幹音ならラベルを返す（鍵盤の色は問わない！）
    return degreeMap[relativeIndex]
  }

  return '' // 派生音（♯♭付き）なら空文字
}

// ... (landscapeTransform の定義が続く) ...
</script>

<template>
  <div class="view portrait-view">
    <KeySelector :current-key="currentKey" @change-key="handleChangeKey" />

    <div class="settings">
      <button @click="isAbsoluteOnTop = !isAbsoluteOnTop">
        Swap Top ({{ isAbsoluteOnTop ? 'Abs' : 'Rel' }})
      </button>
      <button @click="isTopKeyboardFixed = !isTopKeyboardFixed">
        Swap Fixed ({{ isTopKeyboardFixed ? 'Top' : 'Bottom' }})
      </button>
    </div>

    <div
      class="keyboard-wrapper"
      @touchstart.prevent="handleWrapperTouchStart"
      @touchmove.prevent="handleWrapperTouchMove"
      @touchend.prevent="handleWrapperTouchEnd"
    >
      <div
        class="guide-lines-container"
        :style="{ transform: `translateX(${totalSwipeOffset}px)` }"
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
}
.settings {
  /* 設定ボタンのラッパー */
  background-color: #111;
  padding: 4px;
  display: flex;
  justify-content: center;
  gap: 10px;
}
.settings button {
  font-size: 0.8rem;
  padding: 4px 8px;
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
.portrait-view .piano-top {
  top: 50%;
  margin-top: -220px;
  z-index: 10;
}
.portrait-view .piano-bottom {
  top: 50%;
  margin-top: 10px;
  z-index: 10;
}
.portrait-view .guide-lines-container {
  position: absolute;
  left: 0;
  width: 1102.5px;
  z-index: 5;
  top: 50%;
  height: 430px;
  margin-top: -220px;
  overflow: hidden;
}
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
  background-color: rgba(255, 255, 255, 0.4); /* 白に (君が変更した) */
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
    /* 横画面ではガイドラインを非表示（必要なら後で追加） */
  }
  .landscape-view .piano {
    top: 50%; /* 画面の上下中央に配置 */
    transform: translateY(-50%);
  }
}
</style>
