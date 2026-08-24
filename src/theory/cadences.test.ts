import { describe, expect, it } from 'vitest'
import { formatChord } from './chords.ts'
import { cadenceChords, dealCadence } from './cadences.ts'

describe('cadences', () => {
  it('builds a major ii-V-I in C', () => {
    const chords = cadenceChords('major-251', 'C')
    expect(chords.map(formatChord)).toEqual(['Dm7', 'G7', 'Cmaj7'])
  })

  it('hides one chord symbol in the dealt question', () => {
    const q = dealCadence(['C'])
    expect(q.symbols).toHaveLength(3)
    expect(q.symbols[q.hiddenIndex]).toBe(q.expected)
    expect(q.choices).toContain(q.expected)
    expect(new Set(q.choices).size).toBe(q.choices.length)
  })
})
