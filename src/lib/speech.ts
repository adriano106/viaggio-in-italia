let cachedVoice: SpeechSynthesisVoice | null | undefined;

function pickItalianVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith('it') && v.localService) ??
    voices.find((v) => v.lang.toLowerCase().startsWith('it')) ??
    null
  );
}

/** The voice list loads asynchronously in some browsers — refresh the cache. */
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoice = pickItalianVoice();
  });
}

export function getItalianVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice === undefined) cachedVoice = pickItalianVoice();
  return cachedVoice ?? null;
}

export function speechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && getItalianVoice() !== null;
}

/** Speak Italian text aloud. rate 1 = normal, ~0.7 = slow replay. */
export function speakItalian(text: string, rate = 1): void {
  const voice = getItalianVoice();
  if (!voice) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = rate;
  window.speechSynthesis.speak(u);
}
