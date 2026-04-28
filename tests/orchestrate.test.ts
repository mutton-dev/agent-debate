import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate,
    },
  })),
}));

import { runDebate, type DebateTurn } from '../src/debate.js';

describe('runDebate (orchestration)', () => {
  beforeEach(() => {
    mockCreate.mockReset();
    let n = 0;
    mockCreate.mockImplementation(async () => {
      n += 1;
      return { content: [{ type: 'text', text: `argument-${n}` }] };
    });
  });

  it('yields proponent → opponent → neutral per round', async () => {
    const turns: DebateTurn[] = [];
    for await (const t of runDebate('Topic', 2, 'fake-key')) {
      turns.push(t);
    }
    expect(turns).toHaveLength(6);
    expect(turns.map((t) => t.role)).toEqual([
      'proponent',
      'opponent',
      'neutral',
      'proponent',
      'opponent',
      'neutral',
    ]);
    expect(turns.map((t) => t.round)).toEqual([1, 1, 1, 2, 2, 2]);
  });

  it('passes prior turns as context to later turns', async () => {
    const turns: DebateTurn[] = [];
    for await (const t of runDebate('SomeTopic', 2, 'fake-key')) {
      turns.push(t);
    }
    // Round 2 proponent (call #4) should have round-1 transcript in user message
    const round2ProponentCall = mockCreate.mock.calls[3][0];
    expect(round2ProponentCall.messages[0].content).toContain('argument-1');
    expect(round2ProponentCall.messages[0].content).toContain('argument-3');
  });

  it('supports a single round', async () => {
    const turns: DebateTurn[] = [];
    for await (const t of runDebate('T', 1, 'k')) {
      turns.push(t);
    }
    expect(turns).toHaveLength(3);
  });
});
