import { useState, useEffect, useRef, useCallback } from 'react';
import { debounce, throttle } from 'lodash';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import ExitModal from '../components/ExitModal';
import { StatusBar, useColorScheme } from 'react-native';
import PlayerCard from '../components/player/PlayerCard';
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
  updatePlayer as apiUpdatePlayer,
  onWebSocketDisconnect,
} from '../api';
import { usePlayerStore, Player } from '../store/playerStore';

// Define icons once here, outside the component
const skillTokenIcons = [
  require('../assets/Move.png'),
  require('../assets/Look.png'),
  require('../assets/Engage.png'),
  require('../assets/Help.png'),
  require('../assets/Take.png'),
  require('../assets/Overpower.png'),
];

type BackendPlayer = {
  playerId: number;
  sessionCode: number;
  playerNumber?: number;
  name?: string;
  character?: string;
  escapePod?: string;
  location?: string;
  skillTokens?: any;
  turn?: boolean;
  journalText?: string;
  statuses?: any;
  impactDiceSlots?: any;
};

const GamePage = () => {
  const route = useRoute();
  const { playerId, sessionCode } = route.params as {
    playerId: number;
    sessionCode: number;
  };

  const {
    playerInfo,
    viewedPlayerId,
    initializePlayers,
    mergePlayerUpdates,
    setViewedPlayerId,
    updatePlayer,
    playerUpdated,
  } = usePlayerStore();

  const [isOpen, setOpen] = useState(false);
  const [challengeDice, setChallengeDice] = useState(0);
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

  const debouncedApiUpdatePlayer = useRef(
    debounce((player: Player) => {
      apiUpdatePlayer(player);
    }, 300),
  ).current;

  const handleUpdatePlayer = useCallback(
    (updates: Partial<Player>) => {
      // Immediately update the local store for responsiveness
      updatePlayer(playerId, updates);

      // Then, debounce the API call
      const updatedPlayer = usePlayerStore
        .getState()
        .playerInfo.find(p => p.id === playerId);
      if (updatedPlayer) {
        debouncedApiUpdatePlayer(updatedPlayer);
      }
    },
    [playerId, updatePlayer, debouncedApiUpdatePlayer],
  );

  const myPlayer = playerInfo.find(p => p.id === playerId);
  const isMyTurn = myPlayer?.turn ?? false;
  const isMyTurnRef = useRef(isMyTurn);
  useEffect(() => {
    isMyTurnRef.current = isMyTurn;
  }, [isMyTurn]);

  const throttledOnPlayersUpdate = useCallback(
    throttle(
      (gameData: { players: BackendPlayer[]; challengeDice: number }) => {
        if (!challengeDiceInitialized.current) {
          setChallengeDice(gameData.challengeDice);
          challengeDiceInitialized.current = true;
        }

        const transformedPlayers = gameData.players.map(
          (p: BackendPlayer): Player => ({
            id: p.playerId,
            sessionCode: p.sessionCode,
            playerNumber: Number(p.playerNumber) || 0,
            name: p.name || '',
            character: p.character || '',
            escapePod: p.escapePod || '',
            location: p.location || '',
            skillTokens:
              p.skillTokens && !Array.isArray(p.skillTokens)
                ? Object.values(p.skillTokens)
                : p.skillTokens || Array(6).fill({ quantity: 0 }),
            turn: p.turn || false,
            journalText: p.journalText || '',
            statuses: p.statuses || {
              heart: 0,
              star: 0,
              'timer-sand-full': 0,
            },
            impactDiceSlots:
              p.impactDiceSlots && !Array.isArray(p.impactDiceSlots)
                ? Object.values(p.impactDiceSlots)
                : p.impactDiceSlots || [],
          }),
        );

        if (usePlayerStore.getState().playerInfo.length === 0) {
          initializePlayers(transformedPlayers, playerId);
        } else {
          mergePlayerUpdates(transformedPlayers, playerId);
        }
        if (loading) setLoading(false);
      },
      500,
      { leading: true, trailing: true },
    ),
    [initializePlayers, mergePlayerUpdates, playerId, loading],
  );

  useEffect(() => {
    let disconnectListener: (() => void) | undefined;
    let challengeDiceListener: (() => void) | undefined;
    let playersListener: (() => void) | undefined;
    let playerListener: (() => void) | undefined;

    const initWebSocket = async () => {
      try {
        await connectWebSocket();
        console.log('WebSocket connected');

        challengeDiceListener = onChallengeDiceUpdate(newDice => {
          if (!isMyTurnRef.current) setChallengeDice(newDice);
        });

        playersListener = onPlayersUpdate(throttledOnPlayersUpdate);
        playerListener = onPlayerUpdate(playerUpdated);

        disconnectListener = onWebSocketDisconnect(() => {
          console.log('WebSocket disconnected, navigating to Home');
          (navigation as any).navigate('Home');
        });

        readPlayers(sessionCode);
        readChallengeDice(sessionCode);
      } catch (err) {
        console.error('WebSocket connection failed:', err);
        setLoading(false);
      }
    };

    initWebSocket();

    return () => {
      if (disconnectListener) disconnectListener();
      if (challengeDiceListener) challengeDiceListener();
      if (playersListener) playersListener();
      if (playerListener) playerListener();
    };
  }, [sessionCode, throttledOnPlayersUpdate, navigation, playerUpdated]);

  const debouncedUpdateDice = useRef(
    debounce((val: number) => updateChallengeDice(sessionCode, val), 300),
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

  const viewedPlayer = playerInfo.find(p => p.id === viewedPlayerId);

  if (loading && playerInfo.length === 0) {
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
            viewedPlayerId={viewedPlayerId}
            onSetViewedPlayer={setViewedPlayerId}
          />
          {viewedPlayer && (
            <PlayerCard
              key={viewedPlayer.id} // Add key for re-mounting on player change
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
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    lineHeight: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#b7c9d0',
  },
});

export default GamePage;
