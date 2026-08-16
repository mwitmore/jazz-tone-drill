export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
export const LETTER_PC = [0, 2, 4, 5, 7, 9, 11] as const

export type Note = {
  letter: number
  accidental: number
}

export type Interval = {
  diatonic: number
  semitones: number
}

export const P1: Interval = { diatonic: 0, semitones: 0 }
export const m2: Interval = { diatonic: 1, semitones: 1 }
export const M2: Interval = { diatonic: 1, semitones: 2 }
export const A2: Interval = { diatonic: 1, semitones: 3 }
export const m3: Interval = { diatonic: 2, semitones: 3 }
export const M3: Interval = { diatonic: 2, semitones: 4 }
export const P4: Interval = { diatonic: 3, semitones: 5 }
export const A4: Interval = { diatonic: 3, semitones: 6 }
export const d5: Interval = { diatonic: 4, semitones: 6 }
export const P5: Interval = { diatonic: 4, semitones: 7 }
export const A5: Interval = { diatonic: 4, semitones: 8 }
export const m6: Interval = { diatonic: 5, semitones: 8 }
export const M6: Interval = { diatonic: 5, semitones: 9 }
export const d7: Interval = { diatonic: 6, semitones: 9 }
export const m7: Interval = { diatonic: 6, semitones: 10 }
export const M7: Interval = { diatonic: 6, semitones: 11 }

export function notePc(note: Note): number {
  return (((LETTER_PC[note.letter] + note.accidental) % 12) + 12) % 12
}

export function parseNote(input: string): Note {
  const s = input
    .trim()
    .replaceAll('♯', '#')
    .replaceAll('♭', 'b')
    .replaceAll('𝄪', 'x')
    .replaceAll('𝄫', 'bb')
  const letter = s[0]?.toUpperCase()
  const letterIndex = LETTERS.indexOf(letter as (typeof LETTERS)[number])
  if (letterIndex < 0) {
    throw new Error(`Bad note: ${input}`)
  }
  const rest = s.slice(1).toLowerCase()
  let accidental = 0
  if (rest === 'x' || rest === '##') accidental = 2
  else if (rest === '#') accidental = 1
  else if (rest === 'bb') accidental = -2
  else if (rest === 'b') accidental = -1
  else if (rest !== '') {
    throw new Error(`Bad accidental: ${input}`)
  }
  return { letter: letterIndex, accidental }
}

export function note(name: string): Note {
  return parseNote(name)
}

function accidentalGlyph(accidental: number, style: 'ascii' | 'unicode'): string {
  if (style === 'ascii') {
    if (accidental === -2) return 'bb'
    if (accidental === -1) return 'b'
    if (accidental === 1) return '#'
    if (accidental === 2) return 'x'
    return ''
  }
  if (accidental === -2) return '𝄫'
  if (accidental === -1) return '♭'
  if (accidental === 1) return '♯'
  if (accidental === 2) return '𝄪'
  return ''
}

export function formatNote(n: Note, style: 'ascii' | 'unicode' = 'unicode'): string {
  return `${LETTERS[n.letter]}${accidentalGlyph(n.accidental, style)}`
}

export function notesEqual(a: Note, b: Note): boolean {
  return a.letter === b.letter && a.accidental === b.accidental
}

export function transpose(n: Note, interval: Interval): Note {
  const letter = (n.letter + interval.diatonic + 70) % 7
  const pc = (notePc(n) + interval.semitones + 120) % 12
  const natural = LETTER_PC[letter]
  let accidental = pc - natural
  if (accidental > 6) accidental -= 12
  if (accidental < -6) accidental += 12
  return { letter, accidental }
}

export function noteFromPc(pc: number, letter: number): Note {
  const natural = LETTER_PC[letter]
  let accidental = (((pc - natural) % 12) + 12) % 12
  if (accidental > 6) accidental -= 12
  return { letter, accidental }
}

export function preferFlatsFor(n: Note): boolean {
  if (n.accidental < 0) return true
  if (n.accidental > 0) return false
  return LETTERS[n.letter] === 'F'
}

const SHARP_CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT_CHROMATIC = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

export function chromaticNames(preferFlats: boolean, override?: Note): string[] {
  const names = (preferFlats ? FLAT_CHROMATIC : SHARP_CHROMATIC).map((s) =>
    formatNote(parseNote(s)),
  )
  if (override) {
    names[notePc(override)] = formatNote(override)
  }
  return names
}

export function parsePc(name: string): number {
  return notePc(parseNote(name.replaceAll('♯', '#').replaceAll('♭', 'b').replaceAll('𝄪', 'x').replaceAll('𝄫', 'bb')))
}
