import {
  A2,
  A4,
  M3,
  M7,
  P1,
  P5,
  d5,
  d7,
  m2,
  m3,
  m6,
  m7,
  formatNote,
  transpose,
  type Interval,
  type Note,
} from './notes.ts'

export const CHORD_QUALITIES = [
  'maj7',
  'm7',
  '7',
  'm7b5',
  'dim7',
  '7alt',
  '7b9',
  '7#11',
  'mMaj7',
  'maj7#11',
  'maj7#9',
] as const

export type ChordQuality = (typeof CHORD_QUALITIES)[number]

export const DEGREE_IDS = ['1', '3', '5', '7', '9', 'b9', '#9', '#11', 'b13'] as const
export type DegreeId = (typeof DEGREE_IDS)[number]

export type ChordTone = {
  degree: DegreeId
  interval: Interval
  label: string
}

export type Chord = {
  root: Note
  quality: ChordQuality
}

const T = {
  '1': { degree: '1', interval: P1, label: 'root' },
  '3': { degree: '3', interval: M3, label: '3rd' },
  b3: { degree: '3', interval: m3, label: '3rd' },
  '5': { degree: '5', interval: P5, label: '5th' },
  b5: { degree: '5', interval: d5, label: '5th' },
  '7': { degree: '7', interval: M7, label: '7th' },
  b7: { degree: '7', interval: m7, label: '7th' },
  bb7: { degree: '7', interval: d7, label: '7th' },
  '9': { degree: '9', interval: { diatonic: 1, semitones: 2 }, label: '9th' },
  b9: { degree: 'b9', interval: m2, label: '♭9' },
  // Superlocrian #9 is a minor 3rd (G7alt → B♭). Lydian #2 is an augmented 2nd (Cmaj7♯9 → D♯).
  s9alt: { degree: '#9', interval: m3, label: '♯9' },
  s9lyd: { degree: '#9', interval: A2, label: '♯9' },
  s11: { degree: '#11', interval: A4, label: '♯11' },
  b13: { degree: 'b13', interval: m6, label: '♭13' },
} as const satisfies Record<string, ChordTone>

const QUALITY_TONES: Record<ChordQuality, ChordTone[]> = {
  maj7: [T[1], T[3], T[5], T[7], T[9]],
  m7: [T[1], T.b3, T[5], T.b7, T[9]],
  7: [T[1], T[3], T[5], T.b7, T[9]],
  m7b5: [T[1], T.b3, T.b5, T.b7],
  dim7: [T[1], T.b3, T.b5, T.bb7],
  '7alt': [T[1], T[3], T.b7, T.b9, T.s9alt, T.s11, T.b13],
  '7b9': [T[1], T[3], T[5], T.b7, T.b9],
  '7#11': [T[1], T[3], T[5], T.b7, T.s11],
  mMaj7: [T[1], T.b3, T[5], T[7]],
  'maj7#11': [T[1], T[3], T[5], T[7], T.s11],
  'maj7#9': [T[1], T[3], T[5], T[7], T.s9lyd],
}

const QUALITY_SYMBOL: Record<ChordQuality, string> = {
  maj7: 'maj7',
  m7: 'm7',
  7: '7',
  m7b5: 'm7♭5',
  dim7: 'dim7',
  '7alt': '7alt',
  '7b9': '7♭9',
  '7#11': '7♯11',
  mMaj7: 'mMaj7',
  'maj7#11': 'maj7♯11',
  'maj7#9': 'maj7♯9',
}

export const QUALITY_LABELS: Record<ChordQuality, string> = {
  maj7: 'maj7',
  m7: 'm7',
  7: '7',
  m7b5: 'm7♭5',
  dim7: 'dim7',
  '7alt': '7alt',
  '7b9': '7♭9',
  '7#11': '7♯11',
  mMaj7: 'mMaj7',
  'maj7#11': 'maj7♯11',
  'maj7#9': 'maj7♯9',
}

export function chordTones(quality: ChordQuality): ChordTone[] {
  return QUALITY_TONES[quality]
}

export function toneForDegree(quality: ChordQuality, degree: DegreeId): ChordTone | undefined {
  return QUALITY_TONES[quality].find((tone) => tone.degree === degree)
}

export function availableDegrees(quality: ChordQuality): DegreeId[] {
  return QUALITY_TONES[quality].map((tone) => tone.degree)
}

export function spelledTone(chord: Chord, degree: DegreeId): { tone: ChordTone; note: Note } | undefined {
  const tone = toneForDegree(chord.quality, degree)
  if (!tone) return undefined
  return { tone, note: transpose(chord.root, tone.interval) }
}

export function formatChord(chord: Chord): string {
  return `${formatNote(chord.root)}${QUALITY_SYMBOL[chord.quality]}`
}

const COMPOUND_DEGREES = new Set<DegreeId>(['9', 'b9', '#9', '#11', 'b13'])

export function soundingSemitones(degree: DegreeId, intervalSemitones: number): number {
  if (COMPOUND_DEGREES.has(degree) && intervalSemitones < 12) {
    return intervalSemitones + 12
  }
  return intervalSemitones
}

export function allSpelledTones(chord: Chord): {
  degree: DegreeId
  label: string
  note: Note
  name: string
  semitones: number
}[] {
  return QUALITY_TONES[chord.quality].map((tone) => {
    const n = transpose(chord.root, tone.interval)
    return {
      degree: tone.degree,
      label: tone.label,
      note: n,
      name: formatNote(n),
      semitones: soundingSemitones(tone.degree, tone.interval.semitones),
    }
  })
}

export const DEFAULT_QUALITIES: ChordQuality[] = ['maj7', 'm7', '7']
export const DEFAULT_DEGREES: DegreeId[] = ['3', '7']

export const DOMINANT_QUALITIES: ChordQuality[] = ['7', '7alt', '7b9', '7#11']
