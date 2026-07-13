const STORAGE_KEY = 'viaggio-in-italia';
const CODE_PREFIX = 'VIAGGIO1.';

/** Serialize saved progress into a portable backup code. */
export function exportProgress(): string | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  // btoa only handles latin1; route through UTF-8 bytes first.
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(raw)));
  return CODE_PREFIX + b64;
}

/**
 * Validate and apply a backup code. Returns an error message, or null on
 * success (caller should reload so the store rehydrates).
 */
export function importProgress(code: string): string | null {
  const trimmed = code.trim();
  if (!trimmed.startsWith(CODE_PREFIX)) {
    return "That doesn't look like a backup code (it should start with VIAGGIO1.)";
  }
  let raw: string;
  try {
    const bytes = Uint8Array.from(atob(trimmed.slice(CODE_PREFIX.length)), (c) =>
      c.charCodeAt(0),
    );
    raw = new TextDecoder().decode(bytes);
  } catch {
    return 'The code is damaged or incomplete — copy it again in one piece.';
  }
  try {
    const parsed = JSON.parse(raw);
    const s = parsed?.state;
    if (
      typeof s?.xp !== 'number' ||
      !Array.isArray(s?.stamps) ||
      typeof s?.stars !== 'object' ||
      !Array.isArray(s?.mistakes)
    ) {
      return "The code decoded, but it doesn't contain valid game progress.";
    }
  } catch {
    return 'The code is damaged or incomplete — copy it again in one piece.';
  }
  localStorage.setItem(STORAGE_KEY, raw);
  return null;
}
