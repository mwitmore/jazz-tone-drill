import type { Question } from '../drills/types.ts'
import { MusicText } from './MusicText.tsx'

type RevealCardProps = {
  question: Question
  noteOk: boolean
  modeOk: boolean | null
  onNext?: () => void
}

export function RevealCard({ question, noteOk, modeOk, onNext }: RevealCardProps) {
  const { parent } = question
  const showMode = modeOk !== null
  return (
    <section className="reveal" aria-live="polite">
      <p className="reveal-verdict">
        {noteOk ? 'Tone is right' : <MusicText text={`Tone is ${question.expectedNoteName}`} />}
        {modeOk === null
          ? ''
          : modeOk
            ? ' · mode is right'
            : <> · mode is <MusicText text={parent.mode.name} /></>}
      </p>
      <div className="tone-row">
        {question.allTones.map((tone) => (
          <span key={tone.degree} className={tone.degree === question.degree ? 'is-asked' : ''}>
            <small>
              <MusicText text={tone.label} />
            </small>
            <MusicText className="note-name" text={tone.name} />
          </span>
        ))}
      </div>
      {showMode && (
        <>
          <p className="parent-line">
            <strong>
              <MusicText text={parent.mode.name} />
            </strong>
            {parent.mode.family === 'diminished' ? '' : ` · ${parent.mode.modeIndex + 1 === 1 ? '' : `${ordinal(parent.mode.modeIndex + 1)} mode of `}`}
            {parent.mode.family === 'diminished' ? '' : <MusicText text={parent.parentLabel} />}
          </p>
          <div className="scale-row">
            {parent.notes.map((n) => (
              <span key={`${n.label}-${n.name}`}>
                <small>
                  <MusicText text={n.label} />
                </small>
                <MusicText className="note-name" text={n.name} />
              </span>
            ))}
          </div>
        </>
      )}
      {onNext && (
        <button type="button" className="primary-btn reveal-next" onClick={onNext}>
          Next
        </button>
      )}
    </section>
  )
}

function ordinal(n: number): string {
  if (n === 1) return '1st'
  if (n === 2) return '2nd'
  if (n === 3) return '3rd'
  return `${n}th`
}
