import type { Chord, ChordQuality, DegreeId } from '../theory/chords.ts'
import type { Note } from '../theory/notes.ts'
import type { ParentPrefs } from '../theory/parents.ts'
import type { SequenceId } from '../theory/progressions.ts'
import type { BuiltScale, ModeId } from '../theory/scales.ts'

export type DrillMode = 'tones' | 'tones+mode' | 'cadence'
export type KeyOrder = 'random' | 'cycle4'
export type ThemeId = 'dark' | 'light'

export type DrillSettings = {
  drillMode: DrillMode
  keys: string[]
  qualities: ChordQuality[]
  degrees: DegreeId[]
  sequence: SequenceId
  keyOrder: KeyOrder
  autoAdvanceSec: number | null
  autoSound: boolean
  theme: ThemeId
  parentPrefs: ParentPrefs
}

export type SessionCursor = {
  keyName: string
  seqIndex: number
  sequenceChords: Chord[] | null
}

export type Question = {
  chord: Chord
  symbol: string
  sequence: { chords: Chord[]; symbols: string[]; index: number; keyName: string } | null
  degree: DegreeId
  degreeLabel: string
  expectedNote: Note
  expectedNoteName: string
  expectedPc: number
  expectedSemitones: number
  parent: BuiltScale
  acceptableModeIds: ModeId[]
  preferredModeId: ModeId
  allTones: { degree: DegreeId; label: string; name: string; semitones: number }[]
  padNames: string[]
  modeChoices: ModeId[]
}

export type Score = {
  correct: number
  total: number
  streak: number
}
