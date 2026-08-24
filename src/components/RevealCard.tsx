import type { Question } from '../drills/types.ts'

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
        {noteOk ? 'Tone is right' : `Tone is ${question.expectedNoteName}`}
        {modeOk === null
          ? ''
          : modeOk
            ? ' · mode is right'
            : ` · mode is ${parent.mode.name}`}
      </p>
      <div className="tone-row">
        {question.allTones.map((tone) => (
          <span key={tone.degree} className={tone.degree === question.degree ? 'is-asked' : ''}>
            <small>{tone.label}</small>
            <NoteName name={tone.name} />
          </span>
        ))}
      </div>
      {showMode && (
        <>
          <p className="parent-line">
            <strong>{parent.mode.name}</strong>
            {parent.mode.family === 'diminished' ? '' : ` · ${parent.mode.modeIndex + 1 === 1 ? '' : `${ordinal(parent.mode.modeIndex + 1)} mode of `}${parent.parentLabel}`}
          </p>
          <div className="scale-row">
            {parent.notes.map((n) => (
              <span key={`${n.label}-${n.name}`}>
                <small>{n.label}</small>
                <NoteName name={n.name} />
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

function NoteName({ name }: { name: string }) {
  const letter = /^[A-G]/.test(name) ? name[0] : name
  const accidental = letter === name ? '' : name.slice(letter.length)
  return (
    <span className="note-name">
      <span className="note-letter">{letter}</span>
      {accidental ? <span className="note-acc">{accidental}</span> : null}
    </span>
  )
}

function ordinal(n: number): string {
  if (n === 1) return '1st'
  if (n === 2) return '2nd'
  if (n === 3) return '3rd'
  return `${n}th`
}
