# React Sandbox

A simple React application for testing AI code reviewer functionality.

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run the App

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm build
```

## What's Included

- **App Component**: Main application component with header and layout
- **Counter Component**: Interactive counter with increment, decrement, reset, and undo
- **useCounter Hook**: Reusable counter state logic with step sizes and range clamping
- **Basic Styling**: Simple CSS for a clean, dark-themed UI

### Counter Features

- Selectable step size (1, 5, or 10)
- Values clamped to the range -100 to 100, with the +/- buttons disabled at the bounds
- Undo, which walks back through the history of previous values
- Reset, which clears the count, step size, and history

## Purpose

This app is designed to be a simple codebase for testing code review tools. Feel free to:
- Modify component logic
- Change styling
- Add new components
- Refactor code structure
- Introduce bugs to test detection
