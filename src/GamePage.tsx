import React, { useState, useEffect, useRef } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ExitModal from './components/ExitModal';
import { StatusBar, useColorScheme } from 'react-native';
import PlayerCard from './components/PlayerCard';
import { LinearGradient } from 'expo-linear-gradient';
import CustomText from './components/CustomText';
import { getCharacterColor } from './utils';
import { webSocketManager } from './api/websocket';
import { Player, GameState } from './types';
import { RootStackParamList } from '../App';

const GamePage = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'Game'>>();
  const { sessionId } = route.params;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [me, setMe] = useState<Player | null>(null);
  const [viewedPlayerId, setViewedPlayerId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [exitModalOpen, setExitModalOpen] = useState(false);

  const tempIdRef = useRef(`temp-${Math.random()}`);
  const isDarkMode = useColorScheme() === 'dark';

  const skillTokenIcons = [
    require('./assets/Move.png'),
    require('./assets/Look.png'),
    require('./assets/Engage.png'),
    require('./assets/Help.png'),
    require('./assets/Take.png'),
    require('./assets/Overpower.png'),
  ];

  useEffect(() => {
    const handleMessage = (data: any) => {
      if (data.action === 'gameStateUpdate' && data.gameState) {
        const receivedGameState: GameState = data.gameState;
        setGameState(receivedGameState);
        setIsConnecting(false);

        if (tempIdRef.current) {
          const foundMe = receivedGameState.players.find(
            p => p.tempId === tempIdRef.current,
          );
          if (foundMe) {
            setMe(foundMe);
            setViewedPlayerId(foundMe.id);
            tempIdRef.current = null; // We've found ourselves
          }
        } else if (me) {
          const updatedMe = receivedGameState.players.find(p => p.id === me.id);
          if (updatedMe) setMe(updatedMe);
        }

        if (!viewedPlayerId && receivedGameState.players.length > 0) {
          setViewedPlayerId(receivedGameState.players[0].id);
        }
      } else if (data.error) {
        Alert.alert('Error', data.error);
        setIsConnecting(false);
      }
    };

    webSocketManager.onMessage(handleMessage);

    const connectAndJoin = async () => {
      try {
        await webSocketManager.connect(sessionId);
        const initialPlayerData = {
          name: `Player #${Math.floor(Math.random() * 900 + 100)}`,
          character: 'Observer',
          escapePod: 'A',
          location: 'Bridge',
          skillTokens: Array(6).fill({ quantity: 0 }),
          turn: false,
          journalText: '',
          statuses: { heart: 3, star: 3, 'timer-sand-full': 3 },
          impactDiceSlots: Array(5).fill({ symbol: 'any', checked: false }),
          tempId: tempIdRef.current,
        };
        webSocketManager.sendMessage({
          action: 'joinSession',
          payload: { sessionId, playerData: initialPlayerData },
        });
      } catch (error) {
        console.error('Connection failed:', error);
        Alert.alert('Connection Failed', 'Could not connect to the game server.');
        setIsConnecting(false);
        navigation.goBack();
      }
    };

    connectAndJoin();

    return () => {
      webSocketManager.disconnect();
    };
  }, [sessionId, navigation]);

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    webSocketManager.sendMessage({
      action: 'updatePlayer',
      payload: { sessionId, playerId: updatedPlayer.id, playerData: updatedPlayer },
    });
  };

  const handleUpdateDice = (newVal: number) => {
    const challengeDice = Math.max(0, newVal);
     webSocketManager.sendMessage({
      action: 'updateDice',
      payload: { sessionId, challengeDice },
    });
  }

  const handleNextTurn = () => {
    webSocketManager.sendMessage({ action: 'nextTurn', payload: { sessionId } });
  }

  const toggleExitModal = (navigate?: boolean) => {
    if (navigate) {
      navigation.navigate('Home');
    }
    setExitModalOpen(!exitModalOpen);
  };

  const viewedPlayer = gameState?.players.find(p => p.id === viewedPlayerId);

  if (isConnecting) {
    return (
      <LinearGradient colors={['#b7c9d0', '#025472']} style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <CustomText>Connecting to session...</CustomText>
      </LinearGradient>
    );
  }

  if (!gameState || !viewedPlayer) {
    return (
      <LinearGradient colors={['#b7c9d0', '#025472']} style={styles.container}>
        <CustomText>Waiting for game state...</CustomText>
        <Pressable onPress={() => navigation.goBack()}>
            <CustomText>Go Back</CustomText>
        </Pressable>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#b7c9d0', '#025472']} style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.main}>
        <Pressable onPress={() => toggleExitModal(false)} style={styles.closeButton}>
          <CustomText style={styles.closeButtonText}>X</CustomText>
        </Pressable>

        <View style={styles.headerControls}>
            <View style={styles.diceContainer}>
            <CustomText style={styles.mainText} bold>
                Dice: {gameState.challengeDice}
            </CustomText>
            <View style={styles.diceControl}>
                <Pressable onPress={() => handleUpdateDice(gameState.challengeDice - 1)} style={styles.diceButton}>
                <CustomText style={styles.diceButtonText}>-</CustomText>
                </Pressable>
                <CustomText style={styles.diceValue}>{gameState.challengeDice}</CustomText>
                <Pressable onPress={() => handleUpdateDice(gameState.challengeDice + 1)} style={styles.diceButton}>
                <CustomText style={styles.diceButtonText}>+</CustomText>
                </Pressable>
            </View>
            </View>
            <Pressable onPress={handleNextTurn} style={styles.nextTurnButton}>
                <CustomText style={styles.nextTurnButtonText} bold>Next Turn</CustomText>
            </Pressable>
        </View>


        <View style={styles.contentContainer}>
          <View style={styles.sidebar}>
            {gameState.players.map(player => (
              <View key={player.id} style={styles.innerSidebar}>
                <Pressable
                  onPress={() => setViewedPlayerId(player.id)}
                  style={[
                    styles.bubble,
                    { backgroundColor: getCharacterColor(player.character) },
                    player.turn && { borderWidth: 3, borderColor: 'white' },
                  ]}
                >
                  <CustomText style={styles.bubbleText} bold>
                    {player.name?.trim()?.charAt(0)?.toUpperCase() || '?'}
                  </CustomText>
                </Pressable>
                {player.id === viewedPlayerId && (
                  <View style={[ styles.triangle, { borderTopColor: getCharacterColor(player.character) }]}/>
                )}
              </View>
            ))}
          </View>

          <PlayerCard
            player={viewedPlayer}
            isSelf={me?.id === viewedPlayer.id}
            getCharacterColor={getCharacterColor}
            skillTokenIcons={skillTokenIcons}
            onUpdatePlayer={handleUpdatePlayer}
            onNextTurn={handleNextTurn}
          />
        </View>
      </View>
      <ExitModal isOpen={exitModalOpen} toggleModal={toggleExitModal} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 16,
  },
  main: {
    flex: 1,
    width: '100%',
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  nextTurnButton: {
      backgroundColor: '#A6D9F7',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
  },
  nextTurnButtonText: {
      color: 'black',
      fontSize: 16,
  },
  mainText: {
    fontSize: 20,
    color: 'white',
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
    marginBottom: 8,
  },
  innerSidebar: {
    alignItems: 'center',
  },
  bubble: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleText: {
    color: 'white',
  },
  diceContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  diceControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    marginTop: 8,
  },
  diceButton: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diceButtonText: {
    color: 'white',
    fontSize: 22,
  },
  diceValue: {
    fontSize: 22,
    color: 'white',
    minWidth: 30,
    textAlign: 'center',
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 15,
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
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
  },
});

export default GamePage;
