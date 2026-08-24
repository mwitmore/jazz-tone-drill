import { useEffect, useRef, useState } from 'react'
import { playCadenceRoots } from '../audio/playChord.ts'
import { cadenceRootPcs, formatKeyName, type CadenceQuestion } from '../theory/cadences.ts'

const FLASH_MS = 2400

type CadenceCardProps = {
  question: CadenceQuestion
  autoAdvanceSec: number | null
  onAnswer: (correct: boolean, expected: string, label: string) => void
  onNext: () => void
}

export function CadenceCard({ question, autoAdvanceSec, onAnswer, onNext }: CadenceCardProps) {
  const [phase, setPhase] = useState<'flash' | 'ask' | 'reveal'>('flash')
  const [picked, setPicked] = useState<string | null>(null)
  const [correct, setCorrect] = useState(false)
  const [remainingMs, setRemainingMs] = useState<number | null>(null)
  const timedOutRef = useRef(false)
  const onAnswerRef = useRef(onAnswer)
  onAnswerRef.current = onAnswer

  useEffect(() => {
    setPhase('flash')
    setPicked(null)
    setCorrect(false)
    timedOutRef.current = false
    playCadenceRoots(cadenceRootPcs(question))
    const flashTimer = window.setTimeout(() => setPhase('ask'), FLASH_MS)
    return () => window.clearTimeout(flashTimer)
  }, [question])

  useEffect(() => {
    if (phase !== 'ask' || autoAdvanceSec === null) {
      if (autoAdvanceSec === null) setRemainingMs(null)
      return
    }

    const limitMs = autoAdvanceSec * 1000
    setRemainingMs(limitMs)
    const started = Date.now()
    const tick = window.setInterval(() => {
      const left = Math.max(0, limitMs - (Date.now() - started))
      setRemainingMs(left)
      if (left <= 0) {
        window.clearInterval(tick)
        timedOutRef.current = true
        setPicked('')
        setCorrect(false)
        setPhase('reveal')
        onAnswerRef.current(false, question.expected, question.label)
      }
    }, 50)

    return () => window.clearInterval(tick)
  }, [phase, autoAdvanceSec, question.expected, question.label])

  useEffect(() => {
    if (phase !== 'reveal' || autoAdvanceSec === null) return
    const timer = window.setTimeout(() => onNext(), 1600)
    return () => window.clearTimeout(timer)
  }, [phase, autoAdvanceSec, onNext])

  const pick = (choice: string) => {
    if (phase !== 'ask' || timedOutRef.current) return
    const ok = choice === question.expected
    setPicked(choice)
    setCorrect(ok)
    setPhase('reveal')
    onAnswer(ok, question.expected, question.label)
  }

  return (
    <section className="cadence" aria-live="polite">
      <p className="cadence-key">
        {phase === 'flash' ? 'Watch the cadence' : question.label} · {formatKeyName(question.keyName)}
      </p>

      {autoAdvanceSec !== null && remainingMs !== null && phase === 'ask' && (
        <div
          className={`countdown ${remainingMs <= 3000 ? 'is-urgent' : ''}`}
          role="timer"
          aria-live="off"
          aria-label={`${Math.ceil(remainingMs / 1000)} seconds left`}
        >
          <div
            className="countdown-track"
            style={{
              ['--progress' as string]: `${(remainingMs / (autoAdvanceSec * 1000)) * 100}%`,
            }}
          >
            <div className="countdown-fill" />
          </div>
          <p className="countdown-num">{Math.max(0, Math.ceil(remainingMs / 1000))}</p>
        </div>
      )}

      <ol className="cadence-row">
        {question.symbols.map((symbol, index) => {
          const blank = phase === 'ask' && index === question.hiddenIndex
          const revealSpot = phase === 'reveal' && index === question.hiddenIndex
          return (
            <li
              key={`${symbol}-${index}`}
              className={`${blank ? 'is-blank' : ''} ${revealSpot ? (correct ? 'is-right' : 'is-wrong') : ''}`}
            >
              {blank ? '?' : symbol}
            </li>
          )
        })}
      </ol>

      {phase === 'flash' && <p className="prompt">Remember all three</p>}
      {phase === 'ask' && <p className="prompt">Name the missing chord</p>}
      {phase === 'reveal' && (
        <p className="reveal-verdict">{correct ? 'Right' : `It’s ${question.expected}`}</p>
      )}

      {phase !== 'flash' && (
        <div className="cadence-choices">
          {question.choices.map((choice) => {
            const selected = picked === choice
            let tone: string | null = null
            if (phase === 'reveal' && choice === question.expected) tone = 'is-correct'
            else if (phase === 'reveal' && selected && !correct) tone = 'is-wrong'
            else if (phase === 'ask' && selected) tone = 'is-selected'
            return (
              <button
                key={choice}
                type="button"
                className={`chip ${tone ?? ''}`}
                disabled={phase === 'reveal'}
                onClick={() => pick(choice)}
              >
                {choice}
              </button>
            )
          })}
        </div>
      )}

      {phase === 'reveal' && autoAdvanceSec === null && (
        <button type="button" className="primary-btn reveal-next" onClick={onNext}>
          Next
        </button>
      )}
    </section>
  )
}
