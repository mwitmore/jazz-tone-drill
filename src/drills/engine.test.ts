import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from './settings.ts'
import { dealQuestion, gradeMode, gradeNote, initialCursor } from './engine.ts'

describe('drill engine', () => {
  it('deals a question whose expected note is on the pad', () => {
    const settings = { ...DEFAULT_SETTINGS, keys: ['G'], qualities: ['7alt' as const], degrees: ['#9' as const] }
    const q = dealQuestion(settings, initialCursor(settings))
    expect(q.symbol).toBe('G7alt')
    expect(q.expectedNoteName).toBe('B♭')
    expect(q.padNames).toContain('B♭')
    expect(gradeNote(q, 'Bb')).toBe(true)
    expect(gradeNote(q, 'A♯')).toBe(true)
    expect(gradeMode(q, 'superlocrian')).toBe(true)
    expect(q.parent.parentLabel).toBe('A♭ melodic minor')
    expect(q.expectedSemitones).toBe(15)
  })

  it('walks a ii-V-I from the I key', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      keys: ['C'],
      sequence: 'ii-V-I' as const,
      qualities: ['maj7' as const, 'm7' as const, '7' as const],
    }
    const cursor = initialCursor(settings)
    const q = dealQuestion(settings, cursor)
    expect(q.sequence?.symbols[0]).toBe('Dm7')
    expect(q.sequence?.symbols[2]).toBe('Cmaj7')
    expect(q.sequence?.index).toBe(0)
  })
})
