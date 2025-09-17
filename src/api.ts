// wsClient.ts
import { GameWebSocket } from './websocketApi';

// Use your WebSocket URL here
const WS_URL =
  'wss://4gjwhoq0uf.execute-api.us-east-2.amazonaws.com/production';
const API_URL =
  'https://4gjwhoq0uf.execute-api.us-east-2.amazonaws.com/production';

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

export const updateChallengeDice = async (
  gameId: number,
  challengeDice: number,
) => {
  try {
    const response = await fetch(`${API_URL}/update-challenge-dice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameId,
        challengeDice,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update challenge dice');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating challenge dice:', error);
    throw error;
  }
};
