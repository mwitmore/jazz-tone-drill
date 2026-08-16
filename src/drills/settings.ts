import {
  CHORD_QUALITIES,
  DEFAULT_DEGREES,
  DEFAULT_QUALITIES,
  DEGREE_IDS,
  type ChordQuality,
  type DegreeId,
} from '../theory/chords.ts'
import { DEFAULT_PARENT_PREFS } from '../theory/parents.ts'
import { ALL_KEYS, type SequenceId } from '../theory/progressions.ts'
import type { DrillSettings } from './types.ts'

const STORAGE_KEY = 'jazz-tone-drill-settings-v1'

export const DEFAULT_SETTINGS: DrillSettings = {
  drillMode: 'tones',
  keys: [...ALL_KEYS],
  qualities: [...DEFAULT_QUALITIES],
  degrees: [...DEFAULT_DEGREES],
  sequence: 'isolated',
  keyOrder: 'cycle4',
  autoAdvanceSec: null,
  autoSound: false,
  theme: 'dark',
  parentPrefs: { ...DEFAULT_PARENT_PREFS },
}

function isQuality(value: unknown): value is ChordQuality {
  return typeof value === 'string' && (CHORD_QUALITIES as readonly string[]).includes(value)
}

function isDegree(value: unknown): value is DegreeId {
  return typeof value === 'string' && (DEGREE_IDS as readonly string[]).includes(value)
}

function isSequence(value: unknown): value is SequenceId {
  return value === 'isolated' || value === 'ii-V-I' || value === 'minor-ii-V-i' || value === 'I-vi-ii-V'
}

export function loadSettings(): DrillSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<DrillSettings>
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      keys:
        Array.isArray(parsed.keys) && parsed.keys.length > 0
          ? parsed.keys.filter((k): k is string => typeof k === 'string' && (ALL_KEYS as readonly string[]).includes(k))
          : DEFAULT_SETTINGS.keys,
      qualities:
        Array.isArray(parsed.qualities) && parsed.qualities.some(isQuality)
          ? parsed.qualities.filter(isQuality)
          : DEFAULT_SETTINGS.qualities,
      degrees:
        Array.isArray(parsed.degrees) && parsed.degrees.some(isDegree)
          ? parsed.degrees.filter(isDegree)
          : DEFAULT_SETTINGS.degrees,
      sequence: isSequence(parsed.sequence) ? parsed.sequence : DEFAULT_SETTINGS.sequence,
      autoSound: typeof parsed.autoSound === 'boolean' ? parsed.autoSound : DEFAULT_SETTINGS.autoSound,
      parentPrefs: { ...DEFAULT_SETTINGS.parentPrefs, ...parsed.parentPrefs },
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: DrillSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
