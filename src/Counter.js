import React, { useState } from 'react';
import './Counter.css';

function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    setCount(count - 1);
  };

  const reset = () => {
    setCount(0);
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
    </div>
  );
}

export default Counter;
