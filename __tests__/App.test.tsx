/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  let tree;
  // This needs to be wrapped in act because of the state update on font loading
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<App />);
    // Wait for the next tick of the event loop to allow promises to resolve
    await new Promise(res => setTimeout(res, 0));
  });

  expect(tree.toJSON()).toBeTruthy();
});
