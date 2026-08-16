type NotePadProps = {
  names: string[]
  selected: string | null
  disabled: boolean
  result: 'correct' | 'wrong' | null
  expectedName: string
  onPick: (name: string) => void
}

export function NotePad({ names, selected, disabled, result, expectedName, onPick }: NotePadProps) {
  return (
    <div className="note-pad" role="group" aria-label="Note names">
      {names.map((name) => {
        const isSelected = selected === name
        const isExpected = name === expectedName
        let state = ''
        if (result && isExpected) state = 'is-correct'
        else if (result && isSelected && !isExpected) state = 'is-wrong'
        else if (isSelected) state = 'is-selected'
        return (
          <button
            key={name}
            type="button"
            className={`pad-key ${state}`}
            disabled={disabled}
            onClick={() => onPick(name)}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}
