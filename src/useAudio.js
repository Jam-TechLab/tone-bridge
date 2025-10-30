// --- useAudio.js の中身を全部これに差し替える！ ---

// 音を鳴らすための「サウンドカード」みたいなもの。最初に一度だけ作る。
const audioContext = new (window.AudioContext || window.webkitAudioContext)()
const playingNotes = new Map() // 現在再生中の音を管理するリスト

// 音名から周波数（音の高さ）に変換する【修正版】
const noteToFrequency = (note) => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octave = parseInt(note.slice(-1))
  const keyNumber = notes.indexOf(note.slice(0, -1))

  // A4(ラ) = 440Hz を基準に、半音いくつ分離れているかを計算
  const semitones_from_a4 = (octave - 4) * 12 + keyNumber - 9
  return 440 * Math.pow(2, semitones_from_a4 / 12)
}

// このファイルの外から使えるようにするメインの関数
export function useAudio() {
  const playNote = (note) => {
    if (!note || playingNotes.has(note)) return

    const frequency = noteToFrequency(note)

    // --- ここからが音質改善の魔法！ ---
    const oscillator = audioContext.createOscillator() // 音の波形を作る装置
    const gainNode = audioContext.createGain() // 音量をコントロールする装置

    // 接続: 波形 -> 音量 -> スピーカー
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.type = 'sine' // サイン波
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)

    // ADSRエンベロープ (簡易版): Attack
    gainNode.gain.setValueAtTime(0, audioContext.currentTime) // まずは無音
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01) // 0.01秒でフワッと立ち上げる

    oscillator.start()

    // 再生リストには、音量装置も一緒に記録しておく
    playingNotes.set(note, { oscillator, gainNode })
  }

  const stopNote = (note) => {
    if (playingNotes.has(note)) {
      const { oscillator, gainNode } = playingNotes.get(note)

      // ADSRエンベロープ (簡易版): Release
      const releaseTime = 0.1 // 0.1秒かけてスッと消える
      gainNode.gain.cancelScheduledValues(audioContext.currentTime)
      gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + releaseTime)

      // 音が完全に消えた後に停止させる
      oscillator.stop(audioContext.currentTime + releaseTime)
      playingNotes.delete(note)
    }
  }

  return { playNote, stopNote }
}

// ... (useAudio 関数の定義は変更なし) ...

// --- ↓ これをファイルの一番下に追加！ ↓ ---

const noteNameList = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// 'C4' と 7 を渡すと 'G4' を返す関数
export const transposeNote = (note, semitones) => {
  const octave = parseInt(note.slice(-1))
  const noteName = note.slice(0, -1)
  const noteIndex = noteNameList.indexOf(noteName)

  if (noteIndex === -1) return note // 万が一見つからなかったらそのまま

  const totalSemitones = noteIndex + semitones

  const newNoteIndex = (totalSemitones + 1200) % 12 // 1200はマイナスでも動くように
  const octaveOffset = Math.floor(totalSemitones / 12)

  const newNoteName = noteNameList[newNoteIndex]
  const newOctave = octave + octaveOffset

  return `${newNoteName}${newOctave}`
}
