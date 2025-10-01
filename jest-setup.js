jest.mock('./src/websocketApi', () => ({
  GameWebSocket: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    close: jest.fn(),
    onMessage: jest.fn(),
    sendMessage: jest.fn(),
    once: jest.fn().mockResolvedValue({}),
    off: jest.fn(),
    isConnected: jest.fn().mockReturnValue(true),
  })),
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('expo-linear-gradient', () => 'LinearGradient');
jest.mock('expo-modules-core', () => ({
  NativeModule: jest.fn(),
}));
