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

// A map to hold callbacks for different message actions
const messageCallbacks: { [action: string]: ((data: any) => void)[] } = {};

// Single message handler to dispatch to registered callbacks
wsClient.onMessage((data: any) => {
  try {
    if (data && data.action && messageCallbacks[data.action]) {
      messageCallbacks[data.action].forEach(callback => {
        try {
          callback(data);
        } catch (callbackError) {
          console.error(
            `Error in callback for action "${data.action}":`,
            callbackError,
          );
        }
      });
    }
  } catch (error) {
    console.error('Error in wsClient.onMessage handler:', error);
  }
});

// Function to register a callback for a specific action, returns an unsubscribe function
const on = (action: string, callback: (data: any) => void): (() => void) => {
  if (!messageCallbacks[action]) {
    messageCallbacks[action] = [];
  }
  messageCallbacks[action].push(callback);

  // Return a function to unsubscribe
  return () => {
    messageCallbacks[action] = messageCallbacks[action].filter(
      cb => cb !== callback,
    );
  };
};

export const readPlayers = (sessionCode: number) => {
  wsClient.sendMessage({ action: 'readPlayers', sessionCode });
};

export const onPlayersUpdate = (
  callback: (data: any) => void,
): (() => void) => {
  return on('updatePlayers', data => {
    callback(data); // send the whole object { players, challengeDice, code }
  });
};

export const readChallengeDice = (sessionCode: number) => {
  wsClient.sendMessage({ action: 'readChallengeDice', gameId: sessionCode });
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
  callback: (value: number) => void,
): (() => void) => {
  return on('updateChallengeDice', data => {
    if (data && data.challengeDice !== undefined) {
      callback(data.challengeDice);
    }
  });
};

export const leaveGame = async (playerId: number) => {
  wsClient.sendMessage({ action: 'leaveSession', playerId });
  return await wsClient.once('leaveSession');
};

export const onWebSocketDisconnect = (callback: () => void): (() => void) => {
  return wsClient.onDisconnect(callback);
};
