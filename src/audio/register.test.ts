import { describe, expect, it } from 'vitest'
import { allSpelledTones } from '../theory/chords.ts'
import { note } from '../theory/notes.ts'
import { ascendingMidi, rootMidi } from './playChord.ts'

describe('answer-panel register', () => {
  it('keeps chord tones above a G root instead of wrapping down', () => {
    const g = rootMidi(7)
    expect(ascendingMidi(2, g)).toBeGreaterThan(g)
    expect(ascendingMidi(2, g) % 12).toBe(2)
  })

  it('places 9ths an octave above the root', () => {
    const tones = allSpelledTones({ root: note('G'), quality: '7' })
    const ninth = tones.find((t) => t.degree === '9')
    expect(ninth?.semitones).toBe(14)
    expect(rootMidi(7) + (ninth?.semitones ?? 0)).toBeGreaterThan(rootMidi(7) + 11)
  })

  it('walks a scale strictly upward from the tonic', () => {
    const pcs = [7, 9, 11, 0, 2, 4, 6]
    const midis: number[] = []
    for (const pc of pcs) midis.push(ascendingMidi(pc, midis.at(-1)))
    for (let i = 1; i < midis.length; i += 1) {
      expect(midis[i]).toBeGreaterThan(midis[i - 1])
    }
    expect(midis[0]).toBe(rootMidi(7))
    expect(midis[3] % 12).toBe(0)
  })
})
