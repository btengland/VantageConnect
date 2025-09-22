// wsClient.ts
import { GameWebSocket } from './websocketApi';

// Use your WebSocket URL here
const WS_URL =
  'wss://4gjwhoq0uf.execute-api.us-east-2.amazonaws.com/production';

export const wsClient = new GameWebSocket(WS_URL);

export const connectWebSocket = async () => {
  await wsClient.connect();
};

export const hostGame = async (): Promise<{
  playerId: number;
  sessionCode: number;
}> => {
  wsClient.sendMessage({ action: 'hostSession' });
  return await wsClient.once('hostSession');
};

export const joinGame = async (
  sessionCode: number,
): Promise<{ playerId: number; sessionCode: number }> => {
  wsClient.sendMessage({ action: 'joinSession', sessionCode });
  return await wsClient.once('joinSession');
};

// --- Player Subscription ---
let playerUpdateCallback: ((players: any[]) => void) | null = null;
let playerPatchCallback:
  | ((patch: { playerId: number; updates: any }) => void)
  | null = null;
let isPlayerListenerAttached = false;

function attachPlayerListener() {
  if (isPlayerListenerAttached) return;

  wsClient.onMessage((data: any) => {
    if (data.action === 'updatePlayers' && playerUpdateCallback) {
      playerUpdateCallback(data.players);
    } else if (data.action === 'playerPatched' && playerPatchCallback) {
      playerPatchCallback(data);
    }
  });

  isPlayerListenerAttached = true;
}

export const subscribeToPlayers = (
  sessionCode: number,
  onUpdate: (players: any[]) => void,
  onPatch: (patch: { playerId: number; updates: any }) => void,
) => {
  attachPlayerListener();
  playerUpdateCallback = onUpdate;
  playerPatchCallback = onPatch;

  // Request initial player list
  wsClient.sendMessage({ action: 'readPlayers', sessionCode });

  // Return an unsubscribe function for cleanup
  return () => {
    playerUpdateCallback = null;
    playerPatchCallback = null;
    // Note: We are not removing the listener from wsClient to keep it simple.
    // A more robust implementation might track multiple subscribers.
  };
};

export const updatePlayer = (player: any) => {
  wsClient.sendMessage({
    action: 'updatePlayer',
    playerId: player.id,
    updates: player,
  });
};

export const endTurn = async (
  sessionCode: number,
  currentPlayerId: number,
): Promise<void> => {
  // send to API Gateway WebSocket
  wsClient.sendMessage({ action: 'endTurn', sessionCode, currentPlayerId });
};

export const updateChallengeDice = (sessionCode: number, value: number) => {
  wsClient.sendMessage({
    action: 'updateChallengeDice',
    gameId: sessionCode,
    challengeDice: value,
  });
};

export const onChallengeDiceUpdate = (
  callback: (value: number, gameId?: number) => void,
) => {
  wsClient.onMessage((data: any) => {
    if (data.action === 'updateChallengeDice') {
      callback(data.challengeDice);
    }
  });
};
