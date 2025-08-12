import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Linking,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import JoinHostModal from './components/JoinHostModal';
import { StatusBar, useColorScheme } from 'react-native';
import CustomText from './components/CustomText';

const HomePage = () => {
  const [isOpen, setOpen] = useState(false);
  const [buttonPressed, setButtonPressed] = useState('');

  const navigation = useNavigation();

  const isDarkMode = useColorScheme() === 'light';

  const toggleModal = (type: string, navigate?: boolean) => {
    setButtonPressed(type);
    setOpen(type !== '');

    if (navigate) {
      (navigation as any).navigate('Game');
      setOpen(false);
    }
  };

  const spaceImage = require('./assets/SpaceImage.jpg');
  const discordLogo = require('./assets/DiscordLogo.png');

  const openDiscord = () => {
    Linking.openURL('https://stonemaiergames.com/discord/');
  };

  return (
    <ImageBackground
      source={spaceImage}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <TouchableOpacity style={styles.discordButton} onPress={openDiscord}>
        <Image source={discordLogo} style={styles.discordLogo} />
      </TouchableOpacity>

      <View style={styles.container}>
        <CustomText style={styles.title} bold>
          Vantage Connect
        </CustomText>

        <TouchableOpacity
          onPress={() => toggleModal('host')}
          style={styles.button}
        >
          <CustomText style={styles.buttonText} bold>
            Host a Game
          </CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => toggleModal('join')}
          style={styles.button}
        >
          <CustomText style={styles.buttonText} bold>
            Join a Game
          </CustomText>
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
  discordButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  discordLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 40,
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
  },
});

export default HomePage;
