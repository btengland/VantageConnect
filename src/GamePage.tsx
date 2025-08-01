import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import ExitModal from './components/ExitModal';
import { StatusBar, useColorScheme } from 'react-native';
import PlayerCard from './components/PlayerCard';

const GamePage = () => {
  const [isOpen, setOpen] = useState(false);
  const [challengeDice, setChallengeDice] = useState(0);
  const [viewedPlayer, setViewedPlayer] = useState(0);
  const [playerInfo, setPlayerInfo] = useState([
    {
      id: 0,
      name: 'John',
      character: 'Engineer',
      escapePod: 'Delta',
      location: '123',
      isTurn: true,
    },
    {
      id: 1,
      name: 'Richard',
      character: 'Engineer',
      escapePod: 'Delta',
      location: '123',
      isTurn: true,
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.main}>
        {/* Header */}
        <View style={styles.diceContainer}>
          <Text style={styles.mainText}>Available Challenge Dice:</Text>
          <View style={styles.diceControl}>
            <Pressable
              onPress={() => setChallengeDice(prev => Math.max(0, prev - 1))}
              style={styles.diceButton}
            >
              <Text style={styles.diceButtonText}>−</Text>
            </Pressable>

            <Text style={styles.diceValue}>{challengeDice}</Text>

            <Pressable
              onPress={() => setChallengeDice(prev => prev + 1)}
              style={styles.diceButton}
            >
              <Text style={styles.diceButtonText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Sidebar */}
          <View style={styles.sidebar}>
            {playerInfo.map(player => (
              <View style={styles.innerSidebar}>
                <Pressable
                  key={player.id}
                  onPress={() => setViewedPlayer(player.id)}
                  style={styles.bubble}
                >
                  <Text style={styles.bubbleText}>
                    {player.name?.trim()?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                </Pressable>
                {player.id === viewedPlayer && <View style={styles.triangle} />}
              </View>
            ))}

            <Pressable onPress={() => toggleModal(false)} style={styles.bubble}>
              <Text style={styles.bubbleText}>X</Text>
            </Pressable>
          </View>

          {/* Player Card */}
          <PlayerCard player={playerInfo[viewedPlayer]} />
        </View>
      </View>

      <ExitModal isOpen={isOpen} toggleModal={toggleModal} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightgray',
    paddingTop: 50,
    paddingLeft: 20,
  },
  main: {
    flex: 1,
  },
  diceContainer: {
    alignItems: 'center',
  },
  mainText: {
    fontSize: 24,
  },
  contentContainer: {
    flexDirection: 'row',
  },
  sidebar: {
    zIndex: 100,
    gap: 10,
  },
  innerSidebar: {
    flexDirection: 'row',
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
    fontWeight: 'bold',
  },
  diceControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
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
    fontWeight: 'bold',
  },
  diceValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  triangle: {
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderRightWidth: 15,
    marginRight: -2,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'white',
  },
});

export default GamePage;
