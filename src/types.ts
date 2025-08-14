export type SkillToken = { quantity: number };
export type Statuses = { heart: number; star: number; 'timer-sand-full': number };
export type ImpactDiceSlot = { symbol: string; checked: boolean };

export type Player = {
  id: string;
  name: string;
  character: string;
  escapePod: string;
  location: string;
  skillTokens: SkillToken[];
  turn: boolean;
  journalText: string;
  statuses: Statuses;
  impactDiceSlots: ImpactDiceSlot[];
  // This is the temporary ID for initial identification
  tempId?: string;
};

export type GameState = {
  sessionId: string;
  challengeDice: number;
  players: Player[];
  connections: string[];
};
