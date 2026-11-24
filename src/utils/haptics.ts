import { WebHaptics } from 'web-haptics';

// WebHaptics instance for cross-platform fallback
let webHapticsInstance: WebHaptics | null = null;

// iOS Switch Element references
let iosSwitchLabel: HTMLLabelElement | null = null;
let iosSwitchInput: HTMLInputElement | null = null;

// Audio-based tactile sub-bass transducer for iPhone chassis vibration
let iosHapticAudioCtx: AudioContext | null = null;

function isIOS(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function initIOSSwitch() {
  if (typeof document === 'undefined' || iosSwitchLabel) return;

  try {
    const id = 'zikr-ios-haptic-switch';
    const label = document.createElement('label');
    label.htmlFor = id;
    label.style.position = 'fixed';
    label.style.top = '-9999px';
    label.style.left = '-9999px';
    label.style.width = '1px';
    label.style.height = '1px';
    label.style.opacity = '0.001';
    label.style.pointerEvents = 'none';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    input.id = id;
    input.style.position = 'absolute';
    input.style.width = '1px';
    input.style.height = '1px';

    label.appendChild(input);
    document.body.appendChild(label);

    iosSwitchLabel = label;
    iosSwitchInput = input;
  } catch {
    // ignore
  }
}

// Generates an inaudible, deep 50Hz sub-bass mechanical impulse that vibrates the iPhone speaker motor
function playTactileAudioPulse(strength: 'light' | 'medium' | 'heavy' = 'medium') {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!iosHapticAudioCtx) {
      iosHapticAudioCtx = new AudioCtx();
    }

    if (iosHapticAudioCtx.state === 'suspended') {
      iosHapticAudioCtx.resume();
    }

    const now = iosHapticAudioCtx.currentTime;
    const osc = iosHapticAudioCtx.createOscillator();
    const gain = iosHapticAudioCtx.createGain();

    // 50Hz sub-audible frequency maximizes physical transducer excursion
    osc.type = 'sine';
    osc.frequency.setValueAtTime(50, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.03);

    const volume = strength === 'heavy' ? 0.9 : strength === 'medium' ? 0.6 : 0.4;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(gain);
    gain.connect(iosHapticAudioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch {
    // ignore
  }
}

export function triggerHaptic(type: 'tap' | 'target' | 'warning' = 'tap') {
  if (typeof window === 'undefined') return;

  const isApple = isIOS();

  // 1. Android / standard browsers with navigator.vibrate
  if ('vibrate' in navigator && typeof navigator.vibrate === 'function' && !isApple) {
    try {
      switch (type) {
        case 'tap':
          navigator.vibrate(22);
          break;
        case 'target':
          navigator.vibrate([45, 60, 45, 60, 70]);
          break;
        case 'warning':
          navigator.vibrate([60, 40, 60]);
          break;
      }
      return;
    } catch {
      // fallback to webHaptics below
    }
  }

  // 2. iOS Safari & iPhone PWA implementation
  if (isApple || !('vibrate' in navigator)) {
    // Method A: Native iOS 17.4+ / 18+ Taptic Engine Switch Trigger
    initIOSSwitch();
    if (iosSwitchLabel) {
      try {
        iosSwitchLabel.click();
      } catch {
        // ignore
      }
    }

    // Method B: WebHaptics fallback
    if (!webHapticsInstance) {
      try {
        webHapticsInstance = new WebHaptics();
      } catch {
        // ignore
      }
    }
    if (webHapticsInstance) {
      try {
        if (type === 'target') {
          webHapticsInstance.trigger('success');
        } else if (type === 'warning') {
          webHapticsInstance.trigger('warning');
        } else {
          webHapticsInstance.trigger('medium');
        }
      } catch {
        // ignore
      }
    }

    // Method C: Acoustic transducer physical chassis vibration (iPhone speaker recoil)
    if (type === 'target') {
      playTactileAudioPulse('heavy');
      setTimeout(() => playTactileAudioPulse('heavy'), 80);
    } else {
      playTactileAudioPulse('medium');
    }
  }
}
