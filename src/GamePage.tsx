import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import ExitModal from './components/ExitModal';

const GamePage = () => {
  const [isOpen, setOpen] = useState(false);

  const navigation = useNavigation();

  const toggleModal = (navigate?: boolean) => {
    if (navigate) {
      (navigation as any).navigate('Home');
    }
    setOpen(!isOpen);
  };

  return (
    <View style={styles.container}>
      {/* Main Game Content */}
      <View style={styles.main}>
        <Text style={styles.mainText}>Game Content Here</Text>
      </View>

      {/* Floating Bubbles Nav */}
      <View style={styles.sidebar}>
        <Pressable onPress={() => toggleModal(false)} style={styles.bubble}>
          <Text style={styles.bubbleText}>X</Text>
        </Pressable>
      </View>

      <ExitModal isOpen={isOpen} toggleModal={toggleModal} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainText: {
    fontSize: 24,
  },
  sidebar: {
    position: 'absolute',
    left: 10,
    top: 60,
    zIndex: 100,
    gap: 10,
  },
  bubble: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  bubbleText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default GamePage;
