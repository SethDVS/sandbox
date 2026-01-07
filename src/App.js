import React from 'react';
import Counter from './Counter';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to React Sandbox</h1>
        <p>A simple app for testing code changes</p>
      </header>

      <main className="App-main">
        <Counter />

        <section className="info-section">
          <h2>About This App</h2>
          <p>This is a minimal React application created for testing purposes.</p>
          <p>Feel free to modify components and test the AI code reviewer!</p>
        </section>
      </main>
    </div>
  );
}

export default App;
