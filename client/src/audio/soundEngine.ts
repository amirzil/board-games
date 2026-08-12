// Small synthesized sound engine for Splendor — no audio files, everything is
// generated with the Web Audio API so the game stays a single static bundle.

export type SoundName =
  | 'chipSelect'
  | 'chipDeselect'
  | 'chipConfirm'
  | 'cardReveal'
  | 'cardReserve'
  | 'cardBuy'
  | 'nobleClaim'
  | 'turnStart'
  | 'win'

interface AudioPrefs {
  muted: boolean
  volume: number
}

const STORAGE_KEY = 'splendor:audioPrefs'
const DEFAULT_PREFS: AudioPrefs = { muted: false, volume: 0.5 }

function loadPrefs(): AudioPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {
    // localStorage unavailable — fall back to defaults
  }
  return { ...DEFAULT_PREFS }
}

let prefs = loadPrefs()
let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let noiseBuffer: AudioBuffer | null = null

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) {
    ctx = new Ctor()
    masterGain = ctx.createGain()
    masterGain.gain.value = prefs.muted ? 0 : prefs.volume
    masterGain.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function getNoiseBuffer(context: AudioContext): AudioBuffer {
  if (!noiseBuffer || noiseBuffer.sampleRate !== context.sampleRate) {
    const length = context.sampleRate
    noiseBuffer = context.createBuffer(1, length, context.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  }
  return noiseBuffer
}

function tone(
  context: AudioContext,
  opts: { freq: number; type?: OscillatorType; start?: number; duration: number; peak?: number; attack?: number }
) {
  if (!masterGain) return
  const { freq, type = 'sine', start = 0, duration, peak = 0.3, attack = 0.005 } = opts
  const t0 = context.currentTime + start
  const osc = context.createOscillator()
  osc.type = type
  osc.frequency.value = freq
  const gain = context.createGain()
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(peak, t0 + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain)
  gain.connect(masterGain)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

function noiseBurst(
  context: AudioContext,
  opts: { start?: number; duration: number; filterType?: BiquadFilterType; filterFreq: number; q?: number; peak?: number }
) {
  if (!masterGain) return
  const { start = 0, duration, filterType = 'bandpass', filterFreq, q = 1, peak = 0.3 } = opts
  const t0 = context.currentTime + start
  const src = context.createBufferSource()
  src.buffer = getNoiseBuffer(context)
  const filter = context.createBiquadFilter()
  filter.type = filterType
  filter.frequency.value = filterFreq
  filter.Q.value = q
  const gain = context.createGain()
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  src.connect(filter)
  filter.connect(gain)
  gain.connect(masterGain)
  src.start(t0)
  src.stop(t0 + duration + 0.02)
}

const EFFECTS: Record<SoundName, (c: AudioContext) => void> = {
  // Picking up a chip: a light plastic-on-felt tap
  chipSelect: (c) => {
    tone(c, { freq: 720, type: 'triangle', duration: 0.09, peak: 0.18, attack: 0.002 })
    noiseBurst(c, { duration: 0.04, filterFreq: 3200, q: 2, peak: 0.08 })
  },
  // Putting a chip back
  chipDeselect: (c) => {
    tone(c, { freq: 400, type: 'triangle', duration: 0.08, peak: 0.13, attack: 0.002 })
  },
  // Gems land in hand: a few quick clinks of decreasing/varying pitch
  chipConfirm: (c) => {
    ;[0, 0.07, 0.14].forEach((start, i) => {
      tone(c, { freq: 950 + i * 160, type: 'sine', duration: 0.13, peak: 0.16, attack: 0.001, start })
      noiseBurst(c, { start, duration: 0.05, filterFreq: 4200, q: 3, peak: 0.06 })
    })
  },
  // A fresh card slides into the row
  cardReveal: (c) => {
    noiseBurst(c, { duration: 0.18, filterFreq: 1400, q: 0.7, peak: 0.11 })
  },
  // Card tucked into a reserve slot
  cardReserve: (c) => {
    noiseBurst(c, { duration: 0.2, filterFreq: 900, q: 0.6, peak: 0.13 })
    tone(c, { freq: 260, type: 'sine', duration: 0.15, peak: 0.1, start: 0.02 })
  },
  // Purchase: a solid thud followed by a bright two-note chime
  cardBuy: (c) => {
    tone(c, { freq: 170, type: 'sine', duration: 0.12, peak: 0.32, attack: 0.001 })
    noiseBurst(c, { duration: 0.05, filterFreq: 600, q: 0.8, peak: 0.12 })
    tone(c, { freq: 700, type: 'triangle', duration: 0.18, peak: 0.14, start: 0.05 })
    tone(c, { freq: 1050, type: 'triangle', duration: 0.22, peak: 0.14, start: 0.11 })
  },
  // Noble arrives: a short rising arpeggio
  nobleClaim: (c) => {
    ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      tone(c, { freq, type: 'triangle', duration: 0.5, peak: 0.13, start: i * 0.09, attack: 0.01 })
      tone(c, { freq: freq * 2, type: 'sine', duration: 0.35, peak: 0.05, start: i * 0.09 + 0.02 })
    })
  },
  // Your turn begins: a single soft bell
  turnStart: (c) => {
    tone(c, { freq: 880, type: 'sine', duration: 0.22, peak: 0.11, attack: 0.01 })
  },
  // Game over, you won: a longer fanfare chord
  win: (c) => {
    ;[523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
      tone(c, { freq, type: 'triangle', duration: 0.9, peak: 0.11, start: i * 0.12, attack: 0.02 })
    })
  },
}

export function playSound(name: SoundName) {
  if (prefs.muted) return
  const context = ensureContext()
  if (!context) return
  EFFECTS[name](context)
}

export function isMuted() {
  return prefs.muted
}

export function getVolume() {
  return prefs.volume
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // ignore — sound prefs just won't persist this session
  }
}

export function setMuted(muted: boolean) {
  prefs = { ...prefs, muted }
  persist()
  if (masterGain && ctx) masterGain.gain.setTargetAtTime(muted ? 0 : prefs.volume, ctx.currentTime, 0.01)
}

export function toggleMute(): boolean {
  setMuted(!prefs.muted)
  return prefs.muted
}
