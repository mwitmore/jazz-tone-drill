import { formatNote, noteFromPc, notePc, transpose, type Interval, type Note } from './notes.ts'

export const MODE_IDS = [
  'ionian',
  'dorian',
  'phrygian',
  'lydian',
  'mixolydian',
  'aeolian',
  'locrian',
  'melodic-minor',
  'dorian-b2',
  'lydian-augmented',
  'lydian-dominant',
  'mixolydian-b6',
  'locrian-n2',
  'superlocrian',
  'harmonic-minor',
  'locrian-n6',
  'ionian-s5',
  'dorian-s4',
  'phrygian-dominant',
  'lydian-s2',
  'ultralocrian',
  'hw-dim',
  'wh-dim',
] as const

export type ModeId = (typeof MODE_IDS)[number]

export type ModeFamily = 'major' | 'melodic-minor' | 'harmonic-minor' | 'diminished'

export type ScaleDegree = {
  name: string
  note: Note
  label: string
}

export type ModeInfo = {
  id: ModeId
  name: string
  family: ModeFamily
  familyName: string
  modeIndex: number
  steps: number[]
  degreeLabels: string[]
}

const MAJOR_STEPS = [2, 2, 1, 2, 2, 2, 1]
const MELODIC_STEPS = [2, 1, 2, 2, 2, 2, 1]
const HARMONIC_STEPS = [2, 1, 2, 2, 1, 3, 1]

function rotateSteps(steps: number[], index: number): number[] {
  return [...steps.slice(index), ...steps.slice(0, index)]
}

export const MODES: Record<ModeId, ModeInfo> = {
  ionian: {
    id: 'ionian',
    name: 'Ionian',
    family: 'major',
    familyName: 'major',
    modeIndex: 0,
    steps: rotateSteps(MAJOR_STEPS, 0),
    degreeLabels: ['1', '2', '3', '4', '5', '6', '7'],
  },
  dorian: {
    id: 'dorian',
    name: 'Dorian',
    family: 'major',
    familyName: 'major',
    modeIndex: 1,
    steps: rotateSteps(MAJOR_STEPS, 1),
    degreeLabels: ['1', '2', '♭3', '4', '5', '6', '♭7'],
  },
  phrygian: {
    id: 'phrygian',
    name: 'Phrygian',
    family: 'major',
    familyName: 'major',
    modeIndex: 2,
    steps: rotateSteps(MAJOR_STEPS, 2),
    degreeLabels: ['1', '♭2', '♭3', '4', '5', '♭6', '♭7'],
  },
  lydian: {
    id: 'lydian',
    name: 'Lydian',
    family: 'major',
    familyName: 'major',
    modeIndex: 3,
    steps: rotateSteps(MAJOR_STEPS, 3),
    degreeLabels: ['1', '2', '3', '♯4', '5', '6', '7'],
  },
  mixolydian: {
    id: 'mixolydian',
    name: 'Mixolydian',
    family: 'major',
    familyName: 'major',
    modeIndex: 4,
    steps: rotateSteps(MAJOR_STEPS, 4),
    degreeLabels: ['1', '2', '3', '4', '5', '6', '♭7'],
  },
  aeolian: {
    id: 'aeolian',
    name: 'Aeolian',
    family: 'major',
    familyName: 'major',
    modeIndex: 5,
    steps: rotateSteps(MAJOR_STEPS, 5),
    degreeLabels: ['1', '2', '♭3', '4', '5', '♭6', '♭7'],
  },
  locrian: {
    id: 'locrian',
    name: 'Locrian',
    family: 'major',
    familyName: 'major',
    modeIndex: 6,
    steps: rotateSteps(MAJOR_STEPS, 6),
    degreeLabels: ['1', '♭2', '♭3', '4', '♭5', '♭6', '♭7'],
  },
  'melodic-minor': {
    id: 'melodic-minor',
    name: 'Melodic minor',
    family: 'melodic-minor',
    familyName: 'melodic minor',
    modeIndex: 0,
    steps: rotateSteps(MELODIC_STEPS, 0),
    degreeLabels: ['1', '2', '♭3', '4', '5', '6', '7'],
  },
  'dorian-b2': {
    id: 'dorian-b2',
    name: 'Dorian ♭2',
    family: 'melodic-minor',
    familyName: 'melodic minor',
    modeIndex: 1,
    steps: rotateSteps(MELODIC_STEPS, 1),
    degreeLabels: ['1', '♭2', '♭3', '4', '5', '6', '♭7'],
  },
  'lydian-augmented': {
    id: 'lydian-augmented',
    name: 'Lydian augmented',
    family: 'melodic-minor',
    familyName: 'melodic minor',
    modeIndex: 2,
    steps: rotateSteps(MELODIC_STEPS, 2),
    degreeLabels: ['1', '2', '3', '♯4', '♯5', '6', '7'],
  },
  'lydian-dominant': {
    id: 'lydian-dominant',
    name: 'Lydian dominant',
    family: 'melodic-minor',
    familyName: 'melodic minor',
    modeIndex: 3,
    steps: rotateSteps(MELODIC_STEPS, 3),
    degreeLabels: ['1', '2', '3', '♯4', '5', '6', '♭7'],
  },
  'mixolydian-b6': {
    id: 'mixolydian-b6',
    name: 'Mixolydian ♭6',
    family: 'melodic-minor',
    familyName: 'melodic minor',
    modeIndex: 4,
    steps: rotateSteps(MELODIC_STEPS, 4),
    degreeLabels: ['1', '2', '3', '4', '5', '♭6', '♭7'],
  },
  'locrian-n2': {
    id: 'locrian-n2',
    name: 'Locrian ♮2',
    family: 'melodic-minor',
    familyName: 'melodic minor',
    modeIndex: 5,
    steps: rotateSteps(MELODIC_STEPS, 5),
    degreeLabels: ['1', '2', '♭3', '4', '♭5', '♭6', '♭7'],
  },
  superlocrian: {
    id: 'superlocrian',
    name: 'Superlocrian',
    family: 'melodic-minor',
    familyName: 'melodic minor',
    modeIndex: 6,
    steps: rotateSteps(MELODIC_STEPS, 6),
    degreeLabels: ['1', '♭9', '♯9', '3', '♯11', '♭13', '♭7'],
  },
  'harmonic-minor': {
    id: 'harmonic-minor',
    name: 'Harmonic minor',
    family: 'harmonic-minor',
    familyName: 'harmonic minor',
    modeIndex: 0,
    steps: rotateSteps(HARMONIC_STEPS, 0),
    degreeLabels: ['1', '2', '♭3', '4', '5', '♭6', '7'],
  },
  'locrian-n6': {
    id: 'locrian-n6',
    name: 'Locrian ♮6',
    family: 'harmonic-minor',
    familyName: 'harmonic minor',
    modeIndex: 1,
    steps: rotateSteps(HARMONIC_STEPS, 1),
    degreeLabels: ['1', '♭2', '♭3', '4', '♭5', '6', '♭7'],
  },
  'ionian-s5': {
    id: 'ionian-s5',
    name: 'Ionian ♯5',
    family: 'harmonic-minor',
    familyName: 'harmonic minor',
    modeIndex: 2,
    steps: rotateSteps(HARMONIC_STEPS, 2),
    degreeLabels: ['1', '2', '3', '4', '♯5', '6', '7'],
  },
  'dorian-s4': {
    id: 'dorian-s4',
    name: 'Dorian ♯4',
    family: 'harmonic-minor',
    familyName: 'harmonic minor',
    modeIndex: 3,
    steps: rotateSteps(HARMONIC_STEPS, 3),
    degreeLabels: ['1', '2', '♭3', '♯4', '5', '6', '♭7'],
  },
  'phrygian-dominant': {
    id: 'phrygian-dominant',
    name: 'Phrygian dominant',
    family: 'harmonic-minor',
    familyName: 'harmonic minor',
    modeIndex: 4,
    steps: rotateSteps(HARMONIC_STEPS, 4),
    degreeLabels: ['1', '♭2', '3', '4', '5', '♭6', '♭7'],
  },
  'lydian-s2': {
    id: 'lydian-s2',
    name: 'Lydian ♯2',
    family: 'harmonic-minor',
    familyName: 'harmonic minor',
    modeIndex: 5,
    steps: rotateSteps(HARMONIC_STEPS, 5),
    degreeLabels: ['1', '♯2', '3', '♯4', '5', '6', '7'],
  },
  ultralocrian: {
    id: 'ultralocrian',
    name: 'Ultralocrian',
    family: 'harmonic-minor',
    familyName: 'harmonic minor',
    modeIndex: 6,
    steps: rotateSteps(HARMONIC_STEPS, 6),
    degreeLabels: ['1', '♭2', '♭3', '♭4', '♭5', '♭6', '𝄫7'],
  },
  'hw-dim': {
    id: 'hw-dim',
    name: 'Half-whole dim',
    family: 'diminished',
    familyName: 'diminished',
    modeIndex: 0,
    steps: [1, 2, 1, 2, 1, 2, 1, 2],
    degreeLabels: ['1', '♭9', '♯9', '3', '♯11', '5', '13', '♭7'],
  },
  'wh-dim': {
    id: 'wh-dim',
    name: 'Whole-half dim',
    family: 'diminished',
    familyName: 'diminished',
    modeIndex: 0,
    steps: [2, 1, 2, 1, 2, 1, 2, 1],
    degreeLabels: ['1', '2', '♭3', '4', '♭5', '♭6', '6', '7'],
  },
}

export const QUIZ_MODE_IDS: ModeId[] = [
  'ionian',
  'dorian',
  'lydian',
  'mixolydian',
  'locrian',
  'melodic-minor',
  'lydian-dominant',
  'superlocrian',
  'locrian-n2',
  'harmonic-minor',
  'phrygian-dominant',
  'lydian-s2',
  'hw-dim',
  'wh-dim',
]

function parentTonic(modeRoot: Note, mode: ModeInfo): Note {
  if (mode.family === 'diminished') return modeRoot
  const parentLetter = (modeRoot.letter - mode.modeIndex + 70) % 7
  const semitonesFromParent = mode.modeIndex === 0
    ? 0
    : familySteps(mode.family).slice(0, mode.modeIndex).reduce((sum, step) => sum + step, 0)
  const parentPc = (notePc(modeRoot) - semitonesFromParent + 120) % 12
  return noteFromPc(parentPc, parentLetter)
}

function familySteps(family: Exclude<ModeFamily, 'diminished'>): number[] {
  if (family === 'major') return MAJOR_STEPS
  if (family === 'melodic-minor') return MELODIC_STEPS
  return HARMONIC_STEPS
}

function spellSevenNoteScale(tonic: Note, steps: number[]): Note[] {
  const notes = [tonic]
  let current = tonic
  for (let i = 0; i < 6; i += 1) {
    const semitones = steps[i]
    const interval: Interval = { diatonic: 1, semitones }
    current = transpose(current, interval)
    notes.push(current)
  }
  return notes
}

function spellDimScale(root: Note, steps: number[]): Note[] {
  const notes = [root]
  let pc = notePc(root)
  for (let i = 0; i < steps.length - 1; i += 1) {
    pc = (pc + steps[i]) % 12
    const preferFlat = steps[i] === 1 || root.accidental < 0
    const letterGuess = preferFlat
      ? [0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6][pc]
      : [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][pc]
    notes.push(noteFromPc(pc, letterGuess))
  }
  return notes
}

export type BuiltScale = {
  mode: ModeInfo
  tonic: Note
  parentTonic: Note
  notes: ScaleDegree[]
  parentLabel: string
}

export function buildScale(modeRoot: Note, modeId: ModeId): BuiltScale {
  const mode = MODES[modeId]
  const parent = parentTonic(modeRoot, mode)
  const raw =
    mode.family === 'diminished'
      ? spellDimScale(modeRoot, mode.steps)
      : spellSevenNoteScale(modeRoot, mode.steps)
  const notes: ScaleDegree[] = raw.map((n, i) => ({
    name: formatNote(n),
    note: n,
    label: mode.degreeLabels[i] ?? '',
  }))
  const parentLabel =
    mode.family === 'diminished'
      ? mode.name
      : `${formatNote(parent)} ${mode.familyName}`
  return {
    mode,
    tonic: modeRoot,
    parentTonic: parent,
    notes,
    parentLabel,
  }
}

export function scaleNoteNames(modeRoot: Note, modeId: ModeId): string[] {
  return buildScale(modeRoot, modeId).notes.map((n) => n.name)
}

export function modeChipLabel(id: ModeId): string {
  return MODES[id].name
}
