import * as Tone from 'tone'

Tone.context.lookAhead = 0

// ★ここを変更！ PolySynth ではなく Sampler を使う
const sampler = new Tone.Sampler({
  urls: {
    // 白鍵7音だけ登録すればOK。
    // Tone.jsが自動で計算して、C#4などの黒鍵や、他のオクターブの音を作り出してくれるよ。
    C4: 'C4.mp3',
    D4: 'D4.mp3',
    E4: 'E4.mp3',
    F4: 'F4.mp3',
    G4: 'G4.mp3',
    A4: 'A4.mp3',
    B4: 'B4.mp3',
  },
  // publicフォルダのパスを指定
  baseUrl: '/sounds/',

  // 音が切れたときの余韻（リリース）。ピアノなら少し長めが自然。
  attack: 0,
  release: 1,

  // ★これを追加して！
  onload: () => {
    console.log('🎹 サンプル音源の読み込み完了！準備OK！')
  },
  // ★もしエラーならここに出る
  onerror: (e) => {
    console.error('😱 音源の読み込みに失敗...', e)
  },
}).toDestination()

// 音量はここで調整
sampler.volume.value = -5

// --- 以下、既存のロジックと同じ ---

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
    // 準備がまだなら「開始命令」だけ投げて、待たずに次へ進む
    if (!isAudioStarted) {
      Tone.start()
      isAudioStarted = true
    }

    // 二重発音防止
    if (activeNotes.has(note)) return
    activeNotes.add(note)

    // ★ Samplerの場合も triggerAttack は同じ！
    // 読み込み中だと音が鳴らない場合があるけど、Samplerはそこも上手くハンドリングしてくれる。
    sampler.triggerAttack(note, Tone.now())
  }

  const stopNote = (note) => {
    if (activeNotes.has(note)) {
      // 即座に止める命令を出す
      sampler.triggerRelease(note)
      activeNotes.delete(note)
    }
  }

  const releaseAll = () => {
    sampler.releaseAll()
    activeNotes.clear()
  }

  return { playNote, stopNote, releaseAll }
}
