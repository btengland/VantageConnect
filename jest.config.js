module.exports = {
  preset: 'jest-expo',
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest-setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|expo-font|expo-linear-gradient|expo-modules-core|react-native-gesture-handler|react-native-reanimated|@react-native-picker/picker)/)',
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
};
