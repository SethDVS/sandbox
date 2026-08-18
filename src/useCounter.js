import { useCallback, useState } from 'react';

export const DEFAULT_STEP = 1;
export const MIN_COUNT = -100;
export const MAX_COUNT = 100;

const clamp = (value) => Math.min(MAX_COUNT, Math.max(MIN_COUNT, value));

function useCounter(initialCount = 0) {
  const [count, setCount] = useState(() => clamp(initialCount));
  const [step, setStep] = useState(DEFAULT_STEP);
  const [history, setHistory] = useState([]);

  const applyDelta = useCallback((delta) => {
    setCount((current) => {
      const next = clamp(current + delta);

      if (next !== current) {
        setHistory((entries) => [...entries, current]);
      }

      return next;
    });
  }, []);

  const increment = useCallback(() => applyDelta(step), [applyDelta, step]);
  const decrement = useCallback(() => applyDelta(-step), [applyDelta, step]);

  const reset = useCallback(() => {
    setCount(0);
    setStep(DEFAULT_STEP);
    setHistory([]);
  }, []);

  const undo = useCallback(() => {
    setHistory((entries) => {
      if (entries.length === 0) {
        return entries;
      }

      setCount(entries[entries.length - 1]);
      return entries.slice(0, -1);
    });
  }, []);

  return {
    count,
    step,
    setStep,
    history,
    increment,
    decrement,
    reset,
    undo,
    canUndo: history.length > 0,
    atMin: count === MIN_COUNT,
    atMax: count === MAX_COUNT,
  };
}

export default useCounter;
