import { SoundType } from '../types/zikr';

let audioCtx: AudioContext | null = null;

// HTML5 audio elements for fallback (bypasses iOS Silent switch on older WebKit)
const audioCache: Partial<Record<SoundType, HTMLAudioElement>> = {};

function configureIOSAudioSession() {
  if (typeof navigator !== 'undefined' && 'audioSession' in navigator) {
    try {
      // @ts-expect-error - navigator.audioSession is supported in Safari 17+
      navigator.audioSession.type = 'playback';
    } catch {
      // ignore
    }
  }
}

// Generate base64 WAV sound for HTML5 Audio fallback
function createWavDataUri(type: SoundType): string {
  const sampleRate = 22050;
  let duration = 0.05; // 50ms
  if (type === 'bell') duration = 0.3;

  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new Int16Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    switch (type) {
      case 'wood': {
        // Frequency sweep from 350Hz down to 100Hz with exponential decay
        const freq = 350 * Math.exp(-t * 25);
        sample = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 40);
        break;
      }
      case 'click': {
        // High frequency sharp impulse
        const freq = 1600 * Math.exp(-t * 50);
        sample = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 60);
        break;
      }
      case 'bell': {
        // Gentle singing harmonic A5 (880Hz) + E6 (1320Hz)
        sample =
          (Math.sin(2 * Math.PI * 880 * t) * 0.7 +
            Math.sin(2 * Math.PI * 1320 * t) * 0.3) *
          Math.exp(-t * 8);
        break;
      }
      case 'water': {
        // Water drop chirp from 400Hz up to 1200Hz
        const freq = 400 + 800 * (t / duration);
        sample = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 30);
        break;
      }
    }

    buffer[i] = Math.max(-32768, Math.min(32767, Math.floor(sample * 30000)));
  }

  // Create WAV container
  const byteLength = numSamples * 2;
  const wavHeader = new ArrayBuffer(44 + byteLength);
  const view = new DataView(wavHeader);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + byteLength, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  // fmt subchunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample
  // data subchunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, byteLength, true);

  // Write samples
  const uint8View = new Uint8Array(wavHeader, 44);
  const sampleBytes = new Uint8Array(buffer.buffer);
  uint8View.set(sampleBytes);

  // Convert to Base64
  let binary = '';
  const bytes = new Uint8Array(wavHeader);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

function getFallbackAudio(type: SoundType): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!audioCache[type]) {
    try {
      const dataUri = createWavDataUri(type);
      const audio = new Audio(dataUri);
      audio.preload = 'auto';
      audioCache[type] = audio;
    } catch {
      return null;
    }
  }
  return audioCache[type] || null;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  configureIOSAudioSession();

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Global unlock listener for iOS Safari and iPhone PWAs
if (typeof window !== 'undefined') {
  const unlock = () => {
    configureIOSAudioSession();
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    // Warm up fallbacks
    ['wood', 'click'].forEach((t) => {
      const a = getFallbackAudio(t as SoundType);
      if (a) {
        a.volume = 0.01;
        a.play()
          .then(() => {
            a.pause();
            a.currentTime = 0;
            a.volume = 1;
          })
          .catch(() => {});
      }
    });
  };

  window.addEventListener('touchstart', unlock, { once: true, passive: true });
  window.addEventListener('touchend', unlock, { once: true, passive: true });
  window.addEventListener('click', unlock, { once: true, passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      configureIOSAudioSession();
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }
  });
}

export function playTapSound(type: SoundType = 'wood') {
  configureIOSAudioSession();

  // Try Web Audio API first with playback session (bypasses iOS Silent switch on iOS 17+)
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state !== 'closed') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      switch (type) {
        case 'wood': {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(360, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

          gain.gain.setValueAtTime(0.65, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }
        case 'click': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1500, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.025);

          gain.gain.setValueAtTime(0.55, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

          osc.start(now);
          osc.stop(now + 0.035);
          break;
        }
        case 'bell': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now);

          gain.gain.setValueAtTime(0.45, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

          osc.start(now);
          osc.stop(now + 0.35);
          break;
        }
        case 'water': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(450, now);
          osc.frequency.exponentialRampToValueAtTime(1300, now + 0.04);

          gain.gain.setValueAtTime(0.55, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }
      }
      return;
    }
  } catch {
    // If Web Audio API fails, fallback to HTML5 Audio element below
  }

  // HTML5 Audio fallback
  try {
    const audio = getFallbackAudio(type);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  } catch {
    // ignore
  }
}

export function playCelebrationSound() {
  configureIOSAudioSession();

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, idx) => {
      const start = ctx.currentTime + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.3);
    });
  } catch {
    // ignore
  }
}
