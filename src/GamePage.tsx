import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, StyleSheet, Pressable } from 'react-native';
import ExitModal from './components/ExitModal';
import { StatusBar, useColorScheme } from 'react-native';
import PlayerCard from './components/PlayerCard';
import { LinearGradient } from 'expo-linear-gradient';
import CustomText from './components/CustomText';
import { getCharacterColor } from './utils';

const GamePage = () => {
  // Define icons once here
  const skillTokenIcons = [
    require('./assets/Move.png'),
    require('./assets/Look.png'),
    require('./assets/Engage.png'),
    require('./assets/Help.png'),
    require('./assets/Take.png'),
    require('./assets/Overpower.png'),
  ];

  type SkillToken = { quantity: number };
  type Statuses = { heart: number; star: number; 'timer-sand-full': number };
  type Player = {
    id: string;
    name: string;
    character: string;
    escapePod: string;
    location: string;
    skillTokens: SkillToken[];
    turn: boolean;
    journalText: string;
    statuses: Statuses;
    impactDiceSlots: any[];
  };

  const [isOpen, setOpen] = useState(false);
  const [challengeDice, setChallengeDice] = useState(0);
  const [viewedPlayer, setViewedPlayer] = useState('');
  const [playerInfo, setPlayerInfo] = useState<Player[]>([]);

  const isDarkMode = useColorScheme() === 'dark';

  const navigation = useNavigation();

  const toggleModal = (navigate?: boolean) => {
    if (navigate) {
      (navigation as any).navigate('Home');
    }
    setOpen(!isOpen);
  };

  const handleUpdatePlayer = (updatedPlayer: any) => {
    setPlayerInfo(
      playerInfo.map(p => (p.id === updatedPlayer.id ? updatedPlayer : p)),
    );
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
          <CustomText style={styles.mainText} bold>
            Available Dice:
          </CustomText>
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
                    { backgroundColor: getCharacterColor(player.character) },
                    player.turn && {
                      borderWidth: 3,
                      borderColor: 'white',
                    },
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
                      { borderTopColor: getCharacterColor(player.character) },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Player Card */}
          <PlayerCard
            player={playerInfo.find(p => p.id === viewedPlayer)!}
            getCharacterColor={getCharacterColor}
            skillTokenIcons={skillTokenIcons}
            onUpdatePlayer={handleUpdatePlayer}
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
    position: 'relative',
    zIndex: 10,
  },
  bubbleText: {
    color: 'white',
  },
  diceContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderRadius: 16,
    padding: 16,
    alignSelf: 'center',
    alignItems: 'center',
  },
  diceControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
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
    top: 0,
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
