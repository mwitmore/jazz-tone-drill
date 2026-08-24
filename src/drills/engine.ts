import {
  allSpelledTones,
  availableDegrees,
  formatChord,
  soundingSemitones,
  spelledTone,
  type Chord,
  type ChordQuality,
  type DegreeId,
} from '../theory/chords.ts'
import { chromaticNames, formatNote, note, notePc, preferFlatsFor } from '../theory/notes.ts'
import { acceptableParents, preferredParent } from '../theory/parents.ts'
import { ALL_KEYS, buildSequence, nextCycleKey } from '../theory/progressions.ts'
import { QUIZ_MODE_IDS, buildScale, type ModeId } from '../theory/scales.ts'
import type { DrillSettings, Question, SessionCursor } from './types.ts'

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function hashSeed(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0
  }
  return h
}

function modeChoices(correct: ModeId, seed: string): ModeId[] {
  const pool = QUIZ_MODE_IDS.filter((id) => id !== correct)
  const shuffled = [...pool].sort((a, b) => hashSeed(`${seed}:${a}`) - hashSeed(`${seed}:${b}`))
  const choices = [correct, ...shuffled.slice(0, 5)]
  return choices.sort((a, b) => hashSeed(`${seed}|${a}`) - hashSeed(`${seed}|${b}`))
}

function enabledKeys(settings: DrillSettings): string[] {
  const keys = settings.keys.filter((k) => (ALL_KEYS as readonly string[]).includes(k))
  return keys.length > 0 ? keys : [...ALL_KEYS]
}

function enabledQualities(settings: DrillSettings): ChordQuality[] {
  return settings.qualities.length > 0 ? settings.qualities : ['maj7', 'm7', '7']
}

function pickDegree(quality: ChordQuality, enabled: DegreeId[]): DegreeId {
  const available = availableDegrees(quality).filter((d) => d !== '1')
  const overlap = available.filter((d) => enabled.includes(d))
  const pool = overlap.length > 0 ? overlap : available.filter((d) => d === '3' || d === '7')
  return pick(pool.length > 0 ? pool : available)
}

function nextKey(settings: DrillSettings, current: string | undefined): string {
  const keys = enabledKeys(settings)
  if (settings.keyOrder === 'cycle4') {
    return current ? nextCycleKey(keys, current) : keys[0]
  }
  return pick(keys)
}

function isolatedChord(settings: DrillSettings, keyName: string): Chord {
  return { root: note(keyName), quality: pick(enabledQualities(settings)) }
}

export function initialCursor(settings: DrillSettings): SessionCursor {
  const keyName = nextKey(settings, undefined)
  if (settings.sequence === 'isolated') {
    return { keyName, seqIndex: 0, sequenceChords: null }
  }
  return {
    keyName,
    seqIndex: 0,
    sequenceChords: buildSequence(settings.sequence, keyName, enabledQualities(settings)),
  }
}

export function advanceCursor(settings: DrillSettings, cursor: SessionCursor): SessionCursor {
  if (settings.sequence === 'isolated') {
    return { keyName: nextKey(settings, cursor.keyName), seqIndex: 0, sequenceChords: null }
  }
  const current = cursor.sequenceChords
  if (current && cursor.seqIndex < current.length - 1) {
    return { ...cursor, seqIndex: cursor.seqIndex + 1 }
  }
  const keyName = nextKey(settings, cursor.keyName)
  return {
    keyName,
    seqIndex: 0,
    sequenceChords: buildSequence(settings.sequence, keyName, enabledQualities(settings)),
  }
}

export function dealQuestion(settings: DrillSettings, cursor: SessionCursor): Question {
  const chord =
    cursor.sequenceChords?.[cursor.seqIndex] ?? isolatedChord(settings, cursor.keyName)

  const degree = pickDegree(chord.quality, settings.degrees)
  const spelled = spelledTone(chord, degree)
  if (!spelled) {
    throw new Error(`No ${degree} on ${formatChord(chord)}`)
  }

  const preferredModeId = preferredParent(chord.quality, settings.parentPrefs)
  const parent = buildScale(chord.root, preferredModeId)
  const expectedNoteName = formatNote(spelled.note)
  const padNames = chromaticNames(preferFlatsFor(chord.root) || preferFlatsFor(spelled.note), spelled.note)
  const symbol = formatChord(chord)

  return {
    chord,
    symbol,
    sequence: cursor.sequenceChords
      ? {
          chords: cursor.sequenceChords,
          symbols: cursor.sequenceChords.map(formatChord),
          index: cursor.seqIndex,
          keyName: cursor.keyName,
        }
      : null,
    degree,
    degreeLabel: spelled.tone.label,
    expectedNote: spelled.note,
    expectedNoteName,
    expectedPc: notePc(spelled.note),
    expectedSemitones: soundingSemitones(degree, spelled.tone.interval.semitones),
    parent,
    acceptableModeIds: acceptableParents(chord.quality),
    preferredModeId,
    allTones: allSpelledTones(chord).map((t) => ({
      degree: t.degree,
      label: t.label,
      name: t.name,
      semitones: t.semitones,
    })),
    padNames,
    modeChoices: modeChoices(preferredModeId, `${symbol}:${degree}`),
  }
}

export function gradeNote(question: Question, tappedName: string): boolean {
  const cleaned = tappedName.replaceAll('♯', '#').replaceAll('♭', 'b').replaceAll('𝄪', 'x').replaceAll('𝄫', 'bb')
  try {
    return notePc(note(cleaned)) === question.expectedPc
  } catch {
    return false
  }
}

export function gradeMode(question: Question, modeId: ModeId): boolean {
  return question.acceptableModeIds.includes(modeId)
}
