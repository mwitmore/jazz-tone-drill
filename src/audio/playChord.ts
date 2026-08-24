import { allSpelledTones, formatChord, type Chord } from '../theory/chords.ts'
import { notePc } from '../theory/notes.ts'
import { voiceLeadCadence, voiceLeadingBassMidis } from './cadenceVoicing.ts'

const SAMPLE_RATE = 44100

const TONE = {
  attack: 0.012,
  release: 0.06,
  askedDur: 0.72,
  askedAmp: 0.22,
  runNote: 0.3,
  runStep: 0.22,
  runAmp: 0.18,
  cadenceChord: 0.46,
  cadenceGap: 0.08,
  cadenceBassAmp: 0.2,
  cadenceRootAmp: 0.16,
  cadenceGuideAmp: 0.1,
  partials: [
    { ratio: 1, mix: 0.94 },
    { ratio: 2, mix: 0.05 },
    { ratio: 3, mix: 0.015 },
  ],
  bassPartials: [
    { ratio: 1, mix: 0.62 },
    { ratio: 2, mix: 0.26 },
    { ratio: 3, mix: 0.1 },
    { ratio: 4, mix: 0.04 },
  ],
} as const

let player: HTMLAudioElement | null = null
let unlocked = false
let lastUri = ''
let lastPlayAt = 0

const intervalCache = new Map<string, string>()
const singleCache = new Map<number, string>()
const runCache = new Map<string, string>()
const cadenceCache = new Map<string, string>()

function media(): HTMLAudioElement {
  if (!player) {
    player = new Audio()
    player.preload = 'auto'
    player.setAttribute('playsinline', 'true')
    player.setAttribute('webkit-playsinline', 'true')
    document.body?.appendChild(player)
  }
  return player
}

export function isAudioReady(): boolean {
  return unlocked
}

function freqFromMidi(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12)
}

export function rootMidi(pc: number): number {
  return 60 + (((pc % 12) + 12) % 12)
}

export function ascendingMidi(pc: number, previousMidi?: number): number {
  let midi = rootMidi(pc)
  if (previousMidi === undefined) return midi
  while (midi <= previousMidi) midi += 12
  return midi
}

function env(t: number, start: number, end: number): number {
  if (t < start || t > end) return 0
  const pos = t - start
  const dur = end - start
  if (pos < TONE.attack) return 0.5 * (1 - Math.cos((Math.PI * pos) / TONE.attack))
  if (pos > dur - TONE.release) {
    const releasePos = pos - (dur - TONE.release)
    return 0.5 * (1 + Math.cos((Math.PI * releasePos) / TONE.release))
  }
  return 1
}

function onsetNoise(t: number, start: number): number {
  const pos = t - start
  if (pos < 0 || pos > 0.08) return 0
  const fade = 1 - pos / 0.08
  const sampleIndex = Math.floor(t * SAMPLE_RATE)
  const noise = (((sampleIndex * 16807 + 12345) % 2147483647) / 1073741823.5 - 1) * fade * fade * 0.035
  return noise
}

function synthSample(
  t: number,
  hz: number,
  start: number,
  end: number,
  amp: number,
  rich = false,
): number {
  const gain = env(t, start, end)
  if (gain === 0) return 0
  const elapsed = t - start
  let sample = onsetNoise(t, start)
  const partials = rich ? TONE.bassPartials : TONE.partials
  for (const partial of partials) {
    sample += Math.sin(2 * Math.PI * hz * partial.ratio * elapsed) * partial.mix
  }
  return sample * gain * amp
}

function fadeBufferEdges(samples: Float32Array): void {
  const fadeSamples = Math.max(1, Math.floor(SAMPLE_RATE * 0.004))
  const limit = Math.min(fadeSamples, Math.floor(samples.length / 2))
  for (let i = 0; i < limit; i += 1) {
    const gain = 0.5 * (1 - Math.cos((Math.PI * (i + 1)) / (limit + 1)))
    samples[i] *= gain
    samples[samples.length - 1 - i] *= gain
  }
}

function toPcm(samples: Float32Array): Int16Array {
  fadeBufferEdges(samples)
  const pcm = new Int16Array(samples.length)
  for (let i = 0; i < samples.length; i += 1) {
    pcm[i] = Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767)
  }
  return pcm
}

function encodeWav(pcm: Int16Array): string {
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
  view.setUint32(24, SAMPLE_RATE, true)
  view.setUint32(28, SAMPLE_RATE * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeAscii(view, 36, 'data')
  view.setUint32(40, bytes, true)
  new Uint8Array(buffer, 44).set(new Uint8Array(pcm.buffer))
  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }))
}

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let i = 0; i < text.length; i += 1) {
    view.setUint8(offset + i, text.charCodeAt(i))
  }
}

function renderInterval(rootPc: number, semitones: number): string {
  const rootEnd = 0.5
  const upperStart = 0.64
  const upperEnd = 1.32
  const samples = Math.floor(SAMPLE_RATE * (upperEnd + 0.04))
  const mix = new Float32Array(samples)
  const rootHz = freqFromMidi(rootMidi(rootPc))
  const toneHz = freqFromMidi(rootMidi(rootPc) + semitones)
  for (let i = 0; i < samples; i += 1) {
    const t = i / SAMPLE_RATE
    mix[i] =
      synthSample(t, rootHz, 0, rootEnd, 0.26) + synthSample(t, toneHz, upperStart, upperEnd, 0.24)
  }
  return encodeWav(toPcm(mix))
}

function renderSingle(midi: number): string {
  const samples = Math.floor(SAMPLE_RATE * (TONE.askedDur + 0.04))
  const mix = new Float32Array(samples)
  const hz = freqFromMidi(midi)
  for (let i = 0; i < samples; i += 1) {
    mix[i] = synthSample(i / SAMPLE_RATE, hz, 0, TONE.askedDur, TONE.askedAmp)
  }
  return encodeWav(toPcm(mix))
}

function renderRun(pcs: number[]): string {
  const midis = voiceLeadingBassMidis(pcs)
  const total = (midis.length - 1) * TONE.runStep + TONE.runNote + 0.05
  const samples = Math.floor(SAMPLE_RATE * total)
  const mix = new Float32Array(samples)
  const hz = midis.map(freqFromMidi)
  for (let i = 0; i < samples; i += 1) {
    const t = i / SAMPLE_RATE
    let sample = 0
    for (let n = 0; n < hz.length; n += 1) {
      const start = n * TONE.runStep
      const end = start + TONE.runNote
      if (t >= start && t <= end) sample += synthSample(t, hz[n], start, end, TONE.runAmp)
    }
    mix[i] = sample
  }
  return encodeWav(toPcm(mix))
}

function renderCadence(chords: Chord[]): string {
  const voiced = voiceLeadCadence(chords)
  const step = TONE.cadenceChord + TONE.cadenceGap
  const total = chords.length * TONE.cadenceChord + (chords.length - 1) * TONE.cadenceGap + 0.05
  const samples = Math.floor(SAMPLE_RATE * total)
  const mix = new Float32Array(samples)
  for (let i = 0; i < samples; i += 1) {
    const t = i / SAMPLE_RATE
    let sample = 0
    for (let c = 0; c < voiced.length; c += 1) {
      const start = c * step
      const end = start + TONE.cadenceChord
      if (t < start || t > end) continue
      for (const voice of voiced[c]) {
        const amp =
          voice.role === 'bass'
            ? TONE.cadenceBassAmp
            : voice.role === 'root'
              ? TONE.cadenceRootAmp
              : TONE.cadenceGuideAmp
        sample += synthSample(t, freqFromMidi(voice.midi), start, end, amp, voice.role !== 'guide')
      }
    }
    mix[i] = sample
  }
  return encodeWav(toPcm(mix))
}

function cachedInterval(rootPc: number, semitones: number): string {
  const key = `${rootPc}:${semitones}`
  const hit = intervalCache.get(key)
  if (hit) return hit
  const uri = renderInterval(rootPc, semitones)
  intervalCache.set(key, uri)
  return uri
}

function cachedSingle(midi: number): string {
  const hit = singleCache.get(midi)
  if (hit) return hit
  const uri = renderSingle(midi)
  singleCache.set(midi, uri)
  return uri
}

function cachedRun(pcs: number[]): string {
  const key = pcs.join(',')
  const hit = runCache.get(key)
  if (hit) return hit
  const uri = renderRun(pcs)
  runCache.set(key, uri)
  return uri
}

function cachedCadence(chords: Chord[]): string {
  const key = chords.map((chord) => formatChord(chord)).join('|')
  const hit = cadenceCache.get(key)
  if (hit) return hit
  const uri = renderCadence(chords)
  cadenceCache.set(key, uri)
  return uri
}

function warmCache(): void {
  let pc = 55
  const step = () => {
    const limit = Math.min(pc + 3, 85)
    for (; pc < limit; pc += 1) cachedSingle(pc)
    if (pc <= 84) window.setTimeout(step, 0)
  }
  step()
}

function playUri(uri: string): Promise<boolean> {
  const now = Date.now()
  if (uri === lastUri && now - lastPlayAt < 140) return Promise.resolve(true)
  lastUri = uri
  lastPlayAt = now

  const el = media()
  if (el.src !== uri) el.src = uri
  else {
    try {
      el.currentTime = 0
    } catch {
      // Some mobile browsers reject resetting currentTime before metadata loads.
    }
  }

  const result = el.play()
  if (!result) {
    unlocked = true
    return Promise.resolve(true)
  }
  return result
    .then(() => {
      unlocked = true
      return true
    })
    .catch(() => false)
}

export async function playRootAndInterval(rootPc: number, semitones: number): Promise<boolean> {
  if (!unlocked) return false
  return playUri(cachedInterval(rootPc, semitones))
}

export async function unlockAndPlay(rootPc: number, semitones: number): Promise<boolean> {
  const ok = await playUri(cachedInterval(rootPc, semitones))
  if (ok) warmCache()
  return ok
}

export function playCadence(chords: Chord[]): void {
  if (chords.length === 0) return
  void playUri(cachedCadence(chords))
}

export function playCadenceRoots(pcs: number[]): void {
  if (pcs.length === 0) return
  void playUri(cachedRun(pcs))
}

export function playScale(pcs: number[]): void {
  if (pcs.length === 0) return
  void playUri(cachedRun(pcs))
}

export function playTone(midi: number): void {
  void playUri(cachedSingle(midi))
}

export async function playChord(chord: Chord, highlightPc?: number): Promise<boolean> {
  if (!unlocked) return false
  const tones = allSpelledTones(chord)
  const pcs = tones
    .filter(
      (t) =>
        t.degree === '1' ||
        t.degree === '3' ||
        t.degree === '5' ||
        t.degree === '7' ||
        notePc(t.note) === highlightPc,
    )
    .map((t) => notePc(t.note))
  const unique: number[] = []
  for (const pc of pcs) {
    if (!unique.includes(pc)) unique.push(pc)
  }
  return playUri(cachedRun(unique))
}
