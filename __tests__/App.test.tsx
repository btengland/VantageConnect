/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

// This test is designed to handle the asynchronous nature of the App component,
// which loads fonts in a `useEffect` hook.
test('renders correctly after async operations', async () => {
  let renderer;

  // We use an async `act` to ensure all promises and state updates are
  // processed before the test assertion.
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
    // Awaiting a promise that resolves in the next event loop cycle
    // ensures that the `useEffect` in `App.tsx` has time to run and
    // update the state.
    await new Promise(resolve => setImmediate(resolve));
  });

  // Basic assertion to ensure the component rendered something.
  expect(renderer.toJSON()).not.toBeNull();
});