import { motion } from 'framer-motion';
import { CITIES, cityById } from '../data/cities';
import { isCityUnlocked, useGame } from '../state/gameStore';
import type { CityId } from '../types';
import { todayKey } from '../lib/daily';

/** Stylized Italy boot with Sicily and Sardinia. */
const ITALY_PATH =
  'M120,95 L150,75 L200,62 L245,75 L270,95 ' +
  'L285,140 L300,180 L330,230 L355,272 L390,300 ' +
  'L405,335 L385,347 L360,315 L330,320 L310,345 ' +
  'L305,395 L285,432 L268,416 L280,375 ' +
  'L258,340 L248,318 L224,294 L205,264 L186,228 L176,194 L160,158 ' +
  'L135,133 L114,114 Z';

const SICILY_PATH = 'M235,455 L295,448 L305,470 L280,495 L245,490 L228,472 Z';
const SARDINIA_PATH = 'M100,285 L130,278 L140,310 L138,355 L118,375 L100,350 Z';

export function ItalyMap() {
  const stamps = useGame((s) => s.stamps);
  const stars = useGame((s) => s.stars);
  const mistakes = useGame((s) => s.mistakes);
  const daily = useGame((s) => s.daily);
  const navigate = useGame((s) => s.navigate);

  const totalStars = (cityId: CityId) =>
    [...cityById(cityId).games, 'boss'].reduce(
      (sum, g) => sum + (stars[`${cityId}:${g}`] ?? 0),
      0,
    );

  const route1 = CITIES.filter((c) => c.route === 1);
  const route2 = CITIES.filter((c) => c.route === 2);
  const route2Open = stamps.includes('milano');
  const dailyDone = daily.date === todayKey();

  return (
    <div className="map-wrap center-col">
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <h1 className="serif" style={{ fontSize: 34, fontStyle: 'italic' }}>
          Viaggio in Italia
        </h1>
        <div className="subtle">
          From Napoli to Milano: conquer every city and fill your passport! 🇮🇹
        </div>
      </div>

      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 620,
          padding: 10,
          background: 'linear-gradient(180deg, #cfe6ef 0%, #bcdce9 100%)',
        }}
      >
        <svg viewBox="60 40 380 480" style={{ width: '100%', display: 'block' }}>
          {/* Land */}
          <g>
            <path d={ITALY_PATH} fill="#e9dfc3" stroke="#b7a97f" strokeWidth="2.5" strokeLinejoin="round" />
            <path d={SICILY_PATH} fill="#e9dfc3" stroke="#b7a97f" strokeWidth="2.5" strokeLinejoin="round" />
            <path d={SARDINIA_PATH} fill="#e9dfc3" stroke="#b7a97f" strokeWidth="2.5" strokeLinejoin="round" />
          </g>

          {/* Journey routes */}
          <polyline
            points={route1.map((c) => `${c.x},${c.y}`).join(' ')}
            fill="none"
            stroke="#8a6d3b"
            strokeWidth="3"
            strokeDasharray="1 9"
            strokeLinecap="round"
            opacity="0.7"
          />
          {route2Open && (
            <>
              <polyline
                points={[route1[route1.length - 1], ...route2]
                  .map((c) => `${c.x},${c.y}`)
                  .join(' ')}
                fill="none"
                stroke="#c2455f"
                strokeWidth="3"
                strokeDasharray="1 9"
                strokeLinecap="round"
                opacity="0.7"
              />
              <text
                x="62"
                y="66"
                fontSize="11"
                fill="#c2455f"
                fontWeight="700"
                style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
              >
                Il Secondo Viaggio ✨
              </text>
            </>
          )}

          {/* Decorations */}
          <text x="90" y="440" fontSize="20" opacity="0.7">🌊</text>
          <text x="360" y="200" fontSize="20" opacity="0.7">⛵</text>
          <text x="190" y="72" fontSize="16" opacity="0.8">🏔️</text>

          {CITIES.map((city, i) => {
            const unlocked = isCityUnlocked(city.id, stamps);
            const stamped = stamps.includes(city.id);
            const cityStars = totalStars(city.id);
            const isNext = unlocked && !stamped;
            return (
              <motion.g
                key={city.id}
                className={`city-node ${unlocked ? '' : 'locked'}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 260, damping: 16 }}
                onClick={() => unlocked && navigate({ type: 'city', cityId: city.id })}
                style={{ transformOrigin: `${city.x}px ${city.y}px` }}
              >
                {isNext && (
                  <circle cx={city.x} cy={city.y} r="24" fill={city.color} opacity="0.25">
                    <animate attributeName="r" values="20;30;20" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.08;0.3" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={city.x}
                  cy={city.y}
                  r="19"
                  fill={unlocked ? city.color : '#9c9488'}
                  stroke="#fff"
                  strokeWidth="3"
                />
                <text x={city.x} y={city.y + 6} textAnchor="middle" fontSize="17">
                  {unlocked ? city.emoji : '🔒'}
                </text>
                {stamped && (
                  <text x={city.x + 14} y={city.y - 12} fontSize="14">✅</text>
                )}
                <text
                  x={city.x}
                  y={city.id === 'verona' ? city.y - 26 : city.y + 38}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="800"
                  fill="#4a4237"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {city.name}
                </text>
                {unlocked && cityStars > 0 && (
                  <text x={city.x} y={city.y + 52} textAnchor="middle" fontSize="10" fill="#a07d1c">
                    {'⭐'.repeat(Math.min(3, Math.ceil(cityStars / 4)))} {cityStars}/12
                  </text>
                )}
              </motion.g>
            );
          })}
        </svg>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          className="btn"
          style={dailyDone ? { filter: 'saturate(0.6)' } : undefined}
          onClick={() => navigate({ type: 'daily' })}
        >
          {dailyDone ? `🗓️ Daily done ✓ (${daily.correct}/10)` : '🗓️ Daily Challenge'}
        </button>
        <button className="btn ghost" onClick={() => navigate({ type: 'passport' })}>
          🛂 Passport
        </button>
        {mistakes.length > 0 && (
          <button className="btn red" onClick={() => navigate({ type: 'ripasso' })}>
            📝 Review mistakes ({mistakes.length})
          </button>
        )}
      </div>
    </div>
  );
}
