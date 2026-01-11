export function triggerEmergencyFeedback() {
  try {
    // Haptics
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([30, 40, 30]);
    }

    // Sound (short, subtle beep)
    const AnyAudioContext =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AnyAudioContext) return;

    const ctx = new AnyAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = 880;

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);

    osc.onended = () => {
      ctx.close?.();
    };
  } catch {
    // no-op
  }
}
