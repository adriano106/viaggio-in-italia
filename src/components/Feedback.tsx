import { motion } from 'framer-motion';

export type FeedbackState =
  | { kind: 'good'; message: string; note?: string }
  | { kind: 'bad'; message: string; note?: string }
  | null;

export function Feedback({ state }: { state: FeedbackState }) {
  if (!state) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`feedback ${state.kind}`}
    >
      {state.kind === 'good' ? '✓ ' : '✗ '}
      {state.message}
      {state.note && <span className="why">💡 {state.note}</span>}
    </motion.div>
  );
}
