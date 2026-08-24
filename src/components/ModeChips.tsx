import { modeChipLabel, type ModeId } from '../theory/scales.ts'
import { MusicText } from './MusicText.tsx'

type ModeChipsProps = {
  choices: ModeId[]
  selected: ModeId | null
  disabled: boolean
  result: 'correct' | 'wrong' | null
  expectedId: ModeId
  acceptable: ModeId[]
  onPick: (id: ModeId) => void
}

export function ModeChips({
  choices,
  selected,
  disabled,
  result,
  expectedId,
  acceptable,
  onPick,
}: ModeChipsProps) {
  return (
    <div className="mode-chips" role="group" aria-label="Parent scale or mode">
      {choices.map((id) => {
        const isSelected = selected === id
        let state = ''
        if (result && id === expectedId) state = 'is-correct'
        else if (result && isSelected && !acceptable.includes(id)) state = 'is-wrong'
        else if (isSelected) state = 'is-selected'
        return (
          <button
            key={id}
            type="button"
            className={`chip ${state}`}
            disabled={disabled}
            onClick={() => onPick(id)}
          >
            <MusicText text={modeChipLabel(id)} />
          </button>
        )
      })}
    </div>
  )
}
