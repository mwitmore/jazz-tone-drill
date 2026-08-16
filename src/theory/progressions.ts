import { DOMINANT_QUALITIES, type Chord, type ChordQuality } from './chords.ts'
import { M2, M6, P5, note, transpose, type Note } from './notes.ts'

export const CYCLE_OF_FOURTHS = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'B', 'E', 'A', 'D', 'G'] as const

export const ALL_KEYS = [...CYCLE_OF_FOURTHS]

export type SequenceId = 'isolated' | 'ii-V-I' | 'minor-ii-V-i' | 'I-vi-ii-V'

export const SEQUENCE_LABELS: Record<SequenceId, string> = {
  isolated: 'Isolated chords',
  'ii-V-I': 'Major ii–V–I',
  'minor-ii-V-i': 'Minor iiø–V–i',
  'I-vi-ii-V': 'I–vi–ii–V',
}

function pickDominant(enabled: ChordQuality[], fallback: ChordQuality = '7'): ChordQuality {
  const options = enabled.filter((q) => DOMINANT_QUALITIES.includes(q))
  if (options.length === 0) return fallback
  return options[Math.floor(Math.random() * options.length)]
}

export function major251(key: Note, vQuality: ChordQuality): Chord[] {
  return [
    { root: transpose(key, M2), quality: 'm7' },
    { root: transpose(key, P5), quality: vQuality },
    { root: key, quality: 'maj7' },
  ]
}

export function minor251(key: Note, vQuality: ChordQuality, iQuality: 'mMaj7' | 'm7'): Chord[] {
  return [
    { root: transpose(key, M2), quality: 'm7b5' },
    { root: transpose(key, P5), quality: vQuality },
    { root: key, quality: iQuality },
  ]
}

export function turnaround1625(key: Note, vQuality: ChordQuality): Chord[] {
  return [
    { root: key, quality: 'maj7' },
    { root: transpose(key, M6), quality: 'm7' },
    { root: transpose(key, M2), quality: 'm7' },
    { root: transpose(key, P5), quality: vQuality },
  ]
}

export function buildSequence(
  id: Exclude<SequenceId, 'isolated'>,
  keyName: string,
  enabledQualities: ChordQuality[],
): Chord[] {
  const key = note(keyName)
  if (id === 'ii-V-I') {
    return major251(key, pickDominant(enabledQualities, '7'))
  }
  if (id === 'minor-ii-V-i') {
    const v = pickDominant(
      enabledQualities.filter((q) => q === '7alt' || q === '7b9' || q === '7'),
      enabledQualities.includes('7alt') ? '7alt' : '7b9',
    )
    const iQuality = enabledQualities.includes('mMaj7') ? 'mMaj7' : 'm7'
    return minor251(key, v, iQuality)
  }
  return turnaround1625(key, pickDominant(enabledQualities, '7'))
}

export function nextCycleKey(keys: string[], current: string): string {
  if (keys.length === 0) return 'C'
  const cycle = CYCLE_OF_FOURTHS.filter((k) => keys.includes(k))
  const pool = cycle.length > 0 ? cycle : keys
  const index = pool.indexOf(current)
  if (index < 0) return pool[0]
  return pool[(index + 1) % pool.length]
}
