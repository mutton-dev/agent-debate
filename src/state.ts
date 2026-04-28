import type { DebateRole } from './persona.js';
import type { DebateTurn } from './debate.js';
import type { ConsensusResult } from './consensus.js';

export type DebateStatus = 'thinking' | 'synthesizing' | 'done' | 'error';

export interface ThinkingMarker {
  role: DebateRole;
  round: number;
}

export interface DebateState {
  topic: string;
  totalRounds: number;
  turns: DebateTurn[];
  consensus: ConsensusResult | null;
  error: string | null;
  status: DebateStatus;
  thinkingFor: ThinkingMarker | null;
}

const ORDER: DebateRole[] = ['proponent', 'opponent', 'neutral'];

export function createInitialState(topic: string, totalRounds: number): DebateState {
  return {
    topic,
    totalRounds,
    turns: [],
    consensus: null,
    error: null,
    status: 'thinking',
    thinkingFor: { role: 'proponent', round: 1 },
  };
}

export function appendTurn(state: DebateState, turn: DebateTurn): DebateState {
  const turns = [...state.turns, turn];
  const next = nextMarker(turns.length, state.totalRounds);
  return {
    ...state,
    turns,
    thinkingFor: next,
    status: next ? 'thinking' : 'synthesizing',
  };
}

export function setConsensus(state: DebateState, consensus: ConsensusResult): DebateState {
  return { ...state, consensus, status: 'done', thinkingFor: null };
}

export function setError(state: DebateState, message: string): DebateState {
  return { ...state, error: message, status: 'error', thinkingFor: null };
}

export function setThinking(state: DebateState, marker: ThinkingMarker): DebateState {
  return { ...state, thinkingFor: marker, status: 'thinking' };
}

function nextMarker(turnsDone: number, totalRounds: number): ThinkingMarker | null {
  const totalTurns = totalRounds * ORDER.length;
  if (turnsDone >= totalTurns) return null;
  const round = Math.floor(turnsDone / ORDER.length) + 1;
  const role = ORDER[turnsDone % ORDER.length];
  return { role, round };
}
