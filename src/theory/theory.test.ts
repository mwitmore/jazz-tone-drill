import { describe, expect, it } from 'vitest'
import { allSpelledTones, formatChord, soundingSemitones, spelledTone, type Chord } from './chords.ts'
import { formatNote, note, notePc, transpose, M3, m7 } from './notes.ts'
import { acceptableParents, DEFAULT_PARENT_PREFS, preferredParent } from './parents.ts'
import { buildSequence } from './progressions.ts'
import { buildScale, scaleNoteNames } from './scales.ts'

function names(chord: Chord): Record<string, string> {
  return Object.fromEntries(allSpelledTones(chord).map((t) => [t.degree, t.name]))
}

describe('spelling', () => {
  it('spells a major 3rd of Gb as Bb', () => {
    expect(formatNote(transpose(note('Gb'), M3), 'ascii')).toBe('Bb')
  })

  it('spells a minor 7th of Gb as Fb', () => {
    expect(formatNote(transpose(note('Gb'), m7), 'ascii')).toBe('Fb')
  })

  it('names Gb7 chord tones', () => {
    const tones = names({ root: note('Gb'), quality: '7' })
    expect(tones['3']).toBe('B♭')
    expect(tones['7']).toBe('F♭')
  })

  it('spells G7alt #9 as Bb and 3rd as B', () => {
    const chord = { root: note('G'), quality: '7alt' as const }
    expect(formatNote(spelledTone(chord, '#9')!.note, 'ascii')).toBe('Bb')
    expect(formatNote(spelledTone(chord, '3')!.note, 'ascii')).toBe('B')
    expect(formatNote(spelledTone(chord, 'b9')!.note, 'ascii')).toBe('Ab')
    expect(formatNote(spelledTone(chord, 'b13')!.note, 'ascii')).toBe('Eb')
  })

  it('spells Cmaj7#9 #9 as D# (Lydian #2)', () => {
    const chord = { root: note('C'), quality: 'maj7#9' as const }
    expect(formatNote(spelledTone(chord, '#9')!.note, 'ascii')).toBe('D#')
  })

  it('spells B7#11 #11 as E#', () => {
    const chord = { root: note('B'), quality: '7#11' as const }
    expect(formatNote(spelledTone(chord, '#11')!.note, 'ascii')).toBe('E#')
  })

  it('spells Cdim7 7th as Bbb', () => {
    const chord = { root: note('C'), quality: 'dim7' as const }
    expect(formatNote(spelledTone(chord, '7')!.note, 'ascii')).toBe('Bbb')
  })

  it('formats chord symbols', () => {
    expect(formatChord({ root: note('Db'), quality: 'm7b5' })).toBe('D♭m7♭5')
    expect(formatChord({ root: note('G'), quality: '7alt' })).toBe('G7alt')
  })

  it('sounds tensions as compound intervals', () => {
    expect(soundingSemitones('3', 4)).toBe(4)
    expect(soundingSemitones('7', 10)).toBe(10)
    expect(soundingSemitones('#11', 6)).toBe(18)
    expect(soundingSemitones('b9', 1)).toBe(13)
    expect(soundingSemitones('#9', 3)).toBe(15)
  })
})

describe('parent scales', () => {
  it('maps G7alt to Superlocrian / Ab melodic minor', () => {
    expect(preferredParent('7alt', DEFAULT_PARENT_PREFS)).toBe('superlocrian')
    const scale = buildScale(note('G'), 'superlocrian')
    expect(formatNote(scale.parentTonic, 'ascii')).toBe('Ab')
    expect(scale.parentLabel).toBe('A♭ melodic minor')
    expect(scale.notes.map((n) => n.name)).toEqual(['G', 'A♭', 'B♭', 'C♭', 'D♭', 'E♭', 'F'])
  })

  it('maps G7#11 to Lydian dominant / D melodic minor', () => {
    const scale = buildScale(note('G'), 'lydian-dominant')
    expect(formatNote(scale.parentTonic, 'ascii')).toBe('D')
    expect(scaleNoteNames(note('G'), 'lydian-dominant')).toEqual(['G', 'A', 'B', 'C♯', 'D', 'E', 'F'])
  })

  it('maps G7b9 to Phrygian dominant / C harmonic minor', () => {
    const scale = buildScale(note('G'), 'phrygian-dominant')
    expect(formatNote(scale.parentTonic, 'ascii')).toBe('C')
  })

  it('maps Eb Lydian #2 to G harmonic minor', () => {
    const scale = buildScale(note('Eb'), 'lydian-s2')
    expect(formatNote(scale.parentTonic, 'ascii')).toBe('G')
    expect(scale.notes.map((n) => n.name)).toEqual(['E♭', 'F♯', 'G', 'A', 'B♭', 'C', 'D'])
  })

  it('maps D locrian to Eb major', () => {
    const scale = buildScale(note('D'), 'locrian')
    expect(formatNote(scale.parentTonic, 'ascii')).toBe('Eb')
  })

  it('accepts both locrian flavors for m7b5', () => {
    expect(acceptableParents('m7b5')).toEqual(['locrian', 'locrian-n2'])
  })
})

describe('progressions', () => {
  it('builds ii-V-I in C', () => {
    const seq = buildSequence('ii-V-I', 'C', ['7'])
    expect(seq.map((c) => formatChord(c))).toEqual(['Dm7', 'G7', 'Cmaj7'])
  })

  it('builds ii-V-I in Db', () => {
    const seq = buildSequence('ii-V-I', 'Db', ['7'])
    expect(seq.map((c) => formatChord(c))).toEqual(['E♭m7', 'A♭7', 'D♭maj7'])
  })

  it('builds minor ii-V-i in C', () => {
    const seq = buildSequence('minor-ii-V-i', 'C', ['7b9', 'mMaj7'])
    expect(seq[0]).toMatchObject({ quality: 'm7b5' })
    expect(notePc(seq[0].root)).toBe(notePc(note('D')))
    expect(seq[2].quality).toBe('mMaj7')
  })

  it('builds I-vi-ii-V in F', () => {
    const seq = buildSequence('I-vi-ii-V', 'F', ['7'])
    expect(seq.map((c) => formatChord(c))).toEqual(['Fmaj7', 'Dm7', 'Gm7', 'C7'])
  })
})
