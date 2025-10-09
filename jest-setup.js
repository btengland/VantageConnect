jest.mock('expo-font', () => ({
  loadAsync: () => {
    return Promise.resolve();
  },
}));

jest.mock('expo-linear-gradient', () => 'LinearGradient');

jest.mock('expo-modules-core', () => ({
  NativeModule: jest.fn(),
}));

jest.mock('./src/api', () => ({
  connectWebSocket: jest.fn(() => Promise.resolve()),
  hostGame: jest.fn(() => Promise.resolve({ playerId: 1, sessionCode: 1234 })),
  joinGame: jest.fn(() => Promise.resolve({ playerId: 2, sessionCode: 1234 })),
  readPlayers: jest.fn(),
  onPlayersUpdate: jest.fn(),
  readChallengeDice: jest.fn(),
  updatePlayer: jest.fn(),
  endTurn: jest.fn(() => Promise.resolve()),
  updateChallengeDice: jest.fn(),
  onChallengeDiceUpdate: jest.fn(),
  leaveGame: jest.fn(() => Promise.resolve()),
  wsClient: {
    close: jest.fn(),
  },
}));