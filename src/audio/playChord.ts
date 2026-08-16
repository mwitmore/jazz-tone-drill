import { allSpelledTones, type Chord } from '../theory/chords.ts'
import { notePc } from '../theory/notes.ts'

let player: HTMLAudioElement | null = null
let unlocked = false

function media(): HTMLAudioElement {
  if (!player) {
    player = new Audio()
    player.preload = 'auto'
    player.setAttribute('playsinline', 'true')
    player.setAttribute('webkit-playsinline', 'true')
  }
  return player
}

export function isAudioReady(): boolean {
  return unlocked
}

function freqFromMidi(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12)
}

function rootMidi(pc: number): number {
  return 60 + pc
}

function env(t: number, start: number, end: number): number {
  if (t < start || t > end) return 0
  const pos = t - start
  const dur = end - start
  const attack = 0.07
  const release = 0.2
  if (pos < attack) return pos / attack
  if (pos > dur - release) return Math.max(0, (dur - pos) / release)
  return 1
}

function softTone(t: number, hz: number, start: number, end: number, amp: number): number {
  const gain = env(t, start, end)
  if (gain === 0) return 0
  const p = 2 * Math.PI * hz * t
  return (Math.sin(p) * 0.8 + Math.sin(2 * p) * 0.12 + Math.sin(3 * p) * 0.04) * gain * amp
}

function renderInterval(rootPc: number, semitones: number): string {
  const sr = 44100
  const rootEnd = 0.5
  const upperStart = 0.64
  const upperEnd = 1.32
  const samples = Math.floor(sr * (upperEnd + 0.04))
  const pcm = new Int16Array(samples)
  const rootHz = freqFromMidi(rootMidi(rootPc))
  const toneHz = freqFromMidi(rootMidi(rootPc) + semitones)
  for (let i = 0; i < samples; i += 1) {
    const t = i / sr
    const sample = softTone(t, rootHz, 0, rootEnd, 0.26) + softTone(t, toneHz, upperStart, upperEnd, 0.24)
    pcm[i] = Math.max(-1, Math.min(1, sample)) * 32767
  }
  return encodeWav(pcm, sr)
}

function renderChord(pcs: number[]): string {
  const sr = 44100
  const samples = Math.floor(sr * 1.35)
  const pcm = new Int16Array(samples)
  const freqs = pcs.map((pc, i) => freqFromMidi(rootMidi(pc) + (i === 0 ? 0 : 12)))
  for (let i = 0; i < samples; i += 1) {
    const t = i / sr
    let s = 0
    freqs.forEach((hz, n) => {
      s += softTone(t, hz, 0, 1.28, n === 0 ? 0.2 : 0.12)
    })
    pcm[i] = Math.max(-1, Math.min(1, s)) * 32767
  }
  return encodeWav(pcm, sr)
}

function encodeWav(pcm: Int16Array, sampleRate: number): string {
  const bytes = pcm.byteLength
  const buffer = new ArrayBuffer(44 + bytes)
  const view = new DataView(buffer)
  writeAscii(view, 0, 'RIFF')
  view.setUint32(4, 36 + bytes, true)
  writeAscii(view, 8, 'WAVE')
  writeAscii(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeAscii(view, 36, 'data')
  view.setUint32(40, bytes, true)
  new Uint8Array(buffer, 44).set(new Uint8Array(pcm.buffer))
  return `data:audio/wav;base64,${bytesToBase64(new Uint8Array(buffer))}`
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let i = 0; i < text.length; i += 1) {
    view.setUint8(offset + i, text.charCodeAt(i))
  }
}

async function playUri(uri: string): Promise<boolean> {
  const el = media()
  el.pause()
  el.currentTime = 0
  el.src = uri
  try {
    await el.play()
    unlocked = true
    return true
  } catch {
    return false
  }
}

export async function playRootAndInterval(rootPc: number, semitones: number): Promise<boolean> {
  if (!unlocked) return false
  return playUri(renderInterval(rootPc, semitones))
}

export async function unlockAndPlay(rootPc: number, semitones: number): Promise<boolean> {
  return playUri(renderInterval(rootPc, semitones))
}

export async function playChord(chord: Chord, highlightPc?: number): Promise<boolean> {
  if (!unlocked) return false
  const tones = allSpelledTones(chord)
  const pcs = tones
    .filter((t) => t.degree === '1' || t.degree === '3' || t.degree === '5' || t.degree === '7' || notePc(t.note) === highlightPc)
    .map((t) => notePc(t.note))
  const unique: number[] = []
  for (const pc of pcs) {
    if (!unique.includes(pc)) unique.push(pc)
  }
  return playUri(renderChord(unique))
}
