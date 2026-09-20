# Viaggio in Italia 🇮🇹

A gamified web game for learning **intermediate (B1) Italian**. Journey across a map of Italy: each city teaches its own theme and grammar through mini-games, and you unlock the next city by beating its boss.

**▶️ Play it now: https://viaggio-in-italia-flax.vercel.app** — works on desktop and mobile, no install needed. Progress saves in your browser; use the in-game backup codes to move it between devices.

![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)

## The journey

| City | Theme | Grammar focus |
|------|-------|---------------|
| 🍕 Napoli | Food & dining | Present tense, reflexives, direct pronouns |
| 🏛️ Roma | History & city life | Passato prossimo vs imperfetto |
| 🎨 Firenze | Art & descriptions | Comparatives, piacere, stare + gerund |
| 🎓 Bologna | Student life | Imperative, combined pronouns |
| 🛶 Venezia | Travel & directions | Future & conditional |
| 👠 Milano | Fashion & business | Present subjunctive |

## How it works

Each city has **three mini-games** plus a **boss challenge**:

- **🧱 Sentence Builder** — rebuild scrambled Italian sentences from word tiles, with combo multipliers
- **⚔️ Verb Duel** — a conjugation battle against themed opponents (a pizzaiolo, a gondolier, a stilista…): correct answers land hits on their health bar, mistakes cost you hearts
- **🛍️ Word Market** — timed matching of Italian words and real idioms to their meanings
- **👑 Boss challenge** — a story dialogue (dinner at Nonna's, a Roman taxi ride, an oral exam, a Vogue job interview…) mixing all three mechanics; passing it stamps your passport and unlocks the next city

The learning layer:

- ~330 hand-written B1 exercises with **accent-tolerant checking** (typing `perche` counts, but the accent gets flagged)
- An instant **micro-correction** with a one-line "why" on every mistake
- A **Review deck**: every mistake queues up for spaced review; fixing it removes it and earns XP
- XP levels, stars per game, daily streaks, and a passport with stamps — all saved in your browser (no backend, works offline)

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Build

```bash
npm run build   # typechecks + bundles to dist/
```

## Tech

React 18 + TypeScript + Vite, Zustand for state (persisted to localStorage), Framer Motion for animations. All visuals are inline SVG, emoji, and CSS — no external assets, fully self-contained.

---

*Built with [Claude Code](https://claude.com/claude-code).*
