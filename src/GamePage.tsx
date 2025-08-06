import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, StyleSheet, Pressable } from 'react-native';
import ExitModal from './components/ExitModal';
import { StatusBar, useColorScheme } from 'react-native';
import PlayerCard from './components/PlayerCard';
import { LinearGradient } from 'expo-linear-gradient';

import CustomText from './components/CustomText'; // <-- import your CustomText here

const GamePage = () => {
  const Move = require('./assets/Move.png');
  const Look = require('./assets/Look.png');
  const Engage = require('./assets/Engage.png');
  const Help = require('./assets/Help.png');
  const Take = require('./assets/Take.png');
  const Overpower = require('./assets/Overpower.png');

  const [isOpen, setOpen] = useState(false);
  const [challengeDice, setChallengeDice] = useState(0);
  const [viewedPlayer, setViewedPlayer] = useState(0);
  const [playerTurn, setPlayerTurn] = useState(0);
  const [playerInfo, setPlayerInfo] = useState([
    {
      id: 0,
      name: 'John',
      character: 'Jules',
      escapePod: 'Delta',
      location: '123',
      skillTokens: [
        { icon: Move, quantity: 0 },
        { icon: Look, quantity: 0 },
        { icon: Engage, quantity: 0 },
        { icon: Help, quantity: 0 },
        { icon: Take, quantity: 0 },
        { icon: Overpower, quantity: 0 },
      ],
    },
    {
      id: 1,
      name: 'Richard',
      character: 'Tina',
      escapePod: 'Delta',
      location: '123',
    },
    {
      id: 2,
      name: 'Richard',
      character: 'Ariel',
      escapePod: 'Delta',
      location: '123',
    },
    {
      id: 3,
      name: 'Richard',
      character: 'Emilien',
      escapePod: 'Delta',
      location: '123',
    },
    {
      id: 4,
      name: 'Richard',
      character: 'Ira',
      escapePod: 'Delta',
      location: '123',
    },
    {
      id: 5,
      name: 'Richard',
      character: 'Soren',
      escapePod: 'Delta',
      location: '123',
    },
  ]);

  const isDarkMode = useColorScheme() === 'dark';

  const navigation = useNavigation();

  const toggleModal = (navigate?: boolean) => {
    if (navigate) {
      (navigation as any).navigate('Home');
    }
    setOpen(!isOpen);
  };

  const updatePlayerField = (id: number, field: string, value: string) => {
    setPlayerInfo(prev =>
      prev.map(player =>
        player.id === id ? { ...player, [field]: value } : player,
      ),
    );
  };

  const bubbleColors: { [key: string]: string } = {
    jules: '#23b0de',
    captain: '#23b0de',
    tina: '#dc2a27',
    marine: '#dc2a27',
    ariel: '#fdd627',
    engineer: '#fdd627',
    emilien: '#f48c26',
    scholar: '#f48c26',
    ira: '#19a557',
    medic: '#19a557',
    soren: '#794c9f',
    navigator: '#794c9f',
  };

  const characterColor: { [key: string]: string } = {
    jules: '#74cbea',
    captain: '#74cbea',
    tina: '#ef6c6a',
    marine: '#ef6c6a',
    ariel: '#fee866',
    engineer: '#fee866',
    emilien: '#fbb26e',
    scholar: '#fbb26e',
    ira: '#5ecf90',
    medic: '#5ecf90',
    soren: '#a181c0',
    navigator: '#a181c0',
  };

  const getBubbleColor = (characterText: string): string => {
    const lowerText = characterText.toLowerCase();
    for (const key in bubbleColors) {
      if (lowerText.includes(key)) {
        return bubbleColors[key];
      }
    }
    return 'darkgray';
  };

  const getCharacterColor = (characterText: string): string => {
    const lowerText = characterText.toLowerCase();
    for (const key in characterColor) {
      if (lowerText.includes(key)) {
        return characterColor[key];
      }
    }
    return 'darkgray';
  };

  return (
    <LinearGradient colors={['#b7c9d0', '#025472']} style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.main}>
        {/* Close button top-right */}
        <Pressable
          onPress={() => toggleModal(false)}
          style={styles.closeButton}
        >
          <CustomText style={styles.closeButtonText}>X</CustomText>
        </Pressable>

        {/* Header */}
        <View style={styles.diceContainer}>
          <CustomText style={styles.mainText}>Available Dice:</CustomText>
          <View style={styles.diceControl}>
            <Pressable
              onPress={() => setChallengeDice(prev => Math.max(0, prev - 1))}
              style={styles.diceButton}
            >
              <CustomText style={styles.diceButtonText}>-</CustomText>
            </Pressable>

            <CustomText style={styles.diceValue}>{challengeDice}</CustomText>

            <Pressable
              onPress={() => setChallengeDice(prev => prev + 1)}
              style={styles.diceButton}
            >
              <CustomText style={styles.diceButtonText}>+</CustomText>
            </Pressable>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Bubbles on top */}
          <View style={styles.sidebar}>
            {playerInfo.map(player => (
              <View key={player.id} style={styles.innerSidebar}>
                <Pressable
                  onPress={() => setViewedPlayer(player.id)}
                  style={[
                    styles.bubble,
                    { backgroundColor: getBubbleColor(player.character) },
                  ]}
                >
                  <CustomText style={styles.bubbleText} bold>
                    {player.name?.trim()?.charAt(0)?.toUpperCase() || '?'}
                  </CustomText>
                </Pressable>
                {player.id === viewedPlayer && (
                  <View
                    style={[
                      styles.triangle,
                      { borderTopColor: getBubbleColor(player.character) },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Player Card */}
          <PlayerCard
            player={playerInfo[viewedPlayer]}
            playerTurn={playerTurn}
            setPlayerTurn={setPlayerTurn}
            totalPlayers={playerInfo.length}
            currentTurnPlayerName={playerInfo[playerTurn]?.name || 'Unknown'}
            updatePlayerField={updatePlayerField}
            getCharacterColor={getCharacterColor}
          />
        </View>
      </View>

      <ExitModal isOpen={isOpen} toggleModal={toggleModal} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a0c8f0',
    paddingTop: 50,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 16,
  },
  main: {
    flex: 1,
  },
  mainText: {
    fontSize: 24,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  sidebar: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    zIndex: 100,
    marginTop: 16,
  },
  innerSidebar: {
    alignItems: 'center',
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
  },
  diceContainer: {
    backgroundColor: '#cce4ff',
    borderRadius: 16,
    padding: 16,
    alignSelf: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 8,
  },

  diceControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  diceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceButtonText: {
    color: 'white',
    fontSize: 24,
  },
  diceValue: {
    fontSize: 24,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 15,
    marginTop: -2,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    lineHeight: 20,
  },
});

export default GamePage;
