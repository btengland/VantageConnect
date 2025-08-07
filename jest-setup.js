jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
}));
jest.mock('expo-linear-gradient', () => 'LinearGradient');
jest.mock('expo-modules-core', () => ({
    NativeModule: jest.fn(),
}));
