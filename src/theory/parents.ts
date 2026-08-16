import type { ChordQuality } from './chords.ts'
import type { ModeId } from './scales.ts'

export type ParentPrefs = {
  m7b5Scale: 'locrian' | 'locrian-n2'
  mMaj7Scale: 'melodic-minor' | 'harmonic-minor'
  sevenB9Scale: 'phrygian-dominant' | 'hw-dim'
}

export const DEFAULT_PARENT_PREFS: ParentPrefs = {
  m7b5Scale: 'locrian',
  mMaj7Scale: 'melodic-minor',
  sevenB9Scale: 'phrygian-dominant',
}

export function preferredParent(quality: ChordQuality, prefs: ParentPrefs): ModeId {
  switch (quality) {
    case 'maj7':
      return 'ionian'
    case 'maj7#11':
      return 'lydian'
    case 'maj7#9':
      return 'lydian-s2'
    case 'm7':
      return 'dorian'
    case 'm7b5':
      return prefs.m7b5Scale === 'locrian-n2' ? 'locrian-n2' : 'locrian'
    case 'mMaj7':
      return prefs.mMaj7Scale
    case '7':
      return 'mixolydian'
    case '7#11':
      return 'lydian-dominant'
    case '7b9':
      return prefs.sevenB9Scale
    case '7alt':
      return 'superlocrian'
    case 'dim7':
      return 'wh-dim'
    default: {
      const _exhaustive: never = quality
      return _exhaustive
    }
  }
}

export function acceptableParents(quality: ChordQuality): ModeId[] {
  switch (quality) {
    case 'maj7':
      return ['ionian', 'lydian']
    case 'maj7#11':
      return ['lydian']
    case 'maj7#9':
      return ['lydian-s2']
    case 'm7':
      return ['dorian', 'aeolian']
    case 'm7b5':
      return ['locrian', 'locrian-n2']
    case 'mMaj7':
      return ['melodic-minor', 'harmonic-minor']
    case '7':
      return ['mixolydian']
    case '7#11':
      return ['lydian-dominant']
    case '7b9':
      return ['phrygian-dominant', 'hw-dim']
    case '7alt':
      return ['superlocrian']
    case 'dim7':
      return ['wh-dim']
    default: {
      const _exhaustive: never = quality
      return _exhaustive
    }
  }
}
