import React from 'react';
import useCounter, { MAX_COUNT, MIN_COUNT } from './useCounter';
import './Counter.css';

const STEP_OPTIONS = [1, 5, 10];

function Counter() {
  const {
    count,
    step,
    setStep,
    history,
    increment,
    decrement,
    reset,
    undo,
    canUndo,
    atMin,
    atMax,
  } = useCounter(0);

  return (
    <div className="counter">
      <h2>Counter Component</h2>
      <div className="counter-display" aria-live="polite">
        {count}
      </div>

      <div className="counter-range">
        Range: {MIN_COUNT} to {MAX_COUNT}
      </div>

      <div className="counter-steps">
        <span className="counter-steps-label">Step size</span>
        {STEP_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStep(option)}
            className={`btn btn-step${step === option ? ' btn-step-active' : ''}`}
            aria-pressed={step === option}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="counter-buttons">
        <button
          type="button"
          onClick={decrement}
          disabled={atMin}
          className="btn btn-decrement"
          aria-label={`Decrease by ${step}`}
        >
          -
        </button>
        <button type="button" onClick={reset} className="btn btn-reset">
          Reset
        </button>
        <button
          type="button"
          onClick={increment}
          disabled={atMax}
          className="btn btn-increment"
          aria-label={`Increase by ${step}`}
        >
          +
        </button>
      </div>

      <div className="counter-footer">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="btn btn-undo"
        >
          Undo
        </button>
        <span className="counter-history">
          {history.length === 0
            ? 'No changes yet'
            : `${history.length} change${history.length === 1 ? '' : 's'}`}
        </span>
      </div>
    </div>
  );
}

export default Counter;
