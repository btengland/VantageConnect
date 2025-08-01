import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomePage from './src/HomePage';
import GamePage from './src/GamePage';

const Stack = createNativeStackNavigator();

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Game" component={GamePage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
