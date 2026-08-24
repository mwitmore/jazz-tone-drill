import { formatChord, type Chord, type ChordQuality } from './chords.ts'
import { M2, M3, M6, P4, P5, m2, m3, m6, m7, note, transpose, type Note } from './notes.ts'
import { ALL_KEYS } from './progressions.ts'

export const CADENCE_IDS = [
  'major-251',
  'minor-251',
  'tritone-v',
  'backdoor',
  'secondary',
  'sub-251',
  'I-VI-ii',
  'iii-VI-ii',
  'I-bIII-ii',
  'ii-Valt-I',
] as const

export type CadenceId = (typeof CADENCE_IDS)[number]

export const CADENCE_LABELS: Record<CadenceId, string> = {
  'major-251': 'Major ii–V–I',
  'minor-251': 'Minor iiø–V–i',
  'tritone-v': 'Tritone-sub V',
  backdoor: 'Backdoor ii–V–I',
  secondary: 'V/V – V – I',
  'sub-251': 'Sub ii–V–I',
  'I-VI-ii': 'I – VI7 – ii',
  'iii-VI-ii': 'iii – VI7 – ii',
  'I-bIII-ii': 'I – ♭III7 – ii',
  'ii-Valt-I': 'ii – Valt – I',
}

export type CadenceQuestion = {
  keyName: string
  id: CadenceId
  label: string
  chords: Chord[]
  symbols: string[]
  hiddenIndex: number
  expected: string
  choices: string[]
}

function chord(root: Note, quality: ChordQuality): Chord {
  return { root, quality }
}

function rooted(keyRoot: Note, interval: { diatonic: number; semitones: number }, quality: ChordQuality): Chord {
  return chord(transpose(keyRoot, interval), quality)
}

export function cadenceChords(id: CadenceId, keyName: string): Chord[] {
  const keyRoot = note(keyName)
  switch (id) {
    case 'major-251':
      return [rooted(keyRoot, M2, 'm7'), rooted(keyRoot, P5, '7'), chord(keyRoot, 'maj7')]
    case 'minor-251':
      return [rooted(keyRoot, M2, 'm7b5'), rooted(keyRoot, P5, '7b9'), chord(keyRoot, 'm7')]
    case 'tritone-v':
      return [rooted(keyRoot, M2, 'm7'), rooted(keyRoot, m2, '7'), chord(keyRoot, 'maj7')]
    case 'backdoor':
      return [rooted(keyRoot, P4, 'm7'), rooted(keyRoot, m7, '7'), chord(keyRoot, 'maj7')]
    case 'secondary':
      return [rooted(keyRoot, M2, '7'), rooted(keyRoot, P5, '7'), chord(keyRoot, 'maj7')]
    case 'sub-251':
      return [rooted(keyRoot, m6, 'm7'), rooted(keyRoot, m2, '7'), chord(keyRoot, 'maj7')]
    case 'I-VI-ii':
      return [chord(keyRoot, 'maj7'), rooted(keyRoot, M6, '7'), rooted(keyRoot, M2, 'm7')]
    case 'iii-VI-ii':
      return [rooted(keyRoot, M3, 'm7'), rooted(keyRoot, M6, '7'), rooted(keyRoot, M2, 'm7')]
    case 'I-bIII-ii':
      return [chord(keyRoot, 'maj7'), rooted(keyRoot, m3, '7'), rooted(keyRoot, M2, 'm7')]
    case 'ii-Valt-I':
      return [rooted(keyRoot, M2, 'm7'), rooted(keyRoot, P5, '7alt'), chord(keyRoot, 'maj7')]
    default:
      return cadenceChords('major-251', keyName)
  }
}

function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function chordPool(keyName: string): string[] {
  const seen = new Set<string>()
  for (const id of CADENCE_IDS) {
    for (const c of cadenceChords(id, keyName)) {
      seen.add(formatChord(c))
    }
  }
  return [...seen]
}

export function dealCadence(keys: string[], previousKey?: string): CadenceQuestion {
  const enabled = keys.length > 0 ? keys : [...ALL_KEYS]
  const keyName = previousKey
    ? enabled[(enabled.indexOf(previousKey) + 1 + enabled.length) % enabled.length] ?? enabled[0]
    : enabled[0]
  const id = pickOne([...CADENCE_IDS])
  const chords = cadenceChords(id, keyName)
  const symbols = chords.map(formatChord)
  const hiddenIndex = Math.floor(Math.random() * 3)
  const expected = symbols[hiddenIndex]
  const distractors = shuffle(chordPool(keyName).filter((symbol) => symbol !== expected)).slice(0, 5)
  const choices = shuffle([expected, ...distractors])
  return {
    keyName,
    id,
    label: CADENCE_LABELS[id],
    chords,
    symbols,
    hiddenIndex,
    expected,
    choices,
  }
}

export function formatKeyName(keyName: string): string {
  return keyName.replaceAll('b', '♭').replaceAll('#', '♯')
}
