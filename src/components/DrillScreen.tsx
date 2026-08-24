import { useEffect, useMemo, useRef, useState } from 'react'
import { isAudioReady, playCadenceRoots, playRootAndInterval, unlockAndPlay } from '../audio/playChord.ts'
import { CadenceCard } from './CadenceCard.tsx'
import { dealCadence, cadenceRootPcs, type CadenceQuestion } from '../theory/cadences.ts'
import { notePc } from '../theory/notes.ts'
import { advanceCursor, dealQuestion, gradeMode, gradeNote, initialCursor } from '../drills/engine.ts'
import type { DrillSettings, Question, Score, SessionCursor } from '../drills/types.ts'
import type { ModeId } from '../theory/scales.ts'
import { ModeChips } from './ModeChips.tsx'
import { NotePad } from './NotePad.tsx'
import { RevealCard } from './RevealCard.tsx'
import { SettingsPanel } from './SettingsPanel.tsx'

const SET_SIZE = 20

type DrillScreenProps = {
  settings: DrillSettings
  onSettingsChange: (next: DrillSettings) => void
}

type Miss = {
  symbol: string
  degreeLabel: string
  expected: string
  mode: string | null
}

type ScreenPhase = 'ask' | 'reveal' | 'summary'

export function DrillScreen({ settings, onSettingsChange }: DrillScreenProps) {
  const [cursor, setCursor] = useState<SessionCursor>(() => initialCursor(settings))
  const [question, setQuestion] = useState<Question>(() => dealQuestion(settings, initialCursor(settings)))
  const [cadenceQuestion, setCadenceQuestion] = useState<CadenceQuestion>(() => dealCadence(settings.keys))
  const [pickedNote, setPickedNote] = useState<string | null>(null)
  const [pickedMode, setPickedMode] = useState<ModeId | null>(null)
  const [phase, setPhase] = useState<ScreenPhase>('ask')
  const [noteOk, setNoteOk] = useState(false)
  const [modeOk, setModeOk] = useState<boolean | null>(null)
  const [score, setScore] = useState<Score>({ correct: 0, total: 0, streak: 0 })
  const [misses, setMisses] = useState<Miss[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [remainingMs, setRemainingMs] = useState<number | null>(null)
  const settingsRef = useRef(settings)
  const questionRef = useRef(question)
  const cadenceRef = useRef(cadenceQuestion)
  const pickedNoteRef = useRef(pickedNote)
  const pickedModeRef = useRef(pickedMode)
  const cursorRef = useRef(cursor)
  const revealRef = useRef<(tappedNote: string, tappedMode: ModeId | null) => void>(() => {})
  const goNextRef = useRef<() => void>(() => {})
  settingsRef.current = settings
  questionRef.current = question
  cadenceRef.current = cadenceQuestion
  pickedNoteRef.current = pickedNote
  pickedModeRef.current = pickedMode
  cursorRef.current = cursor

  const isCadence = settings.drillMode === 'cadence'
  const needsMode = settings.drillMode === 'tones+mode'
  const drillSignature = [
    settings.sequence,
    settings.keyOrder,
    settings.keys.join(','),
    settings.qualities.join(','),
    settings.degrees.join(','),
    settings.parentPrefs.m7b5Scale,
    settings.parentPrefs.mMaj7Scale,
    settings.parentPrefs.sevenB9Scale,
  ].join('|')

  const dealFrom = (nextSettings: DrillSettings, nextCursor: SessionCursor) => {
    const q = dealQuestion(nextSettings, nextCursor)
    setCursor(nextCursor)
    setQuestion(q)
    setPickedNote(null)
    setPickedMode(null)
    setPhase('ask')
    setNoteOk(false)
    setModeOk(null)
    setRemainingMs(nextSettings.autoAdvanceSec === null ? null : nextSettings.autoAdvanceSec * 1000)
  }

  useEffect(() => {
    if (settingsRef.current.drillMode === 'cadence') return
    dealFrom(settingsRef.current, initialCursor(settingsRef.current))
  }, [drillSignature])

  useEffect(() => {
    if (settings.drillMode !== 'cadence') return
    setCadenceQuestion(dealCadence(settings.keys))
    setPhase('ask')
  }, [settings.drillMode, settings.keys])

  const goNext = () => {
    if (score.total >= SET_SIZE) {
      setPhase('summary')
      return
    }
    if (settingsRef.current.drillMode === 'cadence') {
      setCadenceQuestion(dealCadence(settingsRef.current.keys, cadenceRef.current.keyName))
      return
    }
    const next = advanceCursor(settingsRef.current, cursorRef.current)
    dealFrom(settingsRef.current, next)
  }
  goNextRef.current = goNext

  const reveal = (tappedNote: string, tappedMode: ModeId | null) => {
    const current = questionRef.current
    const wantMode = settingsRef.current.drillMode === 'tones+mode'
    const okNote = gradeNote(current, tappedNote)
    const okMode = wantMode && tappedMode ? gradeMode(current, tappedMode) : null
    const allOk = okNote && (okMode === null || okMode)
    setNoteOk(okNote)
    setModeOk(okMode)
    setPhase('reveal')
    setScore((s) => ({
      correct: s.correct + (allOk ? 1 : 0),
      total: s.total + 1,
      streak: allOk ? s.streak + 1 : 0,
    }))
  }
  revealRef.current = reveal

  const onCadenceAnswer = (correct: boolean, expected: string, label: string) => {
    setScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
      streak: correct ? s.streak + 1 : 0,
    }))
    if (!correct) {
      setMisses((m) => [
        ...m,
        { symbol: label, degreeLabel: 'missing chord', expected, mode: null },
      ])
    }
  }

  const onPickNote = (name: string) => {
    if (phase !== 'ask') return
    setPickedNote(name)
    if (!needsMode) reveal(name, null)
    else if (pickedMode) reveal(name, pickedMode)
  }

  const onPickMode = (id: ModeId) => {
    if (phase !== 'ask') return
    setPickedMode(id)
    if (pickedNote) reveal(pickedNote, id)
  }

  const heardIdRef = useRef('')
  const [soundOn, setSoundOn] = useState(false)

  const hearCurrent = (forceUnlock: boolean) => {
    const q = questionRef.current
    const id = `${q.symbol}:${q.degree}:${q.expectedSemitones}`
    const play = forceUnlock
      ? unlockAndPlay(notePc(q.chord.root), q.expectedSemitones)
      : playRootAndInterval(notePc(q.chord.root), q.expectedSemitones)
    void play.then((ok) => {
      if (ok) {
        heardIdRef.current = id
        setSoundOn(true)
      }
    })
  }

  useEffect(() => {
    if (isCadence || !settings.autoSound) return
    const id = `${question.symbol}:${question.degree}:${question.expectedSemitones}`
    if (!isAudioReady()) return
    if (heardIdRef.current === id) return
    hearCurrent(false)
  }, [question.symbol, question.degree, question.expectedSemitones, settings.autoSound, isCadence])

  useEffect(() => {
    if (isCadence) return
    if (phase !== 'ask' || settings.autoAdvanceSec === null) {
      if (settings.autoAdvanceSec === null) setRemainingMs(null)
      return
    }
    const limitMs = settings.autoAdvanceSec * 1000
    setRemainingMs(limitMs)
    const started = Date.now()
    const tick = window.setInterval(() => {
      const left = Math.max(0, limitMs - (Date.now() - started))
      setRemainingMs(left)
      if (left <= 0) {
        window.clearInterval(tick)
        const q = questionRef.current
        const fallbackNote = pickedNoteRef.current ?? q.padNames[0]
        const fallbackMode = pickedModeRef.current ?? q.preferredModeId
        if (!pickedNoteRef.current) setPickedNote(fallbackNote)
        if (settingsRef.current.drillMode === 'tones+mode' && !pickedModeRef.current) {
          setPickedMode(fallbackMode)
        }
        revealRef.current(
          fallbackNote,
          settingsRef.current.drillMode === 'tones+mode' ? fallbackMode : null,
        )
      }
    }, 50)
    return () => window.clearInterval(tick)
  }, [question.symbol, question.degree, phase, settings.autoAdvanceSec, isCadence])

  useEffect(() => {
    if (isCadence) return
    if (phase !== 'reveal' || settings.autoAdvanceSec === null) return
    const t = window.setTimeout(() => goNextRef.current(), 1600)
    return () => window.clearTimeout(t)
  }, [phase, settings.autoAdvanceSec, isCadence])

  const resetSet = () => {
    setScore({ correct: 0, total: 0, streak: 0 })
    setMisses([])
    setPhase('ask')
    if (settingsRef.current.drillMode === 'cadence') {
      setCadenceQuestion(dealCadence(settingsRef.current.keys, cadenceRef.current.keyName))
      return
    }
    dealFrom(settingsRef.current, initialCursor(settingsRef.current))
  }

  const prompt = useMemo(() => {
    if (needsMode) return `Name the ${question.degreeLabel} and the parent mode`
    return `Name the ${question.degreeLabel}`
  }, [needsMode, question.degreeLabel])

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          type="button"
          className="ghost-btn"
          onClick={() => {
            if (isCadence) {
              playCadenceRoots(cadenceRootPcs(cadenceQuestion))
              return
            }
            hearCurrent(true)
          }}
        >
          Play
        </button>
        <p className="score">
          {score.total}/{SET_SIZE}
          {score.total > 0 ? ` · ✓${score.correct}` : ''}
          {score.streak > 1 ? ` · ${score.streak}` : ''}
        </p>
        {!isCadence && phase === 'ask' && (
          <button type="button" className="primary-btn" onClick={goNext}>
            Skip
          </button>
        )}
        {isCadence && <span className="score" aria-hidden="true" />}
      </header>

      <div className="drill">
        {phase === 'summary' ? (
          <section className="summary" aria-live="polite">
            <p className="summary-title">
              {score.correct} of {SET_SIZE}
            </p>
            <p className="summary-sub">
              {misses.length === 0 ? 'Clean set. Nice.' : 'Worth another look:'}
            </p>
            {misses.length > 0 && (
              <ul className="miss-list">
                {misses.map((miss, index) => (
                  <li key={`${miss.symbol}-${index}`}>
                    <b>{miss.symbol}</b> — {miss.degreeLabel} is {miss.expected}
                    {miss.mode ? ` · ${miss.mode}` : ''}
                  </li>
                ))}
              </ul>
            )}
            <button type="button" className="primary-btn summary-btn" onClick={resetSet}>
              New set
            </button>
          </section>
        ) : isCadence ? (
          <CadenceCard
            question={cadenceQuestion}
            autoAdvanceSec={settings.autoAdvanceSec}
            onAnswer={onCadenceAnswer}
            onNext={goNext}
          />
        ) : (
          <>
            {question.sequence && (
              <ol className="sequence">
                {question.sequence.symbols.map((symbol, i) => (
                  <li key={`${symbol}-${i}`} className={i === question.sequence?.index ? 'is-current' : ''}>
                    {symbol}
                  </li>
                ))}
              </ol>
            )}

            <div className="chord-stage">
              <p className="chord-symbol">{question.symbol}</p>
              <p className="prompt">{prompt}</p>
              {settings.autoSound && !soundOn && (
                <p className="sound-hint">Tap Play once to unlock auto sound</p>
              )}
              {settings.autoAdvanceSec !== null && remainingMs !== null && phase === 'ask' && (
                <div
                  className={`countdown ${remainingMs <= 3000 ? 'is-urgent' : ''}`}
                  role="timer"
                  aria-live="off"
                  aria-label={`${Math.ceil(remainingMs / 1000)} seconds left`}
                >
                  <div
                    className="countdown-track"
                    style={{
                      ['--progress' as string]: `${(remainingMs / (settings.autoAdvanceSec * 1000)) * 100}%`,
                    }}
                  >
                    <div className="countdown-fill" />
                  </div>
                  <p className="countdown-num">{Math.max(0, Math.ceil(remainingMs / 1000))}</p>
                </div>
              )}
            </div>

            <NotePad
              names={question.padNames}
              selected={pickedNote}
              disabled={phase === 'reveal'}
              result={phase === 'reveal' ? (noteOk ? 'correct' : 'wrong') : null}
              expectedName={question.expectedNoteName}
              onPick={onPickNote}
            />

            {(needsMode || phase === 'reveal') && (
              <ModeChips
                choices={question.modeChoices}
                selected={pickedMode}
                disabled={phase === 'reveal' || !needsMode}
                result={
                  phase === 'reveal'
                    ? needsMode
                      ? modeOk
                        ? 'correct'
                        : 'wrong'
                      : 'correct'
                    : null
                }
                expectedId={question.preferredModeId}
                acceptable={question.acceptableModeIds}
                onPick={onPickMode}
              />
            )}

            {phase === 'reveal' ? (
              <RevealCard question={question} noteOk={noteOk} modeOk={modeOk} />
            ) : (
              <div className="tempo-bar" role="group" aria-label="Auto-advance">
                {([null, 4, 6, 8, 12] as const).map((sec) => (
                  <button
                    key={String(sec)}
                    type="button"
                    className={settings.autoAdvanceSec === sec ? 'is-on' : ''}
                    onClick={() => onSettingsChange({ ...settings, autoAdvanceSec: sec })}
                  >
                    {sec === null ? 'Off' : `${sec}s`}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {!isCadence && phase !== 'summary' && phase === 'reveal' && (
        <div className="tempo-bar reveal-tempo" role="group" aria-label="Auto-advance">
          {([null, 4, 6, 8, 12] as const).map((sec) => (
            <button
              key={String(sec)}
              type="button"
              className={settings.autoAdvanceSec === sec ? 'is-on' : ''}
              onClick={() => onSettingsChange({ ...settings, autoAdvanceSec: sec })}
            >
              {sec === null ? 'Off' : `${sec}s`}
            </button>
          ))}
        </div>
      )}

      {isCadence && phase !== 'summary' && (
        <div className="tempo-bar" role="group" aria-label="Auto-advance">
          {([null, 4, 6, 8, 12] as const).map((sec) => (
            <button
              key={String(sec)}
              type="button"
              className={settings.autoAdvanceSec === sec ? 'is-on' : ''}
              onClick={() => onSettingsChange({ ...settings, autoAdvanceSec: sec })}
            >
              {sec === null ? 'Off' : `${sec}s`}
            </button>
          ))}
        </div>
      )}

      <footer className="bottombar">
        <button type="button" className="icon-btn" onClick={() => setSettingsOpen(true)} aria-label="Settings">
          Settings
        </button>
        <div className="seg compact">
          <button
            type="button"
            className={settings.drillMode === 'tones' ? 'is-on' : ''}
            onClick={() => onSettingsChange({ ...settings, drillMode: 'tones' })}
          >
            A
          </button>
          <button
            type="button"
            className={settings.drillMode === 'tones+mode' ? 'is-on' : ''}
            onClick={() => onSettingsChange({ ...settings, drillMode: 'tones+mode' })}
          >
            B
          </button>
          <button
            type="button"
            className={settings.drillMode === 'cadence' ? 'is-on' : ''}
            onClick={() => onSettingsChange({ ...settings, drillMode: 'cadence' })}
          >
            C
          </button>
        </div>
      </footer>

      <SettingsPanel
        open={settingsOpen}
        settings={settings}
        onChange={onSettingsChange}
        onClose={() => setSettingsOpen(false)}
        onResetScore={() => {
          setScore({ correct: 0, total: 0, streak: 0 })
          setMisses([])
        }}
      />
    </div>
  )
}
