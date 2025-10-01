// Mock expo-font to resolve immediately, preventing `act` warnings
jest.mock('expo-font', () => ({
  loadAsync: jest.fn().mockResolvedValue(),
}));

jest.mock('expo-linear-gradient', () => 'LinearGradient');

jest.mock('expo-modules-core', () => ({
    NativeModule: jest.fn(),
}));

// Mock the WebSocket client to prevent open handles in tests and to mock the class structure
jest.mock('./src/websocketApi', () => {
  // 1. Mock the class methods
  const mockWebSocketInstance = {
    connect: jest.fn().mockResolvedValue(undefined),
    sendMessage: jest.fn(),
    once: jest.fn().mockResolvedValue({}), // Immediately resolve promises
    onMessage: jest.fn(),
    off: jest.fn(),
    close: jest.fn(),
    isConnected: jest.fn().mockReturnValue(false),
  };

  // 2. Mock the constructor
  const mockGameWebSocket = jest.fn().mockImplementation(() => {
    return mockWebSocketInstance;
  });

  // 3. Export the mocked class
  return {
    GameWebSocket: mockGameWebSocket,
  };
});