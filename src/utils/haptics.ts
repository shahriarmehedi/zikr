/**
 * Haptic feedback utility
 * Note: Apple (iOS WebKit / Safari) deliberately blocks the W3C Vibration API (navigator.vibrate)
 * on all iPhone and iPad browsers/PWAs for privacy and hardware isolation policies.
 * Standard vibration works natively on Android and supported mobile browsers.
 */

export function triggerHaptic(type: 'tap' | 'target' | 'warning' = 'tap') {
  if (typeof window === 'undefined') return;

  try {
    // Only call navigator.vibrate if natively supported by the browser
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      switch (type) {
        case 'tap':
          navigator.vibrate(25);
          break;
        case 'target':
          navigator.vibrate([50, 70, 50, 70, 80]);
          break;
        case 'warning':
          navigator.vibrate([60, 40, 60]);
          break;
      }
    }
  } catch {
    // Vibration safely fails without interrupting sound or app state
  }
}
