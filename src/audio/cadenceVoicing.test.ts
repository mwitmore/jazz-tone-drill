import { describe, expect, it } from 'vitest'
import { cadenceChords } from '../theory/cadences.ts'
import { voiceLeadCadence } from './cadenceVoicing.ts'

function pcs(voices: { midi: number }[]): number[] {
  return voices.map((voice) => ((voice.midi % 12) + 12) % 12)
}

describe('cadence voicing', () => {
  it('voice-leads C major ii–V–I with audible roots and guide tones', () => {
    const voiced = voiceLeadCadence(cadenceChords('major-251', 'C'))
    expect(pcs(voiced[0].filter((v) => v.role !== 'guide'))).toContain(2)
    expect(pcs(voiced[1].filter((v) => v.role !== 'guide'))).toContain(7)
    expect(pcs(voiced[2].filter((v) => v.role !== 'guide'))).toContain(0)

    const guides = voiced.map((chord) =>
      chord
        .filter((v) => v.role === 'guide')
        .map((v) => v.midi)
        .sort((a, b) => a - b),
    )
    const byPc = (midis: number[]) => midis.map((m) => ((m % 12) + 12) % 12).sort((a, b) => a - b)
    expect(byPc(guides[0])).toEqual([0, 5])
    expect(byPc(guides[1])).toEqual([5, 11])
    expect(byPc(guides[2])).toEqual([4, 11])

    const motion =
      Math.abs(guides[1][0] - guides[0][0]) +
      Math.abs(guides[1][1] - guides[0][1]) +
      Math.abs(guides[2][0] - guides[1][0]) +
      Math.abs(guides[2][1] - guides[1][1])
    expect(motion).toBeLessThanOrEqual(4)
  })

  it('keeps tritone-sub bass descending by half steps', () => {
    const voiced = voiceLeadCadence(cadenceChords('tritone-v', 'C'))
    const bass = voiced.map((chord) => chord.find((v) => v.role === 'bass')!.midi)
    expect(((bass[0] % 12) + 12) % 12).toBe(2)
    expect(((bass[1] % 12) + 12) % 12).toBe(1)
    expect(((bass[2] % 12) + 12) % 12).toBe(0)
    expect(bass[0] - bass[1]).toBe(1)
    expect(bass[1] - bass[2]).toBe(1)
  })
})
