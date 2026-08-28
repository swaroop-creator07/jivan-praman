type Tone = 'success' | 'fail' | 'practice';

export function playTone(kind: Tone) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (kind === 'success') {
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.value = 0.06;
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else if (kind === 'fail') {
      osc.type = 'square';
      osc.frequency.value = 220;
      gain.gain.value = 0.04;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.type = 'sine';
      osc.frequency.value = 660;
      gain.gain.value = 0.05;
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
    setTimeout(() => ctx.close(), 400);
  } catch {
    /* audio not available */
  }
}
