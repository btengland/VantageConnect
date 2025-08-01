import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

type AppButtonProps = {
  title: string;
  onPress: () => void;
};

const AppButton = ({ title, onPress }: AppButtonProps) => (
  <Pressable style={styles.button} onPress={onPress}>
    <Text style={styles.text}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    elevation: 2,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AppButton;
