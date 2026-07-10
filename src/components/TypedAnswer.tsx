import { useEffect, useRef, useState } from 'react';

interface Props {
  placeholder?: string;
  disabled?: boolean;
  onSubmit: (value: string) => void;
  /** Bump to clear the field (new round). */
  resetKey?: number;
  buttonLabel?: string;
}

const ACCENT_CHARS = ['à', 'è', 'é', 'ì', 'ò', 'ù'];

/** Text input with accent helper buttons + submit on Enter. */
export function TypedAnswer({ placeholder, disabled, onSubmit, resetKey = 0, buttonLabel }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue('');
    inputRef.current?.focus();
  }, [resetKey]);

  const submit = () => {
    if (!value.trim() || disabled) return;
    onSubmit(value);
  };

  return (
    <div className="center-col" style={{ gap: 10, width: '100%' }}>
      <input
        ref={inputRef}
        className="type-input"
        value={value}
        placeholder={placeholder ?? 'Type your answer…'}
        disabled={disabled}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <div style={{ display: 'flex', gap: 6 }}>
        {ACCENT_CHARS.map((c) => (
          <button
            key={c}
            className="tile"
            style={{ padding: '4px 10px', fontSize: 15 }}
            disabled={disabled}
            onClick={() => {
              setValue((v) => v + c);
              inputRef.current?.focus();
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <button className="btn" onClick={submit} disabled={disabled || !value.trim()}>
        {buttonLabel ?? 'Answer ⚡'}
      </button>
    </div>
  );
}
