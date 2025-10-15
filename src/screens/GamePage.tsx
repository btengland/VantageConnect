import { useState, useEffect, useRef, useCallback } from 'react';
import { debounce, isEqual } from 'lodash';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import ExitModal from '../components/ExitModal';
import { StatusBar, useColorScheme } from 'react-native';
import PlayerCard from '../components/PlayerCard';
import { LinearGradient } from 'expo-linear-gradient';
import CustomText from '../components/CustomText';
import { getCharacterColor } from '../utils';
import GameHeader from '../components/game/GameHeader';
import PlayerBubbles from '../components/game/PlayerBubbles';
import {
  connectWebSocket,
  readPlayers,
  onPlayersUpdate,
  onPlayerUpdate,
  updateChallengeDice,
  onChallengeDiceUpdate,
  readChallengeDice,
  updatePlayer,
  onWebSocketDisconnect,
} from '../api';

// Define icons once here, outside the component
const skillTokenIcons = [
  require('../assets/Move.png'),
  require('../assets/Look.png'),
  require('../assets/Engage.png'),
  require('../assets/Help.png'),
  require('../assets/Take.png'),
  require('../assets/Overpower.png'),
];

type SkillToken = { quantity: number };
type Statuses = { heart: number; star: number; 'timer-sand-full': number };
export type Player = {
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

const GamePage = () => {
  const route = useRoute();
  const { playerId, sessionCode } = route.params as {
    playerId: number;
    sessionCode: number;
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
  const playerInfoRef = useRef(playerInfo);

  const setPlayerInfoWithRef = useCallback(
    (newState: Player[] | ((prevState: Player[]) => Player[])) => {
      const newPlayerInfo =
        typeof newState === 'function'
          ? newState(playerInfoRef.current)
          : newState;
      playerInfoRef.current = newPlayerInfo;
      setPlayerInfo(newPlayerInfo);
    },
    [],
  );
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

  const debouncedUpdatePlayer = useRef(
    debounce((player: Player) => {
      updatePlayer(player);
    }, 300), // 300ms delay
  ).current;

  const handleUpdatePlayer = useCallback(
    (updates: Partial<Player>) => {
      let fullPlayer: Player | undefined;
      setPlayerInfoWithRef(prev =>
        prev.map(p => {
          if (p.id === playerId) {
            const updatedPlayer = { ...p, ...updates };
            fullPlayer = updatedPlayer;
            return updatedPlayer;
          }
          return p;
        }),
      );

      if (fullPlayer) {
        debouncedUpdatePlayer(fullPlayer);
      }
    },
    [playerId, setPlayerInfoWithRef, debouncedUpdatePlayer],
  );

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
    const disconnectSubscription = onWebSocketDisconnect(() => {
      console.log('WebSocket disconnected, navigating to Home');
      (navigation as any).navigate('Home');
    });

    return () => {
      disconnectSubscription();
    };
  }, [navigation]);

  // This useEffect handles incremental player updates
  useEffect(() => {
    const playerUpdateCleanup = onPlayerUpdate(updatedPlayer => {
      setPlayerInfoWithRef(prev =>
        prev.map(p => (p.id === updatedPlayer.id ? updatedPlayer : p)),
      );
    });

    return () => {
      playerUpdateCleanup();
    };
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    let isMounted = true;
    const cleanupFunctions: (() => void)[] = [];

    const initWebSocket = async () => {
      try {
        // 1️⃣ Connect WS
        await connectWebSocket();
        if (!isMounted) return;
        console.log('WebSocket connected');

        // 2️⃣ Set up listeners
        const challengeDiceCleanup = onChallengeDiceUpdate(newDice => {
          if (isMyTurnRef.current) return; // ignore updates if it's my turn
          setChallengeDice(newDice);
        });
        cleanupFunctions.push(challengeDiceCleanup);

        const playersUpdateCleanup = onPlayersUpdate(
          (gameData: { players: BackendPlayer[]; challengeDice: number }) => {
            if (!isMounted) return;
            const playersFromBackend = gameData.players;

            // Only set initial challengeDice once
            if (!challengeDiceInitialized.current) {
              setChallengeDice(gameData.challengeDice);
              challengeDiceInitialized.current = true;
            }

            const transformedBackendPlayers = playersFromBackend.map(
              (p: BackendPlayer): Player => {
                // Ensure skillTokens is a fixed-length array of 6, creating new objects
                const defaultSkillTokens = Array.from({ length: 6 }, () => ({
                  quantity: 0,
                }));
                let skillTokensSource = p.skillTokens || [];

                // The backend sometimes sends an object instead of an array
                if (skillTokensSource && !Array.isArray(skillTokensSource)) {
                  skillTokensSource = Object.values(skillTokensSource);
                }

                // Safely merge backend tokens with defaults
                const skillTokens = defaultSkillTokens.map(
                  (defaultToken, index) => {
                    const backendToken = skillTokensSource[index];
                    // Ensure the backend token has the required 'quantity' property
                    if (
                      backendToken &&
                      typeof backendToken.quantity === 'number'
                    ) {
                      return backendToken;
                    }
                    return defaultToken;
                  },
                );

                const impactDiceSlots =
                  p.impactDiceSlots && !Array.isArray(p.impactDiceSlots)
                    ? Object.values(p.impactDiceSlots)
                    : p.impactDiceSlots || [];

                return {
                  id: p.playerId,
                  sessionCode: p.sessionCode,
                  playerNumber: Number(p.playerNumber) || 0,
                  name: p.name || '',
                  character: p.character || '',
                  escapePod: p.escapePod || '',
                  location: p.location || '',
                  skillTokens,
                  turn: p.turn || false,
                  journalText: p.journalText || '',
                  statuses: p.statuses || {
                    heart: 0,
                    star: 0,
                    'timer-sand-full': 0,
                  },
                  impactDiceSlots,
                };
              },
            );

            setPlayerInfoWithRef(prevPlayerInfo => {
              if (prevPlayerInfo.length === 0) {
                setLoading(false);
                return rotatePlayers(transformedBackendPlayers, playerId);
              }

              const backendPlayersMap = new Map(
                transformedBackendPlayers.map(p => [p.id, p]),
              );

              const mergedPlayers = prevPlayerInfo
                .map(localPlayer => {
                  const backendPlayer = backendPlayersMap.get(localPlayer.id);
                  if (backendPlayer) {
                    // This player exists in both lists.
                    if (localPlayer.id === playerId) {
                      // It's the current user. Preserve local state but take
                      // authoritative updates from the server (like turn status).
                      return {
                        ...localPlayer,
                        turn: backendPlayer.turn,
                      };
                    }
                    // It's another player. Use the server's version.
                    return backendPlayer;
                  }
                  // This player is not in the backend list; they must have left.
                  return null;
                })
                .filter((p): p is Player => p !== null);

              // Add any new players who are in the backend list but not local.
              const currentIds = new Set(mergedPlayers.map(p => p.id));
              transformedBackendPlayers.forEach(backendPlayer => {
                if (!currentIds.has(backendPlayer.id)) {
                  mergedPlayers.push(backendPlayer);
                }
              });

              const newPlayerOrder = rotatePlayers(mergedPlayers, playerId);

              if (isEqual(newPlayerOrder, prevPlayerInfo)) {
                return prevPlayerInfo;
              }

              return newPlayerOrder;
            });
          },
        );
        cleanupFunctions.push(playersUpdateCleanup);

        // 3️⃣ Initial data fetch
        readPlayers(sessionCode);
        readChallengeDice(sessionCode);
      } catch (err) {
        console.error('WebSocket connection failed:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initWebSocket();

    return () => {
      isMounted = false;
      console.log('Cleaning up WebSocket listeners...');
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [playerId, sessionCode]);

  useEffect(() => {
    setViewedPlayer(currentViewedPlayer => {
      if (playerInfo.length === 0) {
        return null;
      }

      const viewedPlayerExists = playerInfo.some(
        p => p.id === currentViewedPlayer?.id,
      );

      if (viewedPlayerExists) {
        const updatedViewedPlayer = playerInfo.find(
          p => p.id === currentViewedPlayer!.id,
        )!;
        if (!isEqual(updatedViewedPlayer, currentViewedPlayer)) {
          return updatedViewedPlayer;
        }
        return currentViewedPlayer;
      } else {
        return playerInfo[0];
      }
    });
  }, [playerInfo]);

  // Debounced dice update so rapid clicks don't crash the app
  const debouncedUpdateDice = useRef(
    debounce((val: number) => {
      updateChallengeDice(sessionCode, val);
    }, 300), // 300ms delay
  ).current;

  const handleDiceChange = useCallback(
    (delta: number) => {
      setChallengeDice(prev => {
        const newVal = Math.max(0, prev + delta);
        debouncedUpdateDice(newVal);
        return newVal;
      });
    },
    [debouncedUpdateDice],
  );

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

        <GameHeader
          sessionCode={sessionCode}
          challengeDice={challengeDice}
          isMyTurn={isMyTurn}
          onDiceChange={handleDiceChange}
        />

        <View style={styles.contentContainer}>
          <PlayerBubbles
            players={playerInfo}
            viewedPlayer={viewedPlayer}
            onSetViewedPlayer={setViewedPlayer}
          />

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

      <ExitModal
        playerId={playerId}
        isOpen={isOpen}
        toggleModal={toggleModal}
      />
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
