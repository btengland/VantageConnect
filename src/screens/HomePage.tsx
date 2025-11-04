import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Linking,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import JoinHostModal from '../components/JoinHostModal';
import { StatusBar, useColorScheme } from 'react-native';
import CustomText from '../components/CustomText';
import { hostGame, connectWebSocket } from '../api';

type GameData = {
  playerId: number;
  sessionCode: number;
};

const HomePage = () => {
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonPressed, setButtonPressed] = useState('');

  const navigation = useNavigation();

  const isDarkMode = useColorScheme() === 'light';

  const toggleModal = (type: string, data?: GameData) => {
    setButtonPressed(type);
    setOpen(type !== '');

    if (data) {
      (navigation as any).navigate('Game', {
        playerId: data.playerId,
        sessionCode: data.sessionCode,
      });
      setOpen(false);
    }
  };

  const handleHostGame = async () => {
    setLoading(true);
    try {
      await connectWebSocket();
      const data = await hostGame();

      if ((data as any).action === 'error') {
        Alert.alert('Error', 'Failed to host game. Please try again.');
        return;
      }

      const gameData: GameData = {
        playerId: data.playerId,
        sessionCode: data.sessionCode,
      };

      (navigation as any).navigate('Game', {
        playerId: gameData.playerId,
        sessionCode: gameData.sessionCode,
      });
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const spaceImage = require('../assets/SpaceImage.jpg');
  const discordLogo = require('../assets/DiscordLogo.png');

  const openDiscord = () => {
    Linking.openURL('https://stonemaiergames.com/discord/');
  };

  return (
    <ImageBackground
      source={spaceImage}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />

      <TouchableOpacity style={styles.discordButton} onPress={openDiscord}>
        <Image source={discordLogo} style={styles.discordLogo} />
      </TouchableOpacity>

      <View style={styles.container}>
        <CustomText style={styles.title} bold>
          Vantage Connect
        </CustomText>

        <TouchableOpacity
          onPress={handleHostGame}
          style={styles.button}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <CustomText style={styles.buttonText} bold>
              Host a Game
            </CustomText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => toggleModal('join')}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <CustomText style={styles.buttonText} bold>
              Join a Game
            </CustomText>
          )}
        </TouchableOpacity>
      </View>

      <JoinHostModal isOpen={isOpen} toggleModal={toggleModal} />
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
    top: 55,
    right: 40,
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
