import * as Tone from 'tone'

// 1. シンセサイザーの作成
const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: {
    type: 'triangle',
  },
  envelope: {
    attack: 0.005,
    decay: 0.1,
    sustain: 0.3,
    release: 1,
  },
}).toDestination()

synth.volume.value = -10

const noteNameList = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export const transposeNote = (note, semitones) => {
  const octave = parseInt(note.slice(-1))
  const noteName = note.slice(0, -1)
  const noteIndex = noteNameList.indexOf(noteName)

  if (noteIndex === -1) return note

  const totalSemitones = noteIndex + semitones

  const newNoteIndex = (totalSemitones + 1200) % 12
  const octaveOffset = Math.floor(totalSemitones / 12)

  const newNoteName = noteNameList[newNoteIndex]
  const newOctave = octave + octaveOffset

  return `${newNoteName}${newOctave}`
}

// 鳴っている音のリスト
const activeNotes = new Set()

// オーディオコンテキストの起動状態フラグ
let isAudioStarted = false

export function useAudio() {
  const playNote = (note) => {
    // ★★★ 修正点1: await を削除！ ★★★
    // 準備がまだなら「開始命令」だけ投げて、待たずに次へ進む
    if (!isAudioStarted) {
      Tone.start()
      isAudioStarted = true
    }

    // 二重発音防止
    if (activeNotes.has(note)) return
    activeNotes.add(note)

    // ★★★ 修正点2: 待たずに即座に鳴らす命令を出す ★★★
    // これで Stop よりも確実に先に実行される
    synth.triggerAttack(note)
  }

  const stopNote = (note) => {
    if (activeNotes.has(note)) {
      // 即座に止める命令を出す
      synth.triggerRelease(note)
      activeNotes.delete(note)
    }
  }

  const releaseAll = () => {
    synth.releaseAll()
    activeNotes.clear()
  }

  return { playNote, stopNote, releaseAll }
}
