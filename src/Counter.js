import React, { useState } from 'react';
import './Counter.css';

function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  const increment = () => {
    setCount(count + step);
  };

  const decrement = () => {
    setCount(count - step);
  };

  const reset = () => {
    setCount(0);
  };

  const handleStepChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setStep(value);
    }
  };

  return (
    <div className="counter">
      <h2>Counter Component</h2>
      <div className="counter-display">{count}</div>
      <div className="counter-buttons">
        <button onClick={decrement} className="btn btn-decrement">
          -
        </button>
        <button onClick={reset} className="btn btn-reset">
          Reset
        </button>
        <button onClick={increment} className="btn btn-increment">
          +
        </button>
      </div>
      <div className="step-control">
        <label htmlFor="step-input">Step: </label>
        <input
          id="step-input"
          type="number"
          value={step}
          onChange={handleStepChange}
          min="1"
          className="step-input"
        />
      </div>
    </div>
  );
}

export default Counter;
