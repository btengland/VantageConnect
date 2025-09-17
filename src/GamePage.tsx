import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, StyleSheet, Pressable } from 'react-native';
import ExitModal from './components/ExitModal';
import { StatusBar, useColorScheme } from 'react-native';
import PlayerCard from './components/PlayerCard';
import { LinearGradient } from 'expo-linear-gradient';
import CustomText from './components/CustomText';
import { getCharacterColor } from './utils';
import { wsClient, updateChallengeDice } from './api';

const GamePage = () => {
  const route = useRoute();
  const { playerId, sessionCode } = route.params as {
    playerId: number;
    sessionCode: string;
  };

  useEffect(() => {
    console.log('Player ID:', playerId);
  }, [playerId, sessionCode]);

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
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

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

  useEffect(() => {
    const handler = (data: any) => {
      if (data.action === 'updatePlayers') {
        setPlayerInfo(data.players);
        // Also update challenge dice if included in the payload
        if (typeof data.challengeDice === 'number') {
          setChallengeDice(data.challengeDice);
        }
      } else if (data.action === 'updateChallengeDice') {
        setChallengeDice(data.challengeDice);
      }
    };

    wsClient.messageHandlers.push(handler);

    // On mount, set the initially viewed player to the current player
    if (playerInfo.length > 0 && !viewedPlayer) {
      const self = playerInfo.find(p => p.id === playerId.toString());
      if (self) {
        setViewedPlayer(self.id);
      }
    }

    return () => {
      wsClient.off(handler);
    };
  }, [playerInfo, playerId]);

  useEffect(() => {
    const playerToView = playerInfo.find(p => p.id === viewedPlayer);
    setCurrentPlayer(playerToView || null);
  }, [viewedPlayer, playerInfo]);

  const handleDiceChange = (increment: boolean) => {
    const newValue = challengeDice + (increment ? 1 : -1);
    if (newValue >= 0) {
      updateChallengeDice(Number(sessionCode), newValue);
    }
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

        <View style={styles.sessionCode}>
          <CustomText style={styles.mainText} small>
            Session Code: {sessionCode}
          </CustomText>
        </View>

        {/* Header */}
        <View style={styles.diceContainer}>
          <CustomText style={styles.mainText} bold>
            Available Dice:
          </CustomText>
          <View style={styles.diceControl}>
            <Pressable
              onPress={() => handleDiceChange(false)}
              style={styles.diceButton}
            >
              <CustomText style={styles.diceButtonText}>-</CustomText>
            </Pressable>

            <CustomText style={styles.diceValue}>{challengeDice}</CustomText>

            <Pressable
              onPress={() => handleDiceChange(true)}
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

          {currentPlayer && (
            <PlayerCard
              player={currentPlayer}
              getCharacterColor={getCharacterColor}
              skillTokenIcons={skillTokenIcons}
              onUpdatePlayer={handleUpdatePlayer}
            />
          )}
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
  sessionCode: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default GamePage;
