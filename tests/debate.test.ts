import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runDebateTurn } from '../src/debate.js';
import type { Round } from '../src/persona.js';

const mockCreate = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate,
    },
  })),
}));

import Anthropic from '@anthropic-ai/sdk';

describe('runDebateTurn', () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it('returns a DebateTurn with role, content, and round', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'My argument is...' }],
    });
    const client = new Anthropic({ apiKey: 'test' });
    const turn = await runDebateTurn(client, 'proponent', 'Topic X', 1, []);
    expect(turn).toEqual({
      role: 'proponent',
      content: 'My argument is...',
      round: 1,
    });
  });

  it('passes the system prompt and user message to the API', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'reply' }],
    });
    const client = new Anthropic({ apiKey: 'test' });
    await runDebateTurn(client, 'opponent', 'Topic Y', 2, [
      { role: 'proponent', content: 'P1', round: 1 } as Round,
    ]);
    expect(mockCreate).toHaveBeenCalledTimes(1);
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.system.toLowerCase()).toMatch(/skeptic|challenge/);
    expect(callArgs.messages[0].content).toContain('Topic Y');
    expect(callArgs.messages[0].content).toContain('P1');
  });

  it('propagates API errors', async () => {
    mockCreate.mockRejectedValue(new Error('API failure'));
    const client = new Anthropic({ apiKey: 'test' });
    await expect(
      runDebateTurn(client, 'neutral', 'Topic', 1, [])
    ).rejects.toThrow('API failure');
  });

  it('handles non-text content blocks gracefully', async () => {
    mockCreate.mockResolvedValue({
      content: [
        { type: 'tool_use', id: 'x' },
        { type: 'text', text: 'actual text' },
      ],
    });
    const client = new Anthropic({ apiKey: 'test' });
    const turn = await runDebateTurn(client, 'proponent', 'T', 1, []);
    expect(turn.content).toBe('actual text');
  });
});
