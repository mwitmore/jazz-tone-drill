import { allSpelledTones, type Chord } from '../theory/chords.ts'
import { notePc } from '../theory/notes.ts'

export type CadenceVoice = {
  midi: number
  role: 'bass' | 'root' | 'guide'
}

function nearestMidi(pc: number, around: number): number {
  const classPc = ((pc % 12) + 12) % 12
  let best = around
  let bestDistance = Infinity
  for (let midi = around - 18; midi <= around + 18; midi += 1) {
    if ((((midi % 12) + 12) % 12) !== classPc) continue
    const distance = Math.abs(midi - around)
    if (distance < bestDistance) {
      bestDistance = distance
      best = midi
    }
  }
  return best
}

function guidePcs(chord: Chord): { third: number; seventh: number } | null {
  const tones = allSpelledTones(chord)
  const third = tones.find((tone) => tone.degree === '3')
  const seventh = tones.find((tone) => tone.degree === '7')
  if (!third || !seventh) return null
  return { third: notePc(third.note), seventh: notePc(seventh.note) }
}

export function voiceLeadingBassMidis(pcs: number[]): number[] {
  const midis: number[] = []
  for (let i = 0; i < pcs.length; i += 1) {
    if (i === 0) {
      let midi = 48 + pcs[i]
      while (midi > 57) midi -= 12
      while (midi < 45) midi += 12
      midis.push(midi)
      continue
    }
    midis.push(nearestMidi(pcs[i], midis[i - 1]))
  }
  return midis
}

export function voiceLeadCadence(chords: Chord[]): CadenceVoice[][] {
  const bassMidis = voiceLeadingBassMidis(chords.map((chord) => notePc(chord.root)))
  const voiced: CadenceVoice[][] = []
  let prevGuides: [number, number] | null = null

  for (let i = 0; i < chords.length; i += 1) {
    const guides = guidePcs(chords[i])
    let bass = bassMidis[i]
    const voices: CadenceVoice[] = []

    if (guides) {
      if (!prevGuides) {
        const a = nearestMidi(guides.third, 67)
        const b = nearestMidi(guides.seventh, 67)
        prevGuides = a <= b ? [a, b] : [b, a]
      } else {
        const keepThird = [
          nearestMidi(guides.third, prevGuides[0]),
          nearestMidi(guides.seventh, prevGuides[1]),
        ] as [number, number]
        const swapThird = [
          nearestMidi(guides.seventh, prevGuides[0]),
          nearestMidi(guides.third, prevGuides[1]),
        ] as [number, number]
        const cost = (pair: [number, number]) =>
          Math.abs(pair[0] - prevGuides![0]) + Math.abs(pair[1] - prevGuides![1])
        prevGuides = cost(keepThird) <= cost(swapThird) ? keepThird : swapThird
      }

      const lowestGuide = Math.min(prevGuides[0], prevGuides[1])
      while (bass > lowestGuide - 7) bass -= 12
      while (bass < 43) bass += 12

      voices.push({ midi: bass, role: 'bass' })
      voices.push({ midi: bass + 12, role: 'root' })
      voices.push({ midi: prevGuides[0], role: 'guide' })
      voices.push({ midi: prevGuides[1], role: 'guide' })
    } else {
      voices.push({ midi: bass, role: 'bass' })
      voices.push({ midi: bass + 12, role: 'root' })
    }

    voiced.push(voices)
  }

  return voiced
}
