import { useState } from 'react';
import { motion } from 'framer-motion';
import { CITIES } from '../data/cities';
import { useGame } from '../state/gameStore';
import { levelFromXp } from '../lib/scoring';
import { exportProgress, importProgress } from '../lib/backup';
import { HUD } from './HUD';

export function Passport() {
  const navigate = useGame((s) => s.navigate);
  const stamps = useGame((s) => s.stamps);
  const xp = useGame((s) => s.xp);
  const streak = useGame((s) => s.streakCount);
  const totalCorrect = useGame((s) => s.totalCorrect);
  const totalAnswered = useGame((s) => s.totalAnswered);
  const resetProgress = useGame((s) => s.resetProgress);
  const { level } = levelFromXp(xp);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const [backupCode, setBackupCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = async () => {
    const code = exportProgress();
    if (!code) return;
    setBackupCode(code);
    setImporting(false);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleImport = () => {
    const error = importProgress(importText);
    if (error) {
      setImportError(error);
    } else {
      window.location.reload();
    }
  };

  return (
    <div>
      <HUD onBack={() => navigate({ type: 'map' })} />
      <div className="center-col">
        <h1 className="serif" style={{ fontSize: 30, fontStyle: 'italic' }}>
          🛂 Passport
        </h1>

        <div
          className="card"
          style={{
            width: '100%',
            maxWidth: 560,
            background: 'linear-gradient(160deg, #274060, #1b2c45)',
            color: '#f5ecd9',
          }}
        >
          <div style={{ textAlign: 'center', letterSpacing: 4, fontSize: 13, opacity: 0.8 }}>
            REPUBBLICA DELL'APPRENDIMENTO · VIAGGIO IN ITALIA
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 14,
              marginTop: 18,
            }}
          >
            {CITIES.map((city, i) => {
              const stamped = stamps.includes(city.id);
              return (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 12,
                    border: stamped ? `3px solid ${city.color}` : '2px dashed rgba(245,236,217,0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    transform: stamped ? `rotate(${((i * 7) % 13) - 6}deg)` : 'none',
                    background: stamped ? 'rgba(255,255,255,0.08)' : 'transparent',
                  }}
                >
                  <div style={{ fontSize: 30, filter: stamped ? 'none' : 'grayscale(1) opacity(0.4)' }}>
                    {stamped ? city.emoji : '·'}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: stamped ? city.color : 'rgba(245,236,217,0.5)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {city.name}
                  </div>
                  {stamped && <div style={{ fontSize: 10, opacity: 0.7 }}>VISTO ✓</div>}
                </motion.div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <div className="hud-pill">⭐ Level {level}</div>
          <div className="hud-pill">⚡ {xp} XP</div>
          <div className="hud-pill">🔥 {streak}-day streak</div>
          <div className="hud-pill">🎯 {accuracy}% accuracy</div>
          <div className="hud-pill">
            🛂 {stamps.length}/{CITIES.length} stamps
          </div>
        </div>

        {stamps.length === CITIES.length && (
          <div className="card" style={{ textAlign: 'center', background: '#fff8ea', maxWidth: 560 }}>
            <div style={{ fontSize: 40 }}>🏆</div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Journey complete!</div>
            <div className="subtle">
              You've conquered all of Italy. Keep playing for the perfect score: 12 stars in every
              city!
            </div>
          </div>
        )}

        <div className="card" style={{ width: '100%', maxWidth: 560 }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
            💾 Backup & Restore
          </div>
          <div className="subtle" style={{ marginBottom: 12 }}>
            Progress is saved in this browser. To move it to another device or browser, copy a
            backup code here and paste it there.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn small" onClick={handleExport}>
              📤 Copy backup code
            </button>
            <button
              className="btn ghost small"
              onClick={() => {
                setImporting(true);
                setBackupCode(null);
                setImportError(null);
              }}
            >
              📥 Restore from code
            </button>
          </div>

          {backupCode && (
            <div style={{ marginTop: 12 }}>
              <div className="subtle" style={{ marginBottom: 6 }}>
                {copied
                  ? '✓ Copied to clipboard! You can also copy it manually below:'
                  : 'Copy this code and keep it somewhere safe:'}
              </div>
              <textarea
                readOnly
                value={backupCode}
                onFocus={(e) => e.target.select()}
                style={{
                  width: '100%',
                  minHeight: 70,
                  borderRadius: 10,
                  border: '2px solid rgba(60,45,20,0.2)',
                  padding: 8,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  resize: 'vertical',
                }}
              />
            </div>
          )}

          {importing && (
            <div style={{ marginTop: 12 }}>
              <div className="subtle" style={{ marginBottom: 6 }}>
                Paste your backup code (this replaces the progress on this device):
              </div>
              <textarea
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  setImportError(null);
                }}
                placeholder="VIAGGIO1.…"
                style={{
                  width: '100%',
                  minHeight: 70,
                  borderRadius: 10,
                  border: '2px solid rgba(60,45,20,0.2)',
                  padding: 8,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  resize: 'vertical',
                }}
              />
              {importError && (
                <div className="feedback bad" style={{ marginTop: 8, fontSize: 14 }}>
                  ✗ {importError}
                </div>
              )}
              <button
                className="btn small"
                style={{ marginTop: 8 }}
                disabled={!importText.trim()}
                onClick={handleImport}
              >
                Restore progress ↺
              </button>
            </div>
          )}
        </div>

        <button
          className="btn ghost small"
          onClick={() => {
            if (window.confirm('Are you sure? This will erase all your progress!')) resetProgress();
          }}
        >
          🗑️ Start over
        </button>
      </div>
    </div>
  );
}
