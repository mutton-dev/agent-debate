import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreate = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate,
    },
  })),
}));

import { extractConsensus } from '../src/consensus.js';
import type { DebateTurn } from '../src/debate.js';

const sampleTurns: DebateTurn[] = [
  { role: 'proponent', content: 'P1', round: 1 },
  { role: 'opponent', content: 'O1', round: 1 },
  { role: 'neutral', content: 'N1', round: 1 },
];

describe('extractConsensus', () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it('parses a JSON consensus payload', async () => {
    const payload = {
      summary: 'Both sides agree X is needed.',
      dissentingPoints: ['Cost concern', 'Migration risk'],
      confidence: { proponent: 80, opponent: 40, neutral: 70 },
    };
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(payload) }],
    });
    const result = await extractConsensus(sampleTurns, 'Topic', 'k');
    expect(result).toEqual(payload);
  });

  it('strips markdown code fences from JSON response', async () => {
    const payload = {
      summary: 'OK',
      dissentingPoints: [],
      confidence: { proponent: 50, opponent: 50, neutral: 50 },
    };
    mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: '```json\n' + JSON.stringify(payload) + '\n```',
        },
      ],
    });
    const result = await extractConsensus(sampleTurns, 'Topic', 'k');
    expect(result.summary).toBe('OK');
    expect(result.confidence.proponent).toBe(50);
  });

  it('passes the transcript and topic in the user prompt', async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            summary: '',
            dissentingPoints: [],
            confidence: { proponent: 0, opponent: 0, neutral: 0 },
          }),
        },
      ],
    });
    await extractConsensus(sampleTurns, 'My Topic', 'k');
    const args = mockCreate.mock.calls[0][0];
    const userContent = args.messages[0].content;
    expect(userContent).toContain('My Topic');
    expect(userContent).toContain('P1');
    expect(userContent).toContain('O1');
    expect(userContent).toContain('N1');
    expect(userContent.toLowerCase()).toMatch(/json/);
  });

  it('throws on unparseable response', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'not json at all' }],
    });
    await expect(extractConsensus(sampleTurns, 'T', 'k')).rejects.toThrow();
  });
});
