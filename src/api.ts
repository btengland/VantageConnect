import { GameWebSocket } from './websocketApi';

const WS_URL =
  'wss://4gjwhoq0uf.execute-api.us-east-2.amazonaws.com/production';

export const wsClient = new GameWebSocket(WS_URL);

export const connectWebSocket = async () => {
  await wsClient.connect();
};

export const hostGame = async (): Promise<{
  playerId: string;
  sessionCode: number;
}> => {
  wsClient.sendMessage({ action: 'hostSession' });
  return await wsClient.once('hostSession');
};

export const joinGame = async (sessionCode: number) => {
  wsClient.sendMessage({ action: 'joinSession', sessionCode });
  return await wsClient.once('joinSession');
};
