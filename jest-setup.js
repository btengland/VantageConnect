jest.mock('expo-font', () => ({
  loadAsync: () => {
    return Promise.resolve();
  },
}));
jest.mock('expo-linear-gradient', () => 'LinearGradient');
jest.mock('expo-modules-core', () => ({
    NativeModule: jest.fn(),
}));
jest.mock('./src/websocketApi', () => ({
  GameWebSocket: jest.fn().mockImplementation(() => {
    return {
      connect: jest.fn().mockResolvedValue(undefined),
      onMessage: jest.fn(),
      sendMessage: jest.fn(),
      once: jest.fn().mockResolvedValue({ playerId: 1, sessionCode: 1234 }),
    };
  }),
}));
