import { CHORD_QUALITIES, DEGREE_IDS, QUALITY_LABELS, type ChordQuality, type DegreeId } from '../theory/chords.ts'
import { ALL_KEYS, SEQUENCE_LABELS, type SequenceId } from '../theory/progressions.ts'
import type { DrillSettings } from '../drills/types.ts'

type SettingsPanelProps = {
  open: boolean
  settings: DrillSettings
  onChange: (next: DrillSettings) => void
  onClose: () => void
  onResetScore: () => void
}

const DEGREE_LABELS: Record<DegreeId, string> = {
  '1': 'root',
  '3': '3rd',
  '5': '5th',
  '7': '7th',
  '9': '9',
  b9: '♭9',
  '#9': '♯9',
  '#11': '♯11',
  b13: '♭13',
}

const SEQUENCES = Object.keys(SEQUENCE_LABELS) as SequenceId[]

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

export function SettingsPanel({ open, settings, onChange, onClose, onResetScore }: SettingsPanelProps) {
  if (!open) return null

  return (
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <aside className="sheet" role="dialog" aria-label="Settings" onClick={(e) => e.stopPropagation()}>
        <header className="sheet-head">
          <h2>Settings</h2>
          <button type="button" className="text-btn" onClick={onClose}>
            Done
          </button>
        </header>

        <p className="help">
          iReal covers time. This drill forces you to name the tone — and, if you want, the parent scale — before the next change. Play always sounds the root, then the asked tone. Turn on auto sound if you want that on every new card (tap Play once first).
        </p>

        <section>
          <h3>Auto sound</h3>
          <div className="seg">
            <button
              type="button"
              className={!settings.autoSound ? 'is-on' : ''}
              onClick={() => onChange({ ...settings, autoSound: false })}
            >
              Play button only
            </button>
            <button
              type="button"
              className={settings.autoSound ? 'is-on' : ''}
              onClick={() => onChange({ ...settings, autoSound: true })}
            >
              On each new card
            </button>
          </div>
        </section>

        <section>
          <h3>Ask for</h3>
          <div className="seg">
            <button
              type="button"
              className={settings.drillMode === 'tones' ? 'is-on' : ''}
              onClick={() => onChange({ ...settings, drillMode: 'tones' })}
            >
              A · Tones
            </button>
            <button
              type="button"
              className={settings.drillMode === 'tones+mode' ? 'is-on' : ''}
              onClick={() => onChange({ ...settings, drillMode: 'tones+mode' })}
            >
              B · Tones + mode
            </button>
          </div>
        </section>

        <section>
          <h3>Format</h3>
          <div className="chip-wrap">
            {SEQUENCES.map((id) => (
              <button
                key={id}
                type="button"
                className={`chip ${settings.sequence === id ? 'is-selected' : ''}`}
                onClick={() => onChange({ ...settings, sequence: id })}
              >
                {SEQUENCE_LABELS[id]}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>Keys</h3>
          <div className="seg">
            <button
              type="button"
              className={settings.keyOrder === 'cycle4' ? 'is-on' : ''}
              onClick={() => onChange({ ...settings, keyOrder: 'cycle4' })}
            >
              Cycle of 4ths
            </button>
            <button
              type="button"
              className={settings.keyOrder === 'random' ? 'is-on' : ''}
              onClick={() => onChange({ ...settings, keyOrder: 'random' })}
            >
              Random
            </button>
          </div>
          <div className="chip-wrap">
            {ALL_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                className={`chip ${settings.keys.includes(key) ? 'is-selected' : ''}`}
                onClick={() => onChange({ ...settings, keys: toggle(settings.keys, key) })}
              >
                {key.replace('b', '♭').replace('#', '♯')}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>Chord types</h3>
          <div className="chip-wrap">
            {CHORD_QUALITIES.map((q: ChordQuality) => (
              <button
                key={q}
                type="button"
                className={`chip ${settings.qualities.includes(q) ? 'is-selected' : ''}`}
                onClick={() => onChange({ ...settings, qualities: toggle(settings.qualities, q) })}
              >
                {QUALITY_LABELS[q]}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>Degrees</h3>
          <div className="chip-wrap">
            {DEGREE_IDS.filter((d) => d !== '1').map((d) => (
              <button
                key={d}
                type="button"
                className={`chip ${settings.degrees.includes(d) ? 'is-selected' : ''}`}
                onClick={() => onChange({ ...settings, degrees: toggle(settings.degrees, d) })}
              >
                {DEGREE_LABELS[d]}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>Parent-scale preference</h3>
          <label className="select-row">
            m7♭5
            <select
              value={settings.parentPrefs.m7b5Scale}
              onChange={(e) =>
                onChange({
                  ...settings,
                  parentPrefs: { ...settings.parentPrefs, m7b5Scale: e.target.value as 'locrian' | 'locrian-n2' },
                })
              }
            >
              <option value="locrian">Locrian</option>
              <option value="locrian-n2">Locrian ♮2</option>
            </select>
          </label>
          <label className="select-row">
            mMaj7
            <select
              value={settings.parentPrefs.mMaj7Scale}
              onChange={(e) =>
                onChange({
                  ...settings,
                  parentPrefs: {
                    ...settings.parentPrefs,
                    mMaj7Scale: e.target.value as 'melodic-minor' | 'harmonic-minor',
                  },
                })
              }
            >
              <option value="melodic-minor">Melodic minor</option>
              <option value="harmonic-minor">Harmonic minor</option>
            </select>
          </label>
          <label className="select-row">
            7♭9
            <select
              value={settings.parentPrefs.sevenB9Scale}
              onChange={(e) =>
                onChange({
                  ...settings,
                  parentPrefs: {
                    ...settings.parentPrefs,
                    sevenB9Scale: e.target.value as 'phrygian-dominant' | 'hw-dim',
                  },
                })
              }
            >
              <option value="phrygian-dominant">Phrygian dominant</option>
              <option value="hw-dim">Half-whole dim</option>
            </select>
          </label>
        </section>

        <section>
          <h3>Look</h3>
          <div className="seg">
            <button
              type="button"
              className={settings.theme === 'dark' ? 'is-on' : ''}
              onClick={() => onChange({ ...settings, theme: 'dark' })}
            >
              Dark stand
            </button>
            <button
              type="button"
              className={settings.theme === 'light' ? 'is-on' : ''}
              onClick={() => onChange({ ...settings, theme: 'light' })}
            >
              Light stand
            </button>
          </div>
        </section>

        <button type="button" className="text-btn reset" onClick={onResetScore}>
          Reset score
        </button>
      </aside>
    </div>
  )
}
