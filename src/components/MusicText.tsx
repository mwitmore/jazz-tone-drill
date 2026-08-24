import type { ReactNode } from 'react'

const ACCIDENTAL = /[♯♭♮𝄪𝄫]+/g

type MusicTextProps = {
  text: string
  className?: string
}

export function MusicText({ text, className }: MusicTextProps) {
  const nodes: ReactNode[] = []
  let last = 0
  let key = 0
  for (const match of text.matchAll(ACCIDENTAL)) {
    const index = match.index ?? 0
    if (index > last) nodes.push(text.slice(last, index))
    nodes.push(
      <span key={key} className="note-acc">
        {match[0]}
      </span>,
    )
    key += 1
    last = index + match[0].length
  }
  if (last < text.length) nodes.push(text.slice(last))
  if (nodes.length === 0) return text
  return <span className={className}>{nodes}</span>
}
