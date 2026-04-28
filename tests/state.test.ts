import { describe, it, expect } from 'vitest';
import { createInitialState, appendTurn, setConsensus, setError, setThinking } from '../src/state.js';
import type { DebateTurn } from '../src/debate.js';
import type { ConsensusResult } from '../src/consensus.js';

describe('debate state', () => {
  it('initial state is empty / idle', () => {
    const s = createInitialState('Topic', 3);
    expect(s.topic).toBe('Topic');
    expect(s.totalRounds).toBe(3);
    expect(s.turns).toEqual([]);
    expect(s.consensus).toBeNull();
    expect(s.error).toBeNull();
    expect(s.status).toBe('thinking');
    expect(s.thinkingFor).toEqual({ role: 'proponent', round: 1 });
  });

  it('appendTurn adds a turn and advances the next thinking marker', () => {
    const s0 = createInitialState('T', 2);
    const turn: DebateTurn = { role: 'proponent', content: 'A', round: 1 };
    const s1 = appendTurn(s0, turn);
    expect(s1.turns).toHaveLength(1);
    expect(s1.thinkingFor).toEqual({ role: 'opponent', round: 1 });
    const s2 = appendTurn(s1, { role: 'opponent', content: 'B', round: 1 });
    expect(s2.thinkingFor).toEqual({ role: 'neutral', round: 1 });
    const s3 = appendTurn(s2, { role: 'neutral', content: 'C', round: 1 });
    expect(s3.thinkingFor).toEqual({ role: 'proponent', round: 2 });
  });

  it('thinkingFor becomes null after the last expected turn', () => {
    let s = createInitialState('T', 1);
    s = appendTurn(s, { role: 'proponent', content: 'a', round: 1 });
    s = appendTurn(s, { role: 'opponent', content: 'b', round: 1 });
    s = appendTurn(s, { role: 'neutral', content: 'c', round: 1 });
    expect(s.thinkingFor).toBeNull();
    expect(s.status).toBe('synthesizing');
  });

  it('setConsensus transitions to done', () => {
    const s0 = createInitialState('T', 1);
    const consensus: ConsensusResult = {
      summary: 's',
      dissentingPoints: [],
      confidence: { proponent: 1, opponent: 2, neutral: 3 },
    };
    const s1 = setConsensus(s0, consensus);
    expect(s1.consensus).toBe(consensus);
    expect(s1.status).toBe('done');
  });

  it('setError transitions to error', () => {
    const s0 = createInitialState('T', 1);
    const s1 = setError(s0, 'Boom');
    expect(s1.error).toBe('Boom');
    expect(s1.status).toBe('error');
  });

  it('setThinking sets explicit thinking marker', () => {
    const s0 = createInitialState('T', 3);
    const s1 = setThinking(s0, { role: 'neutral', round: 2 });
    expect(s1.thinkingFor).toEqual({ role: 'neutral', round: 2 });
  });
});
