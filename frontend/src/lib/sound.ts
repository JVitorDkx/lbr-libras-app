export function playFeedbackTone(correct: boolean, enabled: boolean) {
  if (!enabled) return;
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = correct ? "sine" : "triangle";
  oscillator.frequency.setValueAtTime(correct ? 620 : 220, context.currentTime);
  if (correct) oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.16);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.24);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.25);
  oscillator.addEventListener("ended", () => void context.close());
}
