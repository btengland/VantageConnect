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

export const readPlayers = (
  sessionCode: number,
  callback: (players: any[]) => void,
) => {
  wsClient.sendMessage({ action: 'readPlayers', sessionCode });

  wsClient.onMessage((data: any) => {
    if (data.action === 'updatePlayers') {
      callback(data.players);
    }
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

export const onChallengeDiceUpdate = (callback: (value: number) => void) => {
  wsClient.onMessage((data: any) => {
    if (data.action === 'updateChallengeDice') {
      callback(data.challengeDice);
    }
  });
};
