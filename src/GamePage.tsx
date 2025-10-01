import { useState, useEffect, useRef } from 'react';
import { debounce, isEqual } from 'lodash';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import ExitModal from './components/ExitModal';
import { StatusBar, useColorScheme } from 'react-native';
import PlayerCard from './components/PlayerCard';
import { LinearGradient } from 'expo-linear-gradient';
import CustomText from './components/CustomText';
import { getCharacterColor } from './utils';
import {
  connectWebSocket,
  readPlayers,
  onPlayersUpdate,
  updateChallengeDice,
  onChallengeDiceUpdate,
  readChallengeDice,
  updatePlayer,
} from './api';

const GamePage = () => {
  const route = useRoute();
  const { playerId, sessionCode } = route.params as {
    playerId: number;
    sessionCode: number;
  };

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
    id: number;
    sessionCode: number;
    playerNumber: number;
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

  type BackendPlayer = {
    playerId: number;
    sessionCode: number;
    playerNumber?: number;
    name?: string;
    character?: string;
    escapePod?: string;
    location?: string;
    skillTokens?: SkillToken[];
    turn?: boolean;
    journalText?: string;
    statuses?: Statuses;
    impactDiceSlots?: any[];
  };

  const [isOpen, setOpen] = useState(false);
  const [challengeDice, setChallengeDice] = useState(0);
  const [viewedPlayer, setViewedPlayer] = useState<Player | null>(null);
  const [playerInfo, setPlayerInfo] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const challengeDiceInitialized = useRef(false);

  const isDarkMode = useColorScheme() === 'dark';

  const navigation = useNavigation();

  const toggleModal = (navigate?: boolean) => {
    if (navigate) {
      (navigation as any).navigate('Home');
    }
    setOpen(!isOpen);
  };

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    setPlayerInfo(prev =>
      prev.map(p => (p.id === updatedPlayer.id ? updatedPlayer : p)),
    );
    debouncedUpdatePlayer(updatedPlayer);
  };

  const rotatePlayers = (players: Player[], currentPlayerId: number) => {
    const index = players.findIndex(p => p.id === currentPlayerId);
    if (index === -1) return players;

    return [...players.slice(index), ...players.slice(0, index)];
  };

  const myPlayer = playerInfo.find(p => p.id === playerId);
  const isMyTurn = myPlayer?.turn ?? false;

  const isMyTurnRef = useRef(false);
  useEffect(() => {
    isMyTurnRef.current = isMyTurn;
  }, [isMyTurn]);

  useEffect(() => {
    const initWebSocket = async () => {
      try {
        // 1️⃣ Connect WS
        await connectWebSocket();
        console.log('WebSocket connected');

        // 2️⃣ Set up listeners
        onChallengeDiceUpdate(newDice => {
          if (isMyTurnRef.current) return; // ignore updates if it's my turn
          setChallengeDice(newDice);
        });

        onPlayersUpdate(
          (gameData: { players: BackendPlayer[]; challengeDice: number }) => {
            const getSanitizedArray = (data: any, defaultData: any[]) => {
              if (Array.isArray(data)) return data;
              if (typeof data === 'object' && data !== null)
                return Object.values(data);
              return defaultData;
            };

            const playersFromBackend = gameData.players;

            // Only set initial challengeDice once
            if (!challengeDiceInitialized.current) {
              setChallengeDice(gameData.challengeDice);
              challengeDiceInitialized.current = true;
            }

            const transformedBackendPlayers = playersFromBackend.map(
              (p: any) => ({
                id: p.playerId,
                sessionCode: p.sessionCode,
                playerNumber: Number(p.playerNumber) || 0,
                name: p.name || '',
                character: p.character || '',
                escapePod: p.escapePod || '',
                location: p.location || '',
                skillTokens: getSanitizedArray(p.skillTokens, [
                  { quantity: 0 },
                  { quantity: 0 },
                  { quantity: 0 },
                  { quantity: 0 },
                  { quantity: 0 },
                  { quantity: 0 },
                ]),
                turn: p.turn || false,
                journalText: p.journalText || '',
                statuses: p.statuses || {
                  heart: 0,
                  star: 0,
                  'timer-sand-full': 0,
                },
                impactDiceSlots: getSanitizedArray(p.impactDiceSlots, []),
              }),
            );

            setPlayerInfo(prevPlayerInfo => {
              if (prevPlayerInfo.length === 0) {
                setLoading(false);
                return rotatePlayers(transformedBackendPlayers, playerId);
              }

              // Create a map of the new players for easy lookup
              const backendPlayersMap = new Map(
                transformedBackendPlayers.map((p: any) => [p.id, p]),
              );

              // Merge the two lists
              const mergedPlayers = prevPlayerInfo.map(localPlayer => {
                const backendPlayer = backendPlayersMap.get(localPlayer.id);
                if (backendPlayer) {
                  // If it's the current user's player, merge carefully
                  if (localPlayer.id === playerId) {
                    return {
                      ...localPlayer, // Keep local changes
                      turn: backendPlayer.turn, // But always update turn status
                    };
                  }
                  // For other players, just use the backend data
                  return backendPlayer;
                }
                return localPlayer;
              });

              // Add any new players from the backend
              transformedBackendPlayers.forEach((backendPlayer: any) => {
                if (!prevPlayerInfo.some(p => p.id === backendPlayer.id)) {
                  mergedPlayers.push(backendPlayer);
                }
              });

              return rotatePlayers(mergedPlayers, playerId);
            });
          },
        );

        // 3️⃣ Initial data fetch
        readPlayers(sessionCode);
        readChallengeDice(sessionCode);
      } catch (err) {
        console.error('WebSocket connection failed:', err);
        setLoading(false);
      }
    };

    initWebSocket();
  }, [playerId, sessionCode]);

  useEffect(() => {
    // Keep viewedPlayer in sync with playerInfo, and set initial viewed player
    if (playerInfo.length > 0) {
      if (viewedPlayer) {
        const updatedViewedPlayer = playerInfo.find(
          p => p.id === viewedPlayer.id,
        );
        if (
          updatedViewedPlayer &&
          !isEqual(updatedViewedPlayer, viewedPlayer)
        ) {
          setViewedPlayer(updatedViewedPlayer);
        }
      } else {
        setViewedPlayer(playerInfo[0]);
      }
    }
  }, [playerInfo]);

  // Debounced dice update so rapid clicks don't crash the app
  const debouncedUpdateDice = useRef(
    debounce((val: number) => {
      updateChallengeDice(sessionCode, val);
    }, 300), // 300ms delay
  ).current;

  // Debounced player update
  const debouncedUpdatePlayer = useRef(
    debounce((player: Player) => {
      updatePlayer(player);
    }, 500), // 500ms delay
  ).current;

  const handleDiceChange = (delta: number) => {
    setChallengeDice(prev => {
      const newVal = Math.max(0, prev + delta);

      // Use debounced update to prevent crashing
      debouncedUpdateDice(newVal);

      return newVal;
    });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#025472" />
        <CustomText>Loading game...</CustomText>
      </View>
    );
  }

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
            {isMyTurn && (
              <Pressable
                onPress={() => handleDiceChange(-1)}
                style={styles.diceButton}
              >
                <CustomText style={styles.diceButtonText}>-</CustomText>
              </Pressable>
            )}

            <CustomText style={styles.diceValue}>{challengeDice}</CustomText>

            {isMyTurn && (
              <Pressable
                onPress={() => handleDiceChange(1)}
                style={styles.diceButton}
              >
                <CustomText style={styles.diceButtonText}>+</CustomText>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Bubbles on top */}
          <View style={styles.sidebar}>
            {playerInfo.map(player => (
              <View key={player.id} style={styles.innerSidebar}>
                <Pressable
                  onPress={() => setViewedPlayer(player)}
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

                {player.id === viewedPlayer?.id && (
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

          {viewedPlayer && (
            <PlayerCard
              currentPlayerId={playerId}
              player={viewedPlayer}
              getCharacterColor={getCharacterColor}
              skillTokenIcons={skillTokenIcons}
              onUpdatePlayer={handleUpdatePlayer}
              totalPlayers={playerInfo.length}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#b7c9d0',
  },
});

export default GamePage;
