export function triggerHaptic(type: 'tap' | 'target' | 'warning' = 'tap') {
  if (typeof window === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'tap':
        // Quick subtle pulse
        navigator.vibrate(18);
        break;
      case 'target':
        // Double gentle pulse pattern for target achievement
        navigator.vibrate([40, 60, 40]);
        break;
      case 'warning':
        // Longer alert pulse
        navigator.vibrate([60, 40, 60]);
        break;
    }
  } catch {
    // Vibration not allowed or supported
  }
}
