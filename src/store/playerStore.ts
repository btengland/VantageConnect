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
  initializePlayers: (players: Player[], localPlayerId: number) => void;
  mergePlayerUpdates: (players: Player[], localPlayerId: number) => void;
  updatePlayer: (playerId: number, updates: Partial<Player>) => void;
  playerUpdated: (player: Player) => void;
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

  initializePlayers: (players, localPlayerId) => {
    set({
      playerInfo: rotatePlayers(players, localPlayerId),
      viewedPlayerId: localPlayerId,
    });
  },

  mergePlayerUpdates: (playersFromBackend, localPlayerId) => {
    set(state => {
      const backendPlayersMap = new Map(playersFromBackend.map(p => [p.id, p]));
      const localPlayersMap = new Map(state.playerInfo.map(p => [p.id, p]));

      // Merge backend updates into local state
      const mergedPlayers = state.playerInfo
        .map(localPlayer => {
          const backendPlayer = backendPlayersMap.get(localPlayer.id);
          if (!backendPlayer) return null; // Player left

          if (localPlayer.id === localPlayerId) {
            // For the local user, only accept authoritative updates (like turn status)
            return { ...localPlayer, turn: backendPlayer.turn };
          }
          // For other players, accept the full backend state
          return backendPlayer;
        })
        .filter((p): p is Player => p !== null);

      // Add new players
      playersFromBackend.forEach(backendPlayer => {
        if (!localPlayersMap.has(backendPlayer.id)) {
          mergedPlayers.push(backendPlayer);
        }
      });

      const newPlayerOrder = rotatePlayers(mergedPlayers, localPlayerId);

      if (isEqual(state.playerInfo, newPlayerOrder)) {
        return { playerInfo: state.playerInfo };
      }

      return { playerInfo: newPlayerOrder };
    });
  },

  updatePlayer: (playerId, updates) => {
    set(state => ({
      playerInfo: state.playerInfo.map(p =>
        p.id === playerId ? { ...p, ...updates } : p,
      ),
    }));
  },

  playerUpdated: (player: Player) => {
    set(state => ({
      playerInfo: state.playerInfo.map(p =>
        p.id === player.id ? player : p,
      ),
    }));
  },
}));
