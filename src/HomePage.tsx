import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import JoinHostModal from './components/JoinHostModal';

const HomePage = () => {
  const [isOpen, setOpen] = useState(false);
  const [buttonPressed, setButtonPressed] = useState('');

  const navigation = useNavigation();

  const toggleModal = (type: string, navigate?: boolean) => {
    setButtonPressed(type);
    setOpen(type !== '');

    if (navigate) {
      (navigation as any).navigate('Game');
      setOpen(false);
    }
  };

  const spaceImage = require('./assets/spaceImage.jpg');

  return (
    <ImageBackground
      source={spaceImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View>
        <Text style={styles.title}>Vantage Connect</Text>

        <TouchableOpacity
          onPress={() => toggleModal('host')}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Host a Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => toggleModal('join')}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Join a Game</Text>
        </TouchableOpacity>
      </View>

      <JoinHostModal
        isOpen={isOpen}
        toggleModal={toggleModal}
        buttonPressed={buttonPressed}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#A6D9F7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 10,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HomePage;
