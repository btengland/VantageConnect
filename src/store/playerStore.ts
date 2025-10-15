import { create } from 'zustand';
import { isEqual } from 'lodash';

// Define the Player type, assuming it's consistent with GamePage
type SkillToken = { quantity: number };
type Statuses = { heart: number; star: number; 'timer-sand-full': number };
type ImpactDiceSlot = { symbol: string; checked: boolean };
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
  impactDiceSlots: ImpactDiceSlot[];
};

interface PlayerState {
  playerInfo: Player[];
  viewedPlayerId: number | null;
  setViewedPlayerId: (id: number) => void;
  setPlayerInfo: (players: Player[]) => void;
  updatePlayer: (playerId: number, updates: Partial<Player>) => void;
}

const rotatePlayers = (players: Player[], currentPlayerId: number): Player[] => {
  const index = players.findIndex(p => p.id === currentPlayerId);
  if (index === -1) return players;
  return [...players.slice(index), ...players.slice(0, index)];
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  playerInfo: [],
  viewedPlayerId: null,

  setViewedPlayerId: id => set({ viewedPlayerId: id }),

  setPlayerInfo: players => {
    set(state => {
      const currentPlayerId = players.find(p => p.turn)?.id; // Heuristic to find current player
      const rotatedPlayers = currentPlayerId
        ? rotatePlayers(players, currentPlayerId)
        : players;

      // Set initial viewed player if not set
      const viewedPlayerId =
        state.viewedPlayerId ?? (rotatedPlayers[0]?.id || null);

      if (isEqual(state.playerInfo, rotatedPlayers)) {
        return { playerInfo: state.playerInfo, viewedPlayerId };
      }
      return { playerInfo: rotatedPlayers, viewedPlayerId };
    });
  },

  updatePlayer: (playerId, updates) => {
    set(state => ({
      playerInfo: state.playerInfo.map(p =>
        p.id === playerId ? { ...p, ...updates } : p,
      ),
    }));
  },
}));
